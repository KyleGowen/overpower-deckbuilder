#!/usr/bin/env bash
# Formatted API health check for local dev (:8085). Repo root relative.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
JQ_FILE="${ROOT}/scripts/dev-health-check.jq"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required for formatted health output. Install jq or use: curl -s http://localhost:8085/health" >&2
  exit 1
fi

curl -sf "http://localhost:8085/health" | jq -r -f "${JQ_FILE}"
