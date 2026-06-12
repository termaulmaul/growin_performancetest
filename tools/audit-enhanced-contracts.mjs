#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const files = execSync("find Script -name 'enchange_*.js' ! -name '*_enhance_log*'", {encoding:'utf8'}).trim().split('\n').filter(Boolean);
const report = { generated: new Date().toISOString(), total: files.length, issues: [], summary: {} };
function ex(s, re) { const o = new Set(); let m; while ((m = re.exec(s))) o.add(m[1]); return o; }
function isRunner(f) {
  const b = path.basename(f);
  return /^enchange_(Growin_|OMO_Android|Optimize_|channelID)/.test(b) || /_LoadTest\.js$/.test(b) || /enchange_Growin_Template\.js$/.test(b);
}
let pairsOk=0, exportsOk=0, metricsOk=0, metricsSkipped=0, sleepDrift=0;

for (const f of files) {
  const base = path.basename(f).replace(/^enchange_/, '');
  const orig = path.join(path.dirname(f), base);
  if (!fs.existsSync(orig)) { report.issues.push({severity:'high', file:f, kind:'MISSING_ORIGINAL'}); continue; }
  pairsOk++;
  const o = fs.readFileSync(orig, 'utf8');
  const e = fs.readFileSync(f, 'utf8');
  const oEx = ex(o, /export\s+(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/g);
  const eEx = ex(e, /export\s+(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/g);
  const missing = [...oEx].filter(x => !eEx.has(x));
  if (missing.length) report.issues.push({severity:'critical', file:f, kind:'EXPORTS_DROPPED', missing});
  else exportsOk++;
  if (isRunner(f)) { metricsSkipped++; }
  else if (!/(duration_|error_rate_|sample_|error_count_|rps_)/.test(e)) report.issues.push({severity:'high', file:f, kind:'METRIC_PREFIX_MISSING'});
  else metricsOk++;
  if (/sleep\(0\.2 \+ Math\.random\(\) \* 0\.4\)/.test(e)) { sleepDrift++; report.issues.push({severity:'medium', file:f, kind:'SLEEP_DRIFT_MEAN_0_4'}); }
  if (/^Script\/[^/]+\/enchange_Growin_/.test(f) && /BP\d+_Android\b/.test(o) && !/BP\d+_Android\b/.test(e) && !/ANDROID_WEB_FALLBACK_WARNED|ALLOW_ANDROID_WEB_FALLBACK/.test(e)) {
    report.issues.push({severity:'medium', file:f, kind:'ANDROID_FALLBACK_SILENT'});
  }
}
report.summary = { pairsOk, exportsOk, metricsOk, metricsSkipped, sleepDrift, issueCount: report.issues.length };
fs.writeFileSync('.audit_guard_report.json', JSON.stringify(report, null, 2));
const sev = (s) => report.issues.filter(i => i.severity===s).length;
const md = `# Audit Guard Report
Generated: ${report.generated}

| Metric | Value |
|---|---:|
| Total enhanced | ${report.total} |
| Pairs OK | ${pairsOk} |
| Exports preserved | ${exportsOk} |
| Metric prefix present (scenarios) | ${metricsOk} |
| Metric check skipped (runners) | ${metricsSkipped} |
| Sleep drift | ${sleepDrift} |
| Critical | ${sev('critical')} |
| High | ${sev('high')} |
| Medium | ${sev('medium')} |

## Top issues
${report.issues.slice(0,30).map(i => '- ['+i.severity+'] '+i.kind+' — '+i.file).join('\n')}
`;
fs.writeFileSync('.audit_guard_report.md', md);
console.log(`pairs=${pairsOk}/${files.length} exportsOk=${exportsOk} scenariosOk=${metricsOk} runnersSkipped=${metricsSkipped} sleepDrift=${sleepDrift} issues=${report.issues.length}`);
process.exit(sev('critical') > 0 ? 1 : 0);
