#!/usr/bin/env bash
# pt-menu.sh — Performance Test Setup TUI

set -euo pipefail

trap '[[ -n "${_SPINNER_PID:-}" ]] && kill "$_SPINNER_PID" 2>/dev/null || true' EXIT

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$PROJECT_DIR/docker-local-pt/configs/local.env"

# PT Auth Source
if [[ -f "$PROJECT_DIR/lib/bash/pt_auth_client.sh" ]]; then
  source "$PROJECT_DIR/lib/bash/pt_auth_client.sh"
else
  # Fallback variables if client missing
  PT_USER="legacy"
  PT_ROLE="god"
  pt_require_auth() { return 0; }
  pt_auth_check_perm() { return 0; }
fi


# ── Colors ─────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GRN='\033[0;32m'; YLW='\033[1;33m'
BLU='\033[0;34m'; CYN='\033[0;36m'; BLD='\033[1m'; RST='\033[0m'
DIM='\033[2m'; MAG='\033[0;35m'

_RUN_START=0
_RUN_LABEL=""
_FZF_KEY=""
_AUTH_USER=""
_AUTH_ROLE=""
_AUTH_DISP=""

# ── Run UI ───────────────────────────────────────────────────────────────────
print_run_header() {
  local label="$1" target="${2:-}"
  _RUN_START=$(date +%s)
  _RUN_LABEL="$label"
  local term_w; term_w="${COLUMNS:-$(tput cols 2>/dev/null || echo 80)}"
  local w=$(( term_w - 4 ))
  local bar; bar=$(printf '─%.0s' $(seq 1 $w))
  echo -e "\n${CYN}${BLD}┌─ ▶  $label${RST}"
  [[ -n "$target" ]] && echo -e "${CYN}${BLD}│${RST}${DIM}     Target : ${RST}${YLW}$target${RST}"
  echo -e "${CYN}${BLD}│${RST}${DIM}     Start  : $(date '+%H:%M:%S')${RST}"
  echo -e "${CYN}${BLD}└${bar}${RST}\n"
}

print_run_footer() {
  local rc="$1" tmplog="${2:-}"
  local elapsed=$(( $(date +%s) - _RUN_START ))
  local dur_str="${elapsed}s"
  [[ $elapsed -ge 60 ]] && dur_str="$(( elapsed/60 ))m $(( elapsed%60 ))s"
  local term_w; term_w="${COLUMNS:-$(tput cols 2>/dev/null || echo 80)}"
  local w=$(( term_w - 4 ))
  local bar; bar=$(printf '─%.0s' $(seq 1 $w))
  echo -e "\n${CYN}${BLD}┌${bar}${RST}"
  echo -e "${CYN}${BLD}│${RST}${DIM}     End    : $(date '+%H:%M:%S')  (+${dur_str})${RST}"
  if [[ "$rc" -eq 0 ]]; then
    echo -e "${CYN}${BLD}│${RST}     Status : ${GRN}${BLD}✓  PASS${RST}"
  else
    echo -e "${CYN}${BLD}│${RST}     Status : ${RED}${BLD}✘  FAIL${RST}  ${DIM}(exit $rc)${RST}"
    if [[ -n "$tmplog" && -f "$tmplog" ]]; then
      local errs; errs=$(grep -iE "level=error|ERRO\[|panic|fatal|error:" "$tmplog" | grep -v "^$" | tail -6 || true)
      if [[ -n "$errs" ]]; then
        echo -e "${CYN}${BLD}│${RST}     ${RED}── Errors:${RST}"
        while IFS= read -r line; do
          echo -e "  ${RED}│  $line${RST}"
        done <<< "$errs"
      fi
    fi
  fi
  echo -e "${CYN}${BLD}└${bar}${RST}"
}

# ── Helpers ─────────────────────────────────────────────────────────────────
get_local_ip() {
  local ip=""
  # macOS: use ipconfig getifaddr; Linux: hostname -I or ip route
  if [[ "$(uname -s)" == "Darwin" ]]; then
    ip=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)
  else
    if command -v hostname &>/dev/null; then
      ip=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi
    if [[ -z "$ip" ]]; then
      ip=$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7}')
    fi
  fi
  if [[ -z "$ip" ]]; then
    ip=$(ifconfig 2>/dev/null | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
  fi
  echo "${ip:-unknown}"
}

open_dir() {
  local dir="$1"
  if [[ "$(uname -s)" == "Darwin" ]]; then
    open "$dir" 2>/dev/null || echo -e "  ${YLW}Cannot open dir${RST}"
  else
    xdg-open "$dir" 2>/dev/null || echo -e "  ${YLW}No GUI file manager${RST}"
  fi
}

banner() {
  clear
  echo -e "${CYN}${BLD}"
  echo '┏━╸┏━┓┏━┓╻ ╻╻┏┓╻   ┏━┓╺┳╸   ┏━╸┏━┓┏━┓┏┳┓┏━╸╻ ╻┏━┓┏━┓╻┏ '
  echo '┃╺┓┣┳┛┃ ┃┃╻┃┃┃┗┫   ┣━┛ ┃    ┣╸ ┣┳┛┣━┫┃┃┃┣╸ ┃╻┃┃ ┃┣┳┛┣┻┓'
  echo '┗━┛╹┗╸┗━┛┗┻┛╹╹ ╹   ╹   ╹    ╹  ╹┗╸╹ ╹╹ ╹┗━╸┗┻┛┗━┛╹┗╸╹ ╹'
  echo -e "${RST}"
  local env_tag; env_tag=$(env_val ENV "—")
  local vus; vus=$(env_val K6_USERS "—")
  local dur; dur=$(env_val DURATION "—")
  local docker_ct; docker_ct=$(docker ps --format "{{.Names}}" 2>/dev/null | grep -cE "pt-|k6" | tail -n 1 || echo 0)
  docker_ct="${docker_ct//[!0-9]/}"
  [[ -z "$docker_ct" ]] && docker_ct=0
  local docker_color="$RED"
  [[ "$docker_ct" -gt 0 ]] && docker_color="$GRN"
  local sep="${DIM}│${RST}"
  local run_status
  run_status=$(python3 "$PROJECT_DIR/bin/pt-lock-status" "${PT_USER:-Unknown}" "$(env_val ENV INT)" 2>/dev/null || echo "🟢 Available | ${PT_USER:-Unknown} [Idle]")
  
  echo -e "  ${DIM}IP:${RST} $(get_local_ip)  $sep  ${YLW}ENV:${RST} $env_tag  $sep  ${YLW}VUs:${RST} $vus  $sep  ${YLW}Dur:${RST} $dur  $sep  ${YLW}${run_status}${RST}"
  echo -e "  ${DIM}$(printf '─%.0s' $(seq 1 $(( ${COLUMNS:-$(tput cols 2>/dev/null || echo 80)} - 4 ))))${RST}\n"
}


