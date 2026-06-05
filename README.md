# Growin Performance Test Framework

> Enterprise-grade **k6-based** performance testing suite for the Growin platform by **Bank Mandiri Sekuritas**. Targets **Onprem** (SSH jump) and **Oncloud** (GCP IAP) production; **Sandbox** demo locally via Docker.

[![bash](https://img.shields.io/badge/bash-5.x-green)](https://www.gnu.org/software/bash/)
[![k6](https://img.shields.io/badge/k6-v1.7.1-purple)](https://k6.io)
[![python](https://img.shields.io/badge/python-3.x-blue)](https://www.python.org)
[![status](https://img.shields.io/badge/status-v2.8.0-brightgreen)](./CHANGELOG.md)

Built on the **Kimi Enterprise Architecture RFC**: terminal-native auth (bcrypt + SQLite), RBAC, env concurrency locking, metric parsing, multi-channel webhooks (Teams / Discord / Telegram / Brrr), NOC-style live dashboard.

---

## Quick Start

```bash
git clone https://github.com/termaulmaul/growin_performancetest.git
cd growin_performancetest
bash setup-pt.sh     # Check & install all deps, init DB, start Docker
./pt-menu.sh         # Launch TUI — first run creates god admin account
```

`setup-pt.sh` is idempotent — safe to re-run. Shows `✓ [already installed]` for existing deps.

### Configuration (`configs/pt.env`)

Auto-created on first `./pt-menu.sh` from `pt.env.example`. Key variables:

| Variable | Purpose |
|----------|---------|
| `ENV` | Target environment: `INT`, `DEV`, `QA`, `DRC`, `SANDBOX` |
| `K6_USERS` / `DURATION` | Default VUs and duration |
| `PT_SSH_PASS` | SSH password for Onprem jump host |
| `TEST_PASSWORD` / `TEST_PIN` | k6 test account credentials |
| `TEAMS_WEBHOOK` | Power Automate webhook URL |
| `THRESHOLD_AVG_MS` / `THRESHOLD_ERR_PCT` / `THRESHOLD_MIN_RPS` | Pass/fail thresholds |

---

## TUI Menu

| Key | Menu | Access |
|-----|------|--------|
| `[1]` | **Run Test** (Onprem / Oncloud / Sandbox) | god, admin, operator |
| `[2]` | **Sandbox Demo** (Local Docker mock) | god, admin, operator |
| `[3]` | **Cron Scheduler** | god, admin |
| `[4]` | **AI Slope** (Code quality) | god, admin, operator |
| `[5]` | **ENV Editor** | all except viewer |
| `[6]` | **Docker Stack** | god, admin |
| `[8]` | **User Management** | god only |
| `[9]` | **Webhooks** (set/test/toggle) | god, admin |
| `[T]` | **Tools / Diagnostics** | all |

### Run Test Flow

```
Select Target → Suite → Script (.js) → Platform → Select BP(s)
→ VUs / Duration / ENV → Confirm → Execute on Remote → Webhook
```

**Multi-BP Select:** TAB to mark multiple BPs, ENTER to confirm. Creates `-e SCENARIO=BP001,BP002`.

**Recent Runs:** `[R]` → pick previous run → re-execute with same params.

**Batch Regression:** `[B]` → multi-select suites → run all sequentially.

### Skip Auth (god only)

`Tools → [S] Skip Auth` → choose:
- **15 minutes** — temporary, auto-expires
- **Permanent** — login skipped until manually disabled
- **Disable skip** — re-enable login requirement

---

## Execution Targets

| Target | Connection | k6 Binary |
|--------|-----------|-----------|
| **Onprem** | SSH `qa@10.82.15.72` → `qa@10.184.120.48` | Repo k6 (`~/growin_performancetest/k6`) first, then system |
| **Oncloud** | `gcloud compute ssh vm-pt-ksix-0 --tunnel-through-iap` | Same priority |
| **Sandbox** | SSH `qa@127.0.0.1:2222` (Docker) | Container k6 |

Scripts uploaded as tarball, extracted to `/tmp/pt-run-UUID/`. Reports saved to `Report/<Suite>/<Platform>/<BP>/<RunBy>/`.

---

## Test Suites

| Suite | Platforms |
|-------|-----------|
| `Growin_Auth_AdminPermission_Create` | Web, iOS, Android |
| `Growin_2FA` | Web |
| `Growin_Calendar` | Web, Android, iOS |
| `Growin_Community` | Web |
| `Growin_Banner_Promo` | Web, Android, iOS |
| `Growin_Daily_Trade` | Web |
| `Growin_Data_Visualization` | Web |
| `Growin_Eipo_Stock` | Web, iOS |
| `Growin_News` | Web |
| `Growin_OMO` | iOS |
| `Growin_Password_Expired` | Android |
| `Growin_Ratelimit_Reset_Password` | Web |
| `ExaCC` | Web, Android, iOS |
| `Template_Project` | Web |
| `Sandbox_Demo` | Web (mock only) |

### Suite Structure

```
Script/<Suite>/
├── <Suite>.js              # Dispatcher (BP routing + setup/teardown)
├── <Suite>_LoadTest.sh     # LoadTest wrapper
├── <Suite>_Regression.sh   # Regression wrapper
├── Web/BP001.js            # Platform-specific BPs
├── iOS/BP001.js
└── Android/BP001.js
```

### Manual Run

```bash
cd Script/<Suite>
../../k6 run <Suite>.js \
  -e RUNBY=Manual -e ENV=INT -e USER=335 -e DURATION=5m \
  -e NUMSTART=1 -e SCENARIO=BP001 -e PLATFORM=iOS \
  --out dashboard=export=../../Report/<Suite>/iOS/BP001/Manual/report.html
```

---

## Webhooks — Teams Card Output

Multi-channel notifications sent after each run. Teams uses full-width Adaptive Card.

### Example Card (Multi-BP Run)

```
📊 PT Run Report

Suite       ExaCC / ExaCC.js [Onprem · Web · BP001,BP002,BP003 · 100VU · 30s]
Target      Onprem 10.82.15.72 → 10.184.120.48
Run by      qacentral
Execution   30s duration
Start       2026-06-05 10:06:41
End         2026-06-05 10:07:11

✅ PASSED
Reason: All metrics meet thresholds.

📈 Global Summary vs Thresholds
┌──────────┬────────────┬────────────┬────────────┬───────────┬──────────┐
│ Samples  │ Avg        │ Avg (p95)  │ Error Rate │ Total RPS │ TPS      │
├──────────┼────────────┼────────────┼────────────┼───────────┼──────────┤
│ 11755    │ 22.73 ms ✓ │ 22.73 ms ✓ │ 0.00% ✓    │ 391.83 ✓  │ 391.83 ✓ │
└──────────┴────────────┴────────────┴────────────┴───────────┴──────────┘

📋 Per-API Performance
┌───┬────────────────────────────────────────────┬──────────┬────────┬────────┬───────┬────────┬─────┐
│ # │ API                                        │ Samp     │ Avg    │ P95    │ Err%  │ RPS    │ Err │
├───┼────────────────────────────────────────────┼──────────┼────────┼────────┼───────┼────────┼─────┤
│ 1 │ BP001 01 01 Udf Indicators COMPOSITE D IDX │ 2773080  │ 144.52 │ 901.99 │ 0.00% │ 384.33 │ 1   │
│ 2 │ BP001 01 02 Udf Indicators IDXBASIC D IDX  │ 2773080  │ 144.60 │ 902.30 │ 0.00% │ 384.33 │ 0   │
│ 3 │ BP001 01 03 Udf Indicators IDXCYCLIC D IDX │ 2773080  │ 148.31 │ 908.38 │ 0.00% │ 384.33 │ 0   │
│...│ ...                                        │ ...      │ ...    │ ...    │ ...   │ ...    │ ... │
├───┼────────────────────────────────────────────┼──────────┼────────┼────────┼───────┼────────┼─────┤
│   │ TOTAL                                      │ 38823120 │ 100.47 │ 912.58 │ 0.00% │5380.62 │ 3   │
└───┴────────────────────────────────────────────┴──────────┴────────┴────────┴───────┴────────┴─────┘

❌ Top Errors (1)
• [500] /user/api/v2/watchlistgroup — 1×
```

Table data sourced from k6 `--summary-export` (custom metrics per BP). Full-width via `msteams.width: Full`.

---

## Auth & RBAC

| Role | Run Test | Scheduler | Docker | User Mgmt | Webhooks |
|------|----------|-----------|--------|-----------|----------|
| **god** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **admin** | ✓ | ✓ | ✓ | — | ✓ |
| **operator** | ✓ | — | — | — | — |
| **readonly** | — | — | — | — | — |

### First Boot

```bash
./pt-menu.sh  # → "No God user found" → create god username + password
```

### Emergency Rescue

```bash
python3 bin/pt-rescue   # Force-reset god password
```

---

## Observability (Docker)

| Service | URL | Credentials |
|---------|-----|-------------|
| **Grafana** | http://localhost:3000 | admin / admin |
| **InfluxDB** | http://localhost:18086 | — |
| **Mock API** | http://localhost:18080 | — |

---

## Repository Structure

```
growin_performancetest/
├── pt-menu.sh              # Main TUI (2200+ lines)
├── setup-pt.sh             # One-command bootstrap
├── configs/pt.env          # Primary config (gitignored)
├── configs/pt.env.example  # Template (committed)
├── bin/                    # pt-auth, pt-rbac, pt-audit, pt-lock, pt-usermgmt, pt-scheduler, etc.
├── lib/bash/               # pt_auth_client.sh (session + skip-auth)
├── lib/python/db.py        # SQLite schema (WAL mode)
├── lib/webhook/            # send-summary-webhook.mjs, parse-k6-log.py
├── Script/                 # k6 test suites (~27 suites)
├── Helper/                 # config.js, bundle.js, textSummary.js
├── Report/                 # HTML reports (gitignored)
├── docker-local-pt/        # Docker stack (mock-api, sandbox-ssh, grafana, influx)
├── scheduler_cli/          # Python cron backend + AI slope validator
├── blueprint/              # Architecture RFCs
└── docs/                   # Audit checklists
```

---

## KPI Thresholds

| Metric | Threshold | Config Key |
|--------|-----------|------------|
| P95 Response Time | < 200ms | `THRESHOLD_AVG_MS` |
| Error Rate | < 0.1% | `THRESHOLD_ERR_PCT` |
| Min RPS | >= 381 | `THRESHOLD_MIN_RPS` |

---

## Contributing

1. Branch: `feat/<suite>`, `fix/<issue>`, `refactor/<area>`
2. **ES5 only** in k6 scripts — no `?.` or `??` (remote k6 v0.51.0 fallback)
3. No secrets in commits — use `configs/pt.env` (gitignored)
4. Test in Sandbox before Onprem/Oncloud
