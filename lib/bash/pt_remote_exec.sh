#!/usr/bin/env bash
# lib/bash/pt_remote_exec.sh — Unified remote k6 execution helpers
# REFACTOR (H1): Extract common Onprem/Oncloud/Sandbox logic to kill ~300
# lines of duplication in pt-menu.sh.
#
# Design: Provide reusable helpers that the ssh_menu calls instead of
# inlining the same code 3 times. Each helper is mode-aware and dispatches
# to the right transport (sshpass+ProxyCommand / gcloud / direct ssh).
#
# Public API:
#   pt_pack_run_tarball <tarball_path> <suite_name>
#       Pack Script/<suite>/ + Helper/ + k6-linux-* binaries into tarball.
#       Returns 0 on success.
#
#   pt_build_k6_remote_cmd <mode> <stamp> <suite> <file> <platform> \
#                           <scenario> <vus> <dur> <env_name> <runby> \
#                           <test_pwd> <test_pin> <report_file>
#       Emit the remote shell script that extracts tarball, picks the
#       right k6 binary, runs k6, prints summary JSON markers, and exits.
#       Echoes the command to stdout. Caller pipes it to ssh.
#
#   pt_transport_upload <mode> <tarball> <pass> <ssh_opts>
#       Upload tarball to remote /tmp/. Mode = Onprem|Oncloud|Sandbox.
#
#   pt_transport_ssh <mode> <cmd> <pass> <ssh_opts> <log_file>
#       Execute remote command via the right transport. Stdout/err -> log.
#       Returns the remote command's exit code.
#
#   pt_transport_download_report <mode> <remote_dir> <suite> <platform> \
#                                  <scen_label> <runby> <pass> <ssh_opts>
#       SCP HTML report files from remote workspace to local
#       Report/<suite>/<platform>/<scen_label>/<runby>/.
#
#   pt_transport_cleanup <mode> <remote_dir> <pass> <ssh_opts>
#       Remove remote workspace dir after report download.
#
# Constraints:
#   - Caller is responsible for pt-lock acquire/release and cancel trap.
#   - Uses env vars: PROJECT_DIR, RED/GRN/YLW/DIM/RST (color codes).
#   - Requires _sshpass_cmd to be defined in caller's scope.

# ── Helper: pack tarball ─────────────────────────────────────────────────────
pt_pack_run_tarball() {
  local tarball="$1" suite_name="$2"
  [[ -z "$tarball" || -z "$suite_name" ]] && return 1
  local _tar_k6=()
  [[ -f "$PROJECT_DIR/k6-linux-amd64" ]] && _tar_k6+=("k6-linux-amd64")
  [[ -f "$PROJECT_DIR/k6-linux-arm64" ]] && _tar_k6+=("k6-linux-arm64")
  tar -czf "$tarball" -C "$PROJECT_DIR" \
    "Script/$suite_name" Helper ${_tar_k6[@]+"${_tar_k6[@]}"} 2>&1
}

# ── Helper: build remote k6 command template ─────────────────────────────────
# Args: stamp suite file platform scenario vus dur env_name runby test_pwd test_pin report_file
# Emits a multiline shell command suitable for ssh "$(...)" execution.
pt_build_k6_remote_cmd() {
  local stamp="$1" suite="$2" file="$3" platform="$4" scenario="$5"
  local vus="$6" dur="$7" env_name="$8" runby="$9" test_pwd="${10}"
  local test_pin="${11}" report_file="${12}"
  local remote_dir="/tmp/pt-run-${stamp}"
  local tarball_name="pt-upload-${stamp}.tar.gz"
  cat <<REMOTE_CMD
set -e
mkdir -p ${remote_dir}
cd ${remote_dir}
tar -xzf /tmp/${tarball_name}
echo '[remote] Extracted at:' \$(pwd)
# Pick k6 binary by arch
REPO_K6=''
for _d in ~/growin_performancetest ~/mostng_performancetest_api /home/qa/growin_performancetest /home/qa/mostng_performancetest_api; do
  if [ -x "\$_d/k6" ]; then REPO_K6="\$_d/k6"; break; fi
done
ARCH=\$(uname -m)
if [ -n "\$REPO_K6" ]; then K6_BIN="\$REPO_K6"
elif [ "\$ARCH" = "x86_64" ] && [ -x ./k6-linux-amd64 ]; then K6_BIN=./k6-linux-amd64
elif [ "\$ARCH" = "aarch64" ] && [ -x ./k6-linux-arm64 ]; then K6_BIN=./k6-linux-arm64
elif command -v k6 >/dev/null; then K6_BIN=\$(command -v k6)
else echo 'FATAL: k6 not found'; exit 127
fi
chmod +x \$K6_BIN 2>/dev/null || true
echo '[remote] Arch:' \$ARCH '| k6:' \$K6_BIN
cd Script/${suite}
mkdir -p ../../Report/${suite}/${platform}/${scenario}/${runby}
set -o pipefail
\$K6_BIN run --compatibility-mode=extended --summary-export=/tmp/k6-export-\$\$.json ${file} -e RUNBY=${runby} -e ENV=${env_name} -e USER=${vus} -e K6_USERS=${vus} -e DURATION=${dur} -e SCENARIO=${scenario} -e PLATFORM=${platform} -e NUMSTART=1 -e TEST_PASSWORD="${test_pwd}" -e TEST_PIN="${test_pin}" --out dashboard=export=${report_file} 2>&1
RC=\$?
if [ -f /tmp/k6-export-\$\$.json ]; then
  echo 'K6_SUMMARY_JSON_START'
  cat /tmp/k6-export-\$\$.json
  echo 'K6_SUMMARY_JSON_END'
  rm -f /tmp/k6-export-\$\$.json
fi
# Note: ${remote_dir} kept until local scp completes the report download.
cd /tmp && rm -f ${tarball_name}
exit \$RC
REMOTE_CMD
}

