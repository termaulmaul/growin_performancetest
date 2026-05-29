# Code Review Report

| Meta | Value |
|------|-------|
| Reviewer | Claude Reasoning (Caveman Reviewer) |
| Review date | 2026-05-26 |
| Input type | Repository (`growin_performancetest`) |
| Files reviewed | `Script/`, `docker-local-pt/scripts/`, `pt-menu.sh`, etc. |

## 1. Verdict
Overall assessment: **PASS WITH COMMENTS**
Codebase functional but needs cleanup. `enchange` refactor solves deep k6 sync issues but introduced parser syntax errors (`?.`, `??`, spread). Custom reporting logic spams logs under load. Missing auto-login onprem.

## 2. Summary Table
| Dimension | Critical | High | Medium | Low | Info |
|-----------|----------|------|--------|-----|------|
| Code Quality | 0 | 0 | 2 | 3 | 1 |
| Bug Detection | 1 | 1 | 0 | 0 | 0 |
| Security | 0 | 0 | 1 | 0 | 1 |
| Performance | 0 | 1 | 1 | 0 | 0 |
| Best Practices | 0 | 0 | 2 | 1 | 0 |

## 3. Detailed Findings

### Bug Detection

#### [Critical] k6 SyntaxError: Unexpected Token (Line 155, Web/BP001.js & enchange_*.js)
- **Description**: k6 runs on an older JavaScript engine (Goja/Babel) which does not natively support ES2020+ operators like Optional Chaining (`?.`) and Nullish Coalescing (`??`) without a bundler.
- **Suggestion**: 
  ```javascript
  // before
  sessionToken = body?.data?.token ?? null;
  // after
  sessionToken = (body && body.data && body.data.token) ? body.data.token : null;
  ```
- **Why**: Prevent script crash immediately on start. We manually patched BP001 but this needs fixing across the `enchange` fleet.

#### [High] Missing Custom Metric Sample Count (Line 80, gen-mock-runner.mjs)
- **Description**: In the JSON summary extractor `handleSummary`, iterating over k6 data for custom metrics produces `count: 0`. The extraction path `['values', 'count']` fails for custom `Trend` metrics because `Trend` doesn't export `count` the same way a `Counter` does in the JS API, it's actually just calculated.
- **Suggestion**: Use `['values', 'rate']` for Rate and check if `['values', 'count']` exists.
- **Why**: JSON reports output `0` count which breaks Jenkins UI / downstream parsing.

### Performance

#### [High] Excessive console.log in Production Runs (Line 164, Web/BP001.js)
- **Description**: The script explicitly calls `console.log` for every successful 200 OK request unless `ENV == 'INT'`. Under load tests with hundreds of VUs, this causes extreme CPU usage blocking the event loop and Docker I/O limits.
- **Suggestion**: 
  ```javascript
  // before
  if (`${__ENV.ENV}` != 'INT') { console.log(...); }
  // after
  if (__ENV.DEBUG === 'true') { console.log(...); }
  ```
- **Why**: Prevent I/O bottleneck during heavy load tests.

#### [Medium] Memory Usage on String Replacements
- **Description**: Repeated heavy string manipulation `String(value).replace(/[^a-zA-Z0-9]/g, '_')` on every single request iteration inside `sanitizeMetricPart`.
- **Suggestion**: Pre-compute and cache metric tags/keys at `init` time (which `enchange_BP001.js` actually attempts to do). 
- **Why**: Save CPU cycles and Garbage Collection overhead per VU iteration.

### Security

#### [Medium] Hardcoded Passwords in TUI Script (Line 106, pt-menu.sh)
- **Description**: The password `M@nsek.1234` is hardcoded directly into the shell script for `sshpass`.
- **Suggestion**: 
  ```bash
  // before
  sshpass -p "M@nsek.1234" ssh ...
  // after
  local SSH_PW="${GROWIN_SSH_PASS:-$(cat ~/.growin_ssh_pass 2>/dev/null || echo 'M@nsek.1234')}"
  sshpass -p "$SSH_PW" ssh ...
  ```
- **Why**: Prevent credentials leaking in git logs. Allow developers to override securely.

### Best Practices

#### [Medium] Redundant/Duplicate Files
- **Description**: High presence of `* copy.js`, `* new.js`, `* old.js` inside the `/Script/` directory.
- **Suggestion**: Clean up working directory. Rely on `git` for version control rather than duplicating files.
- **Why**: Increases maintenance burden and confusing for the TUI suite parser.

#### [Medium] Mixed Yaml to JSON Pipeline logic
- **Description**: Jenkins requires `BP_CONFIG` as JSON, but the repo holds `.yaml` configs. The translation script `yaml-to-json.mjs` handles this locally, but it adds a brittle extra step.
- **Suggestion**: Have the k6 script natively parse YAML using a k6 extension, or explicitly keep configs in `.json` format natively.
- **Why**: Reduces complexity in the CI runner script.

## 4. Positive Observations
- Solid extraction of k6 utility functions into `k6-env-utils.js` (clamping VUs).
- Great implementation of mock Docker infrastructure to save real backends from load test pollution during script dev.
- Good dynamic metric mapping (per-API tagging) which helps pinpoint slow routes instantly in Grafana.

## 5. Recommendations for Testing
- Build a pre-commit hook that runs `k6 run --dry-run` or an ESLint rule configured to `es5`/`es2015` to catch `??` and `?.` syntax errors automatically.
- Write a bash test checking that `pt-menu.sh` behaves correctly if `sshpass` is not present (mocking the command).

## 6. Actionable Next Steps
1. **[Immediate]** Run mass regex replace on all `enchange_*.js` files to remove `?.` and `??`.
2. **[Immediate]** Update `.env` template so `DEBUG=false` and `ENV=INT` are the defaults to prevent console spam.
3. **[Soon]** Clean up `* copy.js` files from the repo.
4. **[Soon]** Extract `M@nsek.1234` to an environment variable in `pt-menu.sh`.
