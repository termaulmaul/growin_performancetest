#!/usr/bin/env bash
# Growin PT Framework — Setup Script
# Run ONCE on a fresh machine after git clone. Safe to re-run.

set -e
BOLD='\033[1m'; GRN='\033[0;32m'; YLW='\033[1;33m'; RED='\033[0;31m'; RST='\033[0m'

ok()     { echo -e "  ${GRN}✓${RST}  $1"; }
warn()   { echo -e "  ${YLW}!${RST}  $1"; }
fail()   { echo -e "  ${RED}✘${RST}  $1"; }
skip()   { echo -e "  ${GRN}✓${RST}  $1 ${GRN}[already installed]${RST}"; }
install(){ echo -e "  ${YLW}↓${RST}  $1 ${YLW}[installing...]${RST}"; }

echo -e "\n${BOLD}Growin PT Framework — Dependency Setup${RST}\n"

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── 1. Homebrew ──────────────────────────────────────────────────────────────
if command -v brew &>/dev/null; then
  skip "Homebrew $(brew --version | head -1)"
else
  install "Homebrew"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ok "Homebrew installed"
fi

# ── 2. fzf ───────────────────────────────────────────────────────────────────
if command -v fzf &>/dev/null; then
  skip "fzf $(fzf --version)"
else
  install "fzf"
  brew install fzf
  ok "fzf installed"
fi

# ── 3. jq ────────────────────────────────────────────────────────────────────
if command -v jq &>/dev/null; then
  skip "jq $(jq --version)"
else
  install "jq"
  brew install jq
  ok "jq installed"
fi

# ── 4. bash 5+ (macOS ships 3.2, need 4+ for assoc arrays) ─────────────────
BASH_MAJOR=$(bash --version | head -1 | grep -oE '[0-9]+' | head -1)
if [[ "$BASH_MAJOR" -ge 4 ]]; then
  skip "bash $(bash --version | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)"
else
  install "bash 5 (current: $BASH_MAJOR.x)"
  brew install bash
  warn "Add Homebrew bash to /etc/shells then: chsh -s \$(brew --prefix)/bin/bash"
  warn "Or prefix runs: bash ./pt-menu.sh"
fi

# ── 5. python3 ───────────────────────────────────────────────────────────────
if command -v python3 &>/dev/null; then
  skip "python3 $(python3 --version)"
else
  install "python3"
  brew install python3
  ok "python3 installed"
fi

# ── 6. Python packages (check each individually) ────────────────────────────
echo ""
PY_PKGS=(bcrypt click psutil)
PY_MISSING=()
for pkg in "${PY_PKGS[@]}"; do
  if python3 -c "import $pkg" &>/dev/null; then
    skip "python: $pkg $(python3 -c "import $pkg; v=getattr($pkg,'__version__','?'); print(v)" 2>/dev/null)"
  else
    warn "python: $pkg not found"
    PY_MISSING+=("$pkg")
  fi
