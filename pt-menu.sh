#!/usr/bin/env bash
# pt-menu.sh — Performance Test Setup TUI
# Requires: fzf (brew install fzf)

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
    grep -v "^#" "$ENV_FILE" | grep -v "^$" | while IFS= read -r line; do
      echo -e "  ${YLW}${line}${RST}"
    done
  else
    echo -e "  ${RED}[NOT FOUND] $ENV_FILE${RST}"
  fi
  echo ""
}

pick_fzf() {
  local prompt="$1"; shift
  local opts=("$@")
  printf '%s\n' "${opts[@]}" | fzf --prompt="$prompt " --height=~40% --border=rounded \
    --color='prompt:cyan,pointer:yellow,selected:green' --no-info --ansi
}

confirm() {
  echo -e "\n${YLW}$1 [y/N]${RST} " && read -r ans
  [[ "$ans" =~ ^[Yy]$ ]]
}

# ── SSH Section ──────────────────────────────────────────────────────────────

ssh_menu() {
  banner
  echo -e "${BLD}  SSH — Select Target${RST}\n"

  local extra_host=""
  local base_url; base_url=$(env_val "BASE_URL")
  if [[ "$base_url" =~ ^https?://([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+) ]]; then
    extra_host="${BASH_REMATCH[1]}"
  fi

  local choices=()
  choices+=("Onprem-1  │ 10.82.15.72")
  choices+=("Onprem-2  │ 10.184.120.48")
  choices+=("Cloud IAP │ vm-pt-ksix-0")
  [[ -n "$extra_host" ]] && choices+=("Auto .env │ $extra_host")
  choices+=("← Back")

  local sel; sel=$(pick_fzf "SSH target>" "${choices[@]}")
  [[ "$sel" == "← Back" ]] && return

  if [[ "$sel" == "Auto .env │ "* ]]; then
    local ip="${sel#*│ }"; ip="${ip// /}"
    local user; user=$(env_val "SSH_USER" "qa")
    local target="$user@$ip"
    echo -e "\n${GRN}Connecting: ${BLD}$target${RST} (from .env BASE_URL)\n"
    ssh "$target"
    return
  fi

  local target=""
  local pass=""

  case "$sel" in
    "Onprem-1  │ 10.82.15.72")
      target="qa@10.82.15.72"
      pass="M@nsek.1234"
      ;;
    "Onprem-2  │ 10.184.120.48")
      target="qa@10.184.120.48"
      pass="M@nsek.1234"
      ;;
    "Cloud IAP │ vm-pt-ksix-0")
      echo -e "\n${GRN}Connecting via IAP: ${BLD}vm-pt-ksix-0${RST}\n"
      gcloud compute ssh --zone "asia-southeast2-c" "vm-pt-ksix-0" \
        --tunnel-through-iap --project "compute-pt"
      return
      ;;
  esac

  echo -e "\n${GRN}Connecting: ${BLD}$target${RST}"
  if [[ -n "$pass" ]]; then
    echo -e "  ${YLW}Password: ${BLD}${pass}${RST}  (copy if prompted)"
    echo -e "  ${CYN}(tip: use ssh-copy-id to avoid password prompt)${RST}\n"
    if command -v sshpass &>/dev/null; then
      sshpass -p "$pass" ssh -o StrictHostKeyChecking=accept-new "$target"
    else
      echo "$pass" | pbcopy 2>/dev/null && echo -e "  ${GRN}Password copied to clipboard.${RST}\n" || true
      ssh -o StrictHostKeyChecking=accept-new "$target"
    fi
  else
    ssh -o StrictHostKeyChecking=accept-new "$target"
  fi
}

