# CI Audit Guard — Wiring Reference

No `package.json`, no `Jenkinsfile`, no `.github/` found in this repo. Audit guard runs as standalone Node script.

## Manual run
```bash
node tools/audit-enhanced-contracts.mjs
node tools/audit-banner-promo-bp001-parity.mjs
```

Exit code 1 on any `critical` issue (e.g. dropped export).

## When a package.json is introduced
Add:
```json
{
  "scripts": {
    "audit:enhanced": "node tools/audit-enhanced-contracts.mjs",
    "audit:banner-parity": "node tools/audit-banner-promo-bp001-parity.mjs"
  }
}
```

## GitHub Actions snippet
```yaml
name: audit-enhanced-contracts
on: [push, pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: node tools/audit-enhanced-contracts.mjs
```

## Jenkinsfile stage
```groovy
stage('Audit Enhanced k6 Contracts') {
  steps {
    sh 'node tools/audit-enhanced-contracts.mjs'
  }
  post {
    failure { echo 'Enhanced k6 contract audit failed — dropped exports or metric drift.' }
  }
}
```

## Outputs (gitignored)
- `.audit_guard_report.json`
- `.audit_guard_report.md`
- `Script/Growin_Banner_Promo/iOS/enchange_BP001_parity_audit.md` (kept in repo)
