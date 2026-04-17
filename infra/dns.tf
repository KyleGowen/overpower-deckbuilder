# DNS Configuration for excelsior.cards domain

# Create Route 53 hosted zone for excelsior.cards
resource "aws_route53_zone" "main" {
  name = var.domain_name

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-hosted-zone"
  })
}

# Data source to reference the hosted zone (for use in other resources)
data "aws_route53_zone" "main" {
  name         = aws_route53_zone.main.name
  private_zone = false
  depends_on   = [aws_route53_zone.main]
}

# Phase 0 (see docs/current/OPS_TLS_AND_HTTPS.md):
#
# - Apex `excelsior.cards` is an ALIAS A record targeting the CloudFront
#   distribution so viewer traffic terminates TLS at CloudFront.
# - `www.excelsior.cards` is an ALIAS CNAME-equivalent targeting the same
#   CloudFront distribution.
# - `origin.excelsior.cards` is a direct A record to the EC2 EIP so CloudFront
#   can reach the origin without looping through the apex alias (which would
#   be a "CloudFront → CloudFront" loop).

resource "aws_route53_record" "main" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.card_images.domain_name
    zone_id                = aws_cloudfront_distribution.card_images.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.card_images.domain_name
    zone_id                = aws_cloudfront_distribution.card_images.hosted_zone_id
    evaluate_target_health = false
  }
}

# Origin hostname for CloudFront → EC2. Never aliased — must stay pointed at
# the raw EIP so CloudFront can resolve it outside the CloudFront graph.
resource "aws_route53_record" "origin" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "origin.${var.domain_name}"
  type    = "A"
  ttl     = 300
  records = [aws_eip.app_eip.public_ip]
}

# Email forwarding DNS records for Amazon SES

# DKIM CNAME records for email authentication
resource "aws_route53_record" "dkim_1" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "xonnbcs2hhr4stwsl7jnwtjf4auqxews._domainkey.excelsior.cards"
  type    = "CNAME"
  ttl     = 300
  records = ["xonnbcs2hhr4stwsl7jnwtjf4auqxews.dkim.amazonses.com"]
}

resource "aws_route53_record" "dkim_2" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "o6afnxv46ggqws4xxexivbm4bd4dwcuq._domainkey.excelsior.cards"
  type    = "CNAME"
  ttl     = 300
  records = ["o6afnxv46ggqws4xxexivbm4bd4dwcuq.dkim.amazonses.com"]
}

resource "aws_route53_record" "dkim_3" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "o2ygfccjz4c6s7zfxqbo3tfr7vlu7s3u._domainkey.excelsior.cards"
  type    = "CNAME"
  ttl     = 300
  records = ["o2ygfccjz4c6s7zfxqbo3tfr7vlu7s3u.dkim.amazonses.com"]
}

# DMARC TXT record for email policy
resource "aws_route53_record" "dmarc" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "_dmarc.excelsior.cards"
  type    = "TXT"
  ttl     = 300
  records = ["v=DMARC1; p=none;"]
}

# MX record to route mail to Amazon SES
resource "aws_route53_record" "mx" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "excelsior.cards"
  type    = "MX"
  ttl     = 3600
  records = ["10 inbound-smtp.us-west-2.amazonaws.com"]
}

# Optional: AAAA record for IPv6 (if you have IPv6 support)
# resource "aws_route53_record" "main_ipv6" {
#   zone_id = data.aws_route53_zone.main.zone_id
#   name    = "excelsior.cards"
#   type    = "AAAA"
#   ttl     = 300
#   records = [aws_eip.app_eip.ipv6_addresses]
# }
