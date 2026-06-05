# Growin Performance Test Framework

Enterprise-grade **k6-based** performance testing suite for the Growin platform by Bank Mandiri Sekuritas. Designed to run load tests across Web, Android, and iOS scenarios against **Onprem** (SSH jump) and **Oncloud** (GCP IAP) production targets. Sandbox mode available for local demo/dry-run.

Built on the **Kimi Enterprise Architecture RFC**, featuring terminal-native authentication, RBAC, environment concurrency locking, metric parsing, webhook notifications to Teams/Discord/Telegram/Brrr, and a live NOC-style dashboard.

See [AGENTS.md](./AGENTS.md) and [CLAUDE.md](./CLAUDE.md) for QA automation engineer context and agent instructions. See [STRUCTURE.md](./STRUCTURE.md) for repository layout and [CHANGELOG.md](./CHANGELOG.md) for release history.

---

## 🆕 Recent Changes (v2.6.0 — 2026-06)

Major UX overhaul completed across PRs #1–#5. Highlights:

| Area | Improvement |
|---|---|
| Repo hygiene | 270 `.DS_Store` cleaned, k6 binaries untracked (-183MB), 78 `* copy*.js` purged, `.gitignore` hardened |
| Navigation | Breadcrumb headers (`Main ▸ Run Test ▸ Onprem`), `?` global help keymap overlay |
| Input validation | `prompt_int` (range + retry), `prompt_duration` (k6 format check) |
| Pre-execution | `confirm_run` summary card with `[Y] Run · [E] Edit · [C] Cancel` |
| Discovery | `[T] Tools / Diagnostics` menu exposes pt-resmon, pt-rescue, pt-dashboard, pt-audit, pt-lock-status |
| Recent runs | Last 5 tracked in `~/.pt/var/recent_runs.json`, `[R] Recent` shortcut in suite picker |
| Script picker | fzf preview window (`head -40` of file) |
| Multi-suite | `[B] Batch Run Regression` — TAB to mark, ENTER to confirm, per-suite tracking + summary |
| Webhook test | 3-step verbose (DNS → HTTP preflight → actual payload) with latency + peer IP |
| ENV editor | Hybrid: inline key-value prompt, $EDITOR fallback, RBAC-aware summary |
| Status bar | 2-line: User/Role · Last run · Webhook indicator · Docker count |
| Docs | mermaid flowcharts fixed + updated to reflect current menu structure |

`pt-menu.sh`: **1389 → 1901 lines** (+37%) — all additive, zero breaking changes.

---

## 🚀 Quick Start

Launch the interactive TUI (Requires `fzf` and `python3`):

```bash
./pt-menu.sh
```

**Initial Setup:**
When running the TUI for the first time on a fresh server, it will detect that no users exist and will enter **Initial Setup Mode**. You will be prompted to create the first `god` level username and password.

*(You can change this password later inside the TUI via `User Management` > `Reset Password`)*

### 🚑 Emergency Access (Forgot Password)
If you lose access to the `god` account or get locked out, run the CLI rescue tool directly from the terminal:
```bash
python3 bin/pt-rescue
```
It will prompt for the username and force-reset the password or unlock the account directly via SQLite.

---

## 🗺️ TUI Architecture & Navigation

```
main_menu
  [1] Run Test  (Onprem / Oncloud)
       └─ Pick Target → Onprem (SSH jump) / Oncloud (GCP IAP) / Sandbox Demo
          └─ Pick Suite (with [R] Recent · [B] Batch · [?] Help shortcuts)
             └─ Pick File (fzf preview window)
                └─ Configure VUs / Duration / ENV / RUNBY
                   └─ Confirm Run [Y]es · [E]dit · [C]ancel
                      └─ k6 execute → Report → Webhook notify
  [2] Sandbox Demo  (Local Mock — k6 binary)
       └─ Mock-API stack or Direct k6
  [3] Cron Scheduler  →  Add / Pause / Resume / Remove jobs
  [4] AI Slope (Code Quality)  →  Scan scripts for issues
  [5] ENV Editor  →  Inline edit · $EDITOR · Show summary
  [6] Docker Stack  →  Start / Stop / Logs
  [7] Open Project Dir
  [8] User Management  (god only)
  [9] Webhooks  →  Set / Verbose Test / Toggle / Clear
  [D] Dashboard  →  Live CPU/RAM/Locks/Audit
  [T] Tools / Diagnostics  →  pt-resmon · pt-rescue · pt-bootstrap · pt-audit · pt-lock-status
  [?] Help / Keymap  →  Global keybind reference
  [Q] Quit
```

**Navigation:** ↑↓ arrows, Enter to select, ESC/Backspace to go back, Ctrl-C to exit, TAB to mark (in batch mode), `/` to search within fzf lists.

---

## 💻 Environment Capabilities

### 1. Run Test — Onprem / Oncloud (Production Targets)
Execute k6 scripts from `Script/` folder on remote VMs.
- **Onprem:** SSH via bastion jump host (`10.82.15.72` → `10.184.120.48`) using automated `sshpass`.
- **Oncloud:** GCP IAP tunnel to `vm-pt-ksix-0` (`asia-southeast2-c`, project `compute-pt`).
- **Sandbox Demo:** Local `127.0.0.1:2222` SSH container — demo/dry-run only, not a production target.

