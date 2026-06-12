#!/usr/bin/env bash
# Run one PT scenario against local Docker mock API.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
# shellcheck source=resolve-k6-users.sh
source docker-local-pt/scripts/resolve-k6-users.sh

SCENARIO="${1:-${SCENARIO:-BP001}}"
PLATFORM="${2:-${PLATFORM:-Web}}"
VARIANT="${3:-${VARIANT:-original}}"
SUITE="${SUITE:-Growin_PT_Dev[ToDo]}"
DURATION="${DURATION:-30s}"
MOCK_LATENCY_MS="${MOCK_LATENCY_MS:-80}"
MOCK_ERROR_RATE="${MOCK_ERROR_RATE:-0}"
USE_GRAFANA_OUTPUT="${USE_GRAFANA_OUTPUT:-false}"
ENV="${ENV:-LOCAL}"
RUNBY="${RUNBY:-LocalDocker}"

resolve_k6_users
USER_N="$K6_USERS"

COMPOSE_FILE="docker-local-pt/docker-compose.yml"
HAS_CONFIG=false

PREFIX=""
[[ "$VARIANT" == "enchange" ]] && PREFIX="enchange_"
SCRIPT_REL="Script/${SUITE}/${PLATFORM}/${PREFIX}${SCENARIO}.js"
if [[ ! -f "$SCRIPT_REL" ]]; then
  echo "ERROR: script not found: $SCRIPT_REL" >&2
  exit 1
fi

TS="$(date +%Y%m%d_%H%M%S)"
SAFE_SUITE="${SUITE//\//_}"
BASENAME="${SAFE_SUITE}_${SCENARIO}_${PLATFORM}_${VARIANT}_${TS}"
GEN_RUNNER="docker-local-pt/results/.runner-${SAFE_SUITE}_${SCENARIO}_${PLATFORM}_${VARIANT}.js"

mkdir -p docker-local-pt/results

BP_CONFIG_FILE_ENV=""
for d in Configs configs Config; do
  YAML="Script/${SUITE}/${d}/${SCENARIO}.yaml"
  YML="Script/${SUITE}/${d}/${SCENARIO}.yml"
  if [[ -f "$YAML" ]]; then
    node docker-local-pt/scripts/yaml-to-json.mjs "$YAML" > "docker-local-pt/results/${SCENARIO}.json"
    BP_CONFIG_FILE_ENV="/results/${SCENARIO}.json"
    HAS_CONFIG=true
    break
  fi
  if [[ -f "$YML" ]]; then
    node docker-local-pt/scripts/yaml-to-json.mjs "$YML" > "docker-local-pt/results/${SCENARIO}.json"
    BP_CONFIG_FILE_ENV="/results/${SCENARIO}.json"
    HAS_CONFIG=true
    break
  fi
done

node docker-local-pt/scripts/gen-mock-runner.mjs \
  --suite "$SUITE" --scenario "$SCENARIO" --platform "$PLATFORM" --variant "$VARIANT" \
  --has-config "$HAS_CONFIG" --out "$GEN_RUNNER"

echo ">> mock-api up"
docker compose -f "$COMPOSE_FILE" up -d mock-api
curl -sf "http://localhost:18080/health" >/dev/null || { echo "mock health failed" >&2; exit 1; }

ENV_ARGS=(
  -e "PT_RUNNER=${GEN_RUNNER}"
  -e "SUITE=${SUITE}"
  -e "SCENARIO=${SCENARIO}"
  -e "PLATFORM=${PLATFORM}"
  -e "VARIANT=${VARIANT}"
  -e "K6_USERS=${K6_USERS}"
  -e "USER_COUNT=${USER_COUNT}"
  -e "USER=${K6_USERS}"
  -e "DURATION=${DURATION}"
  -e "ENV=${ENV}"
  -e "RUNBY=${RUNBY}"
  -e "MOCK_RESULT_BASENAME=${BASENAME}"
  -e "BASE_URL=http://mock-api:8080"
  -e "MOCK_LATENCY_MS=${MOCK_LATENCY_MS}"
  -e "MOCK_ERROR_RATE=${MOCK_ERROR_RATE}"
)
[[ -n "$BP_CONFIG_FILE_ENV" ]] && ENV_ARGS+=(-e "BP_CONFIG_FILE=${BP_CONFIG_FILE_ENV}")

if [[ "$USE_GRAFANA_OUTPUT" == "true" ]]; then
  docker compose -f "$COMPOSE_FILE" --profile observability up -d influxdb 2>/dev/null || true
  ENV_ARGS+=(-e "K6_OUT=influxdb=http://influxdb:8086/k6")
else
  ENV_ARGS+=(-e "K6_OUT=")
fi

echo ">> k6 ${SCRIPT_REL} (${VARIANT}) K6_USERS=${K6_USERS} DURATION=${DURATION} ENV=${ENV}"
docker compose -f "$COMPOSE_FILE" run --rm "${ENV_ARGS[@]}" k6-runner

if [[ -f "docker-local-pt/results/summary.json" ]]; then
  cp "docker-local-pt/results/summary.json" "docker-local-pt/results/${BASENAME}.json"
  echo ">> summary: docker-local-pt/results/${BASENAME}.json"
fi
