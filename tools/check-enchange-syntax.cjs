const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
function walk(d, o=[]) {
  for (const e of fs.readdirSync(d, {withFileTypes:true})) {
    const p = path.join(d,e.name);
    if (e.isDirectory()) walk(p,o);
    else if (e.isFile() && /^enchange_.*\.js$/.test(e.name)) o.push(p);
  }
  return o;
}
const files = walk('Script');
const fails = [];
let pass = 0;
for (const f of files) {
  try { execSync(`node --check "${f}"`, {stdio:'pipe'}); pass++; }
  catch (e) { fails.push({f, err: String(e.stderr||e.message).slice(0,300)}); }
}
console.log('PASS=' + pass + ' FAIL=' + fails.length);
for (const x of fails) console.log('FAIL:', x.f, '\n  ', x.err.replace(/\n/g,' | '));
fs.writeFileSync('.check_syntax_report.json', JSON.stringify({pass, fails}, null, 2));
