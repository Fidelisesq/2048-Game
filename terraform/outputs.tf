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

output "api_gateway_url" {
  description = "API Gateway URL for leaderboard"
  value       = aws_apigatewayv2_stage.api_stage.invoke_url
}

output "computed_alias" {
  value = "${var.subdomain}.${var.domain_name}"
}
