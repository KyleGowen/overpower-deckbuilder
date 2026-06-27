#!/usr/bin/env bash
# Run Flyway via the official Docker image against local overpower-postgres (:1337).
# Use when Flyway CLI is not installed on the host (Kyle's Windows dev setup).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CMD="${1:-migrate}"

docker run --rm \
  -v "${ROOT}:/workspace" \
  -w /workspace \
  flyway/flyway:latest \
  -configFiles=conf/flyway.docker.conf \
  "${CMD}"
