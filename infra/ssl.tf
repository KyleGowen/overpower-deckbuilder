# SSL / TLS for excelsior.cards
#
# Phase 0 of the external-API-client hardening plan (see
# docs/current/OPS_TLS_AND_HTTPS.md) puts CloudFront in front of the apex
# domain. That requires an ACM certificate in us-east-1 (the only region
# CloudFront reads viewer certs from).
#
# Cost: free when used with CloudFront/ALB. Renewal is handled automatically
# by ACM provided the Route53 validation records stay in place.

resource "aws_acm_certificate" "main" {
  provider                  = aws.us_east_1
  domain_name               = var.domain_name
  subject_alternative_names = ["www.${var.domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-ssl-cert"
  })
}

# DNS validation records in Route53. ACM publishes one CNAME per SAN; we loop
# over the validation set so adding a new SAN just requires updating the cert.
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main.zone_id
}

resource "aws_acm_certificate_validation" "main" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

output "acm_certificate_arn" {
  description = "ARN of the ACM cert attached to the CloudFront distribution"
  value       = aws_acm_certificate_validation.main.certificate_arn
}