login_screen() {
  while true; do
    clear
    echo -e "${CYN}${BLD}"
    echo '┏━╸┏━┓┏━┓╻ ╻╻┏┓╻   ┏━┓╺┳╸   ┏━╸┏━┓┏━┓┏┳┓┏━╸╻ ╻┏━┓┏━┓╻┏ '
    echo '┃╺┓┣┳┛┃ ┃┃╻┃┃┃┗┫   ┣━┛ ┃    ┣╸ ┣┳┛┣━┫┃┃┃┣╸ ┃╻┃┃ ┃┣┳┛┣┻┓'
    echo '┗━┛╹┗╸┗━┛┗┻┛╹╹ ╹   ╹   ╹    ╹  ╹┗╸╹ ╹╹ ╹┗━╸┗┻┛┗━┛╹┗╸╹ ╹'
    echo -e "${RST}"
    echo -e "  ${DIM}Welcome to Growin Performance Test Framework${RST}\n"
    
    printf "  Username : "
    read -r input_user
    [[ -z "$input_user" ]] && continue
    
    printf "  Password : "
    read -rs input_pwd
    echo ""
    
    local login_out
    local login_rc
    set +e
    login_out=$(python3 "$PROJECT_DIR/pt-data/auth.py" login "$input_user" "$input_pwd" 2>&1)
    login_rc=$?
    set -e
    
    if [[ $login_rc -eq 0 ]]; then
      _AUTH_USER="$input_user"
      _AUTH_DISP="${login_out%|*}"
      _AUTH_ROLE="${login_out#*|}"
      echo -e "\n  ${GRN}Login successful. Welcome, $PT_USER [Role: $PT_ROLE]${RST}"
      sleep 1
      return
    else
      echo -e "\n  ${RED}Login failed: $login_out${RST}"
      sleep 1
    fi
  done
}

user_mgmt_menu() {
  if [[ "$PT_ROLE" != "god" && "$PT_ROLE" != "admin" ]]; then
    echo -e "  ${RED}Access Denied. Admin+ role required.${RST}"
    read -r -p $'\nPress Enter...'
    return
  fi
  banner
  section_header "User Management"

  local choices=(
    "[1] List Users"
    "[2] Create User"
    "[3] Lock/Unlock User"
    "[4] Reset Password"
    "[5] Assign Role"
    "[6] Delete User"
    "[0] Back"
  )
  local sel; sel=$(pick_fzf "Action>" "${choices[@]}")
  [[ -z "$sel" ]] && return

  case "$sel" in
    "[1] List Users")
      echo ""
      python3 "$PROJECT_DIR/bin/pt-usermgmt" list-users --by "$PT_USER" 2>&1 | python3 -c "
import json, sys
raw = sys.stdin.read().strip()
if not raw.startswith('{'): raw = raw[raw.find('{'):]
try: d = json.loads(raw)
except: d = {}
users = d.get('data', {}).get('users', [])
print(f\"  {'Username':<12} {'Role':<10} {'Locked':<8} {'Last Login'}\")
print('  ' + '-'*55)
for u in users:
    locked = 'YES' if u['is_locked'] else 'no'
    ll = (u.get('last_login') or 'never')[:19]
    print(f\"  {u['username']:<12} {u['role']:<10} {locked:<8} {ll}\")
"
      read -r -p $'\nPress Enter...'
      ;;
    "[2] Create User")
      if [[ "$PT_ROLE" != "god" ]]; then
        echo -e "  ${RED}Only god can create users.${RST}"
        read -r -p $'\nPress Enter...'; return
      fi
      printf "\n  Username : "; read -r n_user
      [[ -z "$n_user" ]] && return
      local r_choices=("operator" "admin" "readonly" "guest" "god")
      local n_role; n_role=$(pick_fzf "Role>" "${r_choices[@]}")
      [[ -z "$n_role" ]] && return
      python3 "$PROJECT_DIR/bin/pt-usermgmt" create --by "$PT_USER" --username "$n_user" --role "$n_role" 2>&1 | python3 -c "import json,sys; raw=sys.stdin.read().strip(); raw=raw[raw.find('{'):] if '{' in raw else '{}'; d=json.loads(raw) if raw else {}; print(d.get('message', d.get('error','?')))"
      read -r -p $'\nPress Enter...'
      ;;
    "[3] Lock/Unlock User")
      printf "\n  Username : "; read -r t_user
      [[ -z "$t_user" ]] && return
      local la_choices=("lock" "unlock")
      local la; la=$(pick_fzf "Action>" "${la_choices[@]}")
      [[ -z "$la" ]] && return
      python3 "$PROJECT_DIR/bin/pt-usermgmt" "${la}-user" --by "$PT_USER" --username "$t_user" 2>&1 | python3 -c "import json,sys; raw=sys.stdin.read().strip(); raw=raw[raw.find('{'):] if '{' in raw else '{}'; d=json.loads(raw) if raw else {}; print(d.get('message', d.get('error','?')))"
      read -r -p $'\nPress Enter...'
      ;;
    "[4] Reset Password")
      printf "\n  Username : "; read -r t_user
      [[ -z "$t_user" ]] && return
      python3 "$PROJECT_DIR/bin/pt-usermgmt" reset-password --by "$PT_USER" --username "$t_user" 2>&1 | python3 -c "import json,sys; raw=sys.stdin.read().strip(); raw=raw[raw.find('{'):] if '{' in raw else '{}'; d=json.loads(raw) if raw else {}; print(d.get('message', d.get('error','?')))"
      read -r -p $'\nPress Enter...'
      ;;
    "[5] Assign Role")
      if [[ "$PT_ROLE" != "god" ]]; then
        echo -e "  ${RED}Only god can assign roles.${RST}"; read -r -p $'\nPress Enter...'; return
      fi
      printf "\n  Username : "; read -r t_user
      [[ -z "$t_user" ]] && return
      local r2_choices=("operator" "admin" "readonly" "guest" "god")
      local n_role2; n_role2=$(pick_fzf "New Role>" "${r2_choices[@]}")
      [[ -z "$n_role2" ]] && return
      python3 "$PROJECT_DIR/bin/pt-usermgmt" assign-role --by "$PT_USER" --username "$t_user" --role "$n_role2" 2>&1 | python3 -c "import json,sys; raw=sys.stdin.read().strip(); raw=raw[raw.find('{'):] if '{' in raw else '{}'; d=json.loads(raw) if raw else {}; print(d.get('message', d.get('error','?')))"
      read -r -p $'\nPress Enter...'
      ;;
    "[6] Delete User")
      if [[ "$PT_ROLE" != "god" ]]; then
        echo -e "  ${RED}Only god can delete users.${RST}"; read -r -p $'\nPress Enter...'; return
      fi
      printf "\n  Username : "; read -r t_user
      [[ -z "$t_user" ]] && return
      printf "  Confirm delete '%s'? (yes/no): " "$t_user"; read -r confirm
      [[ "$confirm" != "yes" ]] && { echo "Cancelled."; read -r -p $'\nPress Enter...'; return; }
      python3 "$PROJECT_DIR/bin/pt-usermgmt" delete --by "$PT_USER" --username "$t_user" 2>&1 | python3 -c "import json,sys; raw=sys.stdin.read().strip(); raw=raw[raw.find('{'):] if '{' in raw else '{}'; d=json.loads(raw) if raw else {}; print(d.get('message', d.get('error','?')))"
      read -r -p $'\nPress Enter...'
      ;;
    "[0] Back") return ;;
  esac
}
env_val() {
  local key="$1" default="${2:-}"
  if [[ -f "$ENV_FILE" ]]; then
    local val
    val=$(grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | tail -1 | cut -d= -f2- | tr -d '"')
    echo "${val:-$default}"
  else
    echo "$default"
  fi
}

