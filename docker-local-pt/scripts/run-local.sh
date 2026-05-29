#!/bin/sh
# k6 entrypoint inside container. Reads env, runs k6 against mounted /workspace.
set -eu
cd /workspace

echo "──────── Local PT Run ────────"
echo " PT_RUNNER : ${PT_RUNNER}"
echo " SUITE     : ${SUITE:-Growin_PT_Dev[ToDo]}"
echo " SCENARIO  : ${SCENARIO:-BP001}"
echo " PLATFORM  : ${PLATFORM:-Web}"
echo " VARIANT   : ${VARIANT:-original}"
echo " ENV       : ${ENV:-LOCAL}"
echo " K6_USERS  : ${K6_USERS:-${USER_COUNT:-1}}"
echo " USER      : ${USER:-<host>}"
echo " DURATION  : ${DURATION:-30s}"
echo " RUNBY     : ${RUNBY:-LocalDocker}"
echo " NUMSTART  : ${NUMSTART:-1}"
echo " DEBUG     : ${DEBUG:-false}"
echo " BASE_URL  : ${BASE_URL:-http://mock-api:8080}"
echo " BP_CONFIG : ${BP_CONFIG:+(inline, ${#BP_CONFIG} bytes)}"
echo " BP_CONFIG_FILE: ${BP_CONFIG_FILE:-<unset>}"
echo " K6_OUT    : ${K6_OUT:-<stdout>}"
echo "──────────────────────────────"

if [ -z "${BP_CONFIG:-}" ] && [ -n "${BP_CONFIG_FILE:-}" ] && [ -f "${BP_CONFIG_FILE}" ]; then
  case "${BP_CONFIG_FILE}" in
    *.json) BP_CONFIG=$(cat "${BP_CONFIG_FILE}") ;;
    *.yaml|*.yml)
      echo "ERROR: YAML BP_CONFIG_FILE not converted. Run on host:" >&2
      echo "  node docker-local-pt/scripts/yaml-to-json.mjs <yaml> > docker-local-pt/results/BP001.json" >&2
      exit 2 ;;
  esac
  export BP_CONFIG
fi

EXTRA=""
if [ "${USE_GRAFANA_OUTPUT:-false}" = "true" ] && [ -n "${K6_OUT:-}" ]; then
  EXTRA="--out ${K6_OUT}"
elif [ -n "${K6_OUT:-}" ] && [ "${K6_OUT}" != "influxdb=http://influxdb:8086/k6" ]; then
  EXTRA="--out ${K6_OUT}"
fi
[ "${K6_INSECURE_SKIP_TLS_VERIFY:-false}" = "true" ] && EXTRA="$EXTRA --insecure-skip-tls-verify"

exec k6 run "${PT_RUNNER}" \
  -e RUNBY="${RUNBY:-LocalDocker}" \
  -e ENV="${ENV:-LOCAL}" \
  -e K6_USERS="${K6_USERS:-${USER_COUNT:-1}}" \
  -e USER_COUNT="${USER_COUNT:-${K6_USERS:-1}}" \
  -e USER="${K6_USERS:-${USER_COUNT:-1}}" \
  -e DURATION="${DURATION:-30s}" \
  -e NUMSTART="${NUMSTART:-1}" \
  -e SUITE="${SUITE:-Growin_PT_Dev[ToDo]}" \
  -e SCENARIO="${SCENARIO:-BP001}" \
  -e PLATFORM="${PLATFORM:-Web}" \
  -e VARIANT="${VARIANT:-original}" \
  -e MOCK_RESULT_BASENAME="${MOCK_RESULT_BASENAME:-summary}" \
  -e DEBUG="${DEBUG:-false}" \
  -e BASE_URL="${BASE_URL:-http://mock-api:8080}" \
  -e BP_CONFIG="${BP_CONFIG:-}" \
  -e STRICT_PLATFORM_IMPLEMENTATION="${STRICT_PLATFORM_IMPLEMENTATION:-false}" \
  -e ALLOW_ANDROID_WEB_FALLBACK="${ALLOW_ANDROID_WEB_FALLBACK:-true}" \
  $EXTRA