Scripts are sourced from `$PROJECT_DIR/Script/<suite>/` and run via `cd growin_performancetest && cd Script/<suite> && ../../k6 run <file>.js`.

### 2. Sandbox Demo (Local Mock + Direct k6)
Execute scripts directly from host machine. Prints tabulated **K6 Load Test Summary** (RPS, P95, Errors) at end of each run.
- **✓ MockReady Suites:** Run through `docker-local-pt` stack against `http://mock-api:8080`.
- **⚡ Direct Suites:** Run via native `./k6` binary from host.

### 3. Distributed Locking & Concurrency Protection
Prevents QA engineers from overlapping test executions.
- Automatically acquires an **environment lock** (e.g., `INT`, `STG`) before launching a test.
- Forks a background heartbeat daemon (`pt-lock`) that checks in every 15s.
- Dynamic TUI Status Bar states:
  - 🟢 `Available | maul [Idle]`
  - 🟡 `OCCUPIED | BP001 | By: budi | since 2m 10s`
  - 🔴 `PT ACTIVE | BP001 | 5m elapsed`

### 4. RBAC & User Management
Full terminal-native role-based access control backed by SQLite (`~/.pt/var/pt.db`).
- **Roles:** `god` (Full admin), `admin`, `operator` (PT runner), `readonly`, `guest`.
- **User Management TUI:** Create users, lock/unlock, reset passwords, assign roles.

### 5. Webhook Notifications
Integrated alerting and reporting.
- Supports **Telegram**, **Discord**, **Microsoft Teams**, and custom **Brrr** webhook endpoints.
- Configurable interactively via the Webhook menu [9].

---

## 📁 Repository Structure

```text
growin_performancetest/
├── pt-menu.sh                 ← Main TUI entrypoint
├── k6                         ← k6 binary (compiled with custom extensions)
├── configs/
│   └── pt.env                 ← Primary config (targets, thresholds, webhooks)
├── Script/                    ← ALL test scripts (run from here on remote)
│   ├── <SuiteName>/
│   │   ├── <SuiteName>.js     ← Main k6 script
│   │   ├── <SuiteName>_LoadTest.sh
│   │   ├── <SuiteName>_Regression.sh
│   │   └── Web/Android/iOS/   ← Platform configs
│   └── Template_Project/      ← Base template for new suites
├── Report/                    ← HTML reports per suite/platform/bp/runby
├── Helper/                    ← Shared k6 modules
├── lib/
│   ├── bash/pt_auth_client.sh ← Auth gate bash wrapper
│   ├── python/db.py           ← SQLite schema (auth, locks, audit, scheduler)
│   └── webhook/               ← Notifiers + log parser
├── bin/                       ← Kimi Architecture Python CLIs
│   ├── pt-auth, pt-rbac, pt-audit, pt-lock
│   ├── pt-lock-status, pt-dashboard, pt-resmon
│   ├── pt-scheduler, pt-usermgmt, pt-rescue
│   └── pt-bootstrap-check, pt-remote-daemon.sh
├── pt-data/                   ← User state, run state
├── artifacts/results/         ← Latest summary.json
├── scheduler_cli/             ← Python cron backend + AI slope validator
├── docs/performance-audit/    ← CI/Grafana/Jenkins checklists
├── blueprint/                 ← Architecture RFCs (Kimi, Manus, DeepSeek)
├── docker-local-pt/           ← DEMO ONLY. Not production target.
│   ├── docker-compose.yml
│   ├── configs/local.env      ← Legacy config (fallback only)
│   ├── jenkins/               ← CI pipeline definitions
│   └── scripts/               ← Mock runner utilities
├── AGENTS.md                  ← Global agent instructions + QA skills
├── CLAUDE.md                  ← AI context + QA performance testing reference
└── CHANGELOG.md
```

---

## 🛠️ Script Authoring Guidelines

To ensure compatibility across both **Local Mock** and **Remote Environments**, scripts must construct URLs dynamically based on environment variables:

```javascript
// ✅ Correct (Supports Mocking)
const env = __ENV.ENV || 'LOCAL';
const baseUrl = env === 'LOCAL' ? __ENV.BASE_URL : `https://${env.toLowerCase()}-api.growin.com`;

// ❌ Incorrect (Cannot be mocked locally)
if (`${__ENV.ENV}` != 'INT') {
    // Only works on Real Servers
}
```

---

## 📊 Observability & K6 Extensions

The framework provides real-time and post-run observability:
- **Live Dashboard:** Select `[D] Dashboard` in the TUI to monitor CPU/RAM health, active test locks, and a tail of the audit trail.
- **Summary Table:** A custom Python parser (`print-summary-table.py`) renders an Excel-like ASCII table of K6 metrics locally.
- **Grafana/InfluxDB:** Start the `observability` Docker profile to ship real-time metrics.

*For complete local mock operator documentation, see [`READMOCKDOCK.md`](./READMOCKDOCK.md).*
*For autonomous agents configuration, see [`AGENTS.md`](./AGENTS.md).*