# Range hosted labs: the shared AWS pieces every student lab uses.
#   - a private network with one public subnet (labs and the gateway)
#   - the Guacamole gateway that opens labs in the browser
#   - an AWS login Range uses to start, stop and reset labs, limited to lab machines
#   - a monthly budget alert
# Student labs themselves are created by Range, not by Terraform.

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws    = { source = "hashicorp/aws", version = "~> 5.0" }
    random = { source = "hashicorp/random", version = "~> 3.6" }
  }
}

provider "aws" {
  region = var.region
  default_tags {
    tags = { project = "casefile-hosted-labs" }
  }
}

data "aws_caller_identity" "me" {}
data "aws_availability_zones" "az" { state = "available" }

# ---- network -------------------------------------------------------------

resource "aws_vpc" "labs" {
  cidr_block           = "10.60.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags                 = { Name = "casefile-labs" }
}

resource "aws_internet_gateway" "labs" {
  vpc_id = aws_vpc.labs.id
  tags   = { Name = "casefile-labs" }
}

# Public addresses give labs a way out to Range without a NAT gateway.
# Nothing can reach a lab from the internet: its security group only lets the gateway in.
resource "aws_subnet" "labs" {
  vpc_id                  = aws_vpc.labs.id
  cidr_block              = "10.60.1.0/24"
  availability_zone       = data.aws_availability_zones.az.names[0]
  map_public_ip_on_launch = true
  tags                    = { Name = "casefile-labs" }
}

resource "aws_route_table" "labs" {
  vpc_id = aws_vpc.labs.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.labs.id
  }
  tags = { Name = "casefile-labs" }
}

resource "aws_route_table_association" "labs" {
  subnet_id      = aws_subnet.labs.id
  route_table_id = aws_route_table.labs.id
}

# ---- security groups -----------------------------------------------------

resource "aws_security_group" "gateway" {
  name        = "casefile-lab-gateway"
  description = "Guacamole gateway: HTTPS from anywhere, HTTP for the certificate check"
  vpc_id      = aws_vpc.labs.id

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "HTTP for the Lets Encrypt check and the redirect to HTTPS"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "lab" {
  name        = "casefile-lab"
  description = "Student labs: remote desktop from the gateway only, web out only"
  vpc_id      = aws_vpc.labs.id

  ingress {
    description     = "Remote desktop from the gateway"
    from_port       = 3389
    to_port         = 3389
    protocol        = "tcp"
    security_groups = [aws_security_group.gateway.id]
  }
  egress {
    description = "HTTPS out, for the lab sync to CaseFile"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    description = "HTTP out, for certificate revocation checks"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ---- gateway ---------------------------------------------------------------

resource "random_id" "gateway_key" {
  byte_length = 16 # guacamole-auth-json wants a 128-bit key, as 32 hex characters
}

resource "random_id" "lab_secret" {
  byte_length = 32 # encrypts each lab's remote-desktop password in Range
}

data "aws_ssm_parameter" "al2023" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

resource "aws_iam_role" "gateway" {
  name = "casefile-lab-gateway"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "ec2.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}

# Shell access through Session Manager, so no SSH port is open.
resource "aws_iam_role_policy_attachment" "gateway_ssm" {
  role       = aws_iam_role.gateway.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "gateway" {
  name = "casefile-lab-gateway"
  role = aws_iam_role.gateway.name
}

resource "aws_instance" "gateway" {
  ami                    = data.aws_ssm_parameter.al2023.value
  instance_type          = var.gateway_instance_type
  subnet_id              = aws_subnet.labs.id
  vpc_security_group_ids = [aws_security_group.gateway.id]
  iam_instance_profile   = aws_iam_instance_profile.gateway.name
  user_data = templatefile("${path.module}/gateway-user-data.sh.tftpl", {
    domain     = var.gateway_domain
    json_key   = random_id.gateway_key.hex
    acme_email = var.alert_email
  })
  user_data_replace_on_change = true

  metadata_options {
    http_tokens = "required"
  }
  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }
  tags = { Name = "casefile-lab-gateway" }
}

resource "aws_eip" "gateway" {
  instance = aws_instance.gateway.id
  domain   = "vpc"
  tags     = { Name = "casefile-lab-gateway" }
}

# ---- Range's AWS login -------------------------------------------------
# It can create lab machines only with the casefile-lab tag, only in this
# subnet and security group, and can only start, stop or end tagged machines.

locals {
  arn_prefix = "arn:aws:ec2:${var.region}:${data.aws_caller_identity.me.account_id}"
}

resource "aws_iam_user" "casefile" {
  name = "casefile-hosted-labs"
}

resource "aws_iam_user_policy" "casefile" {
  name = "casefile-hosted-labs"
  user = aws_iam_user.casefile.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "LaunchTaggedLabs"
        Effect   = "Allow"
        Action   = "ec2:RunInstances"
        Resource = ["${local.arn_prefix}:instance/*", "${local.arn_prefix}:volume/*"]
        Condition = {
          StringEquals = { "aws:RequestTag/casefile-lab" = "true" }
        }
      },
      {
        Sid    = "LaunchIntoLabNetwork"
        Effect = "Allow"
        Action = "ec2:RunInstances"
        Resource = [
          "arn:aws:ec2:${var.region}::image/*",
          aws_subnet.labs.arn,
          aws_security_group.lab.arn,
          "${local.arn_prefix}:network-interface/*",
        ]
      },
      {
        Sid      = "TagAtLaunch"
        Effect   = "Allow"
        Action   = "ec2:CreateTags"
        Resource = ["${local.arn_prefix}:instance/*", "${local.arn_prefix}:volume/*"]
        Condition = {
          StringEquals = { "ec2:CreateAction" = "RunInstances" }
        }
      },
      {
        Sid      = "ManageLabs"
        Effect   = "Allow"
        Action   = ["ec2:StartInstances", "ec2:StopInstances", "ec2:TerminateInstances"]
        Resource = "${local.arn_prefix}:instance/*"
        Condition = {
          StringEquals = { "ec2:ResourceTag/casefile-lab" = "true" }
        }
      },
      {
        Sid      = "SeeLabs"
        Effect   = "Allow"
        Action   = "ec2:DescribeInstances"
        Resource = "*"
      },
    ]
  })
}

resource "aws_iam_access_key" "casefile" {
  user = aws_iam_user.casefile.name
}

# ---- budget ----------------------------------------------------------------

resource "aws_budgets_budget" "labs" {
  name         = "casefile-hosted-labs"
  budget_type  = "COST"
  limit_amount = tostring(var.monthly_budget_usd)
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = [var.alert_email]
  }
}
