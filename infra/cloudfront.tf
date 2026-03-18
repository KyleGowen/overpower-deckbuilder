# CloudFront CDN distribution for card images
#
# This offloads /src/resources/* image delivery to AWS edge locations,
# removing image traffic from the EC2 instance entirely.
#
# Free tier: 1 TB/month data transfer out + 10M HTTP requests/month.
# After free tier: ~$0.0085/GB data transfer, ~$0.0075/10K requests.
#
# IMPORTANT: Run `terraform plan` before `terraform apply`.
# A human must review and approve the plan before any AWS resources are created.

resource "aws_cloudfront_distribution" "card_images" {
  enabled     = true
  comment     = "Card images CDN for excelsior.cards"
  price_class = "PriceClass_100" # US, Canada, Europe only — lowest cost tier

  # Origin 1: EC2 instance (app traffic and any non-image paths)
  origin {
    # CloudFront requires a DNS hostname — raw IP addresses are not accepted.
    # excelsior.cards resolves to the EC2 EIP via Route53, so this is equivalent.
    domain_name = var.domain_name
    origin_id   = "ec2-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Origin 2: S3 bucket for card image assets (OAC-authenticated)
  origin {
    domain_name              = aws_s3_bucket.card_images.bucket_regional_domain_name
    origin_id                = "s3-assets-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.card_images.id
  }

  # Ordered behavior: card images are served from S3, not EC2.
  # This path pattern is evaluated BEFORE the default_cache_behavior.
  # Long TTL is safe — images are content-addressed by filename and never mutated in place.
  ordered_cache_behavior {
    path_pattern           = "/src/resources/cards/images/*"
    target_origin_id       = "s3-assets-origin"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 86400    # 1 day default
    max_ttl     = 31536000 # 1 year maximum
  }

  # Default behavior: all other traffic proxied to EC2
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "ec2-origin"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 86400    # 1 day default
    max_ttl     = 31536000 # 1 year maximum
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Use CloudFront's default *.cloudfront.net certificate (free)
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = var.common_tags
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name for card images — set this as CDN_BASE_URL in production"
  value       = "https://${aws_cloudfront_distribution.card_images.domain_name}"
}

# Restart the running Docker container on EC2 with CDN_BASE_URL injected.
# Uses AWS SSM Run Command — no SSH required.
# Triggers whenever the CloudFront domain name changes.
resource "null_resource" "restart_app_with_cdn" {
  triggers = {
    cdn_domain = aws_cloudfront_distribution.card_images.domain_name
  }

  provisioner "local-exec" {
    command = <<-EOT
      aws ssm send-command \
        --region ${var.aws_region} \
        --instance-ids ${aws_instance.app.id} \
        --document-name "AWS-RunShellScript" \
        --comment "Restart app container with CDN_BASE_URL" \
        --parameters 'commands=[
          "set -e",
          "CDN_BASE_URL=$(aws ssm get-parameter --name /${var.project_name}/${var.environment}/app/cdn_base_url --region ${var.aws_region} --query Parameter.Value --output text)",
          "DB_URL=$(aws ssm get-parameter --name /${var.project_name}/${var.environment}/database/url --with-decryption --region ${var.aws_region} --query Parameter.Value --output text)",
          "APP_ENV=$(aws ssm get-parameter --name /${var.project_name}/${var.environment}/app/environment --region ${var.aws_region} --query Parameter.Value --output text)",
          "FIREBASE_API_KEY=$(aws ssm get-parameter --name /${var.project_name}/${var.environment}/firebase/api_key --region ${var.aws_region} --query Parameter.Value --output text 2>/dev/null || echo \"\")",
          "FIREBASE_AUTH_DOMAIN=$(aws ssm get-parameter --name /${var.project_name}/${var.environment}/firebase/auth_domain --region ${var.aws_region} --query Parameter.Value --output text 2>/dev/null || echo \"\")",
          "FIREBASE_PROJECT_ID=$(aws ssm get-parameter --name /${var.project_name}/${var.environment}/firebase/project_id --region ${var.aws_region} --query Parameter.Value --output text 2>/dev/null || echo \"\")",
          "FIREBASE_APP_ID=$(aws ssm get-parameter --name /${var.project_name}/${var.environment}/firebase/app_id --region ${var.aws_region} --query Parameter.Value --output text 2>/dev/null || echo \"\")",
          "FIREBASE_SERVICE_ACCOUNT=$(aws ssm get-parameter --name /${var.project_name}/${var.environment}/firebase/service_account_json --with-decryption --region ${var.aws_region} --query Parameter.Value --output text 2>/dev/null || echo \"\")",
          "ECR_URL=$(aws ecr describe-repositories --repository-names op-deckbuilder-repo --region ${var.aws_region} --query repositories[0].repositoryUri --output text)",
          "aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin $ECR_URL",
          "docker pull $ECR_URL:latest",
          "docker stop overpower-app || true",
          "docker rm overpower-app || true",
          "docker run -d --name overpower-app --restart unless-stopped -p 3000:3000 -e NODE_ENV=$APP_ENV -e DATABASE_URL=$DB_URL -e NODE_TLS_REJECT_UNAUTHORIZED=0 -e PORT=3000 -e SKIP_MIGRATIONS=false -e FIREBASE_API_KEY=$FIREBASE_API_KEY -e FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN -e FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID -e FIREBASE_APP_ID=$FIREBASE_APP_ID -e FIREBASE_SERVICE_ACCOUNT_JSON=$FIREBASE_SERVICE_ACCOUNT -e CDN_BASE_URL=$CDN_BASE_URL $ECR_URL:latest",
          "sleep 10",
          "docker ps | grep -q overpower-app && echo SUCCESS || echo FAILED"
        ]'
    EOT
  }

  depends_on = [
    aws_cloudfront_distribution.card_images,
    aws_ssm_parameter.cdn_base_url,
  ]
}