show_env_summary() {
  echo -e "${CYN}${BLD}  ── ENV: $ENV_FILE ──${RST}"
  if [[ -f "$ENV_FILE" ]]; then
    grep -v "^#" "$ENV_FILE" | grep -v "^$" | head -8 | while IFS= read -r line; do
      if [[ "$PT_ROLE" != "god" ]] && echo "$line" | grep -qiE "pass|secret|token|key|pwd"; then
        key="${line%%=*}"
        echo -e "  ${YLW}${key}=***MASKED***${RST}"
      else
        echo -e "  ${YLW}${line}${RST}"
      fi
    done
    echo "  ..."
  else
    echo -e "  ${RED}[NOT FOUND] $ENV_FILE${RST}"
  fi
  echo ""
}

pick_fzf() {
  local prompt="$1"; shift
  local val
  val=$(printf '%s\n' "$@" | fzf \
    --prompt="$prompt " \
    --header="  ↑↓ navigate  ↵ select  ESC=back  Ctrl-C=exit" \
    ${_FZF_HEIGHT_FLAG} --border=rounded --layout=reverse \
    --color='prompt:cyan,pointer:yellow,fg+:bright-green,header:240,border:cyan,hl:yellow,hl+:bright-yellow' \
    ${_FZF_NOINFO_FLAG} --ansi 2>/dev/null) || true
  _FZF_KEY=""
  echo "$val"
}

