# G0DM0D3 Security Audit – growin_performancetest

**Date:** 2026-06-15
**Scope:** `/Users/maul/github/growin_performancetest`
**Modes executed:** Static, Architecture (Runtime skipped - CLI/scripting target)

## Mode 1: Static Reconnaissance
| ID | Severity | Finding | Evidence (file:line) | Fix |
|----|----------|---------|----------------------|-----|
| S‑01 | CRITICAL | Hardcoded SSH password (`PT_SSH_PASS`) | `configs/pt.env:19` | Use SSH Keys instead of hardcoded `PT_SSH_PASS` in plaintext files. |
| S‑02 | HIGH | Hardcoded Webhook URLs / Bot Tokens | `configs/pt.env:40-41` | Treat webhooks as secrets. Inject via secure vault or CI/CD secrets. |
| S‑03 | HIGH | Command injection via `eval` | `scheduler_cli/scripts/bad_script.sh:5` | Remove `eval` and execute commands directly or use parameterized arrays. |
| S‑04 | MEDIUM | Hardcoded test credentials & PINs | `configs/pt.env:23-25` | Do not store raw passwords in `.env` if this file is shared. Use placeholder `<your_value_here>` in templates. |
| S‑05 | LOW | Dependency vulnerability (npm) | `@ai-sdk/provider-utils` (npm audit) | Run `npm audit fix` to resolve Uncontrolled Resource Consumption. |

## Mode 2: Runtime Penetration
| ID | Severity | Finding | Evidence (request/response) | Fix |
|----|----------|---------|-----------------------------|-----|
| R‑01 | N/A | Not applicable for this target | Target is a TUI framework without a continuously running web-server exposed. | N/A |

## Mode 3: Architecture & Configuration
| ID | Severity | Finding | Evidence | Fix |
|----|----------|---------|----------|-----|
| A‑01 | LOW | Docker container elevates to root during build | `docker-local-pt/jenkins/Dockerfile:4` | While it correctly drops to `USER jenkins` on L43, minimize the layers executed as root. |

## Summary & Next Steps
- **Total findings:** 6 ( Critical: 1, High: 2, Medium: 1, Low: 2 )
- **Immediate actions:** 
  1. Rotate SSH Passwords and transition to SSH keys for bastion jumping.
  2. Remove `eval` usage from `bad_script.sh` to prevent command injection risks.
  3. Cycle all Webhook tokens (Teams/Telegram) found directly in `configs/pt.env`.
- **Full report saved to:** `SECURITY_GODMODE_REPORT.md`
