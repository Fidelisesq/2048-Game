#!/bin/bash
# Import existing Route53 record into Terraform state
# Replace HOSTED_ZONE_ID with your actual hosted zone ID
# Replace SUBDOMAIN with your actual subdomain (e.g., play-2048)

terraform import aws_route53_record.game HOSTED_ZONE_ID_SUBDOMAIN.fozdigitalz.com_A

# Example:
# terraform import aws_route53_record.game Z1234567890ABC_play-2048.fozdigitalz.com_A