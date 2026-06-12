# Changelog

## [Unreleased] - 2026-06-12

### Added / Updated
- Updated architecture diagram / golden ratio / API endpoints
- Added Playwright v1.60+ upgrade notes (`@playwright/test@1.60+`)
- Fixed PIN modal sequence documentation (from `explore.mjs` comments)
- Parallel workers, HAR tracing, and AI assertions implemented.

## [2.7.0] - 2026-06-05

### Security — CRITICAL fixes
- **[CRITICAL] Remove hardcoded SSH password fallback** — `_ssh_pass()` no longer has
  `M@nsek.1234` as default. `PT_SSH_PASS` must now be explicitly set in `configs/pt.env`.
  Prevents password exposure via `ps aux` on shared machines.
- **[CRITICAL] Remove `PT_AUTH_BYPASS` auth bypass** — `lib/bash/pt_auth_client.sh`
  no longer accepts `PT_AUTH_BYPASS=1` as instant god-role bypass vector.
- **[CRITICAL] bcrypt migration for `pt-data/auth.py`** — replaces SHA-256 no-salt
  hashing with bcrypt (gensalt 12). Backward-compatible: verifies legacy sha256 hashes
  and auto-migrates on next write. Prevents rainbow table attacks on users.json.
- **[CRITICAL] Externalize hardcoded test credentials** — `Helper/config.js` password
  and `Growin_2FA.js` PIN now read from `TEST_PASSWORD` / `TEST_PIN` env vars.
  Both are required — scripts log an error if not set.
- **[CRITICAL] Purge `configs/pt.env` from git history** — Teams webhook URL was
  committed in 14 commits. `git filter-branch` removed it from all 85 commits.
  File is now gitignored. Use `configs/pt.env.example` as template.
- **[CRITICAL] Fix `bin/pt-rbac` missing `import sqlite3`** — `grant` command was
  crashing with `NameError` on duplicate permission inserts instead of clean error.

### Bug Fixes — HIGH
- **[HIGH] Fix `operator` role locked out of Run Test** — `main_menu` RBAC check
  used undefined role `tester` instead of `operator`. All three run-related menu items
  now check `operator` correctly.
- **[HIGH] Fix `_stamp` race condition** — tarball name now uses `uuidgen` (falls
  back to PID+nanosecond). Prevents `/tmp/pt-upload-*.tar.gz` collision on concurrent runs.
- **[HIGH] Fix `prompt_duration` regex** — removed `\s*` that allowed `"1h 30m"` to
  pass validation; k6 rejects space-separated durations.
- **[HIGH] Fix `vus`/`dur` scope leak** — declared `local vus="" dur="" env_name=""
  runby="" platform="" scenario=""` at start of `.js` block in `ssh_menu`. Prevents
  stale values from previous run leaking into next suite selection.
- **[HIGH] Add `CREATE INDEX idx_users_username`** — `lib/python/db.py` now creates
  an index on `users.username` for login lookup performance.
- **[HIGH] Fix `pass=1` dead code** — replaced unreferenced variable with explicit
  no-op comment in `pt_auth_client.sh`.

### Bug Fixes — MEDIUM (Growin_2FA.js)
- **[MEDIUM] Fix invalid `summaryTimeUnit: '3600s'`** → `'s'` (valid k6 values: ms/s/m).
- **[MEDIUM] Fix excessive timeouts** — `setupTimeout`/`teardownTimeout` `'3600s'` → `'10m'`/`'2m'`.
- **[MEDIUM] Fix `http.batch()` single-item** → `http.get()` (cleaner, no overhead).
- **[MEDIUM] Fix broken `__summaryShown` flag** — replaced with clean unconditional
  log block (flag was set immediately then checked again, always false).

### New Files
- `configs/pt.env.example` — safe-to-commit template with all required keys documented.
  Copy to `configs/pt.env` and fill in real values on each machine.

## [2.5.0] - 2026-06-04

### Added — Sandbox_Demo Suite
- **New dedicated demo script:** `Script/Sandbox_Demo/Sandbox_Demo.js` for
  framework validation in Sandbox target. Mock-api cannot fully emulate Growin
  backend (login + PIN + userId + trading + portfolio + market data + ...),
  so real Growin scripts will fail there. Sandbox_Demo uses only endpoints
  that mock supports: login, userid, health.
- Pattern matches real Growin scripts: BP001 with `duration_BP001_NN_*`,
  `error_rate_BP001_NN_*`, `sample_BP001_NN_*` custom metrics.

