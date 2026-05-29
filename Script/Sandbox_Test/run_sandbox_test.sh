#!/usr/bin/env bash
# Sandbox simulation test — creates files, verifies, reports pass/fail

set -euo pipefail

TS=$(date +%Y%m%d_%H%M%S)
DIR="/tmp/sandbox_run_${TS}"

echo "── Sandbox Test ──────────────────────────"
echo "  Dir  : $DIR"
echo "  User : $(whoami) @ $(hostname)"
echo "──────────────────────────────────────────"

mkdir -p "$DIR"

echo '{"env":"sandbox","status":"ok"}' > "$DIR/config.json"
echo "alpha content - $TS"          > "$DIR/file_alpha.txt"
echo "beta content - $TS"           > "$DIR/file_beta.txt"
echo "Run by: $(whoami) @ $(hostname)" > "$DIR/run_info.txt"

echo ""
echo "── Verify ────────────────────────────────"
PASS=0; FAIL=0
for f in config.json file_alpha.txt file_beta.txt run_info.txt; do
  if [[ -f "$DIR/$f" ]]; then
    echo "  ✓  $f  ($(wc -c < "$DIR/$f") bytes)"
    PASS=$(( PASS + 1 ))
  else
    echo "  ✘  $f  MISSING"
    FAIL=$(( FAIL + 1 ))
  fi
done

echo ""
echo "── Result ────────────────────────────────"
echo "  PASS: $PASS  |  FAIL: $FAIL"
[[ $FAIL -eq 0 ]] && echo "  ALL CHECKS PASSED" || { echo "  FAILURES DETECTED"; exit 1; }
