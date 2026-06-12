#!/usr/bin/env bash
# Resolve numeric VU count. Never use host $USER (e.g. maul) as k6 VUs.
resolve_k6_users() {
  local v=""
  if [[ -n "${K6_USERS:-}" && "${K6_USERS}" =~ ^[0-9]+$ ]]; then
    v="${K6_USERS}"
  elif [[ -n "${USER_COUNT:-}" && "${USER_COUNT}" =~ ^[0-9]+$ ]]; then
    v="${USER_COUNT}"
  elif [[ -n "${USER:-}" && "${USER}" =~ ^[0-9]+$ ]]; then
    v="${USER}"
  else
    if [[ -n "${USER:-}" ]]; then
      echo "[LOCAL-PT] Ignoring non-numeric USER=${USER}; using K6_USERS/USER_COUNT/default=1" >&2
    fi
    v=1
  fi
  if [[ "${ALLOW_HIGH_LOCAL_LOAD:-false}" != "true" && "$v" -gt 10 ]]; then
    echo "[LOCAL-PT] Clamping VUs ${v} -> 10 (set ALLOW_HIGH_LOCAL_LOAD=true to override)" >&2
    v=10
  fi
  export K6_USERS="$v"
  export USER_COUNT="$v"
}
