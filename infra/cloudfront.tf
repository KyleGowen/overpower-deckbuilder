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

  # Cache behavior for card images — long TTL since images are immutable by filename
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
