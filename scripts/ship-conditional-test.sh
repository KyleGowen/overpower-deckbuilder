#!/usr/bin/env bash
# Run unit or integration tests only when the working tree fingerprint changed
# since the last successful run of that suite (for ship / fast iteration).
#
# Usage: bash scripts/ship-conditional-test.sh unit|integration
# Force always run: SHIP_TESTS_FORCE=1 bash scripts/ship-conditional-test.sh unit
#
# Fingerprint = HEAD + staged/unstaged diffs + untracked paths and their content hashes.

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1
CACHE_FILE="$ROOT/.ship-test-cache"
MODE="${1:-}"

if [[ "$MODE" != "unit" && "$MODE" != "integration" ]]; then
  echo "Usage: $0 unit|integration" >&2
  echo "Set SHIP_TESTS_FORCE=1 (or true) to always run tests." >&2
  exit 2
fi

fingerprint_stream() {
  git rev-parse HEAD 2>/dev/null || printf 'NO_HEAD\n'
  git diff --no-ext-diff 2>/dev/null || true
  git diff --cached --no-ext-diff 2>/dev/null || true
  git ls-files -o --exclude-standard 2>/dev/null | LC_ALL=C sort | while IFS= read -r f; do
    [[ -n "$f" && -f "$f" ]] || continue
    printf '%s\t' "$f"
    if command -v sha256sum >/dev/null 2>&1; then
      sha256sum "$f" | awk '{print $1}'
    else
      shasum -a 256 "$f" | awk '{print $1}'
    fi
  done
}

current_fp() {
  if command -v sha256sum >/dev/null 2>&1; then
    fingerprint_stream | sha256sum | awk '{print $1}'
  else
    fingerprint_stream | shasum -a 256 | awk '{print $1}'
  fi
}

read_stored_fp() {
  local key="$1"
  [[ -f "$CACHE_FILE" ]] || { echo ""; return 0; }
  grep "^${key}=" "$CACHE_FILE" 2>/dev/null | tail -1 | cut -d= -f2- || echo ""
}

write_stored_fp() {
  local key="$1" val="$2"
  local tmp
  tmp="$(mktemp)"
  if [[ -f "$CACHE_FILE" ]]; then
    grep -v "^${key}=" "$CACHE_FILE" >"$tmp" 2>/dev/null || true
  else
    : >"$tmp"
  fi
  printf '%s=%s\n' "$key" "$val" >>"$tmp"
  mv "$tmp" "$CACHE_FILE"
}

if [[ "${SHIP_TESTS_FORCE:-}" == "1" || "${SHIP_TESTS_FORCE:-}" == "true" ]]; then
  echo "ship-conditional-test: SHIP_TESTS_FORCE set — running ${MODE} tests"
  npm run "test:${MODE}"
  EC=$?
  if [[ $EC -eq 0 ]]; then
    FP="$(current_fp)"
    write_stored_fp "$MODE" "$FP"
    echo "ship-conditional-test: recorded ${MODE} ok (fp=${FP:0:12}...)"
  fi
  exit "$EC"
fi

FP="$(current_fp)"
STORED="$(read_stored_fp "$MODE")"

if [[ -n "$STORED" && "$STORED" == "$FP" ]]; then
  echo "ship-conditional-test: skip ${MODE} tests (working tree matches last successful run, fp=${FP:0:12}...)"
  exit 0
fi

echo "ship-conditional-test: running ${MODE} tests (fp=${FP:0:12}...)"
npm run "test:${MODE}"
EC=$?
if [[ $EC -eq 0 ]]; then
  write_stored_fp "$MODE" "$FP"
  echo "ship-conditional-test: recorded ${MODE} ok"
fi
exit "$EC"
