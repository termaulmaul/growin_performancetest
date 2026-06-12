# Banner_Promo BP001 — Smoke Plan

## Mode A — original
```bash
k6 run Script/Growin_Banner_Promo/Growin_Banner_Promo.js \\
  -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=30s -e NUMSTART=1 \\
  -e SCENARIO=BP001 -e PLATFORM=iOS -e DEBUG=true \\
  --summary-export=report-orig.json
```

## Mode B — enhanced via throwaway runner
Create temp file (do NOT commit) `.tmp/Growin_Banner_Promo_enchange_BP001_smoke.js`:
```js
import { BP001 as BP001_iOS } from "../Script/Growin_Banner_Promo/iOS/enchange_BP001.js";
// reuse minimal options + setup from original runner; import getBaseUrl + getUserCredentials + getDefaultHeaders
// ...
export function BP001(data) { return BP001_iOS(data); }
export const options = { vus: 1, duration: '30s' };
export function setup() { /* mirror original setup() */ }
```
Run:
```bash
k6 run .tmp/Growin_Banner_Promo_enchange_BP001_smoke.js \\
  -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=30s -e NUMSTART=1 \\
  -e SCENARIO=BP001 -e PLATFORM=iOS -e DEBUG=true \\
  --summary-export=report-enc.json
```

## Compare
- diff request count per endpoint
- diff status code distribution
- diff `duration_*` series names
- diff `error_rate_*` series names
- diff `sample_*` series names
- diff `waiting_*` (added in enhanced; should populate)
- diff check failures

## Cleanup
`rm .tmp/Growin_Banner_Promo_enchange_BP001_smoke.js`