### Changed — pt-menu.sh Sandbox flow
- Real Growin scripts on Sandbox now show warning prompt:
  `⚠️ Sandbox warning: Real Growin scripts need real backend (Onprem/Oncloud).`
  User can still proceed but expected to fail at first non-trivial endpoint.
- `Sandbox_Demo` and `Sandbox_Test` suites bypass warning (designed for sandbox).

### Documentation
- `Script/Sandbox_Demo/README.md` explains sandbox's purpose: framework
  validation only, not backend testing. Real testing happens on Onprem/Oncloud.

## [2.4.0] - 2026-06-04

### Fixed — Restore SSH Execution Architecture
- **k6 executes on REMOTE** (Onprem-2 / Oncloud VM), not on local Mac.
  - Onprem-2 (`10.184.120.48`) sudah dalam jaringan internal — DNS `internal-api-pt.growin.id` resolve dari sana.
  - Oncloud VM (`vm-pt-ksix-0`) sudah punya IAP access ke internal API.
- **Auto `git pull --ff-only origin main`** sebelum cd Script — remote selalu sync dengan latest commit.
- Sandbox Demo tetap jalan **local** (Mac) terhadap mock-api `http://localhost:18080` via `BASE_URL` override.
- `Helper/config.js` `getBaseUrl()` priority order kept:
  - `BASE_URL` env wins → for Sandbox local mock
  - `ENV=INT|DEV|QA|DRC` → for Onprem/Oncloud remote (where DNS works)

### Reverted
- v2.3.0 architecture (k6 local + BASE_URL only). Wrong assumption — dev Mac tidak punya VPN ke internal API.

## [2.3.0] - 2026-06-04

### Fixed — DNS / BASE_URL Override
- **`Helper/config.js` getBaseUrl()** now respects `__ENV.BASE_URL` (highest priority). Previously hardcoded `urlMap[ENV]` always won, ignoring `-e BASE_URL=...` from `pt-menu.sh`.
- Added target aliases: `ENV=ONPREM`, `ENV=ONCLOUD`, `ENV=SANDBOX` map to `ONPREM_BASE_URL`, `ONCLOUD_BASE_URL`, `http://localhost:18080` respectively.
- Legacy `ENV=DEV|QA|DRC|INT` still work for backward compat.

### Fixed — Architecture (v2.2.1 carried forward)
- k6 now runs **locally** on PT/dev machine. Targets Onprem/Oncloud differ only by `BASE_URL`, not SSH hops.
- Removed SSH jump + GCP IAP execution path (still available for interactive shell, but not for script execution).

## [2.2.0] - 2026-06-04

### Fixed — Webhook & Report Accuracy
- **Webhook double-fire:** Test Webhook in `webhook_menu` no longer triggers `print_run_footer` webhook send (added `skip_webhook` flag).
- **RPS/TPS wrong:** `parse-k6-log.py` now extracts `DURATION` and VUs from k6 stdout instead of hardcoded `30s`/`1VU`.
- **Teams card typography:** `## ✅ PASSED` literal in Adaptive Card replaced with clean text. `send-summary-webhook.mjs` and `webhook-tester.mjs` now consistent.
- **Webhook tester target:** Changed from hardcoded "Local Sandbox 127.0.0.1:2222" to "Onprem 10.82.15.72 → 10.184.120.48 [DEMO]".
- **`send-summary-webhook.mjs` targetUrl:** Now mode-aware (Onprem/Oncloud fallback strings instead of "Local Sandbox").

### Fixed — Navigation QA
- **Docker menu `awk` ANSI break:** Replaced with `while IFS= read` loop — no more syntax error on container display.
- **`ssh_menu` ESC navigation:** Added `while true` loop + `← Back` options at every level (Script → File → Platform → Scenario → RUNBY). ESC now goes back one level, not exit to main.
- **File pick no exit:** Added `"← Back"` to files array + `"← Back"` check in scripts array.

### Changed — Architecture
- **Configs extracted:** New `configs/pt.env` as primary config (targets, thresholds, webhooks). Legacy fallback to `docker-local-pt/configs/local.env`.
- **`ENV_FILE` resolution:** `pt-menu.sh` now reads `configs/pt.env` first, falls back to legacy path.
- **`remote_base` path:** Canonical path is `growin_performancetest` (with `2>/dev/null` fallback chain).
- **Target labels:** Release targets are Onprem and Oncloud. Sandbox/Docker is explicitly labeled `[demo only]`.
- **Main menu labels:** `[1] Run Test (Onprem / Oncloud)`, `[2] Sandbox Demo (Local Mock — k6 binary)`.

