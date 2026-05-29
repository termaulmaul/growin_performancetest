#!/usr/bin/env node
// YAML → JSON renderer. Reads YAML path arg; writes JSON to stdout.
// Optional: BASE_URL_OVERRIDE env injects/overrides base_url on the top-level object.
//
// Usage:
//   node docker/pt/scripts/render-bp-config.mjs "Script/Growin_PT_Dev[ToDo]/Configs/BP001.yaml" > /tmp/bp.json
//
// Requires `js-yaml` if installed; falls back to minimal YAML parse for the BP_CONFIG schema only.

import fs from 'node:fs';
import path from 'node:path';

const file = process.argv[2];
if (!file) {
  console.error('Usage: render-bp-config.mjs <yaml-path>');
  process.exit(2);
}
const raw = fs.readFileSync(file, 'utf8');

async function parseYaml(s) {
  try {
    const yaml = await import('js-yaml');
    return yaml.load(s);
  } catch {
    // Minimal fallback for simple BP_CONFIG YAML (no anchors/refs/multidoc).
    return miniYaml(s);
  }
}

function miniYaml(src) {
  const lines = src.replace(/\r\n/g, '\n').split('\n').map(l => l.replace(/\s+#.*$/, '')).filter(l => l.trim().length && !l.trim().startsWith('#'));
  const root = {};
  const stack = [{ indent: -1, val: root, type: 'map' }];
  for (const raw of lines) {
    const indent = raw.match(/^ */)[0].length;
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const cur = stack[stack.length - 1];
    const line = raw.trim();
    if (line.startsWith('- ')) {
      if (!Array.isArray(cur.val)) {
        const parent = stack[stack.length - 2];
        const lastKey = parent.lastKey;
        parent.val[lastKey] = [];
        cur.val = parent.val[lastKey];
        cur.type = 'list';
      }
      const item = {};
      cur.val.push(item);
      const rest = line.slice(2);
      if (rest.includes(':')) {
        const [k, ...v] = rest.split(':');
        const val = v.join(':').trim();
        item[k.trim()] = coerce(val);
        stack.push({ indent, val: item, type: 'map', lastKey: k.trim() });
      } else {
        stack.push({ indent, val: item, type: 'map' });
      }
      continue;
    }
    if (line.endsWith(':')) {
      const key = line.slice(0, -1).trim();
      cur.val[key] = {};
      cur.lastKey = key;
      stack.push({ indent, val: cur.val[key], type: 'map' });
    } else if (line.includes(':')) {
      const [k, ...v] = line.split(':');
      const val = v.join(':').trim();
      cur.val[k.trim()] = coerce(val);
      cur.lastKey = k.trim();
    }
  }
  return root;
}

function coerce(v) {
  if (v === '' || v === 'null') return null;
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+$/.test(v)) return Number(v);
  if (/^-?\d+\.\d+$/.test(v)) return Number(v);
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
  return v;
}

const obj = await parseYaml(raw);
const override = process.env.BASE_URL_OVERRIDE;
if (override) obj.base_url = override;
process.stdout.write(JSON.stringify(obj));
