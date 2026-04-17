# RDS PostgreSQL Database for OverPower Deckbuilder
# This creates a PostgreSQL database accessible from outside AWS

# Data source for default VPC (we'll use this for now, can be replaced with custom VPC later)
data "aws_vpc" "default" {
  default = true
}

# Data source for default subnets
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# RDS security group — Phase 1 restricted inbound to the EC2 app SG plus a
# small allowlist of CI / ops CIDRs. See docs/current/OPS_RDS_SECURITY_GROUP.md
# for how to add a runner CIDR.
#
# The old `0.0.0.0/0` rule is intentionally preserved as a comment for 30 days
# as a reference point in case rollback is needed; git revert of this commit
# restores it.
resource "aws_security_group" "rds_sg" {
  name_prefix = "${var.project_name}-rds-"
  description = "Security group for RDS PostgreSQL database"
  vpc_id      = data.aws_vpc.default.id

  # Primary: EC2 app security group (normal app traffic).
  ingress {
    from_port       = var.db_port
    to_port         = var.db_port
    protocol        = "tcp"
    security_groups = [aws_security_group.app_sg.id]
    description     = "PostgreSQL access from the app EC2 SG"
  }

  # Ops / CI allowlist. CIDRs configured via var.rds_admin_cidrs. Default empty
  # — integration tests run from within the EC2 SG in the CI runner. Add a
  # runner CIDR when a new GitHub Actions network range is needed.
  dynamic "ingress" {
    for_each = length(var.rds_admin_cidrs) > 0 ? [1] : []
    content {
      from_port   = var.db_port
      to_port     = var.db_port
      protocol    = "tcp"
      cidr_blocks = var.rds_admin_cidrs
      description = "PostgreSQL admin/CI allowlist"
    }
  }

  # Pre-Phase-1 rule for reference (DO NOT re-enable without explicit ask):
  # ingress {
  #   from_port   = var.db_port
  #   to_port     = var.db_port
  #   protocol    = "tcp"
  #   cidr_blocks = ["0.0.0.0/0"]
  #   description = "PostgreSQL access from internet"
  # }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = {
    Name        = "${var.project_name}-rds-sg"
    Environment = var.environment
  }
}

# DB subnet group - uses default subnets
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = data.aws_subnets.default.ids

  tags = {
    Name        = "${var.project_name}-db-subnet-group"
    Environment = var.environment
  }
}

# RDS PostgreSQL instance
resource "aws_db_instance" "postgres" {
  # Basic configuration
  identifier = "${var.project_name}-postgres"
  engine     = "postgres"
  engine_version = "16.8"  # Match running environment minor version to avoid downgrade
  
  # Instance configuration
  instance_class    = var.rds_instance_class
  allocated_storage = var.rds_allocated_storage
  storage_type      = "gp3"  # General Purpose SSD (gp3) - better performance than gp2
  storage_encrypted = true   # Encrypt storage at rest
  
  # Database configuration
  db_name  = var.rds_database_name
  username = var.rds_username
  password = var.rds_password
  port     = var.db_port
  
  # Network configuration
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  publicly_accessible    = true  # Allows access from internet (required for external access)
  
  # Backup configuration
  backup_retention_period = 7  # Keep backups for 7 days (free tier allows up to 7 days)
  backup_window          = "03:00-04:00"  # UTC time
  maintenance_window     = "sun:04:00-sun:05:00"  # UTC time
  
  # Monitoring and logging
  monitoring_interval = 0  # Disable enhanced monitoring (not free tier)
  monitoring_role_arn = null
  
  # Performance Insights (disabled for free tier)
  performance_insights_enabled = false
  
  # Deletion protection (disabled for dev environment)
  deletion_protection = var.environment == "prod" ? true : false
  
  # Skip final snapshot for dev environment
  skip_final_snapshot = var.environment != "prod"
  final_snapshot_identifier = var.environment == "prod" ? "${var.project_name}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null
  
  # Auto minor version upgrade
  auto_minor_version_upgrade = true
  
  tags = {
    Name        = "${var.project_name}-postgres"
    Environment = var.environment
  }
}