### Added
- **QA Skills documentation:** Full 12-section QA Automation Engineer reference in both `AGENTS.md` (393 lines) and `CLAUDE.md` (109 lines). Covers 3S objectives, 7 test types, tool stack, CI/CD integration, version control, backend/frontend, test management, agent rules, folder structure, and metrics.
- **`webhook-tester.mjs` full rewrite:** Card body now mirrors `send-summary-webhook.mjs` exactly — Adaptive Card structure, FactSet, ColumnSet, Per-API table. Status = ⚠️ WARNING (RPS < 381 demo).


## [2.1.2] - 2026-06-03

### Fixed
- Docker-compose path issues in `pt-menu.sh`.
- Python stdin exhaustion bugs in scheduler and user management menus.

### Removed
- Stale files: `c.txt`, `envconto.txt`, legacy `docker/pt` artifacts, `tui/` experiments.

### Changed
- Refreshed documentation and repository structure in `README.md`.

# Changelog


## [Unreleased] - 2026-05-29

### Added (Kimi Architecture Implementation)
* **Auth Gate & Session Cache**: Forced interactive TUI login requiring valid credentials, backed by encrypted SQLite tokens with robust RBAC structure (`god`, `admin`, `operator`, `readonly`, `guest`).
* **Initial Setup Bootstrap Mode**: Upon running the TUI on a fresh instance without any users, the system initiates an interactive bootstrap flow asking the operator to securely create the primary `god` user.
* **Environment Locking & Concurrency Protection**: Added execution locking mechanism bounding load test processes to active environments (`INT`, `STG`, etc.). Includes a backend process heartbeat daemon checking every 15s to cleanly clear stale locks on unexpected crashes.
* **ASCII Metrics Tabulator**: End-of-test output will now print an Excel-like parsed metric view generated dynamically from K6 `summary.json`, displaying request counts, latency metrics (Max, Min, P95, Avg), and success rates directly in the console.
* **User Management Dashboard**: New `User Management` menu item strictly accessible by `god` accounts to reset passwords, delete, assign roles, and handle account lockouts directly.
* **Status Bar Refit**: Real-time TUI status bar featuring multi-user context. Actively identifies PT statuses spanning `Available`, `OCCUPIED`, and `PT ACTIVE` including the specific scenario executing and ETA.
* **Live System Monitoring Dashboard**: New interactive `[D] Dashboard` available inside the TUI for system observability covering host CPU, Memory metrics, active tests execution map, and real-time audit logs.
* **CLI Binaries Foundation**: Created isolated `bin/` and `lib/` structure enclosing isolated Python executors: `pt-auth`, `pt-lock`, `pt-dashboard`, `pt-rescue`, `pt-resmon`, `pt-audit`, `pt-usermgmt`, and `pt-scheduler`.
* **Scheduler Migration**: Python Cron tasks moved natively from a hardcoded `jobs_state.json` file into the primary SQLite configuration setup guaranteeing better transactional atomicity.
* **Emergency Rescue Utility**: New tool mapped at `bin/pt-rescue` for instances where root administrators lose TUI access entirely requiring shell intervention.

### Fixed
* Fixed a TUI presentation anomaly where trailing text labels (like `e`) spawned adjacently inside fzf selections due to an outdated `--expect=esc,bs` tag fallback. `pick_fzf` is now cleanly routed via terminal code capture (code 130 abort for escapes).
* Implemented proper dynamic terminal width detection utilizing shell `$COLUMNS` environments mitigating cut-off header blocks appearing poorly aligned against full-size selections grids.
* Resolved `JSONDecodeError` runtime panics impacting the Scheduler and User menus by wrapping output pipelines internally identifying raw JSON brace brackets ignoring arbitrary debug warnings from subprocess pipes.
* Corrected Bash integer string casting leading to syntax fault `[[: 0 0: syntax error in expression` when fetching background Docker availability statistics via regex stripping digits.
* Fixed shell backward escape bugs and navigation loops across menu sub-shells; exiting functions now correctly returns parents via unified ESC/Backspace routing.

### Changed
* **TUI Execution Options**: Local testing parameters have been functionally diversified handling standard flat scripts targeting real APIs compared alongside Mock-compatible scripts. Evaluated statically by `list-scenarios.mjs` resolving configuration paths accurately.
* Secret masking deployed inline protecting `.env` file display configurations specifically censoring variables carrying key names matching `password|secret|token|key|pwd` dynamically.
