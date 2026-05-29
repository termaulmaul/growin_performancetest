# Grafana Compare Checklist

Compare original vs enhanced run_id/build_id.

## Required Series

- duration_*
- error_rate_*
- sample_*
- error_count_*
- waiting_*  (new, expected empty in original)
- rps_*

## Compare

| Metric Group | Must Match | Allowed Difference |
|---|---|---|
| duration_* names | exact same series names | none |
| error_rate_* names | exact same series names | none |
| sample_* names | exact same series names | none |
| error_count_* names | exact same series names | none |
| rps_* names | exact same series names | none |
| waiting_* | populated in enhanced, empty in original | additive only |
| request count | same total per endpoint | ± small only |
| RPS | similar | no load-shape drift |
| p95/p99 | comparable | investigate big deltas |
| error rate | no increase | investigate |

## Procedure
1. Tag both runs with distinct `run_id` env or build_id.
2. Open Grafana k6 dashboard for both runs.
3. Diff series names panel by panel.
4. Export PNG/JSON snapshot for audit trail.

Do NOT claim Grafana passed without snapshot.
