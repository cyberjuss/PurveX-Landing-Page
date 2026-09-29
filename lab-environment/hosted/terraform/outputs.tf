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

# Paste these into Vercel. Add HOSTED_LAB_AMI after the image is built, and HOSTED_LAB_EMAILS for the pilot.
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
    HOSTED_LAB_INSTANCE_TYPE         = "t3.medium"
    HOSTED_LAB_INSTANCE_PROFILE      = aws_iam_instance_profile.lab.name
  }
}
