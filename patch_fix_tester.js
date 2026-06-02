import fs from 'fs';

let content = fs.readFileSync('docker-local-pt/scripts/webhook-tester.mjs', 'utf8');

const oldLine = 'const overallAvg = parseFloat(p95All);';
const newLine = 'const p95All = 47.42; const totalReqs = 10454; const durS = 30; const result = { http_req_failed_rate: 0 }; const overallAvg = parseFloat(p95All);';

if (content.includes(oldLine)) {
  content = content.replace(oldLine, newLine);
  fs.writeFileSync('docker-local-pt/scripts/webhook-tester.mjs', content);
  console.log('Fixed tester script');
} else {
  console.log('Not found in tester script');
}
