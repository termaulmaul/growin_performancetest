# Growin Performance Test Framework

> Enterprise-grade **k6-based** performance testing suite for the Growin platform by **Bank Mandiri Sekuritas**. Targets **Onprem** (SSH jump) and **Oncloud** (GCP IAP) production; **Sandbox** demo locally via Docker.

[![bash](https://img.shields.io/badge/bash-5.x-green)](https://www.gnu.org/software/bash/)
[![k6](https://img.shields.io/badge/k6-v1.7.1-purple)](https://k6.io)
[![python](https://img.shields.io/badge/python-3.x-blue)](https://www.python.org)
[![status](https://img.shields.io/badge/status-v2.8.0-brightgreen)](./CHANGELOG.md)

Built on the **Kimi Enterprise Architecture RFC**: terminal-native auth (bcrypt + SQLite), RBAC, env concurrency locking, metric parsing, multi-channel webhooks (Teams / Discord / Telegram / Brrr), NOC-style live dashboard.

---

## 📊 Codebase Analysis (Latest)
*Analysis Date: 2026-06-15*

Full findings available in [KNOWLEDGE.md](./KNOWLEDGE.md).
- **Code Health**: All `.sh` and `.py` files pass syntax compilation. Core tools work perfectly (Bash, Python, Go modules present).
- **Security Check**: ⚠️ **URGENT** - Found hardcoded credentials (`TEST_PASSWORD=M@nsek.123`) in `configs/pt.env.example` which should be removed. No new security flaws found.
- **Testing**: ⚠️ Test coverage is low (0 active unit tests). Relying mainly on the E2E k6 scripts.
- **Agent Skills**: `autoskills` successfully checked. 6 AI skills installed natively (accessibility, bash-defensive-patterns, frontend-design, golang-patterns, golang-testing, seo).
- **Runtime Environment**: Docker daemon was currently unavailable during analysis but Docker Compose configs (`docker-local-pt`) remain intact for the Sandbox.
- **Verdict**: DONE - Codebase is stable, architecture remains sound, but secret hygiene requires cleanup in example templates.

---

## 🚀 Latest Changes

- Formatted Telegram webhook notifications with rich HTML tables, `<pre>` headers, and proper bot token support.
- Fixed Telegram `Parse Entities` errors by implementing robust HTML character escaping.
- Stripped numeric prefix from k6 custom metric names globally and fixed Grafana metric keys rendering.
- Replaced non-POSIX `head -n -1` with `sed ""` for full macOS compatibility in terminal summary.
- Fixed k6 init log spam by moving `console.log('User Distribution')` to `setup()` across 22 test scripts.
- Served utilization reports via HTTP and updated Teams webhook URL mapping.
- Fixed `recent runs` execution logic bypassing suite select and parsing issues.
- Updated documentation and workflow flowcharts from codebase analysis.

---

## Quick Start

### Prerequisites

| Tool | Why | Install |
|---|---|---|
| `bash` ≥ 4 | TUI runtime | macOS: `brew install bash` · Linux: built-in |
| `fzf` | Menu picker | `brew install fzf` / `apt install fzf` |
| `python3` ≥ 3.9 | Auth / scheduler / audit | `brew install python` / built-in |
| `node` ≥ 18 | Webhook senders | `brew install node` |
| `jq` | JSON parsing in TUI | `brew install jq` / `apt install jq` |
| `sshpass` | Onprem jump host | `brew install sshpass` |
| `gcloud` | Oncloud IAP | [gcloud SDK](https://cloud.google.com/sdk/docs/install) |
| `docker` | Local sandbox stack | [Docker Desktop](https://www.docker.com/products/docker-desktop) |

### One-Command Setup

```bash
git clone https://github.com/termaulmaul/growin_performancetest.git
cd growin_performancetest
bash setup-pt.sh     # Checks & installs all deps, inits DB, starts Docker
./pt-menu.sh         # Launch TUI — first run creates god admin account
```

`setup-pt.sh` is idempotent — safe to re-run. Shows `✓ [already installed]` for existing deps.

### Configuration

```bash
# Auto-created on first ./pt-menu.sh from pt.env.example
configs/pt.env        # Primary config (gitignored — never committed)
configs/pt.env.example  # Template with all keys (committed)
```

Key variables in `configs/pt.env`:

| Variable | Purpose |
|----------|---------|
| `ENV` | Target environment: `INT`, `DEV`, `QA`, `DRC`, `SANDBOX` |
| `K6_USERS` | Default VUs per run |
| `DURATION` | Default duration (e.g. `5m`, `60s`) |
| `PT_SSH_PASS` | SSH password for Onprem jump host |
| `TEST_PASSWORD` | k6 test account password |
| `TEST_PIN` | 2FA PIN for login flow |
| `TEAMS_WEBHOOK` | Power Automate webhook URL |
| `THRESHOLD_AVG_MS` | P95 threshold (default: 200ms) |
| `THRESHOLD_ERR_PCT` | Error rate threshold (default: 0.1%) |
| `THRESHOLD_MIN_RPS` | Min RPS threshold (default: 381) |
| `GRAFANA_BACKEND_URL` | Grafana data backend URL (default: `http://localhost:5000`) |

---

## TUI Menu (`pt-menu.sh`)

Interactive fzf-based menu. All operations accessible from one entry point.

```
┏━╸┏━┓┏━┓╻ ╻╻┏┓╻   ┏━┓╺┳╸   ┏━╸┏━┓┏━┓┏┳┓┏━╸╻ ╻┏━┓┏━┓╻┏
┃╺┓┣┳┛┃ ┃┃╻┃┃┃┗┫   ┣━┛ ┃    ┣╸ ┣┳┛┣━┫┃┃┃┣╸ ┃╻┃┃ ┃┣┳┛┣┻┓
┗━┛╹┗╸┗━┛┗┻┛╹╹ ╹   ╹   ╹    ╹  ╹┗╸╹ ╹╹ ╹┗━╸┗┻┛┗━┛╹┗╸╹ ╹
```

| Key | Menu | Access |
|-----|------|--------|
| `[1]` | **Run Test** (Onprem / Oncloud / Sandbox) | god, admin, operator |
| `[2]` | **Sandbox Demo** (Local Docker mock) | god, admin, operator |
| `[3]` | **Cron Scheduler** (SQLite-backed) | god, admin |
| `[4]` | **AI Slope** (Code quality scanner) | god, admin, operator |
| `[5]` | **ENV Editor** | all except viewer |
| `[6]` | **Docker Stack** (start/stop/logs) | god, admin |
| `[7]` | **Open Project Dir** | all |
| `[8]` | **User Management** | god only |
| `[9]` | **Webhooks** (set/test/toggle) | god, admin |
| `[D]` | **Live Dashboard** (NOC view) | god, admin |
| `[T]` | **Tools / Diagnostics** | all |
| `[?]` | **Help / Keymap** | all |
| `[Q]` | **Quit** | — |

### Run Test Flow

```text
[ ./pt-menu.sh ] → [ Auth ] → [ Login ] → [ Main Menu ]
  (if first run) → [ Initial Setup ] → [ Login ]

[ Main Menu ] → [1] Run Test
              → [2] Sandbox Demo

[1] Run Test → Target (Onprem / Oncloud / Sandbox)
Target → Suite Picker → Configure (VUs/Dur/Env) → Confirm Run → Execute k6
Execute k6 → Parse Metrics → Report + Webhook → Grafana Report → [ Main Menu ]
```

**Recent Runs:** `[R]` in suite picker → select previous run → re-execute with same params.

**Batch Regression:** `[B]` → multi-select suites with TAB → run all sequentially.

### Skip Auth (15 min)

God users can temporarily bypass login via `Tools → [S] Skip Auth (15 min)`.

---

## Execution Targets

### Onprem

```
PT Machine → SSH qa@10.82.15.72 (jump) → SSH qa@10.184.120.48 (runner)
```

- Scripts uploaded as tarball, extracted to `/tmp/pt-run-UUID/`
- k6 uses **repo-level binary** first (`~/growin_performancetest/k6`), falls back to system k6
- Reports saved to `Report/<Suite>/<Platform>/<BP>/<RunBy>/`

### Oncloud (GCP)

```
PT Machine → gcloud compute ssh vm-pt-ksix-0 --tunnel-through-iap
```

Same tarball upload flow. IAP handles authentication (no password needed).

### Sandbox (Docker)

```
PT Machine → SSH qa@127.0.0.1:2222 (Docker container) → mock-api:8080
```

- `pt-mock-api` container serves mock HTTP endpoints
- `pt-sandbox-ssh` container mimics remote runner
- `configs/pt.env` auto-bootstrapped from `pt.env.example`
- Reports written to `/tmp/Report/` inside container

---

## Test Suites

| Suite | Description | Platforms |
|-------|-------------|-----------|
| `Growin_Auth_AdminPermission_Create` | Admin permission CRUD | Web, iOS, Android |
| `Growin_2FA` | Two-factor auth login flow | Web |
| `Growin_Calendar` | Calendar/scheduling | Web, Android, iOS |
| `Growin_Community` | Social features | Web |
| `Growin_Banner_Promo` | Banner/promo display | Web, Android, iOS |
| `Growin_Daily_Trade` | Daily trade operations | Web |
| `Growin_Data_Visualization` | Data viz endpoints | Web |
| `Growin_Eipo_Stock` | eIPO stock operations | Web, iOS |
| `Growin_News` | News feed | Web |
| `Growin_OMO` | OMO trading flow | iOS |
| `Growin_Password_Expired` | Password expiry | Android |
| `Growin_Ratelimit_Reset_Password` | Rate limit + reset | Web |
| `Growin_Rewards` | Rewards/loyalty | Web |
| `Growin_UUPDP` | UUPDP flow | Web, Android, iOS |
| `ExaCC` | ExaCC operations | Web, Android, iOS |
| `Template_Project` | Skeleton for new suites | Web |
| `Sandbox_Demo` | Framework validation (mock) | Web |

### Suite Structure

```
Script/<Suite>/
├── <Suite>.js                    # Main dispatcher (BP routing + setup/teardown)
├── <Suite>_LoadTest.sh           # LoadTest wrapper script
├── <Suite>_Regression.sh         # Regression wrapper script
├── Web/
│   ├── BP001.js                  # Business process 001
│   ├── BP002.js
│   ├── Template_ByPass_Setup.js  # Login-per-iteration pattern
│   └── Template_Use_Setup.js     # Use setup() token pattern
├── iOS/
│   └── BP001.js
└── Android/
    └── BP001.js
```

### Running a Script (Manual)

```bash
# From Script/<Suite>/ directory:
../../k6 run <Suite>.js \
  -e RUNBY=Manual \
  -e ENV=INT \
  -e USER=335 \
  -e DURATION=5m \
  -e NUMSTART=1 \
  -e SCENARIO=BP001 \
  -e PLATFORM=iOS \
  --out dashboard=export=../../Report/<Suite>/iOS/BP001/Manual/report.html
```

Or use `./pt-menu.sh` → Run Test for interactive selection.

---

## Webhooks

Multi-channel notifications after each run. Configured in `configs/pt.env`.

| Channel | Variable | Format |
|---------|----------|--------|
| **Teams** | `TEAMS_WEBHOOK` | Adaptive Card (full-width) |
| **Discord** | `DISCORD_WEBHOOK` | Markdown table |
| **Telegram** | `TELEGRAM_WEBHOOK` | Markdown table |
| **Brrr** | `BRRR_WEBHOOK` | Plain text |

### Teams Card Features

- ✅/⚠️/❌ Status with threshold comparison
- Global summary: Samples, P95, Error Rate, RPS
- Per-API performance table (monospace, full-width)
- **Top Errors section** — e.g. `[500] /user/api/v2/watchlistgroup — 39×`
- Full-width card via `msteams.width: Full`

### Test Webhook

```
pt-menu.sh → Webhooks → Test Webhook (Send Sample)
```

Runs DNS check → HTTP preflight → actual payload send with verbose output.

---

## Auth & RBAC

SQLite-backed authentication with bcrypt password hashing.

| Role | Run Test | Sandbox | Scheduler | Docker | User Mgmt | Webhooks |
|------|----------|---------|-----------|--------|-----------|----------|
| **god** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **admin** | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| **operator** | ✓ | ✓ | — | — | — | — |
| **readonly** | — | — | — | — | — | — |
| **guest** | — | — | — | — | — | — |

### First Boot

```bash
./pt-menu.sh
# → "No God user found" → create god username + password
```

### Emergency Rescue

```bash
python3 bin/pt-rescue   # Force-reset god password (bypasses normal auth)
```

---

## Observability (Docker)

```bash
# Start with observability profile
cd docker-local-pt
docker compose --env-file configs/local.env --profile observability up -d
```

| Service | URL | Credentials |
|---------|-----|-------------|
| **Grafana** | http://localhost:3000 | admin / admin |
| **InfluxDB** | http://localhost:18086 | — |
| **Mock API** | http://localhost:18080 | — |
| **Jenkins** | http://localhost:18081 | (initial password in container) |

---

## Repository Structure

```
growin_performancetest/
├── pt-menu.sh              # Main TUI (2100+ lines, fzf-based)
├── setup-pt.sh             # Bootstrap: check deps, init DB, start Docker
├── configs/
│   ├── pt.env              # Primary config (gitignored)
│   └── pt.env.example      # Template (committed)
├── bin/                    # CLI tools (Kimi Architecture)
│   ├── pt-auth             # Login, sessions, bootstrap (bcrypt)
│   ├── pt-rbac             # Permission checks
│   ├── pt-audit            # Immutable audit log
│   ├── pt-lock             # Environment concurrency locking
│   ├── pt-usermgmt         # User CRUD (god only)
│   ├── pt-scheduler        # Cron job management
│   ├── pt-dashboard        # NOC-style live monitor
│   ├── pt-resmon           # CPU/Mem/Load snapshot
│   ├── pt-rescue           # Emergency god password reset
│   └── pt-grafana-report   # Grafana utilization HTML report generator
├── lib/
│   ├── bash/pt_auth_client.sh  # Auth wrapper (session verify, skip-auth)
│   ├── python/db.py            # SQLite schema (WAL mode)
│   └── webhook/
│       ├── send-summary-webhook.mjs  # Teams/Discord/Telegram sender
│       ├── parse-k6-log.py           # Extract metrics + errors from log
│       └── webhook-tester.mjs        # Verbose webhook test
├── Script/                 # k6 test suites (~27 suites)
│   ├── <Suite>/<Suite>.js  # Dispatcher + setup/teardown
│   ├── <Suite>/Web/BP*.js  # Platform-specific BPs
│   └── Template_Project/   # Skeleton for new suites
├── Helper/
│   ├── config.js           # getBaseUrl, getUserCredentials, headers
│   ├── bundle.js           # k6 polyfills
│   └── textSummary.js      # Terminal summary formatter
├── Report/                 # HTML reports (gitignored except template)
│   └── Utilization/        # Auto-generated Grafana utilization reports
├── get_grafana_data/       # Grafana metrics web app (Flask backend + HTML frontend)
├── docker-local-pt/        # Docker stack (mock-api, sandbox-ssh, grafana, influx, jenkins)
├── scheduler_cli/          # Python cron backend + AI slope validator
├── blueprint/              # Architecture RFCs (Kimi, Manus, DeepSeek)
├── docs/                   # Audit checklists, UX docs
├── tools/                  # One-off audit scripts
└── archive/                # Legacy files (do not extend)
```

---

## Security (v2.7.0+)

- **No hardcoded passwords** — all credentials via `configs/pt.env` (gitignored)
- **bcrypt** password hashing (migration from SHA-256)
- **No auth bypass** — `PT_AUTH_BYPASS` removed
- **Webhook URL purged** from git history via `filter-branch`
- **Session-based auth** with configurable expiry
- **RBAC** enforced on all menu items

---

## KPI Thresholds

| Metric | Threshold | Config Key |
|--------|-----------|------------|
| P95 Response Time | < 200ms | `THRESHOLD_AVG_MS` |
| Error Rate | < 0.1% | `THRESHOLD_ERR_PCT` |
| Min RPS | ≥ 381 | `THRESHOLD_MIN_RPS` |
| CPU Usage | < 70% | (Grafana alert) |

---

## 📈 Grafana Utilization Report

After each test run, the framework **automatically generates a Grafana utilization report** showing CPU and Memory metrics for Growin pods during the test window.

### How It Works

```text
[ k6 Test Finishes ] → [ pt-grafana-report ] 
  ↔ [ Grafana Backend (localhost:5000) ] ↔ [ Prometheus ]
[ pt-grafana-report ] → [ Report/Utilization/*.html ]
  → [ Webhook Message ] → [ "View Utilization Report" Button ]
```

### Setup

1. **Grafana data backend starts automatically** on the first test run. It tries port 5000, 5001, then 5002.
2. Set `GRAFANA_BACKEND_URL` in `configs/pt.env` if you want to use a specific remote instance (default: auto-detected local backend).
- If Grafana backend fails to start or is unreachable, an empty report is generated (graceful fallback).

### Report Contents

| Section | Data |
|---------|------|
| **Container Metrics** | Avg/Min/Max CPU (millicores) and Memory (MB) per pod |
| **Node Utilization** | Avg CPU % and Memory per node (if available) |
| **Time Range** | Exact start → end timestamps of test run |

### Webhook Integration

- **Teams**: Adaptive Card with a "📈 View Utilization Report" action button.
- **Discord / Telegram**: Direct file path link appended to message.
- If Grafana backend is unreachable, an empty report is generated (graceful fallback).

---

## New Team Member Onboarding

```bash
# 1. Clone
git clone https://github.com/termaulmaul/growin_performancetest.git
cd growin_performancetest

# 2. Setup (installs deps, creates pt.env, starts Docker)
bash setup-pt.sh

# 3. Launch
./pt-menu.sh
# First boot → create god account → login → ready

# 4. Run a test
# Menu → [1] Run Test → Onprem → Select Suite → Configure → Run
```

---

## Documentation

- [`CHANGELOG.md`](./CHANGELOG.md) — Release history
- [`STRUCTURE.md`](./STRUCTURE.md) — Detailed repo map
- [`CLAUDE.md`](./CLAUDE.md) — AI agent context + QA reference
- [`READMOCKDOCK.md`](./READMOCKDOCK.md) — Docker mock operator guide
- [`docs/`](./docs/) — Audit checklists, UX improvement logs
- [`blueprint/`](./blueprint/) — Architecture RFCs

---

## Contributing

1. Branch from `main`: `feat/<suite>`, `fix/<issue>`, `refactor/<area>`
2. No `copy.js` files in main
3. No secrets in commits — use `configs/pt.env` (gitignored)
4. Script commit = script + Report scaffold + CHANGELOG entry
5. All k6 scripts must be ES5-compatible (no `?.` or `??` — remote k6 v0.51.0)
6. Test in Sandbox before pushing to Onprem/Oncloud