# ── ENV Edit ────────────────────────────────────────────────────────────────
env_edit_menu() {
  banner
  echo -e "${BLD}  ENV Editor — $ENV_FILE${RST}\n"
  show_env_summary

  local choices=(
    "Edit full .env in \$EDITOR"
    "Set BASE_URL"
    "Set ENV (LOCAL/DEV/QA/PROD)"
    "Set K6_USERS + DURATION"
    "Set SUITE"
    "Set SCENARIO"
    "Toggle DEBUG"
    "Toggle USE_GRAFANA_OUTPUT"
    "← Back"
  )
  local sel; sel=$(pick_fzf "ENV action>" "${choices[@]}")

  set_env_key() {
    local key="$1" val="$2"
    if [[ -f "$ENV_FILE" ]]; then
      if grep -q "^${key}=" "$ENV_FILE"; then
        sed -i '' "s|^${key}=.*|${key}=${val}|" "$ENV_FILE"
      else
        echo "${key}=${val}" >> "$ENV_FILE"
      fi
    fi
    echo -e "${GRN}Set ${key}=${val}${RST}"
  }

  toggle_env_key() {
    local key="$1"
    local cur; cur=$(env_val "$key" "false")
    local new="true"; [[ "$cur" == "true" ]] && new="false"
    set_env_key "$key" "$new"
  }

  case "$sel" in
    "Edit full .env in \$EDITOR")
      ${EDITOR:-nano} "$ENV_FILE" ;;
    "Set BASE_URL")
      echo -e "\n${YLW}Current: $(env_val BASE_URL)${RST}"
      printf "New BASE_URL: "; read -r v; [[ -n "$v" ]] && set_env_key "BASE_URL" "$v" ;;
    "Set ENV"*)
      local env_sel; env_sel=$(pick_fzf "ENV>" "LOCAL" "DEV" "QA" "PROD" "STAGING")
      set_env_key "ENV" "$env_sel" ;;
    "Set K6_USERS + DURATION")
      printf "K6_USERS [$(env_val K6_USERS 1)]: "; read -r u
      printf "DURATION [$(env_val DURATION 30s)]: "; read -r d
      [[ -n "$u" ]] && set_env_key "K6_USERS" "$u" && set_env_key "USER_COUNT" "$u"
      [[ -n "$d" ]] && set_env_key "DURATION" "$d" ;;
    "Set SUITE")
      printf "SUITE [$(env_val SUITE)]: "; read -r v; [[ -n "$v" ]] && set_env_key "SUITE" "$v" ;;
    "Set SCENARIO")
      printf "SCENARIO [$(env_val SCENARIO)]: "; read -r v; [[ -n "$v" ]] && set_env_key "SCENARIO" "$v" ;;
    "Toggle DEBUG")    toggle_env_key "DEBUG" ;;
    "Toggle USE_GRAFANA_OUTPUT") toggle_env_key "USE_GRAFANA_OUTPUT" ;;
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
    "Restart mock-api"
    "Tail k6-runner logs"
    "Open Grafana (browser)"
    "docker ps"
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
    "Restart mock-api")
      docker compose restart mock-api ;;
    "Tail k6-runner logs")
      docker compose logs -f k6-runner ;;
    "Open Grafana"*)
      local url; url=$(env_val GRAFANA_URL "http://localhost:3000")
      open "$url" 2>/dev/null || xdg-open "$url" 2>/dev/null || echo "$url" ;;
    "docker ps")
      docker ps; read -r -p $'\nPress Enter...' ;;
    "← Back") cd "$PROJECT_DIR"; return ;;
  esac
  cd "$PROJECT_DIR"
  sleep 1
}

# ── Run Test ────────────────────────────────────────────────────────────────
run_test_menu() {
  banner
  echo -e "${BLD}  Run Test${RST}\n"
  echo -e "  ${CYN}ENV: $(env_val ENV LOCAL) | SUITE: $(env_val SUITE) | SCENARIO: $(env_val SCENARIO) | VUs: $(env_val K6_USERS 1) | ${YLW}$(env_val DURATION 30s)${RST}\n"

  local choices=(
    "Run mock suite (run-mock-suite.sh)"
    "Run k6 direct (docker compose)"
    "Generate mock runners"
    "← Back"
  )
  local sel; sel=$(pick_fzf "Run>" "${choices[@]}")

  case "$sel" in
    "Run mock suite"*)
      local run_sh="$PROJECT_DIR/docker-local-pt/scripts/run-mock-suite.sh"
      [[ -x "$run_sh" ]] && bash "$run_sh" || echo -e "${RED}Not found: $run_sh${RST}"
      read -r -p $'\nPress Enter...' ;;
    "Run k6 direct"*)
      local compose_dir="$PROJECT_DIR/docker-local-pt"
      cd "$compose_dir"
      docker compose --env-file configs/local.env up --abort-on-container-exit k6-runner
      cd "$PROJECT_DIR"
      read -r -p $'\nPress Enter...' ;;
    "Generate mock runners")
      local gen="$PROJECT_DIR/docker-local-pt/scripts/gen-mock-runner.mjs"
      [[ -f "$gen" ]] && node "$gen" || echo -e "${RED}Not found: $gen${RST}"
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
      "🖥  SSH — Connect to Server"
      "⚙️  ENV — Edit local.env"
      "🐳  Docker — Local PT Stack"
      "▶️  Run Test"
      "📂  Open Project in Finder"
      "❌  Quit"
    )

    local sel; sel=$(pick_fzf "Action>" "${choices[@]}")

    case "$sel" in
      "🖥  SSH"*)  ssh_menu ;;
      "⚙️  ENV"*)  env_edit_menu ;;
      "🐳  Docker"*) docker_menu ;;
      "▶️  Run Test"*) run_test_menu ;;
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
