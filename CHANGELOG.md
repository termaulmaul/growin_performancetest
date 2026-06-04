# Changelog

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
