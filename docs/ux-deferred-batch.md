# UX Deferred Batch — pt-menu.sh

PR: feat/ux-deferred-batch (follows feat/ux-tui-improvements)

## Summary
Ships the 4 deferred items from the UX audit. All additive — no breaking changes. `bash -n` verified.

## Features

### 1. Multi-select regression (`fzf --multi`)
- New helper `pick_fzf_multi` (TAB to mark, ENTER to confirm)
- New fn `batch_run_regression` accessible via `[B] Batch Run Regression` shortcut in `ssh_menu` suite picker
- Per-suite tracking with PASS/FAIL/SKIP counts + final summary table
- Shared params (VUs, Duration, ENV) prompted once with `confirm_run` summary
- Each suite executes its own `<Suite>_Regression.sh` (skip with notice if absent)

### 2. Webhook test verbose output
Replaces the silent "Sent" with a 3-step diagnostic flow:
- **[1/3] DNS resolution** — getent/nslookup/host fallback chain
- **[2/3] HTTP preflight** — curl POST with sample `{"_preflight":true}`, prints HTTP code, latency, peer IP
- **[3/3] Actual payload** — runs existing `webhook-tester.mjs` and indents output for readability

### 3. ENV editor hybrid mode
Replaces the single-key `e` overlay with a proper menu:
- `[1] Inline edit` — pick key from fzf list, see current value (masked for secrets), enter new value or `-` to clear
- `[2] Open in $EDITOR` — fallback to vi/nano/$EDITOR
- `[3] Show full ENV summary` — RBAC-aware: non-god roles see masked secrets
- `[+] Add new key` option in inline mode

### 4. Status bar verbose mode
Banner adds a second info line:
- `User: <name> · <role>` (role colored magenta)
- `Last: <last recent run summary>` (✓ indicator + first 48 chars)
- `Webhook: ●` (green if any webhook configured, dim ○ if none)
- `Docker: <count>` (green when stack up)

Original line preserved: IP · ENV · VUs · Dur · Lock status.

## Verification
- `bash -n pt-menu.sh` → SYNTAX OK
- Total lines: 1859 (was 1707)
- All 4 features verified via grep presence check

## Files changed
- `pt-menu.sh` — +152 lines net
- `docs/ux-deferred-batch.md` — new