# Detect fzf version compatibility once at startup
_fzf_detect_flags() {
  local fzf_ver
  fzf_ver=$(fzf --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+' | head -1)
  local major minor
  major=${fzf_ver%%.*}
  minor=${fzf_ver##*.}
  # --no-info available since 0.21
  _FZF_NOINFO_FLAG=""
  [[ "${major:-0}" -gt 0 || "${minor:-0}" -ge 21 ]] && _FZF_NOINFO_FLAG="--no-info"
  # --height=~X% (tilde) available since 0.30
  _FZF_HEIGHT_FLAG="--height=60%"
  [[ "${major:-0}" -gt 0 || "${minor:-0}" -ge 30 ]] && _FZF_HEIGHT_FLAG="--height=~60%"
}
_fzf_detect_flags

section_header() {
  local title="$1"
  local term_w
  # $COLUMNS is updated by bash on resize; tput cols as fallback
  term_w="${COLUMNS:-$(tput cols 2>/dev/null || echo 80)}"
  local w=$(( term_w - 2 ))
  [[ $w -lt 40 ]] && w=40
  local bar; bar=$(printf '═%.0s' $(seq 1 $w))
  echo -e "\n${CYN}${BLD}╔${bar}╗${RST}"
  printf "${CYN}${BLD}║ ${BLD}%-$(( w - 2 ))s ${CYN}${BLD}║${RST}\n" "$title"
  echo -e "${CYN}${BLD}╚${bar}╝${RST}\n"
}

_SPINNER_PID=""

spinner_start() {
  local msg="${1:-Working}"
  (
    local sp='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    local i=0
    while true; do
      printf "\r  \033[36m${sp:i++%${#sp}:1}\033[0m  $msg..." >&2
      sleep 0.1
    done
  ) &
  _SPINNER_PID=$!
}

spinner_stop() {
  if [[ -n "$_SPINNER_PID" ]]; then
    kill "$_SPINNER_PID" 2>/dev/null || true
    wait "$_SPINNER_PID" 2>/dev/null || true
    _SPINNER_PID=""
  fi
  printf "\r\033[K" >&2
}

# ── SSH helpers ──────────────────────────────────────────────────────────────
_ssh_pass() {
  # Always read from env var; fall back to default only if not set
  echo "${PT_SSH_PASS:-M@nsek.1234}"
}

_sshpass_cmd() {
  local pass="$1"; shift
  if command -v sshpass &>/dev/null; then
    sshpass -p "$pass" "$@"
  else
    echo -e "${YLW}Warning: sshpass not installed. Password will be prompted.${RST}" >&2
    "$@"
  fi
}

# ── SSH Section ──────────────────────────────────────────────────────────────
ssh_menu() {
  banner
  section_header "SSH — Select Target"

  local choices=(
    "Onprem (Jump 10.82.15.72 -> 10.184.120.48)"
    "Oncloud (GCP IAP vm-pt-ksix-0)"
    "Local Sandbox (Docker 127.0.0.1:2222)  [mock=host:18080]"
    "← Back"
  )

  local sel; sel=$(pick_fzf "SSH target>" "${choices[@]}")

  [[ -z "$sel" || "$sel" == "← Back" ]] && return

  section_header "Select Script / Command"
  local scripts=()
  while IFS= read -r s; do
    [[ -z "${s:-}" ]] && continue
    scripts+=("Suite: $s")
  done < <(find "$PROJECT_DIR/Script" -maxdepth 1 -mindepth 1 -type d -exec basename {} \; | sort)
  scripts+=("Custom Command" "Only Connect (Interactive Shell)")

  local script_sel; script_sel=$(pick_fzf "Script>" "${scripts[@]}")


  [[ -z "$script_sel" || "$script_sel" == "← Back" ]] && return

  local run_cmd=""
  local _run_label=""
  case "$script_sel" in
    "Suite: "*)
       local suite_name="${script_sel#Suite: }"
       local suite_dir="$PROJECT_DIR/Script/$suite_name"
       local files=()
       while IFS= read -r f; do
         [[ -z "$f" ]] && continue
         # Skip copies, temp files, and markdown logs
         [[ "$f" == *"copy"* || "$f" == *"?"* || "$f" == *"_enhance_log.md" ]] && continue
         files+=("$f")
       done < <(find "$suite_dir" -maxdepth 1 \( -name '*.sh' -o -name '*.js' \) -exec basename {} \; | sort)

       if [[ ${#files[@]} -eq 0 ]]; then
         echo -e "${RED}No .sh or .js scripts found in Script/$suite_name${RST}"
         read -r -p $'\nPress Enter...'
         return
       fi

       local file_sel; file_sel=$(pick_fzf "Select script file>" "${files[@]}")

       [[ -z "$file_sel" ]] && { echo "Cancelled."; read -r -p $'\nPress Enter...'; return; }

       if [[ "$file_sel" == *.sh ]]; then
         run_cmd="cd Script/$suite_name && bash $file_sel"
         _run_label="$suite_name / $file_sel"
       elif [[ "$file_sel" == *.js ]]; then
         echo -e "\n${CYN}${BLD}  ── K6 Script Run Configuration ──${RST}"

         local plat_choices=("Web" "iOS" "Android")
         local platform; platform=$(pick_fzf "Platform>" "${plat_choices[@]}")

         [[ -z "$platform" ]] && { echo "Cancelled."; read -r -p $'\nPress Enter...'; return; }

         local bps=()
         while IFS= read -r line; do
           [[ -z "$line" ]] && continue
           bps+=("$line")
         done < <(grep -E '^export function BP[0-9]+' "$suite_dir/$file_sel" | awk '{print $3}' | cut -d'(' -f1 | sort)

         local scenario=""
         if [[ ${#bps[@]} -gt 0 ]]; then
           local scenario_choices=("All" "${bps[@]}")
           local scenario_sel; scenario_sel=$(pick_fzf "Scenario (BP)>" "${scenario_choices[@]}")

           [[ -z "$scenario_sel" ]] && { echo "Cancelled."; read -r -p $'\nPress Enter...'; return; }
           if [[ "$scenario_sel" != "All" ]]; then
             scenario="$scenario_sel"
           fi
         else
           printf "  Scenario (BP) [BP001]: "
           read -r scenario
           scenario="${scenario:-BP001}"
         fi

         local default_vus; default_vus=$(env_val K6_USERS 100)
         printf "  VUs / Users [%s]: " "$default_vus"
         local vus; read -r vus
         vus="${vus:-$default_vus}"

         local default_dur; default_dur=$(env_val DURATION 5m)
         printf "  Duration [%s]: " "$default_dur"
         local dur; read -r dur
         dur="${dur:-$default_dur}"

         local default_env; default_env=$(env_val ENV INT)
         printf "  ENV [%s]: " "$default_env"
         local env_name; read -r env_name
         env_name="${env_name:-$default_env}"

         local runby_choices=("Manual" "Regression" "LoadTest")
         local runby; runby=$(pick_fzf "RUNBY>" "${runby_choices[@]}")

         [[ -z "$runby" ]] && { echo "Cancelled."; read -r -p $'\nPress Enter...'; return; }

         local scen_label="${scenario:-AllBP}"
         local report_file="../../Report/$suite_name/$platform/$scen_label/$runby/${runby}_DryRun_\$(date +%m%d)_\$(date +%H%M)_${scen_label}.html"

         run_cmd="cd Script/$suite_name && ../../k6 run $file_sel -e RUNBY=$runby -e ENV=$env_name -e USER=$vus -e DURATION=$dur -e SCENARIO=$scenario -e PLATFORM=$platform --out dashboard=export=$report_file"
         _run_label="$suite_name / $file_sel  [$platform · ${scenario:-AllBP} · ${vus}VU · $dur]"
         python3 "$PROJECT_DIR/pt-data/auth.py" set_run "$PT_USER" "$file_sel" "$dur" 2>/dev/null || true
       fi
       ;;
    "Custom Command")
       printf "Command: "
       read -r run_cmd
       [[ -z "$run_cmd" ]] && { echo "Cancelled."; read -r -p $'\nPress Enter...'; return; }
       _run_label="Custom: $run_cmd"
       ;;
  esac

  # NOTE: mostng_performancetest_api is the complete repo; growin_performancetest is older/incomplete
  local remote_base="cd mostng_performancetest_api || cd growin_performancetest || cd /home/qa/growin_performancetest || cd /data/qa/growin_performancetest || { echo 'Repo not found on remote!'; exit 1; }"
  local ssh_cmd=""

  if [[ -n "$run_cmd" ]]; then
      ssh_cmd="$remote_base && $run_cmd"
  fi

  local _run_log; _run_log=$(mktemp)
  local _run_rc=0
  local pass; pass=$(_ssh_pass)

  case "$sel" in
    "Onprem "*)
      if [[ -n "$ssh_cmd" ]]; then
        print_run_header "${_run_label:-cmd}" "Onprem  10.82.15.72 → 10.184.120.48"
        set +e
        _sshpass_cmd "$pass" ssh -o StrictHostKeyChecking=no \
          -o ProxyCommand="sshpass -p \"$pass\" ssh -o StrictHostKeyChecking=no -W %h:%p qa@10.82.15.72" \
          qa@10.184.120.48 "$ssh_cmd" 2>&1 | tee "$_run_log"
        _run_rc=${PIPESTATUS[0]}; set -e
        print_run_footer "$_run_rc" "$_run_log"
      else
        echo -e "\n${GRN}Connecting via Jump to Onprem-2 (interactive)...${RST}"
        _sshpass_cmd "$pass" ssh -o StrictHostKeyChecking=no \
          -o ProxyCommand="sshpass -p \"$pass\" ssh -o StrictHostKeyChecking=no -W %h:%p qa@10.82.15.72" \
          qa@10.184.120.48
      fi
      ;;
    "Oncloud "*)
      if [[ -n "$ssh_cmd" ]]; then
        print_run_header "${_run_label:-cmd}" "Oncloud  GCP IAP → vm-pt-ksix-0"
        set +e
        gcloud compute ssh --zone "asia-southeast2-c" "vm-pt-ksix-0" \
          --tunnel-through-iap --project "compute-pt" \
          --command="$ssh_cmd" 2>&1 | tee "$_run_log"
        _run_rc=${PIPESTATUS[0]}; set -e
        print_run_footer "$_run_rc" "$_run_log"
      else
        echo -e "\n${GRN}Connecting via GCP IAP (interactive)...${RST}\n"
        gcloud compute ssh --zone "asia-southeast2-c" "vm-pt-ksix-0" \
          --tunnel-through-iap --project "compute-pt"
      fi
      ;;
    "Local Sandbox "*)
      if [[ -n "$ssh_cmd" ]]; then
        print_run_header "${_run_label:-cmd}" "Local Sandbox  127.0.0.1:2222"
        set +e
        _sshpass_cmd "$pass" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
          -p 2222 qa@127.0.0.1 "$ssh_cmd" 2>&1 | tee "$_run_log"
        _run_rc=${PIPESTATUS[0]}; set -e
        print_run_footer "$_run_rc" "$_run_log"
      else
        echo -e "\n${GRN}Connecting to Local SSH Sandbox (interactive)...${RST}"
        _sshpass_cmd "$pass" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
          -p 2222 qa@127.0.0.1
      fi
      ;;
  esac

  rm -f "$_run_log"
  python3 "$PROJECT_DIR/pt-data/auth.py" clear_run "$PT_USER" 2>/dev/null || true
  read -r -p $'\nPress Enter...'
}

# ── ENV Edit ────────────────────────────────────────────────────────────────
env_edit_menu() {
  banner
  section_header "ENV Editor — ${ENV_FILE##*/}"
  show_env_summary

  local choices=(
    "Edit full .env in \$EDITOR"
    "Set single key=value"
    "← Back"
  )
  local sel; sel=$(pick_fzf "ENV action>" "${choices[@]}")


  [[ -z "$sel" ]] && return
  case "$sel" in
    "Edit full .env"*)
      ${EDITOR:-nano} "$ENV_FILE"; return ;;
    "Set single key=value")
      if [[ ! -f "$ENV_FILE" ]]; then
        echo -e "  ${RED}ENV file not found: $ENV_FILE${RST}"
        read -r -p $'\nPress Enter...'
        return
      fi
      # Pick key from existing keys
      local keys=()
      while IFS= read -r k; do
        [[ -z "$k" ]] && continue
        keys+=("$k")
      done < <(grep -E '^[A-Z_]+=.' "$ENV_FILE" | cut -d= -f1 | sort -u)
      keys+=("New key")
      local key_sel; key_sel=$(pick_fzf "Key>" "${keys[@]}")

      [[ -z "$key_sel" ]] && { read -r -p $'\nPress Enter...'; return; }

      local key="$key_sel"
      if [[ "$key_sel" == "New key" ]]; then
        printf "  Key name: "; read -r key
        [[ -z "$key" ]] && { echo "Cancelled."; read -r -p $'\nPress Enter...'; return; }
      fi

      local current; current=$(env_val "$key" "")
      printf "  %s [%s]: " "$key" "$current"
      local newval; read -r newval
      [[ -z "$newval" ]] && { echo "No change."; read -r -p $'\nPress Enter...'; return; }

      if grep -qE "^${key}=" "$ENV_FILE"; then
        # Replace existing
        local tmpf; tmpf=$(mktemp)
        sed "s|^${key}=.*|${key}=${newval}|" "$ENV_FILE" > "$tmpf" && mv "$tmpf" "$ENV_FILE"
      else
        # Append new
        echo "${key}=${newval}" >> "$ENV_FILE"
      fi
      echo -e "  ${GRN}✓ Set ${key}=${newval}${RST}"
      ;;
    "← Back") return ;;
  esac
  read -r -p $'\nPress Enter...'
}

