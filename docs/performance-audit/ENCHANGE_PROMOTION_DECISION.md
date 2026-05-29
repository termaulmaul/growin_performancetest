# Enchange Promotion Decision

## Verdict

| Group | Decision | Reason |
|---|---|---|
| 107 enhanced scripts | Candidate for parallel INT run | audit clean, R1/R2/R4 fixes safe + ADDED_ONLY waiting_* |
| Banner_Promo/iOS BP001 | **HOLD** | full refactor (1475→410 LOC); runtime parity required |
| Data_Visualization BP002 | **HOLD (BP002 only)** | upstream impl missing; not regression |
| 6 enhanced runners (Android fallback) | Candidate with warning fallback | STRICT_PLATFORM_IMPLEMENTATION available |

## Promotion Rules
1. Run INT smoke per suite.
2. Compare Grafana series (see GRAFANA_COMPARE_CHECKLIST.md).
3. Confirm Jenkins env (see JENKINS_ENV_REPRO_CHECKLIST.md).
4. Swap imports only after pass.
5. Keep rollback path.

## Rollback
Revert single import line in runner:
```diff
-import { BP001 as BP001_Web } from "./Web/enchange_BP001.js";
+import { BP001 as BP001_Web } from "./Web/BP001.js";
```
Originals never modified.

## Order of Promotion (recommended)
1. Single low-risk suite (e.g. `Growin_News`).
2. Medium suites (`Growin_AI_Summarizer` Web BPs).
3. Multi-platform runners under `STRICT_PLATFORM_IMPLEMENTATION=false`.
4. Banner_Promo BP001 only after full parity sign-off.
