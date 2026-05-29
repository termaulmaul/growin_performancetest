# Banner_Promo iOS BP001 — Parity Audit (deterministic, PARTIAL_STATIC_ONLY)

Generated: 2026-05-16T13:10:44.903Z

## Source
| Field | Value |
|---|---|
| Original | `Script/Growin_Banner_Promo/iOS/BP001.js` (1475 lines) |
| Enhanced | `Script/Growin_Banner_Promo/iOS/enchange_BP001.js` (410 lines) |

## Exports
| Symbol | Original | Enhanced |
|---|---|---|
| `BP001` | yes | yes |

## Metric Literals (static only)
| Family | Original | Enhanced |
|---|---:|---:|
| duration_ | 26 | 1 |
| error_rate_ | 26 | 1 |
| error_count_ | 26 | 1 |
| sample_ | 26 | 1 |
| rps_ | 26 | 1 |
| waiting_ | 26 | 1 |
| **total literal** | **156** | **6** |

Enhanced uses template factory; static extraction cannot verify final names.

## Endpoint Paths (literal extraction)
| Field | Count |
|---|---:|
| Original distinct paths | 24 |
| Enhanced distinct paths | 0 |
| Only in original | 24 |
| Only in enhanced | 0 |

### Only-in-original (first 30)
- /user/api/v2/profile/trading
- /user/api/v1/profile/personal
- /auth/api/v1/protected/password-reminder
- /auth/api/v1/protected/password-remind-later
- /user/api/v1/banner/promo
- /user/api/protected/v1/portfolio/consolidated
- /user/api/v2/watchlistgroup
- /user/api/v1/watchlist/${watchlistGroupID}
- /news/api/v2/
- /news/api/v2/categories
- /oaofinance/api/v1/quota/status/margin
- /oaofinance/api/v1/user-opening-progress-summary/monitoring/margin
- /auth/api/v1/protected/account-center/switchables
- /mutualfund/api/v1/user/risk-profile
- /auth/api/v1/protected/account-center/status
- /bond/api/v1/sbn/master/strapi/banner
- /mutualfund/api/v1/mutual-fund/list?limit=3
- /news/api/v2/?category=&is_sharia=0&items=5&page=1
- /auth/api/v1/protected/get-config
- /auth/api/v1/protected/client/selected
- /bond/api/v1/sbn/client/check/status
- /mutualfund/api/v1/user/filter
- /user/api/v1/user_settings
- /order/api/v1/order-status-action-map

### Only-in-enhanced (first 30)
(none)

## HTTP Call Sites
| Where | http.* call count |
|---|---:|
| Original | 0 |
| Enhanced | 2 |

## Verdict
- Exports parity: **PASS**
- Metric naming parity: **PARTIAL_STATIC_ONLY** (template factory not resolvable; original literal count = 156).
- Endpoint path parity: **MISMATCH**
- HTTP call count: **MISMATCH (0 vs 2)**

## Verified automatically
- Symbol-level exports
- Metric literal name families
- Static string-literal endpoint set
- http.* call site count

## Needs manual review
- Resolve metric template at runtime; confirm full set matches original 156 names.
- Confirm method + headers + body + query per endpoint.
- Confirm response-callback status set unchanged.
- Confirm data chaining (watchlistGroupID extraction) unchanged.

## Blocker before runner-import swap
1. Manual side-by-side request review.
2. Parallel INT smoke.
3. Grafana panel comparison.

## Parallel Run Command Template
```bash
# Original
k6 run Script/Growin_Banner_Promo/Growin_Banner_Promo.js \
  -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=60s -e SCENARIO=BP001 -e PLATFORM=iOS -e DEBUG=true \
  --summary-export=report-orig.json
# Enhanced via throwaway runner importing enchange_BP001
k6 run path/to/throwaway-runner.js \
  -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=60s -e SCENARIO=BP001 -e PLATFORM=iOS -e DEBUG=true \
  --summary-export=report-enc.json
node tools/audit-enhanced-contracts.mjs
```

## Recommendation
- Safe as sibling: yes
- Safe to swap import: **NO** until 3 blockers above cleared
