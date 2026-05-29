#!/usr/bin/env node
/**
 * Discover PT scenarios for mock sweep.
 * Usage:
 *   node docker-local-pt/scripts/list-scenarios.mjs
 *   node docker-local-pt/scripts/list-scenarios.mjs --json
 *   node docker-local-pt/scripts/list-scenarios.mjs --suite Growin_Calendar
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('Script');
const args = process.argv.slice(2);
const asJson = args.includes('--json');
const suiteFilter = args.includes('--suite') ? args[args.indexOf('--suite') + 1] : null;

function configDir(suitePath) {
  for (const c of ['Configs', 'configs', 'Config']) {
    const p = path.join(suitePath, c);
    if (fs.existsSync(p)) return c;
  }
  return null;
}

function yamlForScenario(suitePath, cfg, scenario) {
  if (!cfg) return null;
  const base = path.join(suitePath, cfg, `${scenario}.yaml`);
  if (fs.existsSync(base)) return base;
  const yml = path.join(suitePath, cfg, `${scenario}.yml`);
  return fs.existsSync(yml) ? yml : null;
}

function scriptExists(suite, platform, scenario, variant) {
  const prefix = variant === 'enchange' ? 'enchange_' : '';
  const rel = path.join('Script', suite, platform, `${prefix}${scenario}.js`);
  return fs.existsSync(rel) ? rel : null;
}

const rows = [];
for (const suite of fs.readdirSync(root).sort()) {
  if (suiteFilter && suite !== suiteFilter) continue;
  const suitePath = path.join(root, suite);
  if (!fs.statSync(suitePath).isDirectory()) continue;
  const cfg = configDir(suitePath);
  const platforms = ['Web', 'iOS', 'Android'].filter((p) => fs.existsSync(path.join(suitePath, p)));
  if (!platforms.length) continue;

  const scenarios = new Set();
  for (const plat of platforms) {
    for (const f of fs.readdirSync(path.join(suitePath, plat))) {
      const m = f.match(/^(?:enchange_)?(BP\d+[^.]*)\.js$/);
      if (m) scenarios.add(m[1]);
    }
  }

  for (const scenario of [...scenarios].sort()) {
    for (const platform of platforms) {
      for (const variant of ['original', 'enchange']) {
        const script = scriptExists(suite, platform, scenario, variant);
        if (!script) continue;
        const yaml = yamlForScenario(suitePath, cfg, scenario);
        const mockReady = Boolean(script) && (!cfg || yaml || suite.includes('PT_Dev'));
        rows.push({
          suite,
          runner: 'docker-local-pt/scripts/k6-mock-runner.js',
          platform,
          scenario,
          variant,
          config: yaml ? yaml.replace(/\\/g, '/') : '-',
          script: script.replace(/\\/g, '/'),
          mockReady,
        });
      }
    }
  }
}

if (asJson) {
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

const cols = [
  ['Suite', 28],
  ['Platform', 8],
  ['Scenario', 10],
  ['Variant', 10],
  ['Config', 36],
  ['MockReady', 9],
];
const pad = (s, n) => String(s).slice(0, n).padEnd(n);
const line = (cells) => cols.map(([_, w], i) => pad(cells[i], w)).join(' | ');
console.log(line(cols.map(([h]) => h)));
console.log(cols.map(([_, w]) => '-'.repeat(w)).join('-|-'));
for (const r of rows) {
  console.log(
    line([
      r.suite,
      r.platform,
      r.scenario,
      r.variant,
      r.config === '-' ? '-' : path.basename(r.config),
      r.mockReady ? 'yes' : 'no',
    ])
  );
}
console.error(`\n# total rows: ${rows.length}`);
