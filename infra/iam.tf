# IAM policy granting the CI/CD user (GitHub Actions) write access to the S3 assets bucket.
#
# The CI IAM user was created manually and is referenced here via a data source.
# Set var.ci_iam_username to the IAM username whose access keys are stored as
# AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY in GitHub Actions secrets.
#
# To find the username:
#   aws iam list-users --query 'Users[*].UserName' --output table

# Reference the existing manually-created CI IAM user.
# Only created when var.ci_iam_username is non-empty.
data "aws_iam_user" "ci_user" {
  count     = var.ci_iam_username != "" ? 1 : 0
  user_name = var.ci_iam_username
}

# Policy granting CI the minimum S3 permissions needed to sync card images.
# Only created when var.ci_iam_username is non-empty.
resource "aws_iam_policy" "ci_s3_assets" {
  count       = var.ci_iam_username != "" ? 1 : 0
  name        = "${var.project_name}-ci-s3-assets-policy"
  description = "Allows CI/CD (GitHub Actions) to sync card images to the S3 assets bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowS3AssetsBucketList"
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = aws_s3_bucket.card_images.arn
      },
      {
        Sid    = "AllowS3AssetsObjectWrite"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:GetObject"
        ]
        Resource = "${aws_s3_bucket.card_images.arn}/*"
      }
    ]
  })

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-ci-s3-assets-policy"
  })
}

# Attach the S3 assets policy to the CI user
resource "aws_iam_user_policy_attachment" "ci_s3_assets" {
  count      = var.ci_iam_username != "" ? 1 : 0
  user       = data.aws_iam_user.ci_user[0].user_name
  policy_arn = aws_iam_policy.ci_s3_assets[0].arn
}
