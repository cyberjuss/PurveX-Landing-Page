variable "region" {
  description = "AWS region for the labs. Pick the one closest to the students."
  type        = string
  default     = "us-east-1"
}

variable "gateway_domain" {
  description = "Where students open their labs. Point a DNS A record at the gateway_ip output."
  type        = string
  default     = "lab.purvex.io"
}

variable "alert_email" {
  description = "Gets budget alerts and the Let's Encrypt certificate notices."
  type        = string
}

variable "monthly_budget_usd" {
  description = "Monthly AWS budget. An email goes out at 80% spent and when the forecast passes 100%."
  type        = number
  default     = 300
}

variable "gateway_instance_type" {
  description = "t3.small handles a 20-student pilot. Move to t3.xlarge around 200 students."
  type        = string
  default     = "t3.small"
}

variable "pod_slots" {
  description = <<-TEXT
    How many students can have a lab pod at once. Each slot is one security group
    that only the pod's own two machines share, so no student's lab can reach
    another's. Slots cost nothing when empty; raise this and apply again before a
    class outgrows it. The ceiling is the 2,500 security groups a region allows.
  TEXT
  type        = number
  default     = 60
}

variable "linux_instance_type" {
  description = "The Ubuntu server in each pod. It runs no desktop, so t3.small is enough."
  type        = string
  default     = "t3.small"
}

variable "dc_instance_type" {
  description = "The domain controller in each pod."
  type        = string
  default     = "t3.large"
}