# ── Helper: upload tarball to remote ─────────────────────────────────────────
# Args: mode tarball pass ssh_opts
pt_transport_upload() {
  local mode="$1" tarball="$2" pass="$3" ssh_opts="${4:--o ServerAliveInterval=30}"
  case "$mode" in
    Onprem)
      _sshpass_cmd "$pass" scp $ssh_opts -o StrictHostKeyChecking=no \
        -o ProxyCommand="sshpass -p \"$pass\" ssh $ssh_opts -o StrictHostKeyChecking=no -W %h:%p qa@10.82.15.72" \
        "$tarball" qa@10.184.120.48:/tmp/ 2>&1 | tail -3
      return ${PIPESTATUS[0]}
      ;;
    Oncloud)
      gcloud compute scp --zone "asia-southeast2-c" \
        --tunnel-through-iap --project "compute-pt" \
        "$tarball" "vm-pt-ksix-0:/tmp/" 2>&1 | tail -3
      return ${PIPESTATUS[0]}
      ;;
    Sandbox)
      _sshpass_cmd "$pass" scp -P 2222 $ssh_opts -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null \
        "$tarball" qa@127.0.0.1:/tmp/ 2>&1 | tail -3
      return ${PIPESTATUS[0]}
      ;;
    *)
      echo "pt_transport_upload: unknown mode '$mode'" >&2
      return 2
      ;;
  esac
}

# ── Helper: execute remote command via right transport ───────────────────────
# Args: mode cmd pass ssh_opts log_file
pt_transport_ssh() {
  local mode="$1" cmd="$2" pass="$3" ssh_opts="${4:--o ServerAliveInterval=30}" log="$5"
  case "$mode" in
    Onprem)
      _sshpass_cmd "$pass" ssh $ssh_opts -o StrictHostKeyChecking=no \
        -o ProxyCommand="sshpass -p \"$pass\" ssh $ssh_opts -o StrictHostKeyChecking=no -W %h:%p qa@10.82.15.72" \
        qa@10.184.120.48 "$cmd" 2>&1 | tee "$log"
      return ${PIPESTATUS[0]}
      ;;
    Oncloud)
      gcloud compute ssh --zone "asia-southeast2-c" "vm-pt-ksix-0" \
        --tunnel-through-iap --project "compute-pt" \
        --ssh-flag="-o ServerAliveInterval=30 -o ServerAliveCountMax=3" \
        --command="$cmd" 2>&1 | tee "$log"
      return ${PIPESTATUS[0]}
      ;;
    Sandbox)
      _sshpass_cmd "$pass" ssh -p 2222 $ssh_opts -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null qa@127.0.0.1 "$cmd" 2>&1 | tee "$log"
      return ${PIPESTATUS[0]}
      ;;
    *)
      echo "pt_transport_ssh: unknown mode '$mode'" >&2
      return 2
      ;;
  esac
}