# ── Docker Section ──────────────────────────────────────────────────────────
docker_menu() {
  banner
  section_header "Docker — Local PT Stack"
  local compose_dir="$PROJECT_DIR/docker-local-pt"
  echo -e "${CYN}${BLD}  Container         Status                  Ports${RST}"
  echo -e "  ${DIM}$(printf '─%.0s' $(seq 1 $(( ${COLUMNS:-$(tput cols 2>/dev/null || echo 80)} - 4 ))))${RST}"
  local ct_lines; ct_lines=$(docker ps --format "  {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null | grep -E "pt-|k6" || true)
  if [[ -n "$ct_lines" ]]; then
    echo -e "$ct_lines" | awk -F'\t' '{printf "  '"${GRN}"'▶'"${RST}"'  %-18s  %-22s  '"${DIM}"'%s'"${RST}"'\n", $1, $2, $3}'
  else
    echo -e "  ${DIM}(no pt/k6 containers running)${RST}"
  fi
  echo ""

  local choices=(
    "Start stack (mock + k6)"
    "Start stack + observability (Grafana/Influx)"
    "Restart stack"
    "Show logs (mock-api)"
    "Stop all"
    "← Back"
  )
  local sel; sel=$(pick_fzf "Docker action>" "${choices[@]}")


  [[ -z "$sel" ]] && return
  cd "$compose_dir"
  case "$sel" in
    "Start stack (mock + k6)")
      echo ""
      spinner_start "Starting mock-api"
      docker compose --env-file configs/local.env up -d mock-api 2>&1
      spinner_stop
      echo -e "  ${GRN}${BLD}✓ mock-api started${RST}" ;;
    "Start stack + observability"*)
      echo ""
      spinner_start "Starting full stack + observability"
      docker compose --env-file configs/local.env --profile observability up -d 2>&1
      spinner_stop
      echo -e "  ${GRN}${BLD}✓ full stack started${RST}" ;;
    "Restart stack")
      echo ""
      spinner_start "Restarting stack"
      docker compose down 2>&1
      docker compose --env-file configs/local.env up -d mock-api 2>&1
      spinner_stop
      echo -e "  ${GRN}${BLD}✓ stack restarted${RST}" ;;
    "Show logs (mock-api)")
      cd "$PROJECT_DIR"
      echo -e "\n${CYN}  Logs — mock-api (last 50 lines, Ctrl+C to exit):${RST}\n"
      docker compose -f "$compose_dir/docker-compose.yml" logs --tail=50 -f mock-api 2>&1 || true
      read -r -p $'\nPress Enter...'
      return ;;
    "Stop all")
      echo ""
      spinner_start "Stopping all containers"
      docker compose down 2>&1
      spinner_stop
      echo -e "  ${YLW}${BLD}⏹ stack stopped${RST}" ;;
    "← Back") cd "$PROJECT_DIR"; return ;;
  esac
  cd "$PROJECT_DIR"
  read -r -p $'\nPress Enter...'
}

