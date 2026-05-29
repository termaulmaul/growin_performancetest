#!/bin/bash
cat << 'INNER' > pt-menu.sh
#!/usr/bin/env bash
# pt-menu.sh — Performance Test Setup TUI

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$PROJECT_DIR/docker-local-pt/configs/local.env"

# ── Colors ─────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GRN='\033[0;32m'; YLW='\033[1;33m'
BLU='\033[0;34m'; CYN='\033[0;36m'; BLD='\033[1m'; RST='\033[0m'

# ── Helpers ─────────────────────────────────────────────────────────────────
banner() {
  clear
  echo -e "${BLU}${BLD}"
  echo "  ╔══════════════════════════════════════════════╗"
  echo "  ║     🚀  Growin Performance Test Menu         ║"
  echo "  ╚══════════════════════════════════════════════╝${RST}"
  echo ""
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
      echo -e "  ${YLW}${line}${RST}"
    done
    echo "  ..."
  else
    echo -e "  ${RED}[NOT FOUND] $ENV_FILE${RST}"
  fi
  echo ""
}

pick_fzf() {
  local prompt="$1"; shift
  local opts=("$@")
  printf '%s\n' "${opts[@]}" | fzf --prompt="$prompt " --height=~40% --border=rounded \
    --color='prompt:cyan,pointer:yellow,fg+:green' --no-info --ansi
}

# ── SSH Section ──────────────────────────────────────────────────────────────
ssh_menu() {
  banner
  echo -e "${BLD}  SSH — Select Target${RST}\n"

  local choices=(
    "Onprem (Jump 10.82.15.72 -> 10.184.120.48)"
    "Oncloud (GCP IAP vm-pt-ksix-0)"
    "← Back"
  )

  local sel; sel=$(pick_fzf "SSH target>" "${choices[@]}")
  [[ "$sel" == "← Back" ]] && return

  echo ""
  echo -e "${BLD}  Select Script / Command${RST}"
  local scripts=()
  while IFS= read -r s; do
    [[ -z "$s" ]] && continue
    scripts+=("Suite: $s")
  done < <(find "$PROJECT_DIR/Script" -maxdepth 1 -mindepth 1 -type d -exec basename {} \; | sort)
  scripts+=("Custom Command" "Only Connect (Interactive Shell)")

  local script_sel; script_sel=$(pick_fzf "Script>" "${scripts[@]}")

  local run_cmd=""
  case "$script_sel" in
    "Suite: "*)
       local suite_name="${script_sel#Suite: }"
       run_cmd="bash docker-local-pt/scripts/run-mock-suite.sh \"$suite_name\" Web"
       ;;
    "Custom Command")
       printf "Command: "
       read -r run_cmd
       ;;
  esac

  local remote_base="cd growin_performancetest || cd /data/qa/growin_performancetest || echo 'Repo not found on remote!'"
  local ssh_cmd=""

  if [[ -n "$run_cmd" ]]; then
      ssh_cmd="$remote_base && $run_cmd"
  fi

  case "$sel" in
    "Onprem "*)
      echo -e "\n${GRN}Connecting via Jump to Onprem-2...${RST}"
      
      if command -v sshpass &>/dev/null; then
        if [[ -n "$ssh_cmd" ]]; then
            sshpass -p "M@nsek.1234" ssh -o StrictHostKeyChecking=no -o ProxyCommand="sshpass -p \"M@nsek.1234\" ssh -o StrictHostKeyChecking=no -W %h:%p qa@10.82.15.72" qa@10.184.120.48 "$ssh_cmd"
        else
            sshpass -p "M@nsek.1234" ssh -o StrictHostKeyChecking=no -o ProxyCommand="sshpass -p \"M@nsek.1234\" ssh -o StrictHostKeyChecking=no -W %h:%p qa@10.82.15.72" qa@10.184.120.48
        fi
      else
        echo -e "${YLW}Warning: sshpass not installed. You will be prompted for password twice.${RST}"
        if [[ -n "$ssh_cmd" ]]; then
            ssh -J qa@10.82.15.72 qa@10.184.120.48 "$ssh_cmd"
        else
            ssh -J qa@10.82.15.72 qa@10.184.120.48
        fi
      fi
      ;;
    "Oncloud "*)
      echo -e "\n${GRN}Connecting via GCP IAP...${RST}\n"
      if [[ -n "$ssh_cmd" ]]; then
          gcloud compute ssh --zone "asia-southeast2-c" "vm-pt-ksix-0" --tunnel-through-iap --project "compute-pt" --command="$ssh_cmd"
      else
          gcloud compute ssh --zone "asia-southeast2-c" "vm-pt-ksix-0" --tunnel-through-iap --project "compute-pt"
      fi
      ;;
  esac
  read -r -p $'\nPress Enter...'
}