# ── Helper: download HTML reports from remote ────────────────────────────────
# Args: mode remote_dir suite platform scen_label runby pass ssh_opts
pt_transport_download_report() {
  local mode="$1" remote_dir="$2" suite="$3" platform="$4"
  local scen_label="$5" runby="$6" pass="$7" ssh_opts="${8:--o ServerAliveInterval=30}"
  local local_dir="$PROJECT_DIR/Report/${suite}/${platform}/${scen_label}/${runby}"
  mkdir -p "$local_dir" 2>/dev/null || true
  local remote_pattern="${remote_dir}/Report/${suite}/${platform}/${scen_label}/${runby}/*.html"
  case "$mode" in
    Onprem)
      _sshpass_cmd "$pass" scp $ssh_opts -o StrictHostKeyChecking=no \
        -o ProxyCommand="sshpass -p \"$pass\" ssh $ssh_opts -o StrictHostKeyChecking=no -W %h:%p qa@10.82.15.72" \
        "qa@10.184.120.48:${remote_pattern}" "$local_dir/" 2>/dev/null
      ;;
    Oncloud)
      gcloud compute scp --zone "asia-southeast2-c" \
        --tunnel-through-iap --project "compute-pt" \
        "vm-pt-ksix-0:${remote_pattern}" "$local_dir/" 2>/dev/null
      ;;
    Sandbox)
      # Sandbox uses /tmp/Report/... not _remote_dir/Report/...
      local sandbox_pattern="/tmp/Report/${suite}/${platform}/${scen_label}/${runby}/*.html"
      _sshpass_cmd "$pass" scp -P 2222 $ssh_opts -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null \
        "qa@127.0.0.1:${sandbox_pattern}" "$local_dir/" 2>/dev/null
      ;;
    *)
      return 2
      ;;
  esac
}

# ── Helper: clean up remote workspace dir ────────────────────────────────────
# Args: mode remote_dir pass ssh_opts
pt_transport_cleanup() {
  local mode="$1" remote_dir="$2" pass="$3" ssh_opts="${4:--o ServerAliveInterval=30}"
  [[ -z "$remote_dir" || "$remote_dir" == "/" || "$remote_dir" == "/tmp" ]] && return 1
  case "$mode" in
    Onprem)
      _sshpass_cmd "$pass" ssh $ssh_opts -o StrictHostKeyChecking=no \
        -o ProxyCommand="sshpass -p \"$pass\" ssh $ssh_opts -o StrictHostKeyChecking=no -W %h:%p qa@10.82.15.72" \
        qa@10.184.120.48 "rm -rf ${remote_dir}" 2>/dev/null
      ;;
    Oncloud)
      gcloud compute ssh --zone "asia-southeast2-c" "vm-pt-ksix-0" \
        --tunnel-through-iap --project "compute-pt" \
        --command="rm -rf ${remote_dir}" 2>/dev/null
      ;;
    Sandbox)
      # Sandbox has no per-run dir to clean; reports live in container's /tmp/Report
      return 0
      ;;
  esac
}

# ── Convenience: full run (high-level) ───────────────────────────────────────
# Args: mode suite file platform scenario vus dur env_name runby
# Caller must have already done: pt-lock acquire + _arm_cancel_trap.
# Returns: k6 exit code (0 = pass).
pt_remote_run() {
  local mode="$1" suite="$2" file="$3" platform="$4" scenario="$5"
  local vus="$6" dur="$7" env_name="$8" runby="$9"
  local pass="${PT_SSH_PASS_RUNTIME:-}"
  local ssh_opts="${_SSH_ALIVE_OPTS:--o ServerAliveInterval=30 -o ServerAliveCountMax=3}"
  local stamp; stamp="$(uuidgen 2>/dev/null || printf '%s_%s' "$$" "$(date +%s%N)")"
  local tarball="/tmp/pt-upload-${stamp}.tar.gz"
  local remote_dir="/tmp/pt-run-${stamp}"
  local scen_label="${scenario:-AllBP}"; scen_label="${scen_label//,/-}"
  local report_file="../../Report/${suite}/${platform}/${scen_label}/${runby}/${runby}_${mode}_$(date +%m%d)_$(date +%H%M)_${scen_label}.html"
  local test_pwd test_pin
  test_pwd=$(env_val TEST_PASSWORD '')
  test_pin=$(env_val TEST_PIN '')

  pt_pack_run_tarball "$tarball" "$suite" || { rm -f "$tarball"; return 1; }
  pt_transport_upload "$mode" "$tarball" "$pass" "$ssh_opts" || { rm -f "$tarball"; return 2; }
  local remote_cmd
  remote_cmd=$(pt_build_k6_remote_cmd "$stamp" "$suite" "$file" "$platform" \
    "$scen_label" "$vus" "$dur" "$env_name" "$runby" \
    "$test_pwd" "$test_pin" "$report_file")
  local log; log=$(mktemp)
  pt_transport_ssh "$mode" "$remote_cmd" "$pass" "$ssh_opts" "$log"
  local rc=$?
  # Report download + cleanup (best-effort)
  if [[ "$(env_val DOWNLOAD_REPORT 'true')" == "true" ]]; then
    pt_transport_download_report "$mode" "$remote_dir" "$suite" "$platform" \
      "$scen_label" "$runby" "$pass" "$ssh_opts"
    pt_transport_cleanup "$mode" "$remote_dir" "$pass" "$ssh_opts"
  fi
  rm -f "$tarball" "$log"
  return $rc
}
