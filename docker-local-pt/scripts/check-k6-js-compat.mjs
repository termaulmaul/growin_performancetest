#!/usr/bin/env node
/**
 * Scan Script/ for k6 0.51-incompatible syntax (optional chaining, nullish coalescing).
 * Usage: node docker-local-pt/scripts/check-k6-js-compat.mjs [--suite Growin_2FA]
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('Script');
const suiteFilter = process.argv.includes('--suite')
  ? process.argv[process.argv.indexOf('--suite') + 1]
  : null;
const findings = [];

function scanFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    if (/\?\./.test(line)) findings.push({ file, line: i + 1, kind: 'optional-chaining', snippet: line.trim().slice(0, 120) });
    if (/\?\?/.test(line)) findings.push({ file, line: i + 1, kind: 'nullish-coalescing', snippet: line.trim().slice(0, 120) });
  });
}

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (name.endsWith('.js') && !name.includes('copy')) scanFile(p);
  }
}

if (suiteFilter) {
  const sp = path.join(root, suiteFilter);
  if (fs.existsSync(sp)) walk(sp);
} else {
  walk(root);
}

const outPath = 'docker-local-pt/results/k6-js-compat-findings.json';
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), count: findings.length, findings }, null, 2));

console.log(`# k6 JS compat findings: ${findings.length}`);
console.log(`# report: ${outPath}`);
for (const f of findings.slice(0, 50)) {
  console.log(`${f.file}:${f.line} [${f.kind}] ${f.snippet}`);
}
if (findings.length > 50) console.log(`... +${findings.length - 50} more`);

process.exit(findings.length > 0 ? 1 : 0);
