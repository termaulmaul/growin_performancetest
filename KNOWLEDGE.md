# Growin Performance Test Framework — Knowledge Base
*(Generated from codebase static analysis on 2026-06-12)*

## 1. Overview
The **growin_performancetest** project is an enterprise-grade k6-based performance testing framework built by Bank Mandiri Sekuritas. It uses a TUI menu (`pt-menu.sh`) to dispatch tests against Onprem, Oncloud, and local Sandbox targets.

## 2. Directory Structure
- `pt-menu.sh`: Main entrypoint (Bash TUI).
- `configs/`: Contains environment configuration (e.g. `pt.env`).
- `bin/`: CLI tools (auth, RBAC, lock, etc.).
- `lib/`: Bash helpers, SQLite schema (`python/db.py`), Webhook notifiers (`webhook/`).
- `Script/`: k6 load testing scenarios (`<Suite>/<Platform>/<BP>.js`).
- `docker-local-pt/`: Local mock Docker stack (Grafana, Influx, Mock API).
- `docs/`, `blueprint/`: Documentation and architecture RFCs.
- `scheduler_cli/`: Python scheduler.
- `.agents/skills/`: Agent skills installed locally.

## 3. Core Modules
- **Bash TUI (`pt-menu.sh`)**: Drives the user interaction, target selection, and script dispatching.
- **`lib/bash/pt_auth_client.sh`**: Client-side auth wrapper.
- **`lib/webhook/send-summary-webhook.mjs`**: JavaScript ES module sending multi-channel notifications (Teams, Discord, Telegram).
- **`lib/webhook/parse-k6-log.py`**: Python script responsible for log metric extraction.
- **CLI Commands (`bin/`)**: `pt-auth`, `pt-rbac`, `pt-lock`, `pt-dashboard`, etc.

## 4. Dependencies & Tools
- **Bash 4+ / 5.x**: Required for advanced arrays in TUI.
- **Python 3.9+**: For database schema (`db.py`), scheduler, and log parsing.
- **k6**: The load testing engine.
- **Docker**: For local Sandbox and observability.
- **SQLite**: Used for persistence of users, roles, and audit trail.
- **sshpass / gcloud**: For jump host navigation.

## 5. Authentication & RBAC
- **Data store**: SQLite (`python/db.py`).
- **Cryptographic**: BCrypt for password hashing.
- **Roles**: `god`, `admin`, `operator`, `readonly`, `guest`.
- **First boot**: Interactively prompts for initial god user setup.
- **Emergency**: `pt-rescue` script allows resetting the god password.

## 6. Webhook Integration
Sends test execution status to multiple destinations.
- **`send-summary-webhook.mjs`**: Supports Teams, Discord, Telegram, Brrr.
- Formats payloads (Teams uses Adaptive Cards).
- Configuration parameters (`TEAMS_WEBHOOK`, `DISCORD_WEBHOOK`, etc.) are read from `configs/pt.env`.

## 7. Test Suites & Scripts
Organized in `Script/<Suite>/`.
- **Structure**: Core dispatcher (`<Suite>.js`) + platform specific wrappers (`Web/BP001.js`, etc.).
- **Platforms**: Web, Android, iOS.
- **Helpers**: `Helper/config.js` sets up base URLs and user creds. `textSummary.js` provides terminal output.

## 8. Security Audit
Analysis detected the following security-relevant findings:
- **Hardcoded Secrets**: 
  - `configs/pt.env` and `configs/pt.env.example` contain `PT_SSH_PASS` and `TEST_PASSWORD`.
  - Default fallbacks (`M@nsek.1234`) are present in `bin/pt-remote-daemon.sh` and `pt-menu.sh`.
  - Webhook URLs are hardcoded in test scripts (e.g. `Script/Wabadima/BP001 copy.js`).
- **Command Injection Risks**: No glaring issues detected by `bash -n`.
- **No syntax errors**: All Bash and Python scripts pass basic parsing.

## 9. Technical Debt & Recommendations
- **Missing Unit Tests**: Almost 0 unit tests found. The `scheduler_cli/scripts/dummy_test.sh` is the only explicit test. All Python and Bash modules lack formal `pytest` or `bats` coverage.
- **Missing Shellcheck**: Static linting with `shellcheck` could not run (missing from system).
- **Refactoring**: Stale `.js` files (like `BP001 copy.js`) should be purged to prevent secret leakage.

## 10. Recent Git History
```
d5673eb Update script
139e672 Update script template
22b987b Update script template
d734a88 fix: pt-menu ssh menu unbound variable
d46b984 feat: add TUI menu and comprehensive README documentation
21473c4 chore: update k6 binary
304d510 Update script
b5f6267 Update BP001 yaml
19451ab Update BP001 yaml
c73716c Update BP001.yaml
```
