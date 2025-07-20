# Debug outputs to check certificate details
output "certificate_domain" {
  description = "Certificate domain name"
  value       = data.aws_acm_certificate.game_cert.domain
}

output "certificate_status" {
  description = "Certificate status"
  value       = data.aws_acm_certificate.game_cert.status
}

output "certificate_subject_alternative_names" {
  description = "Certificate SANs"
  value       = data.aws_acm_certificate.game_cert.subject_alternative_names
}

output "target_domain" {
  description = "Target domain we're trying to use"
  value       = "${var.subdomain}.${var.domain_name}"
}