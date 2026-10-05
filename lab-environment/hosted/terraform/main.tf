# Range hosted labs: the shared AWS pieces every student lab pod uses.
#   - a private network with one public subnet (lab pods and the gateway)
#   - the Guacamole gateway that opens labs in the browser
#   - a pool of pod security groups, one per student, so no pod can reach another
#   - an AWS login Range uses to start, stop and reset pods, limited to lab machines
#   - a monthly budget alert
#
# A pod is one student's two machines: a Windows domain controller and an Ubuntu
# server. The pod's machines talk to each other freely and to nothing else on the
# network. Range creates the machines; Terraform owns every piece of the network
# they land in, so the Vercel key cannot change where a lab sits or who can
# reach it.

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

# The image builder's security group. Students do not use this one -- each gets a
# pod group below. Kept because image/build-image.ps1 launches the builder into it.
# Its description still says "student labs", which it no longer is. AWS cannot
# edit a description, so changing the wording replaces the group, and the group
# cannot be deleted while a stopped lab still has it attached. Not worth an
# outage; this comment is the correction.
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

# ---- pod security groups ---------------------------------------------------
# One group per student, claimed when their pod is built and released when it is
# torn down. Everything a pod needs is inside the group:
#
#   - the two machines in the group reach each other on every port, which is what
#     DNS, Kerberos, LDAP and SMB between the Ubuntu server and the domain
#     controller need, and what makes the pod feel like a small real network
#   - the gateway reaches them on 3389 and 22, and nothing else reaches them at
#     all: no rule names the internet, another pod, or the wider VPC
#   - they reach the web on 80 and 443 only, for apt, Windows updates and the
#     sync back to Range
#
# A security group is default-deny, so student A's Ubuntu box cannot see student
# B's domain controller: B's group names only B's own group and the gateway.
# Groups cost nothing, so the pool is sized for the class rather than the hour.