# ── Local Run Test ──────────────────────────────────────────────────────────
run_test_menu() {
  banner
  section_header "Run Test — Local Docker Mock"

  # Build mock-ready set from list-scenarios.mjs
  local mock_suites
  mock_suites=$(node "$PROJECT_DIR/docker-local-pt/scripts/list-scenarios.mjs" --json 2>/dev/null \
    | python3 -c "import sys,json; data=json.loads(sys.stdin.read().strip()[sys.stdin.read().strip().find('{') if '{' in sys.stdin.read() else sys.stdin.read().strip().find('['):] if '{' in sys.stdin.read() or '[' in sys.stdin.read() else '[]'); [print(d['suite']) for d in data if d.get('mockReady')]" 2>/dev/null \
    | sort -u || true)

  echo -e "  ${CYN}ENV: $(env_val ENV LOCAL) | VUs: $(env_val K6_USERS 1) | ${YLW}$(env_val DURATION 30s)${RST}"
  echo -e "  ${DIM}✓ = Mock API ready   ⚡ = Direct k6 (real ENV)${RST}\n"

  local choices=()
  while IFS= read -r s; do
    [[ -z "$s" ]] && continue
    if echo "$mock_suites" | grep -qx "$s"; then
      choices+=("✓ Mock: $s")
    else
      choices+=("⚡ Direct: $s")
    fi
  done < <(find "$PROJECT_DIR/Script" -maxdepth 1 -mindepth 1 -type d -exec basename {} \; | sort)
  choices+=("← Back")

  local sel; sel=$(pick_fzf "Run Local>" "${choices[@]}")
  [[ -z "$sel" ]] && return

  local _local_log; _local_log=$(mktemp)
  local _local_rc=0

  case "$sel" in
    "✓ Mock: "*)
      local suite_name="${sel#✓ Mock: }"
      local run_sh="$PROJECT_DIR/docker-local-pt/scripts/run-mock-suite.sh"

      local plat_choices=("Web" "iOS" "Android" "All")
      local platform; platform=$(pick_fzf "Platform>" "${plat_choices[@]}")
      [[ -z "$platform" ]] && { rm -f "$_local_log"; return; }

      local platform_arg=""
      [[ "$platform" != "All" ]] && platform_arg="$platform"

      print_run_header "$suite_name  [Mock Suite · $platform]" "Local Docker Mock"
      python3 "$PROJECT_DIR/pt-data/auth.py" set_run "$PT_USER" "MockSuite:$suite_name" "5m" 2>/dev/null || true
      set +e
      bash "$run_sh" "$suite_name" "$platform_arg" 2>&1 | tee "$_local_log"
      _local_rc=${PIPESTATUS[0]}; set -e
      print_run_footer "$_local_rc" "$_local_log"
      python3 "$PROJECT_DIR/docker-local-pt/scripts/print-summary-table.py" "$PROJECT_DIR/docker-local-pt/results/summary.json" 2>/dev/null || true
      rm -f "$_local_log"
      python3 "$PROJECT_DIR/pt-data/auth.py" clear_run "$PT_USER" 2>/dev/null || true
      read -r -p $'\nPress Enter...' ;;

    "⚡ Direct: "*)
      local suite_name="${sel#⚡ Direct: }"
      local suite_dir="$PROJECT_DIR/Script/$suite_name"
      local K6_BIN="$PROJECT_DIR/k6"

      # Collect all .js files (flat + sub-folders)
      local js_files=()
      while IFS= read -r f; do
        [[ "$f" == *"copy"* || "$f" == *"_enhance_log.md" ]] && continue
        js_files+=("$f")
      done < <(find "$suite_dir" -name "*.js" | sed "s|$PROJECT_DIR/||" | sort)

      if [[ ${#js_files[@]} -eq 0 ]]; then
        echo -e "  ${RED}No .js scripts found in $suite_name${RST}"
        read -r -p $'\nPress Enter...'; rm -f "$_local_log"; return
      fi

      local js_sel; js_sel=$(pick_fzf "Script>" "${js_files[@]}")
      [[ -z "$js_sel" ]] && { rm -f "$_local_log"; return; }

      # Config
      local default_vus; default_vus=$(env_val K6_USERS 1)
      printf "  VUs [%s]: " "$default_vus"; read -r vus
      vus="${vus:-$default_vus}"

      local default_dur; default_dur=$(env_val DURATION 30s)
      printf "  Duration [%s]: " "$default_dur"; read -r dur
      dur="${dur:-$default_dur}"

      local default_env; default_env=$(env_val ENV INT)
      printf "  ENV [%s]: " "$default_env"; read -r env_name
      env_name="${env_name:-$default_env}"

      local mock_url="http://localhost:18080"
      local use_mock="n"
      if [[ "$env_name" == "LOCAL" ]]; then
        use_mock="y"
      else
        printf "  Use mock-api (%s)? (y/n): " "$mock_url"; read -r use_mock
      fi

      print_run_header "$suite_name / $(basename "$js_sel")  [Direct · ${vus}VU · $dur]" "k6 binary"
      python3 "$PROJECT_DIR/pt-data/auth.py" set_run "$PT_USER" "$(basename "$js_sel")" "$dur" 2>/dev/null || true
      set +e
      if [[ "$use_mock" == "y" ]]; then
        BASE_URL="$mock_url" "$K6_BIN" run "$PROJECT_DIR/$js_sel" \
          -e ENV="$env_name" -e USER="$vus" -e K6_USERS="$vus" \
          -e DURATION="$dur" -e BASE_URL="$mock_url" 2>&1 | tee "$_local_log"
      else
        "$K6_BIN" run "$PROJECT_DIR/$js_sel" \
          -e ENV="$env_name" -e USER="$vus" -e K6_USERS="$vus" \
          -e DURATION="$dur" 2>&1 | tee "$_local_log"
      fi
      _local_rc=${PIPESTATUS[0]}; set -e
      print_run_footer "$_local_rc" "$_local_log"
      python3 "$PROJECT_DIR/docker-local-pt/scripts/print-summary-table.py" "$PROJECT_DIR/docker-local-pt/results/summary.json" 2>/dev/null || true
      rm -f "$_local_log"
      python3 "$PROJECT_DIR/pt-data/auth.py" clear_run "$PT_USER" 2>/dev/null || true
      read -r -p $'\nPress Enter...' ;;

    "← Back") rm -f "$_local_log"; return ;;
  esac
}

# ── Cron Scheduler ──────────────────────────────────────────────────────────
cron_scheduler_menu() {
  banner
  section_header "Cron Scheduler (SQLite)"

  local choices=(
    "[1] Dashboard (List Jobs)"
    "[2] Add Job"
    "[3] Pause/Resume Job"
    "[4] Remove Job"
    "[0] Back"
  )
  local sel; sel=$(pick_fzf "Scheduler>" "${choices[@]}")
  [[ -z "$sel" ]] && return

  case "$sel" in
    "[1] Dashboard"*)
      echo -e "\n${CYN}  Managed Jobs:${RST}\n"
      python3 "$PROJECT_DIR/bin/pt-scheduler" list | python3 -c "
import json, sys
jobs = json.loads(sys.stdin.read().strip()[sys.stdin.read().strip().find('{') if '{' in sys.stdin.read() else sys.stdin.read().strip().find('['):] if '{' in sys.stdin.read() or '[' in sys.stdin.read() else '[]').get('data', {}).get('jobs', [])
if not jobs:
    print('  (empty)')
else:
    print(f\"  {'ID':<15} | {'Status':<8} | {'Cron Expr':<15} | {'Script'}\")
    print('  ' + '-'*60)
    for j in jobs:
        print(f\"  {j['id']:<15} | {j['status']:<8} | {j['cron_expr']:<15} | {j['script_path']}\")
"
      read -r -p $'\nPress Enter...'
      ;;
    "[2] Add Job"*)
      printf "  Job ID: "; read -r job_id
      [[ -z "$job_id" ]] && return
      printf "  Cron expr [*/5 * * * *]: "; read -r cron_expr
      cron_expr="${cron_expr:-*/5 * * * *}"

      local script_choices=()
      while IFS= read -r s; do
        [[ -z "$s" ]] && continue
        while IFS= read -r js; do
          script_choices+=("$js")
        done < <(find "$PROJECT_DIR/Script/$s" -name '*.js' -maxdepth 1 2>/dev/null)
      done < <(find "$PROJECT_DIR/Script" -maxdepth 1 -mindepth 1 -type d -exec basename {} \; | sort)
      script_choices+=("Custom path")

      local script_sel; script_sel=$(pick_fzf "Script>" "${script_choices[@]}")
      [[ -z "$script_sel" ]] && return
      local script_path="$script_sel"
      if [[ "$script_sel" == "Custom path" ]]; then
        printf "  Script path: "; read -r script_path
        [[ -z "$script_path" ]] && return
      fi
      
      python3 "$PROJECT_DIR/bin/pt-scheduler" add --id "$job_id" --cron "$cron_expr" --script "$script_path" --by "$PT_USER" | python3 -c "import json,sys; print(json.loads(sys.stdin.read().strip()[sys.stdin.read().strip().find('{') if '{' in sys.stdin.read() else sys.stdin.read().strip().find('['):] if '{' in sys.stdin.read() or '[' in sys.stdin.read() else '[]').get('message', 'Failed'))"
      read -r -p $'\nPress Enter...'
      ;;
    "[3] Pause/Resume"*)
      local job_list; job_list=$(python3 "$PROJECT_DIR/bin/pt-scheduler" list | python3 -c "import json,sys; [print(f\"{j['id']} ({j['status']})\") for j in json.loads(sys.stdin.read().strip()[sys.stdin.read().strip().find('{') if '{' in sys.stdin.read() else sys.stdin.read().strip().find('['):] if '{' in sys.stdin.read() or '[' in sys.stdin.read() else '[]').get('data',{}).get('jobs',[])]")
      [[ -z "$job_list" ]] && return
      local job_sel; job_sel=$(echo "$job_list" | pick_fzf "Toggle>")
      [[ -z "$job_sel" ]] && return
      
      local jid="${job_sel%% *}"
      local act="resume"
      [[ "$job_sel" == *"(active)"* ]] && act="pause"
      
      python3 "$PROJECT_DIR/bin/pt-scheduler" toggle --id "$jid" --action "$act" | python3 -c "import json,sys; print(json.loads(sys.stdin.read().strip()[sys.stdin.read().strip().find('{') if '{' in sys.stdin.read() else sys.stdin.read().strip().find('['):] if '{' in sys.stdin.read() or '[' in sys.stdin.read() else '[]').get('message', 'Failed'))"
      read -r -p $'\nPress Enter...'
      ;;
    "[4] Remove"*)
      local job_list; job_list=$(python3 "$PROJECT_DIR/bin/pt-scheduler" list | python3 -c "import json,sys; [print(j['id']) for j in json.loads(sys.stdin.read().strip()[sys.stdin.read().strip().find('{') if '{' in sys.stdin.read() else sys.stdin.read().strip().find('['):] if '{' in sys.stdin.read() or '[' in sys.stdin.read() else '[]').get('data',{}).get('jobs',[])]")
      [[ -z "$job_list" ]] && return
      local job_sel; job_sel=$(echo "$job_list" | pick_fzf "Remove>")
      [[ -z "$job_sel" ]] && return
      
      python3 "$PROJECT_DIR/bin/pt-scheduler" remove --id "$job_sel" | python3 -c "import json,sys; print(json.loads(sys.stdin.read().strip()[sys.stdin.read().strip().find('{') if '{' in sys.stdin.read() else sys.stdin.read().strip().find('['):] if '{' in sys.stdin.read() or '[' in sys.stdin.read() else '[]').get('message', 'Failed'))"
      read -r -p $'\nPress Enter...'
      ;;
    "[0] Back") return ;;
  esac
}

