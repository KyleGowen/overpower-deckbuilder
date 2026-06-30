#!/usr/bin/env bash
# Poll SSM Run Command until Success or a terminal failure state.
# aws ssm wait command-executed has no --max-attempts/--delay; use this for long ops.
set -euo pipefail

CMD_ID="${1:?command-id required}"
INSTANCE_ID="${2:?instance-id required}"
MAX_ATTEMPTS="${3:-36}"
LABEL="${4:-SSM command}"

if [ -z "$CMD_ID" ]; then
  echo "ERROR: empty command ID — command was never sent."
  exit 1
fi

echo "Polling $LABEL (max $((MAX_ATTEMPTS * 5))s)..."
STATUS="Pending"
for i in $(seq 1 "$MAX_ATTEMPTS"); do
  STATUS=$(aws ssm get-command-invocation \
    --command-id "$CMD_ID" \
    --instance-id "$INSTANCE_ID" \
    --query 'Status' --output text 2>/dev/null || echo "Pending")
  echo "[$i/$MAX_ATTEMPTS] $LABEL status: $STATUS"
  if [ "$STATUS" = "Success" ]; then
    exit 0
  fi
  if [ "$STATUS" = "Failed" ] || [ "$STATUS" = "Cancelled" ] || [ "$STATUS" = "TimedOut" ]; then
    echo "SSM command ended with status: $STATUS"
    aws ssm get-command-invocation \
      --command-id "$CMD_ID" \
      --instance-id "$INSTANCE_ID" \
      --query 'StandardOutputContent' --output text || true
    aws ssm get-command-invocation \
      --command-id "$CMD_ID" \
      --instance-id "$INSTANCE_ID" \
      --query 'StandardErrorContent' --output text || true
    exit 1
  fi
  sleep 5
done

echo "ERROR: $LABEL did not complete within $((MAX_ATTEMPTS * 5))s (last status: ${STATUS})"
echo "SSM Command ID: $CMD_ID"
exit 1
