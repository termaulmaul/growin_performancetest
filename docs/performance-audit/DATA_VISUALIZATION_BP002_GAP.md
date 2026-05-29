# Data_Visualization BP002 Gap

## State
- `Script/Growin_Data_Visualization/Web/BP002.js` does **NOT** exist.
- Original `Growin_Data_Visualization.js:90` references `BP002_Web` without import.
- Enhanced runner `enchange_Growin_Data_Visualization.js:76` carries inline fail-fast stub.

## Behavior
- Original under `SCENARIO=BP002 PLATFORM=Web`: ReferenceError at init.
- Enhanced under same env: explicit `throw new Error('BP002_Web is not implemented/imported ...')` at scenario dispatch.

## Root Fix
1. Implement `Script/Growin_Data_Visualization/Web/BP002.js` exporting `function BP002(data)`.
2. Add import: `import { BP002 as BP002_Web } from "./Web/BP002.js";`
3. Remove fail-fast stub in enchange.

## Decision
- Not a regression introduced by enhancement.
- Keep fail-fast guard.
- Treat as carryover gap; track separately.
