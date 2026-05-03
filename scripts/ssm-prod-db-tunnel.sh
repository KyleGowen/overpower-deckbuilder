#!/usr/bin/env bash
# Port-forward localhost to RDS via SSM through the app EC2 instance.
#
# IMPORTANT: Start this script FIRST and leave it running. Then connect TablePlus / psql
# to 127.0.0.1:15432 (or LOCAL_PORT) — NOT to the RDS hostname from your laptop.
#
# Usage, IAM, and prerequisites: docs/current/DEPLOYMENT.md (SSM port forwarding).
set -euo pipefail

usage() {
  sed -n '1,10p' "$0" | tail -n +2
  exit "${1:-0}"
}

if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
  usage 0
fi

AWS_REGION="${AWS_REGION:-us-west-2}"
LOCAL_PORT="${LOCAL_PORT:-15432}"
RDS_PORT="${RDS_PORT:-5432}"
RDS_HOST="${RDS_HOST:-op-deckbuilder-postgres.cdaeyc0ik7bu.us-west-2.rds.amazonaws.com}"
EC2_INSTANCE_ID="${EC2_INSTANCE_ID:-${1:-}}"

if [[ -z "${EC2_INSTANCE_ID}" ]]; then
  echo "Usage: EC2_INSTANCE_ID=i-... ./scripts/ssm-prod-db-tunnel.sh" >&2
  echo "   or: ./scripts/ssm-prod-db-tunnel.sh i-..." >&2
  exit 1
fi

exec aws ssm start-session \
  --region "${AWS_REGION}" \
  --target "${EC2_INSTANCE_ID}" \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters "{\"host\":[\"${RDS_HOST}\"],\"portNumber\":[\"${RDS_PORT}\"],\"localPortNumber\":[\"${LOCAL_PORT}\"]}"