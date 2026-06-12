import { readFileSync, existsSync } from 'fs';
import { parseArgs } from 'util';

const { values: args, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    webhook: { type: 'string' },
    'run-no': { type: 'string' },
  },
  allowPositionals: true,
  strict: false,
});

const RESULT_PATH = positionals[0];
const url = args.webhook;
const runNo = args['run-no'] || '1';

if (!url || !RESULT_PATH || !existsSync(RESULT_PATH)) process.exit(0);

let result;
try { result = JSON.parse(readFileSync(RESULT_PATH, 'utf8')); }
catch(e) { process.exit(0); }

function parseCustomMetrics(custom) {
  const apis = {};
  for (const [key, val] of Object.entries(custom || {})) {
    let prefix = null, rest = null;
    for (const p of ['duration_', 'waiting_', 'error_rate_', 'error_count_', 'sample_']) {
      if (key.startsWith(p)) { prefix = p.slice(0,-1); rest = key.slice(p.length); break; }
    }
    if (!prefix) continue;
    if (!apis[rest]) apis[rest] = { name: rest };
    const count = val.count ?? 0, p95 = val.p95 ?? 0;
    if (prefix === 'duration') { apis[rest].dur_p95=p95; apis[rest].dur_avg=val.avg??p95; apis[rest].dur_max=val.max??p95; apis[rest].dur_min=val.min??0; }
    if (prefix === 'error_rate') { apis[rest].err_rate=p95; apis[rest].err_count=count; }
    if (prefix === 'error_count') apis[rest].err_exact=count;
    if (prefix === 'sample') apis[rest].samples=count;
  }
  return Object.values(apis);
}

const apiRows = parseCustomMetrics(result.custom_metrics).sort((a, b) => a.name.localeCompare(b.name));
const totalReqs = result.http_reqs || 0;
const p95All = result.http_req_duration_p95 || 0;
const statusOk = (result.http_req_failed_rate || 0) === 0 && (result.checks_failed || 0) === 0;

const cardBody = [
  {
    "type": "TextBlock",
    "text": `🧪 Performance Test Results — ${result.suite || 'Direct Run'}`,
    "weight": "Bolder",
    "size": "Large"
  },
  {
    "type": "FactSet",
    "facts": [
      { "title": "Suite:", "value": result.suite || "—" },
      { "title": "Target:", "value": result.base_url || "—" },
      { "title": "Mode:", "value": result.mode || "—" }
    ],
    "spacing": "Medium"
  }
];

if (apiRows.length === 0) {
  const failed = !statusOk;
  cardBody.push({
    "type": "Container",
    "style": failed ? "attention" : "good",
    "items": [
      {
        "type": "ColumnSet",
        "columns": [
          {
            "type": "Column",
            "width": "stretch",
            "items": [
              { "type": "TextBlock", "text": `${result.suite} / ${result.scenario}`, "weight": "Bolder" },
              { "type": "TextBlock", "text": `Samples: ${totalReqs}  |  Avg: ${p95All.toFixed(1)}ms  |  P95: ${p95All.toFixed(1)}ms`, "isSubtle": true, "size": "Small" }
            ]
          },
          {
            "type": "Column",
            "width": "auto",
            "verticalContentAlignment": "Center",
            "items": [
              { "type": "TextBlock", "text": failed ? "FAILED" : "PASSED", "color": failed ? "Attention" : "Good", "weight": "Bolder" }
            ]
          }
        ]
      }
    ]
  });
} else {
  apiRows.forEach(api => {
    const errRate = api.err_rate != null ? (api.err_rate * 100).toFixed(2) : "0.00";
    const failed = parseFloat(errRate) > 0;
    const displayName = api.name.replace(/_/g, ' ').replace(/^BP\d+\s+/, '');
    
    cardBody.push({
      "type": "Container",
      "style": failed ? "attention" : "good",
      "bleed": true,
      "items": [
        {
          "type": "ColumnSet",
          "columns": [
            {
              "type": "Column",
              "width": "stretch",
              "items": [
                { "type": "TextBlock", "text": displayName, "weight": "Bolder", "wrap": true },
                { "type": "TextBlock", "text": `Samples: ${api.samples || 0}  |  Avg: ${(api.dur_avg || 0).toFixed(1)}ms  |  Max: ${(api.dur_max || 0).toFixed(1)}ms  |  P95: ${(api.dur_p95 || 0).toFixed(1)}ms`, "isSubtle": true, "size": "Small" }
              ]
            },
            {
              "type": "Column",
              "width": "auto",
              "verticalContentAlignment": "Center",
              "items": [
                { "type": "TextBlock", "text": failed ? `${errRate}% ERR` : "PASSED", "color": failed ? "Attention" : "Good", "weight": "Bolder" }
              ]
            }
          ]
        }
      ],
      "spacing": "Small"
    });
  });
}

const body = JSON.stringify({
  "type": "message",
  "attachments": [
    {
      "contentType": "application/vnd.microsoft.card.adaptive",
      "content": {
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "type": "AdaptiveCard",
        "version": "1.4",
        "body": cardBody
      }
    }
  ]
});

const u = new URL(url);
const isH = u.protocol === 'https:';
const hReq = isH ? (await import('https')).request : (await import('http')).request;
const req = hReq({ hostname: u.hostname, port: u.port || (isH?443:80), path: u.pathname+u.search, method: 'POST', headers: {'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body)} });
req.write(body); req.end();
