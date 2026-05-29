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
