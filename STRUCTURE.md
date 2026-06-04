# Repository Structure

High-level map of `growin_performancetest`.

```
.
├── bin/                # Operator CLIs (pt-auth, pt-scheduler, pt-rbac, pt-dashboard, …)
├── lib/                # Shared libraries
│   ├── bash/           # Bash helpers (pt_auth_client.sh, …)
│   ├── python/         # Python modules (db.py, …)
│   └── webhook/        # Webhook senders / parsers (Teams, summary, k6 log)
├── Script/             # k6 performance test scripts, per scenario (Growin_*, OMO_*, …)
│   ├── <Scenario>/
│   │   ├── <Scenario>.js
│   │   ├── <Scenario>_LoadTest.sh
│   │   ├── <Scenario>_Regression.sh
│   │   └── {Android,Web,iOS}/
│   └── Template_Project/   # Skeleton for new scenarios
├── Helper/             # Shared k6 helpers (bundle.js, config.js, textSummary.js)
├── Report/             # Test reports (gitignored except Template_Report/)
├── configs/            # Environment configs (pt.env, …)
├── docs/               # Documentation
│   └── performance-audit/  # Audit / promotion checklists
├── blueprint/          # Architecture RFCs (deepseek, kimi, manus)
├── docker-local-pt/    # Local k6 + Jenkins + Grafana stack (compose, mock-api, sandbox)
├── scheduler_cli/      # Python scheduler (cron_manager, local_runner, AI slope validator)
├── pt-data/            # Runtime data (gitignored: active_run.json, users.json, security.db)
├── tools/              # One-off auditors / refresh scripts (audit-*.mjs, refresh-*.cjs)
├── archive/            # Legacy / scratch artifacts (do not extend, see archive/README.md)
├── pt-menu.sh          # Main TUI entry point
├── pt-tui              # TUI binary / launcher
├── setup-pt.sh         # Setup helper
├── Regression.sh       # Top-level regression runner
└── go.{mod,sum}        # Go module (for any Go tooling)
```

## Conventions

- **Scripts:** one directory per scenario in `Script/<Scenario>/` with platform sub-folders (`Android/`, `Web/`, `iOS/`).
- **Reports:** mirror script layout in `Report/<Scenario>/<BPxxx>/<Platform>/`.
- **Binaries (`k6`, `k6-linux-*`):** kept locally, **not** committed (see `.gitignore`).
- **Secrets / runtime DBs:** never commit (`*.token`, `*.env.local`, `security.db`, `pt-data/users.json`).
- **Temporary patches:** do **not** add `patch_*.js` / `fix-*.sh` to repo root. Use PRs.

## Branches

- `main` — protected, production.
- `chore/*` — maintenance, refactor, restructure.
- `feat/*` — new features / scenarios.
- `fix/*` — bug fixes.
