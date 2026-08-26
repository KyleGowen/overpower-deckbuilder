# EC2 Instance for OverPower Deckbuilder Application
# This creates the compute instance that will run the Docker application

# Data source for latest Amazon Linux 2023 AMI
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# IAM role for EC2 instance to access SSM and ECR
resource "aws_iam_role" "ec2_role" {
  name = "${var.project_name}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-ec2-role"
    Environment = var.environment
  }
}

# IAM policy for SSM parameter access
resource "aws_iam_policy" "ssm_policy" {
  name        = "${var.project_name}-ssm-policy"
  description = "Policy for EC2 to access SSM parameters"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ]
        Resource = [
          "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/${var.project_name}/${var.environment}/*"
        ]
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-ssm-policy"
    Environment = var.environment
  }
}

# IAM policy for ECR access
resource "aws_iam_policy" "ecr_policy" {
  name        = "${var.project_name}-ecr-policy"
  description = "Policy for EC2 to access ECR"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ]
        Resource = "*"
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-ecr-policy"
    Environment = var.environment
  }
}

# Allow the application to send only Excelsior feedback mail through the
# verified excelsior.cards SES identity. The app receives these credentials
# from the EC2 instance profile; no static AWS keys are stored in its env file.
resource "aws_iam_policy" "feedback_email_policy" {
  name        = "${var.project_name}-feedback-email-policy"
  description = "Policy for the app to send in-app feedback through SES"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = "ses:SendEmail"
        Resource = [
          "arn:aws:ses:${var.aws_region}:${data.aws_caller_identity.current.account_id}:identity/${var.domain_name}",
          "arn:aws:ses:${var.aws_region}:${data.aws_caller_identity.current.account_id}:configuration-set/${var.ses_default_configuration_set_name}"
        ]
        Condition = {
          StringEquals = {
            "ses:FromAddress" = var.forward_from_email
          }
          "ForAllValues:StringEquals" = {
            "ses:Recipients" = [var.forward_from_email]
          }
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-feedback-email-policy"
    Environment = var.environment
  }
}

# Attach policies to role
resource "aws_iam_role_policy_attachment" "ssm_attachment" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.ssm_policy.arn
}

resource "aws_iam_role_policy_attachment" "ecr_attachment" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.ecr_policy.arn
}

resource "aws_iam_role_policy_attachment" "feedback_email_attachment" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.feedback_email_policy.arn
}

# Attach AWS managed SSM policy for EC2 instances
resource "aws_iam_role_policy_attachment" "ssm_managed_instance_core" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Instance profile for EC2
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project_name}-ec2-profile"
  role = aws_iam_role.ec2_role.name

  tags = {
    Name        = "${var.project_name}-ec2-profile"
    Environment = var.environment
  }
}

# User data script to install Docker and run the application
locals {
  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    ecr_repository_url = aws_ecr_repository.app.repository_url
    aws_region         = var.aws_region
    project_name       = var.project_name
    environment        = var.environment
  }))
}

# EC2 Instance
resource "aws_instance" "app" {
  # Pin AMI to current running instance to avoid replacement on plan
  ami                    = "ami-020e631fda96bcccc"
  instance_type          = "t2.micro" # Free tier eligible
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  user_data              = local.user_data

  # Docker bridge networking adds a hop between the app and IMDS. A hop limit
  # of 2 lets the AWS SDK use the instance role while keeping IMDSv2 required.
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
  }

  # Enable detailed monitoring
  monitoring = true

  # Root volume configuration
  root_block_device {
    volume_type           = "gp3"
    volume_size           = 30 # Minimum required for Amazon Linux 2023
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name        = "${var.project_name}-root-volume"
      Environment = var.environment
    }
  }

  tags = {
    Name        = "${var.project_name}-app"
    Environment = var.environment
  }
}

# Associate Elastic IP with EC2 instance
resource "aws_eip_association" "app_eip_assoc" {
  instance_id   = aws_instance.app.id
  allocation_id = aws_eip.app_eip.id
}
