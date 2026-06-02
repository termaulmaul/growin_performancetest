import fs from 'fs';

let content = fs.readFileSync('docker-local-pt/scripts/webhook-tester.mjs', 'utf8');

const oldLine = 'if (apiRows.length > 0) {';
const newLine = 'const apiRows = [{name: "Marketdata_DailyTrade", samples: 10454, dur_avg: 47.4, dur_min: 12.1, dur_max: 641, dur_p95: 57.3, err_rate: 0}]; if (apiRows.length > 0) {';

if (content.includes(oldLine)) {
  content = content.replace(oldLine, newLine);
  fs.writeFileSync('docker-local-pt/scripts/webhook-tester.mjs', content);
  console.log('Fixed tester script');
} else {
  console.log('Not found in tester script');
}
