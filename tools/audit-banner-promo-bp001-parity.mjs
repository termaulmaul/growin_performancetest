#!/usr/bin/env node
import fs from 'node:fs';

const ORIG = 'Script/Growin_Banner_Promo/iOS/BP001.js';
const ENC  = 'Script/Growin_Banner_Promo/iOS/enchange_BP001.js';
const OUT  = 'Script/Growin_Banner_Promo/iOS/enchange_BP001_parity_audit.md';

const o = fs.readFileSync(ORIG, 'utf8');
const e = fs.readFileSync(ENC, 'utf8');

function setOf(s, re) { const r = new Set(); let m; while ((m = re.exec(s))) r.add(m[1]); return r; }

const metricLitRe = /new\s+(?:Counter|Trend|Rate|Gauge)\(\s*["'BTICK]([^"'BTICK]+)["'BTICK]/g;
const exportRe    = /export\s+(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/g;
const pathRe      = /["'BTICK](\/(?:user|auth|order|news|oaofinance|mutualfund|bond|portfolio|stock)\/[^"'BTICK]+)["'BTICK]/g;

const TICK = String.fromCharCode(96);
const metricLitRe2 = new RegExp(metricLitRe.source.replace(/BTICK/g, TICK), 'g');
const pathRe2 = new RegExp(pathRe.source.replace(/BTICK/g, TICK), 'g');

const oMetric = setOf(o, metricLitRe2);
const eMetric = setOf(e, metricLitRe2);
const oExports = setOf(o, exportRe);
const eExports = setOf(e, exportRe);
const oPaths = setOf(o, pathRe2);
const ePaths = setOf(e, pathRe2);

function httpCalls(s) { return (s.match(/http\.(get|post|put|patch|del|request)\(/g) || []).length; }

function prefixFamily(set) {
  const out = {};
  for (const x of set) {
    const m = x.match(/^(duration_|error_rate_|error_count_|sample_|rps_|waiting_)/);
    if (m) out[m[1]] = (out[m[1]] || 0) + 1;
  }
  return out;
}
const oFam = prefixFamily(oMetric);
const eFam = prefixFamily(eMetric);

const onlyInOrig = [...oPaths].filter(x => !ePaths.has(x));
const onlyInEnc  = [...ePaths].filter(x => !oPaths.has(x));

const FENCE = TICK + TICK + TICK;
const L = [];
L.push('# Banner_Promo iOS BP001 — Parity Audit (deterministic, PARTIAL_STATIC_ONLY)');
L.push('');
L.push('Generated: ' + new Date().toISOString());
L.push('');
L.push('## Source');
L.push('| Field | Value |');
L.push('|---|---|');
L.push('| Original | ' + TICK + ORIG + TICK + ' (' + o.split('\n').length + ' lines) |');
L.push('| Enhanced | ' + TICK + ENC + TICK + ' (' + e.split('\n').length + ' lines) |');
L.push('');
L.push('## Exports');
L.push('| Symbol | Original | Enhanced |');
L.push('|---|---|---|');
for (const sym of new Set([...oExports, ...eExports])) {
  L.push('| ' + TICK + sym + TICK + ' | ' + (oExports.has(sym) ? 'yes' : 'NO') + ' | ' + (eExports.has(sym) ? 'yes' : 'NO') + ' |');
}
L.push('');
L.push('## Metric Literals (static only)');
L.push('| Family | Original | Enhanced |');
L.push('|---|---:|---:|');
for (const fam of ['duration_','error_rate_','error_count_','sample_','rps_','waiting_']) {
  L.push('| ' + fam + ' | ' + (oFam[fam]||0) + ' | ' + (eFam[fam]||0) + ' |');
}
L.push('| **total literal** | **' + oMetric.size + '** | **' + eMetric.size + '** |');
L.push('');
L.push('Enhanced uses template factory; static extraction cannot verify final names.');
L.push('');
L.push('## Endpoint Paths (literal extraction)');
L.push('| Field | Count |');
L.push('|---|---:|');
L.push('| Original distinct paths | ' + oPaths.size + ' |');
L.push('| Enhanced distinct paths | ' + ePaths.size + ' |');
L.push('| Only in original | ' + onlyInOrig.length + ' |');
L.push('| Only in enhanced | ' + onlyInEnc.length + ' |');
L.push('');
L.push('### Only-in-original (first 30)');
L.push(onlyInOrig.slice(0,30).map(p => '- ' + p).join('\n') || '(none)');
L.push('');
L.push('### Only-in-enhanced (first 30)');
L.push(onlyInEnc.slice(0,30).map(p => '- ' + p).join('\n') || '(none)');
L.push('');
L.push('## HTTP Call Sites');
L.push('| Where | http.* call count |');
L.push('|---|---:|');
L.push('| Original | ' + httpCalls(o) + ' |');
L.push('| Enhanced | ' + httpCalls(e) + ' |');
L.push('');
L.push('## Verdict');
L.push('- Exports parity: ' + ([...oExports].every(x => eExports.has(x)) ? '**PASS**' : '**FAIL**'));
L.push('- Metric naming parity: **PARTIAL_STATIC_ONLY** (template factory not resolvable; original literal count = ' + oMetric.size + ').');
L.push('- Endpoint path parity: ' + (onlyInOrig.length === 0 && onlyInEnc.length === 0 ? '**PASS**' : '**MISMATCH**'));
L.push('- HTTP call count: ' + (httpCalls(o) === httpCalls(e) ? '**PASS**' : '**MISMATCH (' + httpCalls(o) + ' vs ' + httpCalls(e) + ')**'));
L.push('');
L.push('## Verified automatically');
L.push('- Symbol-level exports');
L.push('- Metric literal name families');
L.push('- Static string-literal endpoint set');
L.push('- http.* call site count');
L.push('');
L.push('## Needs manual review');
L.push('- Resolve metric template at runtime; confirm full set matches original ' + oMetric.size + ' names.');
L.push('- Confirm method + headers + body + query per endpoint.');
L.push('- Confirm response-callback status set unchanged.');
L.push('- Confirm data chaining (watchlistGroupID extraction) unchanged.');
L.push('');
L.push('## Blocker before runner-import swap');
L.push('1. Manual side-by-side request review.');
L.push('2. Parallel INT smoke.');
L.push('3. Grafana panel comparison.');
L.push('');
L.push('## Parallel Run Command Template');
L.push(FENCE + 'bash');
L.push('# Original');
L.push('k6 run Script/Growin_Banner_Promo/Growin_Banner_Promo.js \\');
L.push('  -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=60s -e SCENARIO=BP001 -e PLATFORM=iOS -e DEBUG=true \\');
L.push('  --summary-export=report-orig.json');
L.push('# Enhanced via throwaway runner importing enchange_BP001');
L.push('k6 run path/to/throwaway-runner.js \\');
L.push('  -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=60s -e SCENARIO=BP001 -e PLATFORM=iOS -e DEBUG=true \\');
L.push('  --summary-export=report-enc.json');
L.push('node tools/audit-enhanced-contracts.mjs');
L.push(FENCE);
L.push('');
L.push('## Recommendation');
L.push('- Safe as sibling: yes');
L.push('- Safe to swap import: **NO** until 3 blockers above cleared');
L.push('');

fs.writeFileSync(OUT, L.join('\n'));
console.log('written', OUT);
console.log('oExports=' + oExports.size, 'eExports=' + eExports.size, 'oMetric=' + oMetric.size, 'eMetric=' + eMetric.size, 'oPaths=' + oPaths.size, 'ePaths=' + ePaths.size, 'httpO/E=' + httpCalls(o) + '/' + httpCalls(e));
