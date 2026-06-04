# QA Automation Engineer (Performance Testing) Context

## 1. Konteks Project — 3S Objectives
**Speed** — Response time, latency, throughput (RPS/TPS).
**Scalability** — System handles increasing load without degradation.
**Stability** — No memory leak, no error spike, no crash over sustained load.
**KPI:** P95 < 500ms, Error rate < 0.1%, Min RPS >= 381, CPU < 70%.

## 2. QA Fundamentals
**Approaches:** Black box (input→output), White box (code coverage), Gray box (API contract known).
**Test Oracles:** Spec (OpenAPI), Regression (baseline), Statistical (p95/err%), Heuristic (experience).
**Mindset:** Prevention > Detection. Shift-left. Quality = team responsibility.

## 3. Performance Testing — 7 Types
| Type | Goal | k6 Pattern |
|------|------|-----------|
| Load | Normal expected load | ramp → steady → down |
| Stress | Find breaking point | ramp past expected max |
| Spike | Sudden burst | instant jump to 10× VUs |
| Endurance | Sustained long period | constant VUs for hours |
| Volume | Large data payload | large body, many DB rows |
| Scalability | Perf change as resources scale | incremental VU steps |
| Capacity | Max before SLA breach | ramp until threshold violation |

**Tool Stack:** k6, Grafana+InfluxDB, pt-menu.sh, Jenkins, Teams/Discord/Telegram webhook, SQLite.

## 4. Testing Techniques
**Functional:** Unit, Integration, E2E (BP001→BPnnn flow).
**Non-Functional:** Performance, Security (rate-limit, auth bypass), Compatibility (Web/iOS/Android).
**Methodologies:** TDD (test→implement→pass), BDD (Given/When/Then in k6 groups), ATDD, RCA (logs→metrics→code→infra→data).
**Data:** Synthetic only. No PII. Tokens in pt-data/users.json. ENV per run: K6_USERS, DURATION, ENV, RUNBY, SCENARIO, PLATFORM.

## 5. SDLC & Delivery
**Agile:** Sprint planning → add PT tasks. Sprint review → share PT results. Retro → discuss flaky tests.
**Shift-Left:** Write PT alongside feature dev, smoke test in CI on every PR merge, gate deployment on PT pass.
**Pyramid:** E2E Load/Stress (few) → Integration API Perf (per sprint) → Contract Smoke (every commit).

## 6. CI/CD Integration
**Pipeline:** Build → Unit → Integration → PT Smoke → Deploy Staging → PT Full → Deploy Prod.
**Gate thresholds (configs/pt.env):** THRESHOLD_AVG_MS=200, THRESHOLD_ERR_PCT=0.1, THRESHOLD_MIN_RPS=381.

## 7. Version Control
**Branching:** main (stable), feature/<suite>, fix/<issue>, refactor/<suite>, release/<version>.
**Rules:** No copy.js in main. No secrets in commits. Script commit = script + Report scaffold + CHANGELOG.

## 8. Backend & Frontend
**API Testing:** k6 http.get/post, check() assertions, Trend/Rate/Counter custom metrics.
**Auth:** Bearer token via setup()→default(), OAuth2/OTP for 2FA suites.
**Browser:** k6 browser module available. PT focus = API-level, not UI automation.
**Rendering:** TTFB (server), TTI (frontend). PT measures TTFB + API P95, not TTI.

## 9. Test Management
**Template:** Suite, Version, RUNBY, ENV, Target (Onprem/Oncloud), VUs, Duration, BPs, Thresholds.
**Tools:** Jira (bugs), TestRail/qTest/Zephyr (test cases), pt-audit (immutable run log).

## 10. Aturan Agent
**Generate script:** `Script/<suite>/<Script>.js`, export default+setup, group('BPxxx_step'), custom metric naming: duration_<slug>, error_rate_<slug>, sample_<slug>. Never hardcode tokens.
**Analyze results:** Parse artifacts/results/summary.json. Compare P95 vs THRESHOLD_AVG_MS, error_rate vs THRESHOLD_ERR_PCT, RPS vs THRESHOLD_MIN_RPS. Status: PASSED / PASSED with Warnings (RPS only) / FAILED.
**Write config:** Primary = configs/pt.env. Never secrets in example file.
**Folder convention:** Script/<Suite>/<Suite>.js + _LoadTest.sh + _Regression.sh + Web/Android/iOS/ subdirs. Report/<Suite>/<Platform>/<BP>/<RunBy>/.

## 11. Struktur Folder
```
growin_performancetest/
├── pt-menu.sh                    ← Main TUI entrypoint
├── k6                            ← k6 binary
├── configs/pt.env                ← Primary config (targets, thresholds, webhooks)
├── Script/                       ← ALL test scripts
│   └── <Suite>/<Suite>.js + shell runners + Web/Android/iOS/
├── Report/                       ← HTML reports per suite/platform/bp/runby
├── Helper/                       ← Shared k6 modules
├── lib/bash/pt_auth_client.sh    ← Auth gate
├── lib/python/db.py              ← SQLite schema
├── lib/webhook/                  ← Notifiers + parser
├── bin/                          ← CLI tools (pt-auth, pt-rbac, pt-audit, pt-lock, pt-scheduler, etc.)
├── pt-data/                      ← User state + run state
├── artifacts/results/            ← Latest summary.json
├── scheduler_cli/                ← Python cron backend
├── docs/performance-audit/       ← CI/Grafana/Jenkins checklists
├── blueprint/                    ← Architecture RFCs
├── docker-local-pt/              ← DEMO ONLY (not production target)
└── CHANGELOG.md
```

## 12. Referensi Metrik
**Percentiles:** P50 (median), P90, P95 (SLA ref — use for thresholds), P99 (worst-case outliers), Max.
**Throughput:** RPS = total_http_reqs / duration_s. TPS = RPS / num_APIs. Target RPS >= 381.
**Error:** Error Rate = failed / total × 100%. Target < 0.1%. k6: http_req_failed.
**Resource (pt-resmon):** CPU (psutil), Memory, Health score = CPU×0.4 + Mem×0.3 + Load×0.3. Alert < 60.

**Custom k6 Metric Pattern:**
```js
const duration_x = new Trend('duration_BP001_01_x', true);
const error_rate_x = new Rate('error_rate_BP001_01_x');
const sample_x = new Counter('sample_BP001_01_x');
group('BP001_01_X', () => {
  const t0 = Date.now(); const res = http.post(url, payload);
  duration_x.add(Date.now() - t0); error_rate_x.add(res.status !== 200);
  sample_x.add(1); check(res, {'200': r => r.status === 200});
});
```

## Performance Testing
Performance Testing is a subset of Performance Engineering. It evaluates system behavior under extreme conditions. Main KPIs: response time, throughput, memory, CPU.

**3S Objectives:** Speed, Scalability, Stability.

**7 Types:** Load, Stress, Spike, Endurance, Volume, Scalability, Capacity.
