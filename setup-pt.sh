#!/usr/bin/env bash
# Growin PT Framework — Setup Script for Mac Mini
# Run this ONCE on a fresh machine after git clone

set -e
BOLD='\033[1m'; GRN='\033[0;32m'; YLW='\033[1;33m'; RED='\033[0;31m'; RST='\033[0m'

ok()   { echo -e "  ${GRN}✓${RST}  $1"; }
warn() { echo -e "  ${YLW}!${RST}  $1"; }
fail() { echo -e "  ${RED}✘${RST}  $1"; }

echo -e "\n${BOLD}Growin PT Framework — Dependency Setup${RST}\n"

# 1. Homebrew
if ! command -v brew &>/dev/null; then
  warn "Homebrew not found. Installing..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
  ok "Homebrew $(brew --version | head -1)"
fi

# 2. fzf
if ! command -v fzf &>/dev/null; then
  warn "Installing fzf..."
  brew install fzf
else
  ok "fzf $(fzf --version)"
fi

# 3. jq
if ! command -v jq &>/dev/null; then
  warn "Installing jq..."
  brew install jq
else
  ok "jq $(jq --version)"
fi

# 4. bash 5+ (macOS default is bash 3.2, upgrade)
BASH_VER=$(bash --version | head -1 | grep -oE '[0-9]+\.[0-9]+' | head -1)
BASH_MAJOR=$(echo "$BASH_VER" | cut -d. -f1)
if [[ "$BASH_MAJOR" -lt 4 ]]; then
  warn "bash $BASH_VER too old. Installing bash 5 via Homebrew..."
  brew install bash
  warn "Add /opt/homebrew/bin/bash or /usr/local/bin/bash to /etc/shells, then run: chsh -s \$(which bash)"
  warn "OR just prefix runs with: bash ./pt-menu.sh (Homebrew bash)"
else
  ok "bash $BASH_VER"
fi

# 5. python3
if ! command -v python3 &>/dev/null; then
  warn "Installing python3..."
  brew install python3
else
  ok "python3 $(python3 --version)"
fi

# 6. Python packages
echo -e "\n  Installing Python packages..."
pip3 install --quiet bcrypt click psutil && ok "bcrypt, click, psutil installed"

# 7. node (for list-scenarios.mjs)
if ! command -v node &>/dev/null; then
  warn "Installing node..."
  brew install node
else
  ok "node $(node --version)"
fi

# 8. Docker
if ! command -v docker &>/dev/null; then
  fail "Docker not installed. Download from: https://www.docker.com/products/docker-desktop"
else
  ok "Docker $(docker --version)"
fi

# 9. ~/.pt directory structure
mkdir -p ~/.pt/var ~/.pt/sessions ~/.pt/audit/archive ~/.pt/run
chmod 700 ~/.pt ~/.pt/sessions ~/.pt/audit/archive
ok "~/.pt/ directory structure ready"

# 10. Init DB
echo -e "\n  Initializing SQLite database..."
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 "$PROJECT_DIR/lib/python/db.py" && ok "SQLite DB initialized at ~/.pt/var/pt.db"

# 11. Ensure pt-menu.sh is executable
chmod +x "$PROJECT_DIR/pt-menu.sh" "$PROJECT_DIR"/bin/pt-*
ok "Executables: pt-menu.sh + bin/pt-*"

# 12. Bootstrap configs/pt.env if missing
if [[ ! -f "$PROJECT_DIR/configs/pt.env" ]]; then
  warn "configs/pt.env missing — please create it from configs/ examples"
fi

# 13. Bootstrap docker-local-pt/configs/local.env from example if missing
if [[ ! -f "$PROJECT_DIR/docker-local-pt/configs/local.env" ]]; then
  cp "$PROJECT_DIR/docker-local-pt/configs/local.env.example" \
     "$PROJECT_DIR/docker-local-pt/configs/local.env"
  ok "Created docker-local-pt/configs/local.env from example"
fi

# 14. Start Docker sandbox stack (mock-api + sandbox-ssh + observability)
echo -e "\n  Starting Docker sandbox stack..."
if command -v docker &>/dev/null && docker info &>/dev/null; then
  ( cd "$PROJECT_DIR/docker-local-pt" && \
    docker compose --env-file configs/local.env \
                   --profile observability \
                   up -d --build mock-api sandbox-ssh influxdb grafana 2>&1 | tail -20 ) \
    && ok "Sandbox stack up: mock-api, sandbox-ssh, influxdb, grafana"
else
  warn "Docker not running — skipping sandbox stack bootstrap"
fi

# 15. Final status
echo -e "\n${BOLD}Setup complete!${RST}"
echo -e "\n${BOLD}Sandbox endpoints:${RST}"
echo -e "  Mock API     : ${GRN}http://localhost:18080${RST}      (HTTP target for k6)"
echo -e "  Sandbox SSH  : ${GRN}qa@127.0.0.1:2222${RST}            (password: M@nsek.1234)"
echo -e "  Grafana      : ${GRN}http://localhost:3000${RST}        (admin/admin)"
echo -e "  InfluxDB     : ${GRN}http://localhost:18086${RST}"
echo -e "\n${BOLD}Next steps:${RST}"
echo -e "  1. Edit ${YLW}configs/pt.env${RST} — set webhooks, Onprem/Oncloud creds"
echo -e "  2. Run: ${GRN}./pt-menu.sh${RST}"
echo -e "  3. First boot creates a god admin account."
echo -e ""
