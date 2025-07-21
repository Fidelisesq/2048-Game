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

output "certificate_details" {
  description = "Certificate validation details"
  value = {
    arn    = data.aws_acm_certificate.domain_cert_validation.arn
    domain = data.aws_acm_certificate.domain_cert_validation.domain
    sans   = data.aws_acm_certificate.domain_cert_validation.subject_alternative_names
    status = data.aws_acm_certificate.domain_cert_validation.status
  }
}