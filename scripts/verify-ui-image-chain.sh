#!/usr/bin/env bash
# Quick triage: UI assets under /src/resources/images/ (logo, icons, backgrounds).
# In production, expect 302 to CloudFront and a follow-up 200 on the Location URL
# (see src/middleware/staticAssetCache.ts, docs/current/CLOUDFRONT_CDN.md).
# Local dev with no CDN_BASE_URL: expect 200 from Express static.
#
# Usage:
#   ./scripts/verify-ui-image-chain.sh
#   ./scripts/verify-ui-image-chain.sh https://excelsior.cards
#   ./scripts/verify-ui-image-chain.sh http://localhost:8085
set -euo pipefail
HOST="${1:-http://127.0.0.1:8085}"
BASE="${HOST%/}"
URL="${BASE}/src/resources/images/logo/logo5.png"
echo "== HEAD ${URL} =="
curl -sSIL --max-time 15 "$URL" | head -30 || true
echo ""
echo "If you see 302, copy the Location and: curl -sSIL \"<Location>\" | head -20"
echo "Expected: image/png and 200 (or 200 on origin when CDN_BASE_URL is unset)."
