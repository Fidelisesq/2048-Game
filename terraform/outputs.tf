output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.game_bucket.bucket
}

output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID"
  value       = aws_cloudfront_distribution.game_distribution.id
}

output "cloudfront_domain_name" {
  description = "CloudFront Distribution Domain Name"
  value       = aws_cloudfront_distribution.game_distribution.domain_name
}

output "website_url" {
  description = "Website URL"
  value       = "https://${aws_cloudfront_distribution.game_distribution.domain_name}"
}

output "computed_alias" {
  value = "${var.subdomain}.${var.domain_name}"
}
