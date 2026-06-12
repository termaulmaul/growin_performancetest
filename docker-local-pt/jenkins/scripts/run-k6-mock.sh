#!/usr/bin/env bash
# Run k6 mock scenario from Jenkins container (or manual exec).
set -euo pipefail

cd "${WORKSPACE:-/workspace}"

SCENARIO="${SCENARIO:-BP001}"
PLATFORM="${PLATFORM:-Web}"
VARIANT="${VARIANT:-original}"
SUITE="${SUITE:-Growin_PT_Dev[ToDo]}"
# shellcheck source=../../scripts/resolve-k6-users.sh
source /workspace/docker-local-pt/scripts/resolve-k6-users.sh
resolve_k6_users
USER_COUNT="${USER_COUNT:-$K6_USERS}"
DURATION="${DURATION:-30s}"
MOCK_LATENCY_MS="${MOCK_LATENCY_MS:-80}"
MOCK_ERROR_RATE="${MOCK_ERROR_RATE:-0}"
BASE_URL="${BASE_URL:-http://mock-api:8080}"
BUILD_ID="${BUILD_ID:-${BUILD_NUMBER:-local}}"
USE_GRAFANA_OUTPUT="${USE_GRAFANA_OUTPUT:-true}"
RUN_ID="${RUN_ID:-${SCENARIO}_${PLATFORM}_${VARIANT}_${BUILD_ID}}"

if ! [[ "$USER_COUNT" =~ ^[0-9]+$ ]] || [ "$USER_COUNT" -gt 2 ]; then
  echo "ERROR: USER_COUNT must be 1-2 (got ${USER_COUNT})" >&2
  exit 1
fi

PREFIX=""
[[ "$VARIANT" == "enchange" ]] && PREFIX="enchange_"
SCRIPT_REL="Script/${SUITE}/${PLATFORM}/${PREFIX}${SCENARIO}.js"
if [[ ! -f "$SCRIPT_REL" ]]; then
  echo "ERROR: script not found: $SCRIPT_REL" >&2
  exit 1
fi

mkdir -p docker-local-pt/results/jenkins
RESULT_DIR="docker-local-pt/results/jenkins"
SAFE_SUITE="${SUITE//\//_}"
GEN_RUNNER="${RESULT_DIR}/.runner-${SAFE_SUITE}_${SCENARIO}_${PLATFORM}_${VARIANT}.js"
HAS_CONFIG=false
BP_CONFIG_FILE_ENV=""

for d in Configs configs Config; do
  YAML="Script/${SUITE}/${d}/${SCENARIO}.yaml"
  YML="Script/${SUITE}/${d}/${SCENARIO}.yml"
  if [[ -f "$YAML" ]]; then
    node docker-local-pt/scripts/yaml-to-json.mjs "$YAML" > "${RESULT_DIR}/${SCENARIO}.json"
    HAS_CONFIG=true
    break
  fi
  if [[ -f "$YML" ]]; then
    node docker-local-pt/scripts/yaml-to-json.mjs "$YML" > "${RESULT_DIR}/${SCENARIO}.json"
    HAS_CONFIG=true
    break
  fi
done

node docker-local-pt/scripts/gen-mock-runner.mjs \
  --suite "$SUITE" --scenario "$SCENARIO" --platform "$PLATFORM" --variant "$VARIANT" \
  --has-config "$HAS_CONFIG" --out "$GEN_RUNNER"

EXTRA=()
if [[ "$USE_GRAFANA_OUTPUT" == "true" ]]; then
  EXTRA+=(--out "influxdb=http://influxdb:8086/k6")
fi

export MOCK_RESULT_BASENAME="jenkins/${RUN_ID}_summary"
export BP_CONFIG=""
if [[ "$HAS_CONFIG" == true ]]; then
  export BP_CONFIG="$(cat "${RESULT_DIR}/${SCENARIO}.json")"
fi

echo ">> k6 ${SCRIPT_REL} USER=${USER_COUNT} DURATION=${DURATION} BASE_URL=${BASE_URL}"
k6 run "${EXTRA[@]}" "$GEN_RUNNER" \
  -e RUNBY="${RUNBY:-JenkinsLocal}" \
  -e ENV="${ENV:-LOCAL}" \
  -e K6_USERS="${K6_USERS}" \
  -e USER_COUNT="${USER_COUNT}" \
  -e USER="${K6_USERS}" \
  -e DURATION="${DURATION}" \
  -e NUMSTART="${NUMSTART:-1}" \
  -e SCENARIO="${SCENARIO}" \
  -e PLATFORM="${PLATFORM}" \
  -e VARIANT="${VARIANT}" \
  -e SUITE="${SUITE}" \
  -e BASE_URL="${BASE_URL}" \
  -e BP_CONFIG="${BP_CONFIG}" \
  -e MOCK_RESULT_BASENAME="${MOCK_RESULT_BASENAME}" \
  -e K6_INSECURE_SKIP_TLS_VERIFY="${K6_INSECURE_SKIP_TLS_VERIFY:-true}" \
  -e DEBUG="${DEBUG:-false}" \
  -e RUN_ID="${RUN_ID}" \
  -e RUNBY="${RUNBY:-JenkinsLocal}"

# k6 writes to /results/... (same bind mount as docker-local-pt/results)
SUMMARY_HOST="${RESULT_DIR}/${RUN_ID}_summary.json"
SUMMARY_VOL="/results/jenkins/${RUN_ID}_summary.json"
if [[ ! -f "$SUMMARY_HOST" && -f "$SUMMARY_VOL" ]]; then
  cp "$SUMMARY_VOL" "$SUMMARY_HOST"
elif [[ ! -f "$SUMMARY_HOST" && -f "docker-local-pt/results/summary.json" ]]; then
  cp docker-local-pt/results/summary.json "$SUMMARY_HOST"
fi
if [[ ! -f "$SUMMARY_HOST" ]]; then
  echo "ERROR: summary not found: $SUMMARY_HOST" >&2
  exit 1
fi
echo ">> done: $SUMMARY_HOST"