# ── AI Slope Check (Standalone) ────────────────────────────────────────────
ai_slope_menu() {
  banner
  section_header "AI Slope — Code Quality Scanner"

  # Pick script to analyze
  local script_choices=()
  while IFS= read -r s; do
    [[ -z "$s" ]] && continue
    while IFS= read -r f; do
      script_choices+=("$f")
    done < <(find "$PROJECT_DIR/Script/$s" -name '*.js' -o -name '*.sh' 2>/dev/null | head -20)
  done < <(find "$PROJECT_DIR/Script" -maxdepth 1 -mindepth 1 -type d -exec basename {} \; | sort)
  # Add shell scripts from root
  while IFS= read -r f; do
    script_choices+=("$f")
  done < <(find "$PROJECT_DIR" -maxdepth 1 -name '*.sh' | sort)
  script_choices+=("Custom path" "← Back")

  local sel; sel=$(pick_fzf "Analyze>" "${script_choices[@]}")

  [[ -z "$sel" || "$sel" == "← Back" ]] && return

  local target_path="$sel"
  if [[ "$sel" == "Custom path" ]]; then
    printf "  File path: "; read -r target_path
    [[ -z "$target_path" ]] && { echo "Cancelled."; read -r -p $'\nPress Enter...'; return; }
  fi

  if [[ ! -f "$target_path" ]]; then
    echo -e "  ${RED}File not found: $target_path${RST}"
    read -r -p $'\nPress Enter...'
    return
  fi

  echo -e "\n${YLW}  Analyzing: $target_path${RST}\n"
  set +e
  python3 -c "
import sys; sys.path.insert(0,'$PROJECT_DIR/scheduler_cli')
from ai.slope_validator import validate_script, format_report
r = validate_script('$target_path')
print(format_report(r))
" 2>&1
  set -e
  read -r -p $'\nPress Enter...'
}