# ── ENV Edit ────────────────────────────────────────────────────────────────
env_edit_menu() {
  banner
  echo -e "${BLD}  ENV Editor — $ENV_FILE${RST}\n"
  show_env_summary

  local choices=(
    "Edit full .env in \$EDITOR"
    "← Back"
  )
  local sel; sel=$(pick_fzf "ENV action>" "${choices[@]}")

  case "$sel" in
    "Edit full .env"*)
      ${EDITOR:-nano} "$ENV_FILE" ;;
    "← Back") return ;;
  esac
  sleep 1
}

# ── Docker Section ──────────────────────────────────────────────────────────
docker_menu() {
  banner
  echo -e "${BLD}  Docker — Local PT Stack${RST}\n"
  local compose_dir="$PROJECT_DIR/docker-local-pt"
  echo -e "${CYN}  Running containers:${RST}"
  docker ps --format "  {{.Names}}\t{{.Status}}" 2>/dev/null | grep -E "pt-|k6" || echo "  (none)"
  echo ""

  local choices=(
    "Start stack (mock + k6)"
    "Start stack + observability (Grafana/Influx)"
    "Stop all"
    "← Back"
  )
  local sel; sel=$(pick_fzf "Docker action>" "${choices[@]}")

  cd "$compose_dir"
  case "$sel" in
    "Start stack (mock + k6)")
      docker compose --env-file configs/local.env up -d mock-api ;;
    "Start stack + observability"*)
      docker compose --env-file configs/local.env --profile observability up -d ;;
    "Stop all")
      docker compose down ;;
    "← Back") cd "$PROJECT_DIR"; return ;;
  esac
  cd "$PROJECT_DIR"
  sleep 1
}

# ── Local Run Test ──────────────────────────────────────────────────────────
run_test_menu() {
  banner
  echo -e "${BLD}  Run Test (Local Docker Mock)${RST}\n"
  echo -e "  ${CYN}ENV: $(env_val ENV LOCAL) | VUs: $(env_val K6_USERS 1) | ${YLW}$(env_val DURATION 30s)${RST}\n"

  local choices=()
  while IFS= read -r s; do
    [[ -z "$s" ]] && continue
    choices+=("Mock Suite: $s")
  done < <(find "$PROJECT_DIR/Script" -maxdepth 1 -mindepth 1 -type d -exec basename {} \; | sort)
  choices+=("Run BP001 Growin_PT_Dev")
  choices+=("← Back")
  
  local sel; sel=$(pick_fzf "Run Local>" "${choices[@]}")

  case "$sel" in
    "Mock Suite: "*)
      local suite_name="${sel#Mock Suite: }"
      local run_sh="$PROJECT_DIR/docker-local-pt/scripts/run-mock-suite.sh"
      bash "$run_sh" "$suite_name" Web
      read -r -p $'\nPress Enter...' ;;
    "Run BP001 Growin_PT_Dev")
      local run_sc="$PROJECT_DIR/docker-local-pt/scripts/run-mock-scenario.sh"
      SUITE='Growin_PT_Dev[ToDo]' bash "$run_sc" BP001 Web enchange
      read -r -p $'\nPress Enter...' ;;
    "← Back") return ;;
  esac
}

# ── Main Menu ───────────────────────────────────────────────────────────────
main_menu() {
  while true; do
    banner
    show_env_summary

    local choices=(
      "🖥  Remote Runner (SSH + Run on Cloud/Onprem)"
      "▶️  Local Runner (Mock Docker K6)"
      "⚙️  ENV — Edit local.env"
      "🐳  Docker — Manage Local Mock Stack"
      "📂  Open Project in Finder"
      "❌  Quit"
    )

    local sel; sel=$(pick_fzf "Action>" "${choices[@]}")

    case "$sel" in
      "🖥  Remote Runner"*) ssh_menu ;;
      "▶️  Local Runner"*) run_test_menu ;;
      "⚙️  ENV"*)  env_edit_menu ;;
      "🐳  Docker"*) docker_menu ;;
      "📂  Open Project"*) open "$PROJECT_DIR" 2>/dev/null || true ;;
      "❌  Quit"|"") echo -e "\n${GRN}bye.${RST}\n"; exit 0 ;;
    esac
  done
}

# ── Entrypoint ───────────────────────────────────────────────────────────────
if ! command -v fzf &>/dev/null; then
  echo -e "${RED}fzf not found. Install: brew install fzf${RST}" >&2
  exit 1
fi

main_menu
INNER
chmod +x pt-menu.sh
