# Jenkins Env Reproduction Checklist

## Required Env Vars

| Var | Required | Notes |
|---|---|---|
| RUNBY | yes | Manual / LoadTest |
| ENV | yes | INT / DEV / QA / DRC |
| USER | yes | total VUs |
| DURATION | yes | k6 duration string |
| NUMSTART | yes | user index offset |
| SCENARIO | yes | BP001..BPNNN |
| PLATFORM | yes | Web / iOS / Android |
| BP_CONFIG | optional | PT_Dev v2 only |
| BP_CONFIG_FILE | optional | PT_Dev v2 only |
| DEBUG | optional | "true" enables verbose logs |
| STRICT_PLATFORM_IMPLEMENTATION | optional | "true" disables Android→Web fallback |
| ALLOW_ANDROID_WEB_FALLBACK | optional | legacy; warning fallback default |

## Rule

- `STRICT_PLATFORM_IMPLEMENTATION=true` only in strict validation jobs.
- Default: warning fallback stays for compatibility.

## Sample Command

```bash
k6 run Script/Growin_Banner_Promo/Growin_Banner_Promo.js \\
  -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=30s -e NUMSTART=1 \\
  -e SCENARIO=BP001 -e PLATFORM=iOS -e DEBUG=true
```

## Expected Artifacts
- HTML dashboard (per existing Jenkinsfile pattern; emit via `--out dashboard=export=path`)
- JSON summary if `--summary-export` used
- k6 stdout containing checks + metrics

## Failure Handling
- Non-zero exit: abort promotion.
- Missing env: fail fast (no silent defaults beyond runner getPlatform).
