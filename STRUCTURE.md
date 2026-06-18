# Repository Structure

High-level map of `growin_performancetest`. Last updated 2026-06.

```
.
├── pt-menu.sh           # Main TUI (1901 lines, fzf-based)
├── pt-tui               # TUI launcher binary
├── Regression.sh        # Top-level regression runner
├── setup-pt.sh          # Bootstrap helper
├── bin/                 # CLI tools (Core Architecture)
│   ├── pt-auth, pt-rbac, pt-audit, pt-lock, pt-lock-status
│   ├── pt-dashboard, pt-resmon, pt-rescue, pt-bootstrap-check
│   ├── pt-scheduler, pt-usermgmt, pt-remote-daemon.sh
│   └── pt-grafana-report                    # Grafana utilization HTML generator
├── lib/
│   ├── bash/            # pt_auth_client.sh
│   ├── python/db.py     # SQLite schema (auth + locks + audit + scheduler)
│   └── webhook/         # send-summary-webhook.mjs, parse-k6-log.py, webhook-tester.mjs
├── Script/              # k6 test scripts per suite
│   ├── <Suite>/
│   │   ├── <Suite>.js              # Aggregate runner (BP dispatcher)
│   │   ├── <Suite>_LoadTest.sh     # LoadTest wrapper
│   │   ├── <Suite>_Regression.sh   # Regression wrapper
│   │   └── {Android,Web,iOS}/      # Platform BP scripts (BPxxx.js)
│   └── Template_Project/           # Skeleton for new suites
├── Helper/              # Shared k6 modules
│   ├── bundle.js        # k6 polyfills (Buffer, crypto)
│   ├── config.js        # getBaseUrl, getUserCredentials, getDefaultHeaders
│   └── textSummary.js   # Terminal summary formatter
├── Report/              # HTML reports (gitignored except Template_Report/)
│   ├── <Suite>/<Platform>/<BP>/<RunBy>/<TS>.html
│   └── Utilization/     # Auto-generated Grafana utilization reports
├── configs/
│   └── pt.env           # Primary config (env vars + thresholds + webhooks)
├── pt-data/             # Runtime data (gitignored: active_run.json, users.json, security.db)
│   └── auth.py
├── scheduler_cli/       # Python cron backend + AI slope validator
│   ├── core/ (cron_manager, local_runner, target_mapper)
│   ├── ai/  (slope_validator)
│   └── main.py
├── tools/               # One-off auditors / refresh scripts
├── docs/                # Documentation
│   ├── performance-audit/ (CI/Grafana/Jenkins checklists)
│   ├── ux-improvements.md          # PR #2 UX log
│   ├── ux-deferred-batch.md        # PR #3 UX log
│   └── performance-test-codebase-audit.md
├── blueprint/           # Architecture RFCs (Deep Research)
├── docker-local-pt/     # Demo stack (compose, mock-api, jenkins, grafana)
│   ├── docker-compose.yml
│   ├── configs/local.env
│   ├── mock-api/, jenkins/, sandbox/, scripts/
│   └── results/         # Runtime artifacts (gitignored, .gitkeep preserved)
├── artifacts/results/   # Latest summary.json (gitignored content, dir kept)
├── get_grafana_data/    # Grafana metrics web app (Flask backend + HTML frontend)
│   ├── backend/app.py   # Flask API (POST /api/metrics)
│   ├── frontend/        # index.html + app.js
│   └── start_backend.sh # Launch helper
├── archive/             # Legacy artifacts (do not extend, see archive/README.md)
├── AGENTS.md            # Global agent context (mermaid flowcharts inside)
├── CLAUDE.md            # AI context + QA performance reference
├── README.md            # Quick start + UX changelog summary
├── STRUCTURE.md         # This file
└── CHANGELOG.md         # Release history
```

## Conventions

- **Suites:** `Script/<Suite>/` per scenario. Platform sub-dirs: `Android/`, `Web/`, `iOS/`.
- **Reports:** mirror script layout in `Report/<Suite>/<Platform>/<BP>/<RunBy>/`.
- **Binaries (`k6`, `k6-linux-*`):** kept locally only, not committed (see `.gitignore`).
- **Secrets / runtime DBs:** never commit (`*.token`, `*.env.local`, `security.db`, `pt-data/users.json`).
- **Temporary patches:** do **not** add `patch_*.js` / `fix-*.sh` to repo root. Use PRs.
- **Junk to skip:** `* copy*.js`, `enchange_*`, `<Suite>[ToDo]/`, `BP001?.js`, scratch `Test*.js`.

## TUI Menu (v2.6.0)

| Key | Menu | Notes |
|---|---|---|
| `[1]` | Run Test | Onprem / Oncloud / Sandbox |
| `[2]` | Sandbox Demo | Mock-API stack or Direct k6 |
| `[3]` | Cron Scheduler | SQLite-backed cron jobs |
| `[5]` | ENV Editor | Inline / $EDITOR / Summary modes |
| `[6]` | Docker Stack | mock-api + grafana + jenkins |
| `[7]` | Open Project Dir | macOS/Linux file manager |
| `[8]` | User Management | god-only |
| `[9]` | Webhooks | Set, verbose test, toggle |
| `[D]` | Dashboard | Live CPU/RAM/locks/audit |
| `[T]` | Tools / Diagnostics | pt-resmon, pt-rescue, pt-bootstrap, pt-audit, pt-lock-status |
| `[?]` | Help / Keymap | Global keybind overlay |
| `[R]` | (suite picker) | Show last 5 recent runs |
| `[B]` | (suite picker) | Batch Regression multi-select |
| `[L]` | Logout | Clears skip-auth flag, re-login |
| `[Q]` | Quit | |

## Branches

- `main` — stable, production.
- `chore/*` — maintenance, refactor, restructure.
- `feat/*` — new features / scenarios.
- `fix/*` — bug fixes.
- `docs/*` — documentation only.
- `release/*` — release tagging.
