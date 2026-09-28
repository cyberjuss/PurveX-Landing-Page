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
