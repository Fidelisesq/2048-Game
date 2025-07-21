output "website_url" {
  description = "URL of the 2048 game website"
  value       = "https://${var.subdomain}.${var.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID"
  value       = aws_cloudfront_distribution.game_distribution.id
}

output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.game_bucket.bucket
}

