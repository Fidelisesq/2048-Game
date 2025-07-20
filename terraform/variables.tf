variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Domain name for Route53 hosted zone"
  type        = string
  default     = "fozdigitalz.com"
}

variable "subdomain" {
  description = "Subdomain for the game"
  type        = string
  default     = "play-2048"
}

