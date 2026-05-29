#!/bin/bash
# Background daemon to track remote k6 processes

STATE_FILE="$HOME/.pt/var/remote_status.json"
PASS="${PT_SSH_PASS:-M@nsek.1234}"

# Prevent multiple daemons
PID_FILE="$HOME/.pt/var/remote_daemon.pid"
if [[ -f "$PID_FILE" ]] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
  exit 0
fi
echo $$ > "$PID_FILE"

while true; do
  onprem_active="false"
  oncloud_active="false"
  sandbox_active="false"

  # Check Onprem
  if command -v sshpass &>/dev/null; then
    if sshpass -p "$PASS" ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=no -o ProxyCommand="sshpass -p \"$PASS\" ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=no -W %h:%p qa@10.82.15.72" qa@10.184.120.48 "pgrep k6 >/dev/null" 2>/dev/null; then
      onprem_active="true"
    fi
  fi
  
  # Check Sandbox
  if command -v sshpass &>/dev/null; then
    if sshpass -p "$PASS" ssh -o ConnectTimeout=2 -o StrictHostKeyChecking=no -p 2222 qa@127.0.0.1 "pgrep k6 >/dev/null" 2>/dev/null; then
      sandbox_active="true"
    fi
  fi

  # Check Oncloud (only if configured and gcloud available, timeout to prevent hang)
  if command -v gcloud &>/dev/null; then
    if timeout 5 gcloud compute ssh --zone "asia-southeast2-c" "vm-pt-ksix-0" --tunnel-through-iap --project "compute-pt" --command="pgrep k6 >/dev/null" 2>/dev/null; then
      oncloud_active="true"
    fi
  fi

  cat <<JSON > "$STATE_FILE.tmp"
{
  "onprem": $onprem_active,
  "oncloud": $oncloud_active,
  "sandbox": $sandbox_active,
  "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
JSON
  mv "$STATE_FILE.tmp" "$STATE_FILE"
  
  sleep 15
done
