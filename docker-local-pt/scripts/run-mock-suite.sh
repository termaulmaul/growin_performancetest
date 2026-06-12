#!/usr/bin/env bash
# Safe sweep: all discoverable scenarios vs Docker mock.
# Usage:
#   bash docker-local-pt/scripts/run-mock-suite.sh
#   bash docker-local-pt/scripts/run-mock-suite.sh Growin_Calendar Web
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
# shellcheck source=resolve-k6-users.sh
source docker-local-pt/scripts/resolve-k6-users.sh
resolve_k6_users

SUITE_FILTER="${1:-}"
PLATFORM_FILTER="${2:-}"
USER_N="${K6_USERS}"
DURATION="${DURATION:-10s}"
MOCK_LATENCY_MS="${MOCK_LATENCY_MS:-50}"
MOCK_ERROR_RATE="${MOCK_ERROR_RATE:-0}"
MAX_SCENARIOS="${MAX_SCENARIOS:-0}"

LIST_ARGS=(--json)
[[ -n "$SUITE_FILTER" ]] && LIST_ARGS+=(--suite "$SUITE_FILTER")
node docker-local-pt/scripts/list-scenarios.mjs "${LIST_ARGS[@]}" > docker-local-pt/results/.suite-queue.json

QUEUE="$(node -e "let r=require('./docker-local-pt/results/.suite-queue.json'); if(process.argv[1]) r=r.filter(x=>x.platform===process.argv[1]); if(+process.argv[2]>0) r=r.slice(0,+process.argv[2]); console.log(r.length)" "${PLATFORM_FILTER}" "${MAX_SCENARIOS}")"

REPORT_JSON="docker-local-pt/results/mock-suite-report.json"
REPORT_MD="docker-local-pt/results/mock-suite-report.md"
ITEMS_JSON="docker-local-pt/results/.suite-items.json"
echo "[]" > "$ITEMS_JSON"

echo ">> suite sweep queue=${QUEUE} USER=${USER_N} DURATION=${DURATION}"
PASS=0
FAIL=0

node -e "
const fs=require('fs');
let rows=require('./docker-local-pt/results/.suite-queue.json').filter(r=>r.mockReady);
const pf=process.argv[1]; const max=+process.argv[2]||0;
if(pf) rows=rows.filter(r=>r.platform===pf);
if(max>0) rows=rows.slice(0,max);
for (const r of rows) console.log([r.suite,r.scenario,r.platform,r.variant].join('\t'));
" "${PLATFORM_FILTER}" "${MAX_SCENARIOS}" | while IFS=$'\t' read -r suite scenario platform variant; do
  echo "---- ${suite} ${scenario} ${platform} ${variant} ----"
  set +e
  SUITE="$suite" K6_USERS="$USER_N" USER_COUNT="$USER_N" DURATION="$DURATION" MOCK_LATENCY_MS="$MOCK_LATENCY_MS" MOCK_ERROR_RATE="$MOCK_ERROR_RATE" USE_GRAFANA_OUTPUT="${USE_GRAFANA_OUTPUT:-false}" \
    bash docker-local-pt/scripts/run-mock-scenario.sh "$scenario" "$platform" "$variant"
  code=$?
  set -e
  status=pass
  [[ $code -ne 0 ]] && status=fail
  [[ $status == pass ]] && PASS=$((PASS+1)) || FAIL=$((FAIL+1))
  node -e "
const fs=require('fs'); const p=process.argv[1];
const items=JSON.parse(fs.readFileSync(p,'utf8'));
items.push({suite:process.argv[2],scenario:process.argv[3],platform:process.argv[4],variant:process.argv[5],status:process.argv[6],exit:+process.argv[7]});
fs.writeFileSync(p, JSON.stringify(items));
" "$ITEMS_JSON" "$suite" "$scenario" "$platform" "$variant" "$status" "$code"
done

node -e "
const fs=require('fs');
const items=JSON.parse(fs.readFileSync('docker-local-pt/results/.suite-items.json','utf8'));
const report={generatedAt:new Date().toISOString(),pass:items.filter(i=>i.status==='pass').length,fail:items.filter(i=>i.status==='fail').length,total:items.length,defaults:{USER:process.env.USER||'1',DURATION:process.env.DURATION||'10s'},items};
fs.writeFileSync('docker-local-pt/results/mock-suite-report.json', JSON.stringify(report,null,2));
let md='# Mock Suite Report\\n\\nGenerated: '+report.generatedAt+'\\n\\n| Pass | Fail | Total |\\n|---:|---:|---:|\\n| '+report.pass+' | '+report.fail+' | '+report.total+' |\\n\\n';
md+='| Suite | Scenario | Platform | Variant | Status |\\n|---|---|---|---|---|\\n';
for (const i of items) md+='| '+[i.suite,i.scenario,i.platform,i.variant,i.status].join(' | ')+' |\\n';
fs.writeFileSync('docker-local-pt/results/mock-suite-report.md', md);
console.log('>>', 'docker-local-pt/results/mock-suite-report.md');
"
