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
CACHE_DIR="${SHIP_TEST_CACHE_DIR:-$ROOT/.ship-test-cache.d}"
LEGACY_CACHE_FILE="$ROOT/.ship-test-cache"
MODE="${1:-}"

if [[ "$MODE" != "unit" && "$MODE" != "integration" ]]; then
  echo "Usage: $0 unit|integration" >&2
  echo "Set SHIP_TESTS_FORCE=1 (or true) to always run tests." >&2
  exit 2
fi

current_fp() {
  node "$ROOT/scripts/ship-tree-fingerprint.mjs" "$ROOT"
}

read_stored_fp() {
  local key="$1"
  if [[ -f "$CACHE_DIR/$key" ]]; then
    cat "$CACHE_DIR/$key"
    return 0
  fi
  [[ -f "$LEGACY_CACHE_FILE" ]] || { echo ""; return 0; }
  grep "^${key}=" "$LEGACY_CACHE_FILE" 2>/dev/null | tail -1 | cut -d= -f2- || echo ""
}

write_stored_fp() {
  local key="$1" val="$2"
  local tmp
  mkdir -p "$CACHE_DIR"
  tmp="$(mktemp "$CACHE_DIR/.${key}.XXXXXX")"
  printf '%s\n' "$val" >"$tmp"
  mv "$tmp" "$CACHE_DIR/$key"
}

run_tests() {
  if [[ "$MODE" == "integration" ]]; then
    npm run test:integration:sharded
  else
    npm run "test:${MODE}"
  fi
}

if [[ "${SHIP_TESTS_FORCE:-}" == "1" || "${SHIP_TESTS_FORCE:-}" == "true" ]]; then
  echo "ship-conditional-test: SHIP_TESTS_FORCE set — running ${MODE} tests"
  run_tests
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
run_tests
EC=$?
if [[ $EC -eq 0 ]]; then
  write_stored_fp "$MODE" "$FP"
  echo "ship-conditional-test: recorded ${MODE} ok"
fi
exit "$EC"
