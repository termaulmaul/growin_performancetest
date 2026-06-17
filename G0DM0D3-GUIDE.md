# G0DM0D3 Audit Guide

## Checks
- **Static**: Scans for hardcoded secrets, `eval`/`exec`, insecure `$PATH`, and SQL concatenation. Runs `npm audit` / `pip-audit`.
- **Runtime**: Provides payloads for manual injection tests (XSS, SQLi).
- **Arch**: Identifies `USER root` in Dockerfiles, password logging, open ports, and firewall rules.

## Interpretation
- Secrets found -> Move to `.env`.
- Injection patterns -> Use parameterized queries.
- `USER root` -> Change to `USER 1000:1000`.

## Run
`bash g0dm0d3-audit.sh /path/to/project`