# ── Main Menu ───────────────────────────────────────────────────────────────
main_menu() {
  pt_require_auth
  python3 "$PROJECT_DIR/bin/pt-audit" log "${PT_USER:-unknown}" "login" "pt-menu" "" 2>/dev/null || true
  while true; do
    banner

    local choices=()
    [[ "$PT_ROLE" == "god" || "$PT_ROLE" == "admin" || "$PT_ROLE" == "tester" ]] && choices+=("[1] Remote Runner (SSH + Cloud/Onprem)")
    [[ "$PT_ROLE" == "god" || "$PT_ROLE" == "admin" || "$PT_ROLE" == "tester" ]] && choices+=("[2] Local Runner (Mock Docker K6)")
    [[ "$PT_ROLE" == "god" || "$PT_ROLE" == "admin" ]] && choices+=("[3] Cron Scheduler")
    [[ "$PT_ROLE" == "god" || "$PT_ROLE" == "admin" || "$PT_ROLE" == "tester" ]] && choices+=("[4] AI Slope (Code Quality)")
    [[ "$PT_ROLE" != "viewer" ]] && choices+=("[5] ENV Editor")
    [[ "$PT_ROLE" == "god" || "$PT_ROLE" == "admin" ]] && choices+=("[6] Docker Stack")
    choices+=("[7] Open Project Dir")
    [[ "$PT_ROLE" == "god" || "$PT_ROLE" == "admin" ]] && choices+=("[D] Dashboard (Live Monitor)")
    [[ "$PT_ROLE" == "god" ]] && choices+=("[8] User Management")
    choices+=("[Q] Quit")

    local sel; sel=$(pick_fzf "Action>" "${choices[@]}")


    case "$sel" in
      "[1] Remote Runner"*) ssh_menu ;;
      "[2] Local Runner"*) run_test_menu ;;
      "[3] Cron Scheduler"*) cron_scheduler_menu ;;
      "[4] AI Slope"*) ai_slope_menu ;;
      "[5] ENV Editor"*)  env_edit_menu ;;
      "[6] Docker Stack"*) docker_menu ;;
      "[7] Open Project Dir"*) open_dir "$PROJECT_DIR" ;;
      "[8] User Management"*) user_mgmt_menu ;;
      "[D] Dashboard"*) bash "$PROJECT_DIR/bin/pt-dashboard" ;;
      "[Q] Quit"|"") echo -e "\n${GRN}bye.${RST}\n"; exit 0 ;;
    esac
  done
}

# ── Entrypoint ───────────────────────────────────────────────────────────────
if ! command -v fzf &>/dev/null; then
  echo -e "${RED}fzf not found. Install: sudo apt install fzf (Debian) / sudo yum install fzf (RHEL)${RST}" >&2
  exit 1
fi

if ! command -v python3 &>/dev/null; then
  echo -e "${YLW}Warning: python3 not found. Scheduler/AI features disabled.${RST}" >&2
fi

main_menu
