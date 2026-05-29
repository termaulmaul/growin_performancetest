# Banner_Promo iOS BP001 — Promotion Checklist

## Static Status

| Check | Status | Notes |
|---|---|---|
| Export names | PASS | `BP001` present in both (1/1) |
| Metric prefixes | PARTIAL_STATIC_ONLY | enhanced uses template factory; literal count: original=156, enhanced=6 |
| Metric final names | UNVERIFIED | requires runtime resolution of `${code}_${name}` |
| Endpoint count | UNVERIFIED | original=24 literal paths, enhanced=0 literal paths (paths in config table) |
| Method parity | UNVERIFIED | manual review required |
| Path parity | UNVERIFIED | enhanced paths not statically extractable |
| Header parity | UNVERIFIED | inspect getDefaultHeaders usage |
| Payload parity | UNVERIFIED | manual review |
| Query parity | UNVERIFIED | manual review |
| Sleep/load pacing | PASS | jitter re-centered to mean 0.25s |
| Success semantics | UNVERIFIED | check() conditions need diff |

## Runtime Required

- Original INT smoke (30s, USER=1)
- Enhanced INT smoke (30s, USER=1, throwaway runner)
- Request count compare
- Status code compare
- Metric series compare (duration_*, error_rate_*, sample_*, error_count_*, waiting_*)
- Grafana panel compare

## Go / No-Go

- GO only if: request contract + metric contract + Jenkins env contract match.
- Current decision: **HOLD** until runtime parity proven.
