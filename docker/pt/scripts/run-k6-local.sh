#!/bin/sh
# Local k6 entrypoint inside container.
# - prints active env
# - reads BP_CONFIG (raw JSON) or BP_CONFIG_FILE (pre-rendered JSON path)
# - executes k6 with the configured runner
set -e

WORK=${WORK:-/work}
cd "$WORK"

echo "──────── PT Local Run ────────"
echo " PT_RUNNER  : ${PT_RUNNER}"
echo " SCENARIO   : ${SCENARIO}"
echo " PLATFORM   : ${PLATFORM}"
echo " ENV        : ${ENV}"
echo " USER       : ${USER:-1}"
echo " DURATION   : ${DURATION:-30s}"
echo " RUNBY      : ${RUNBY:-LocalDocker}"
echo " NUMSTART   : ${NUMSTART:-1}"
echo " DEBUG      : ${DEBUG:-false}"
echo " BP_CONFIG  : ${BP_CONFIG:+(set, ${#BP_CONFIG} bytes)}"
echo " BP_CONFIG_FILE: ${BP_CONFIG_FILE:-<unset>}"
echo " K6_OUT     : ${K6_OUT:-<stdout>}"
echo "──────────────────────────────"

# If BP_CONFIG empty AND BP_CONFIG_FILE points to .json, use the file content as BP_CONFIG.
if [ -z "${BP_CONFIG:-}" ] && [ -n "${BP_CONFIG_FILE:-}" ]; then
  case "${BP_CONFIG_FILE}" in
    *.json) BP_CONFIG=$(cat "${BP_CONFIG_FILE}") ;;
    *.yaml|*.yml)
      echo "ERROR: YAML BP_CONFIG_FILE detected. Pre-render on host:" >&2
      echo "  node tools/pt-yaml-to-json.mjs ${BP_CONFIG_FILE} > /tmp/bp.json" >&2
      echo "  then set BP_CONFIG_FILE=/tmp/bp.json or paste raw into BP_CONFIG" >&2
      exit 2
      ;;
  esac
  export BP_CONFIG
fi

EXTRA=""
if [ -n "${K6_OUT:-}" ]; then EXTRA="--out ${K6_OUT}"; fi
if [ "${K6_INSECURE_SKIP_TLS_VERIFY:-false}" = "true" ]; then EXTRA="$EXTRA --insecure-skip-tls-verify"; fi

exec k6 run "${PT_RUNNER}" \
  -e RUNBY="${RUNBY:-LocalDocker}" \
  -e ENV="${ENV:-INT}" \
  -e USER="${USER:-1}" \
  -e DURATION="${DURATION:-30s}" \
  -e NUMSTART="${NUMSTART:-1}" \
  -e SCENARIO="${SCENARIO:-BP001}" \
  -e PLATFORM="${PLATFORM:-Web}" \
  -e DEBUG="${DEBUG:-false}" \
  -e BP_CONFIG="${BP_CONFIG:-}" \
  -e STRICT_PLATFORM_IMPLEMENTATION="${STRICT_PLATFORM_IMPLEMENTATION:-false}" \
  -e ALLOW_ANDROID_WEB_FALLBACK="${ALLOW_ANDROID_WEB_FALLBACK:-true}" \
  $EXTRA
