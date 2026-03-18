# S3 bucket for static card image assets
#
# Card images are served from this bucket via CloudFront (OAC-protected).
# The bucket is fully private — only the CloudFront distribution can read from it.
# Direct public HTTP access returns 403 Forbidden.
#
# Images are synced here from src/resources/cards/images/ by the CI sync-images job
# on every push to main. The one-time initial seed must be run manually after
# terraform apply — see docs/current/IMAGE_PIPELINE.md for the full workflow.
#
# IMPORTANT: Run `terraform plan` before `terraform apply`.
# A human must review and approve the plan before any AWS resources are created.

# S3 bucket for card image assets
resource "aws_s3_bucket" "card_images" {
  bucket = "${var.project_name}-cards-assets-${var.environment}"

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-cards-assets-${var.environment}"
  })
}

# Block all public access — CloudFront OAC is the only allowed reader
resource "aws_s3_bucket_public_access_block" "card_images" {
  bucket = aws_s3_bucket.card_images.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

# CloudFront Origin Access Control — modern replacement for legacy OAI
# This allows CloudFront to authenticate requests to S3 without making the bucket public.
resource "aws_cloudfront_origin_access_control" "card_images" {
  name                              = "${var.project_name}-cards-oac-${var.environment}"
  description                       = "OAC for ${var.project_name} card images bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Bucket policy — grant CloudFront service principal read access via OAC
resource "aws_s3_bucket_policy" "card_images" {
  bucket = aws_s3_bucket.card_images.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.card_images.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.card_images.arn
          }
        }
      }
    ]
  })

  # Bucket policy must be set after public access block to avoid race condition
  depends_on = [aws_s3_bucket_public_access_block.card_images]
}
