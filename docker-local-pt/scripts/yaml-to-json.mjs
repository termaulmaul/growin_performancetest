#!/usr/bin/env node
// YAML→JSON for BP_CONFIG. Minimal parser tuned for BP schema.
import fs from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('usage: yaml-to-json.mjs <yaml>'); process.exit(2); }
const raw = fs.readFileSync(file, 'utf8');

function parse(src) {
  try { return require('js-yaml').load(src); } catch {}
  // fallback
  const lines = src.replace(/\r\n/g,'\n').split('\n')
    .map(l => l.replace(/\s+#.*$/,''))
    .filter(l => l.trim().length && !l.trim().startsWith('#'));
  const root = {};
  const stack = [{ indent: -1, val: root }];
  for (const raw of lines) {
    const indent = raw.match(/^ */)[0].length;
    while (stack.length > 1 && indent <= stack[stack.length-1].indent) stack.pop();
    const cur = stack[stack.length-1];
    const line = raw.trim();
    if (line.startsWith('- ')) {
      const parent = stack[stack.length-2] || cur;
      const key = parent.lastKey;
      if (key && !Array.isArray(parent.val[key])) parent.val[key] = [];
      const arr = parent.val[key];
      const item = {};
      arr.push(item);
      const rest = line.slice(2);
      if (rest.includes(':')) {
        const [k, ...v] = rest.split(':'); item[k.trim()] = coerce(v.join(':').trim());
        stack.push({ indent, val: item, lastKey: k.trim() });
      } else {
        stack.push({ indent, val: item });
      }
      continue;
    }
    if (line.endsWith(':')) {
      const key = line.slice(0,-1).trim();
      cur.val[key] = {};
      cur.lastKey = key;
      stack.push({ indent, val: cur.val[key] });
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
  if (v === 'true') return true; if (v === 'false') return false;
  if (/^-?\d+$/.test(v)) return Number(v);
  if (/^-?\d+\.\d+$/.test(v)) return Number(v);
  if ((v.startsWith('"') && v.endsWith('"'))||(v.startsWith("'") && v.endsWith("'"))) return v.slice(1,-1);
  return v;
}

const obj = parse(raw);
const override = process.env.BASE_URL_OVERRIDE;
if (override) obj.base_url = override;
process.stdout.write(JSON.stringify(obj));