done
if [[ ${#PY_MISSING[@]} -gt 0 ]]; then
  install "pip3 install ${PY_MISSING[*]}"
  pip3 install --quiet "${PY_MISSING[@]}"
  ok "Installed: ${PY_MISSING[*]}"
fi

# ── 7. node ──────────────────────────────────────────────────────────────────
if command -v node &>/dev/null; then
  skip "node $(node --version)"
else
  install "node"
  brew install node
  ok "node installed"
fi

# ── 8. sshpass (required for Onprem jump host) ──────────────────────────────
if command -v sshpass &>/dev/null; then
  skip "sshpass $(sshpass -V 2>&1 | head -1)"
else
  install "sshpass"
  brew install sshpass 2>/dev/null || brew install hudochenkov/sshpass/sshpass 2>/dev/null || \
    warn "sshpass install failed — Onprem SSH will prompt for password"
  command -v sshpass &>/dev/null && ok "sshpass installed" || warn "sshpass not available"
fi

# ── 9. gcloud (optional — required for Oncloud/IAP) ─────────────────────────
if command -v gcloud &>/dev/null; then
  skip "gcloud $(gcloud --version 2>/dev/null | head -1)"
else
  warn "gcloud not installed — Oncloud (GCP IAP) target will not work"
  warn "Install: https://cloud.google.com/sdk/docs/install"
fi

# ── 10. Docker ───────────────────────────────────────────────────────────────
if command -v docker &>/dev/null; then
  skip "Docker $(docker --version)"
else
  fail "Docker not installed — Sandbox Demo will not work"
  warn "Install: https://www.docker.com/products/docker-desktop"
fi

# ── 11. ~/.pt directory structure ────────────────────────────────────────────
echo ""
if [[ -d "$HOME/.pt/var" ]]; then
  skip "~/.pt/ directory structure"
else
  mkdir -p ~/.pt/var ~/.pt/sessions ~/.pt/audit/archive ~/.pt/run
  chmod 700 ~/.pt ~/.pt/sessions ~/.pt/audit/archive
  ok "~/.pt/ directory structure created"
fi

# ── 12. Init SQLite DB ───────────────────────────────────────────────────────
if [[ -f "$HOME/.pt/var/pt.db" ]]; then
  skip "SQLite DB ~/.pt/var/pt.db"
else
  echo -e "\n  Initializing SQLite database..."
  python3 "$PROJECT_DIR/lib/python/db.py" && ok "SQLite DB initialized at ~/.pt/var/pt.db"
fi

# ── 13. Executables ──────────────────────────────────────────────────────────
chmod +x "$PROJECT_DIR/pt-menu.sh" "$PROJECT_DIR"/bin/pt-* 2>/dev/null
ok "Executables: pt-menu.sh + bin/pt-*"

# ── 14. configs/pt.env ───────────────────────────────────────────────────────
if [[ -f "$PROJECT_DIR/configs/pt.env" ]]; then
  skip "configs/pt.env"
else
  if [[ -f "$PROJECT_DIR/configs/pt.env.example" ]]; then
    cp "$PROJECT_DIR/configs/pt.env.example" "$PROJECT_DIR/configs/pt.env"
    ok "configs/pt.env created from pt.env.example"
    warn "Edit configs/pt.env — set PT_SSH_PASS, TEST_PASSWORD, TEST_PIN, TEAMS_WEBHOOK"
  else
    warn "configs/pt.env missing and no example found — create manually"
  fi
fi

# ── 15. docker-local-pt/configs/local.env ───────────────────────────────────
if [[ -f "$PROJECT_DIR/docker-local-pt/configs/local.env" ]]; then
  skip "docker-local-pt/configs/local.env"
else
  cp "$PROJECT_DIR/docker-local-pt/configs/local.env.example" \
     "$PROJECT_DIR/docker-local-pt/configs/local.env" 2>/dev/null && \
    ok "Created docker-local-pt/configs/local.env from example" || \
    warn "docker-local-pt/configs/local.env.example not found — skipping"
fi

# ── 16. Docker sandbox stack ────────────────────────────────────────────────
echo ""
if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
  # Check if containers already running
  RUNNING=$(docker ps --format "{{.Names}}" 2>/dev/null | grep -cE "^pt-(mock-api|sandbox-ssh)$" || echo 0)
  if [[ "$RUNNING" -ge 2 ]]; then
    skip "Docker sandbox stack (pt-mock-api + pt-sandbox-ssh already running)"
  else
    echo -e "  ${YLW}↓${RST}  Starting Docker sandbox stack..."
    ( cd "$PROJECT_DIR/docker-local-pt" && \
      docker compose --env-file configs/local.env \
                     --profile observability \
                     up -d --build mock-api sandbox-ssh influxdb grafana 2>&1 | tail -10 ) \
      && ok "Sandbox stack up: mock-api + sandbox-ssh + influxdb + grafana"
  fi
else
  warn "Docker not running — skipping sandbox stack (start Docker first, re-run setup)"
fi

# ── 17. Final summary ────────────────────────────────────────────────────────
echo -e "\n${BOLD}Setup complete!${RST}"
echo -e "\n${BOLD}Sandbox endpoints:${RST}"
echo -e "  Mock API    : ${GRN}http://localhost:18080${RST}   (k6 HTTP target)"
echo -e "  Sandbox SSH : ${GRN}qa@127.0.0.1:2222${RST}        (password: M@nsek.1234)"
echo -e "  Grafana     : ${GRN}http://localhost:3000${RST}    (admin / admin)"
echo -e "  InfluxDB    : ${GRN}http://localhost:18086${RST}"
echo -e "\n${BOLD}Next steps:${RST}"
echo -e "  1. Edit ${YLW}configs/pt.env${RST} — set PT_SSH_PASS, TEST_PASSWORD, TEST_PIN, TEAMS_WEBHOOK"
echo -e "  2. Run: ${GRN}./pt-menu.sh${RST}"
echo -e "  3. First boot creates a god admin account."
echo -e ""
