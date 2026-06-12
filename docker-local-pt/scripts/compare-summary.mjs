#!/usr/bin/env node
/**
 * Compare original vs enchange k6 mock summaries.
 * Usage: node docker-local-pt/scripts/compare-summary.mjs a.json b.json
 */
import fs from 'node:fs';

const [aPath, bPath] = process.argv.slice(2);
if (!aPath || !bPath) {
  console.error('usage: compare-summary.mjs <original.json> <enchange.json>');
  process.exit(2);
}

function load(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function num(v) {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

function pctDelta(a, b) {
  if (a === 0 && b === 0) return 0;
  if (a === 0) return 100;
  return ((b - a) / a) * 100;
}

const a = load(aPath);
const b = load(bPath);
const keys = [
  ['iterations', (x) => num(x.iterations)],
  ['http_reqs', (x) => num(x.http_reqs)],
  ['checks_passed', (x) => num(x.checks_passed)],
  ['checks_failed', (x) => num(x.checks_failed)],
  ['http_req_failed_rate', (x) => num(x.http_req_failed_rate)],
  ['http_req_duration_p95', (x) => num(x.http_req_duration_p95)],
];

const report = {
  left: aPath,
  right: bPath,
  meta: {
    left: { suite: a.suite, scenario: a.scenario, platform: a.platform, variant: a.variant },
    right: { suite: b.suite, scenario: b.scenario, platform: b.platform, variant: b.variant },
  },
  metrics: {},
  custom_metrics: {},
  compatible: true,
  notes: [],
};

for (const [name, pick] of keys) {
  const av = pick(a);
  const bv = pick(b);
  const delta = pctDelta(av, bv);
  const ok = name === 'http_req_failed_rate' || name === 'checks_failed'
    ? bv <= av + 0.05
    : Math.abs(delta) <= 25 || (av === 0 && bv === 0);
  report.metrics[name] = { left: av, right: bv, delta_pct: Number(delta.toFixed(2)), ok };
  if (!ok) report.compatible = false;
}

const customKeys = new Set([
  ...Object.keys(a.custom_metrics || {}),
  ...Object.keys(b.custom_metrics || {}),
]);
for (const k of [...customKeys].sort()) {
  const av = a.custom_metrics?.[k]?.count ?? 0;
  const bv = b.custom_metrics?.[k]?.count ?? 0;
  const ok = av === bv || (av > 0 && Math.abs(pctDelta(av, bv)) <= 25);
  report.custom_metrics[k] = { left: av, right: bv, ok };
  if (!ok) {
    report.compatible = false;
    report.notes.push(`custom metric drift: ${k}`);
  }
}

if (a.scenario && b.scenario && a.scenario !== b.scenario) {
  report.notes.push('scenario name mismatch between files');
}
if (a.platform && b.platform && a.platform !== b.platform) {
  report.notes.push('platform mismatch between files');
}

console.log(JSON.stringify(report, null, 2));
process.exit(report.compatible ? 0 : 1);
