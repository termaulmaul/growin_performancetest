# UX TUI Improvements — pt-menu.sh

PR: feat/ux-tui-improvements

## Summary
Eight additive UX improvements to `pt-menu.sh`. All changes additive — no breaking changes to existing workflows.

## New helpers (top of file)
- `breadcrumb` — show navigation path (`Main ▸ Run Test ▸ Onprem`)
- `prompt_int` — validated integer prompt with min/max + retry on bad input
- `prompt_duration` — validates k6 duration format (30s, 5m, 1h, 1h30m)
- `confirm_run` — pre-execution summary card with `[Y] Run · [E] Edit · [C] Cancel`
- `recent_runs_add` / `recent_runs_list` — track last 5 runs to `~/.pt/var/recent_runs.json`
- `help_keymap` — global help overlay (ESC, Ctrl+C, `?`, etc.)
- `spinner_with_timeout` — cancellable spinner with countdown
- `pick_fzf_with_preview` — fzf picker with file content preview window

## Integration points
| Where | What |
|---|---|
| `ssh_menu` | Breadcrumb (`Main ▸ Run Test`, `… ▸ Onprem/Oncloud/Sandbox`) |
| `ssh_menu` | Recent runs shortcut + help shortcut at suite picker |
| `ssh_menu` | fzf preview for script file picker (`head -40`) |
| `ssh_menu` Onprem suite run | `confirm_run` summary before tar/scp/k6 |
| `ssh_menu` k6 prompts | `prompt_int` (VUs 1-5000) + `prompt_duration` |
| `run_test_menu` Direct k6 | `prompt_int`, `prompt_duration`, `confirm_run`, fzf preview |
| `main_menu` | New `[T] Tools / Diagnostics` + `[?] Help / Keymap` entries |
| `tools_menu` (new) | pt-resmon, pt-bootstrap-check, pt-rescue, pt-dashboard, pt-audit tail, pt-lock-status, recent runs list, help |

## Behavior changes
- VU input now validates (1–5000 range, integers only). Retries on bad input.
- Duration input validates k6 format. Retries on bad input.
- Onprem suite execution shows confirmation summary; user can cancel or re-edit.
- Sandbox Direct k6 execution shows same confirmation summary.
- Recent runs auto-tracked after confirmation passes.
- Hidden CLI tools now discoverable in `[T] Tools` menu.
- `?` keybind in main menu opens help overlay.

## Verification
```
bash -n pt-menu.sh   →   SYNTAX OK
Total lines: 1708 (was 1389)
Helper invocations: 35+ wired
```

## Safety
- No existing function removed.
- No menu numbers reassigned.
- All new prompts have sane defaults from `configs/pt.env`.
- All shortcut keys gracefully fall through `case` if not matched.
