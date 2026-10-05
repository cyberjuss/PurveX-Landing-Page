output "gateway_ip" {
  description = "Point a DNS A record for the gateway domain at this address."
  value       = aws_eip.gateway.public_ip
}

output "lab_subnet_id" {
  description = "Pass to image/build-image.ps1 as -SubnetId."
  value       = aws_subnet.labs.id
}

output "lab_security_group_id" {
  description = "Pass to image/build-image.ps1 as -SecurityGroupId."
  value       = aws_security_group.lab.id
}

# Paste these into Vercel. Add HOSTED_LAB_AMI after the Windows image is built,
# and HOSTED_LAB_EMAILS for the pilot. The Ubuntu AMI comes through already.
# Read with: terraform output -json vercel_env
output "vercel_env" {
  sensitive = true
  value = {
    HOSTED_LAB_REGION                = var.region
    HOSTED_LAB_AWS_ACCESS_KEY_ID     = aws_iam_access_key.casefile.id
    HOSTED_LAB_AWS_SECRET_ACCESS_KEY = aws_iam_access_key.casefile.secret
    HOSTED_LAB_SUBNET                = aws_subnet.labs.id
    HOSTED_LAB_SECURITY_GROUP        = aws_security_group.lab.id
    HOSTED_LAB_GATEWAY_URL           = "https://${var.gateway_domain}"
    HOSTED_LAB_GATEWAY_KEY           = random_id.gateway_key.hex
    HOSTED_LAB_SECRET                = random_id.lab_secret.hex
    HOSTED_LAB_INSTANCE_TYPE         = var.dc_instance_type
    HOSTED_LAB_INSTANCE_PROFILE      = aws_iam_instance_profile.lab.name
    HOSTED_LAB_LINUX_AMI             = data.aws_ssm_parameter.ubuntu2404.value
    HOSTED_LAB_LINUX_INSTANCE_TYPE   = var.linux_instance_type
    HOSTED_LAB_POD_SLOTS             = tostring(var.pod_slots)
  }
}

output "pod_slots" {
  description = "How many students can hold a lab pod at once. Raise var.pod_slots and apply to add more."
  value       = var.pod_slots
}

output "linux_ami" {
  description = "The Ubuntu 24.04 image pods are built from. Set HOSTED_LAB_LINUX_AMI to this."
  value       = nonsensitive(data.aws_ssm_parameter.ubuntu2404.value)
}
