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

variable "ecr_repository_name" {
  description = "ECR repository name"
  type        = string
  default     = "2048-game"
}

variable "ecs_cluster_name" {
  description = "ECS cluster name"
  type        = string
  default     = "2048-cluster"
}

variable "ecs_service_name" {
  description = "ECS service name"
  type        = string
  default     = "2048-service"
}

variable "ecs_task_definition_name" {
  description = "ECS task definition name"
  type        = string
  default     = "2048-task-def"
}

variable "container_name" {
  description = "Container name"
  type        = string
  default     = "2048-container"
}

variable "desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 2
}

variable "vpc_id" {
  description = "ID of existing VPC to use"
  type        = string
}

variable "aws_account_id" {
  description = "AWS Account ID"
  type        = string
}

variable "certificate_arn" {
  description = "ACM Certificate ARN"
  type        = string
}

variable "hosted_zone_id" {
  description = "Route53 Hosted Zone ID"
  type        = string
}