resource "aws_security_group" "pod" {
  count       = var.pod_slots
  name        = "casefile-pod-${count.index}"
  description = "Lab pod ${count.index}: its own two machines, the gateway, and the web"
  vpc_id      = aws_vpc.labs.id

  ingress {
    description = "Both machines in this pod, on every port"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    self        = true
  }
  ingress {
    description     = "Remote desktop to the domain controller, from the gateway"
    from_port       = 3389
    to_port         = 3389
    protocol        = "tcp"
    security_groups = [aws_security_group.gateway.id]
  }
  ingress {
    description     = "A shell on the Ubuntu server, from the gateway"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.gateway.id]
  }
  egress {
    description = "HTTPS out: the sync to Range, the SSM agent, apt, Windows update"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    description = "HTTP out: apt and certificate revocation checks"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Range is allowed to launch into a group carrying this tag and no other, so
  # the tag is what keeps a lab out of the gateway group. See the login below.
  tags = {
    Name           = "casefile-pod-${count.index}"
    "casefile-pod" = "true"
    slot           = tostring(count.index)
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

# Canonical's own Ubuntu 24.04 LTS image, read so the pod's Ubuntu AMI lands in
# the Vercel output rather than being looked up by hand. It is pinned in Vercel
# on purpose: a cohort should not get a different Ubuntu halfway through.
data "aws_ssm_parameter" "ubuntu2404" {
  name = "/aws/service/canonical/ubuntu/server/24.04/stable/current/amd64/hvm/ebs-gp3/ami-id"
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

  # The base Amazon Linux image drifts to newer versions over time. Ignore that
  # so a routine apply never tears down the running gateway; rebuild it on purpose.
  lifecycle {
    ignore_changes = [ami]
  }
}

resource "aws_eip" "gateway" {
  instance = aws_instance.gateway.id
  domain   = "vpc"
  tags     = { Name = "casefile-lab-gateway" }
}

# ---- lab instance role (SSM agent) ----------------------------------------
# Each lab runs with this role so the SSM agent can register. That lets Range
# fire Shift incidents into the lab. The role can do nothing else.

resource "aws_iam_role" "lab" {
  name = "casefile-lab"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "ec2.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}

resource "aws_iam_role_policy_attachment" "lab_ssm" {
  role       = aws_iam_role.lab.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "lab" {
  name = "casefile-lab"
  role = aws_iam_role.lab.name
}

# ---- Range's AWS login -------------------------------------------------
# The key Vercel holds. It can build a lab pod and nothing else:
#
#   - launch a machine only with the casefile-lab tag, only in the lab subnet,
#     and only into a security group tagged casefile-pod -- never the gateway's
#   - only the three instance types a lab uses, so a stolen key cannot start a
#     fleet of large machines
#   - start, stop and terminate only tagged lab machines
#   - run only the PowerShell and shell documents, only on tagged lab machines
#
# It cannot create or edit a security group, a subnet or a route. The shape of
# the network is Terraform's alone, so a key leak cannot open a lab to the
# internet or let one pod reach another. It is a managed policy rather than an
# inline one because an inline user policy is capped at 2,048 characters.

locals {
  arn_prefix = "arn:aws:ec2:${var.region}:${data.aws_caller_identity.me.account_id}"
  # What a lab pod is allowed to be. Anything else is denied below.
  lab_instance_types = [var.dc_instance_type, var.linux_instance_type, "t3.medium"]
}

resource "aws_iam_user" "casefile" {
  name = "casefile-hosted-labs"
}

resource "aws_iam_policy" "casefile" {
  name        = "casefile-hosted-labs"
  description = "What Range may do in AWS: build and run student lab pods, nothing else."
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
          "${local.arn_prefix}:network-interface/*",
        ]
      },
      {
        # Only a pod group. The gateway group has no casefile-pod tag, so a lab
        # cannot be launched into the one group that the internet can reach.
        Sid      = "LaunchIntoPodGroupOnly"
        Effect   = "Allow"
        Action   = "ec2:RunInstances"
        Resource = "${local.arn_prefix}:security-group/*"
        Condition = {
          StringEquals = { "aws:ResourceTag/casefile-pod" = "true" }
        }
      },
      {
        Sid      = "NeverTheGatewayGroup"
        Effect   = "Deny"
        Action   = "ec2:RunInstances"
        Resource = aws_security_group.gateway.arn
      },
      {
        # A stolen key cannot turn the account into a mining fleet.
        Sid      = "OnlyLabSizedMachines"
        Effect   = "Deny"
        Action   = "ec2:RunInstances"
        Resource = "${local.arn_prefix}:instance/*"
        Condition = {
          StringNotEquals = { "ec2:InstanceType" = local.lab_instance_types }
        }
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
        # Read-only. Describing groups is how Range finds the pod group for a slot.
        Sid      = "SeeLabs"
        Effect   = "Allow"
        Action   = ["ec2:DescribeInstances", "ec2:DescribeSecurityGroups"]
        Resource = "*"
      },
      {
        Sid      = "GiveLabsTheAgentRole"
        Effect   = "Allow"
        Action   = "iam:PassRole"
        Resource = aws_iam_role.lab.arn
        Condition = {
          StringEquals = { "iam:PassedToService" = "ec2.amazonaws.com" }
        }
      },
      {
        Sid      = "FireShiftIncidents"
        Effect   = "Allow"
        Action   = "ssm:SendCommand"
        Resource = "${local.arn_prefix}:instance/*"
        Condition = {
          StringEquals = { "ssm:resourceTag/casefile-lab" = "true" }
        }
      },
      {
        Sid    = "RunTheTwoScriptDocuments"
        Effect = "Allow"
        Action = "ssm:SendCommand"
        Resource = [
          "arn:aws:ssm:${var.region}::document/AWS-RunPowerShellScript",
          "arn:aws:ssm:${var.region}::document/AWS-RunShellScript",
        ]
      },
      {
        Sid      = "SeeCommandResults"
        Effect   = "Allow"
        Action   = ["ssm:GetCommandInvocation", "ssm:ListCommandInvocations"]
        Resource = "*"
      },
    ]
  })
}

resource "aws_iam_user_policy_attachment" "casefile" {
  user       = aws_iam_user.casefile.name
  policy_arn = aws_iam_policy.casefile.arn
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
