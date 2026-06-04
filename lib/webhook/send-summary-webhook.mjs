import { readFileSync, existsSync } from 'fs';
import { parseArgs } from 'util';

const { values: args, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    webhook: { type: 'string' },
    type: { type: 'string' },
    'run-no': { type: 'string' },
  },
  allowPositionals: true,
  strict: false,
});

const RESULT_PATH = positionals[0];
const type = args.type;
const url = args.webhook;

if (!type || !url || !RESULT_PATH || !existsSync(RESULT_PATH)) process.exit(0);

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

function parseDuration(d) {
  if (!d) return 30;
  const m = String(d).match(/^(\d+)(s|m|h)$/);
  if (!m) return 30;
  const n = parseInt(m[1], 10);
  if (m[2] === 's') return n;
  if (m[2] === 'm') return n * 60;
  if (m[2] === 'h') return n * 3600;
  return 30;
}

const apiRows = parseCustomMetrics(result.custom_metrics).sort((a, b) => a.name.localeCompare(b.name));
const durS = parseDuration(result.duration || '30s');
const totalReqs = result.http_reqs || 0;
const p95All = result.http_req_duration_p95 || 0;
const targetUrl = result.base_url || (result.mode === 'Oncloud' ? 'Oncloud GCP IAP vm-pt-ksix-0' : result.mode === 'Onprem' ? 'Onprem 10.82.15.72 → 10.184.120.48' : 'Unknown Target');
const nowTs = new Date();
const endTs = nowTs.toISOString().replace('T',' ').slice(0,19);
const startTs = result.start_ts || new Date(nowTs.getTime() - durS * 1000).toISOString().replace('T',' ').slice(0,19);

// Thresholds defaults
const tAvg = 200;
const tErr = 0.1;
const tRps = 381;

const overallAvg = parseFloat(p95All);
const overallErr = (result.http_req_failed_rate || 0) * 100;
const totalRpsVal = durS > 0 ? (totalReqs / durS) : 0;
const avgTps = apiRows.length > 0 ? (totalRpsVal / apiRows.length) : totalRpsVal;

const avgOk = overallAvg < tAvg;
const errOk = overallErr < tErr;
const rpsOk = totalRpsVal >= tRps;

let statusText = "";
let statusColor = "";
let reason = "";

if (avgOk && errOk && rpsOk) {
    statusText = "## ✅ PASSED";
    statusColor = "Good";
    reason = `All metrics meet thresholds.`;
} else if (avgOk && errOk && !rpsOk) {
    statusText = "## ⚠️ PASSED with Warnings";
    statusColor = "Warning";
    reason = `Avg (${overallAvg.toFixed(1)}ms <${tAvg}ms) & Err% (${overallErr.toFixed(2)}% <${tErr}%) OK, but RPS (${totalRpsVal.toFixed(1)} < ${tRps}) below threshold.`;
} else {
    statusText = "## ❌ FAILED";
    statusColor = "Attention";
    reason = `Threshold violation: `;
    if (!avgOk) reason += `Avg (${overallAvg.toFixed(1)}ms >= ${tAvg}ms). `;
    if (!errOk) reason += `Err% (${overallErr.toFixed(2)}% >= ${tErr}%). `;
}

let body = '';
let headers = { 'Content-Type': 'application/json' };

const text = `🧪 **growin_performancetest — PT Run Report**\n` +
             `**Status:** ${statusText.replace(/^##\s*/, '')}\n` +
             `**Reason:** ${reason}\n` +
             `**Suite:** ${result.suite || 'Direct Run'} / ${result.scenario || 'BP001'}\n` +
             `**Target:** ${targetUrl}\n` +
             `**Run by:** ${process.env.PT_USER || 'qacentral'}\n` +
             `**Start → End:** ${startTs} → ${endTs}\n` +
             `**Avg TPS:** ${avgTps.toFixed(2)}`;

if (type === 'teams') {
  const cardBody = [
    {
      "type": "TextBlock",
      "text": "📊 PT Run Report",
      "weight": "Bolder",
      "size": "Large",
      "wrap": true
    },

    {
      "type": "FactSet",
      "facts": [
        { "title": "Suite", "value": `${result.suite || 'Direct Run'} / ${result.scenario || 'BP001'}` },
        { "title": "Target", "value": targetUrl },
        { "title": "Run by", "value": process.env.PT_USER || "qacentral" },
        { "title": "Execution", "value": `${result.duration || '30s'} duration` },
        { "title": "Start", "value": startTs },
        { "title": "End", "value": endTs },
        { "title": "Avg TPS", "value": avgTps.toFixed(2) }
      ]
    },
    {
      "type": "TextBlock",
      "text": statusText.replace(/^##\s*/, ''),
      "color": statusColor,
      "wrap": true
    },
    {
      "type": "TextBlock",
      "text": `**Reason:** ${reason}`,
      "wrap": true,
      "spacing": "Small"
    },
    {
      "type": "TextBlock",
      "text": "📈 **Global Summary vs Thresholds**",
      "weight": "Bolder",
      "spacing": "Medium"
    },
    {
      "type": "ColumnSet",
      "columns": [
        {
          "type": "Column",
          "width": "stretch",
          "items": [
            { "type": "TextBlock", "text": "**Samples**", "weight": "Bolder", "size": "Small" },
            { "type": "TextBlock", "text": String(totalReqs), "size": "Small", "spacing": "None" }
          ]
        },
        {
          "type": "Column",
          "width": "stretch",
          "items": [
            { "type": "TextBlock", "text": "**Avg (P95)**", "weight": "Bolder", "size": "Small" },
            { "type": "TextBlock", "text": `${overallAvg.toFixed(2)} ms`, "size": "Small", "spacing": "None", "color": avgOk ? "Good" : "Attention" },
            { "type": "TextBlock", "text": `(<${tAvg}ms)`, "size": "Small", "isSubtle": true, "spacing": "None" }
          ]
        },
        {
          "type": "Column",
          "width": "stretch",
          "items": [
            { "type": "TextBlock", "text": "**Error Rate**", "weight": "Bolder", "size": "Small" },
            { "type": "TextBlock", "text": `${overallErr.toFixed(2)}%`, "size": "Small", "spacing": "None", "color": errOk ? "Good" : "Attention" },
            { "type": "TextBlock", "text": `(<${tErr}%)`, "size": "Small", "isSubtle": true, "spacing": "None" }
          ]
        },
        {
          "type": "Column",
          "width": "stretch",
          "items": [
            { "type": "TextBlock", "text": "**Total RPS**", "weight": "Bolder", "size": "Small" },
            { "type": "TextBlock", "text": totalRpsVal.toFixed(2), "size": "Small", "spacing": "None", "color": rpsOk ? "Good" : "Attention" },
            { "type": "TextBlock", "text": `(>=${tRps})`, "size": "Small", "isSubtle": true, "spacing": "None" }
          ]
        }
      ]
    }
  ];

  if (apiRows.length > 0) {
    cardBody.push({
      "type": "TextBlock",
      "text": "📋 **Per-API Performance (key metrics)**",
      "weight": "Bolder",
      "spacing": "Medium"
    });

    const rowsContainer = {
      "type": "Container",
      "style": "emphasis",
      "items": [
        {
          "type": "ColumnSet",
          "columns": [
            { "type": "Column", "width": "5", "items": [{ "type": "TextBlock", "text": "**#**", "size": "Small", "weight": "Bolder" }] },
            { "type": "Column", "width": "35", "items": [{ "type": "TextBlock", "text": "**API**", "size": "Small", "weight": "Bolder", "wrap": true }] },
            { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "**Samp**", "size": "Small", "weight": "Bolder" }] },
            { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "**Avg**", "size": "Small", "weight": "Bolder" }] },
            { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "**P95**", "size": "Small", "weight": "Bolder" }] },
            { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "**Err%**", "size": "Small", "weight": "Bolder" }] },
            { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "**RPS**", "size": "Small", "weight": "Bolder" }] },
            { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "**TPS**", "size": "Small", "weight": "Bolder" }] }
          ]
        }
      ]
    };

    apiRows.forEach((api, idx) => {
      const errRate = api.err_rate != null ? (api.err_rate * 100).toFixed(1) : "0.0";
      const failed = parseFloat(errRate) >= tErr;
      let displayName = api.name.replace(/_/g, ' ').replace(/^BP\d+\s+/, '').replace(/^001\s+01\s+\d+\s+/, '');
      if (displayName.length > 25) displayName = displayName.substring(0, 22) + '...';
      const rps = durS > 0 ? ((api.samples || 0) / durS).toFixed(1) : "—";
      const tps = apiRows.length > 0 ? (parseFloat(rps) / apiRows.length).toFixed(1) : "—";

      rowsContainer.items.push({
        "type": "ColumnSet",
        "spacing": "Small",
        "columns": [
          { "type": "Column", "width": "5", "items": [{ "type": "TextBlock", "text": String(idx + 1), "size": "Small" }] },
          { "type": "Column", "width": "35", "items": [{ "type": "TextBlock", "text": displayName, "size": "Small", "wrap": true, "weight": "Bolder" }] },
          { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": String(api.samples || 0), "size": "Small" }] },
          { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": (api.dur_avg || 0).toFixed(1), "size": "Small" }] },
          { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": (api.dur_p95 || 0).toFixed(1), "size": "Small" }] },
          { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": errRate + "%", "size": "Small", "color": failed ? "Attention" : "Good" }] },
          { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": String(rps), "size": "Small", "color": parseFloat(rps) < tRps ? "Attention" : "Default" }] },
          { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": String(tps), "size": "Small" }] }
        ]
      });
    });
    cardBody.push(rowsContainer);
  }

  body = JSON.stringify({
    "type": "message",
    "attachments": [
      {
        "contentType": "application/vnd.microsoft.card.adaptive",
        "content": {
          "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
          "type": "AdaptiveCard",
          "version": "1.5",
          "body": cardBody
        }
      }
    ]
  });

} else if (type === 'brrr') {
  body = text;
  headers = { 'Content-Type': 'text/plain; charset=utf-8' };
} else {
  // Plain text table for Discord / Telegram
  let txt = `🧪 **PT Run Report** — ${result.suite}\n`;
  txt += `Status: ${statusText.replace('## ','')} | Target: ${targetUrl} | Run by: ${process.env.PT_USER || 'qacentral'}\n`;
  txt += `Start: ${startTs} → End: ${endTs} | Avg TPS: ${avgTps.toFixed(2)}\n\n`;
  txt += "```text\n";
  txt += "API | Samp | Avg | P95 | Err% | RPS | TPS\n";
  txt += "---------------------------------------------\n";
  if (apiRows.length === 0) {
    txt += `Total | ${totalReqs} | ${p95All.toFixed(1)} | ${p95All.toFixed(1)} | ${((result.http_req_failed_rate||0)*100).toFixed(1)}% | ${durS>0?(totalReqs/durS).toFixed(1):'—'} | ${avgTps.toFixed(1)}\n`;
  } else {
    for (const r of apiRows) {
      let n = r.name.replace(/^BP\d+_|001_01_/g,'').substring(0,12);
      const rps = durS > 0 ? ((r.samples||0)/durS).toFixed(1) : '—';
      const tps = apiRows.length > 0 ? (parseFloat(rps)/apiRows.length).toFixed(1) : '—';
      txt += `${n.padEnd(12)} | ${String(r.samples||0).padEnd(4)} | ${(r.dur_avg||r.dur_p95||0).toFixed(0).padStart(3)} | ${(r.dur_p95||0).toFixed(0).padStart(3)} | ${(r.err_rate!=null?r.err_rate*100:0).toFixed(1)}% | ${rps} | ${tps}\n`;
    }
  }
  txt += "```";

  if (type === 'discord') {
    body = JSON.stringify({ content: txt });
  } else if (type === 'telegram') {
    const m = url.match(/[?&]chat_id=([^&]+)/);
    body = JSON.stringify({ chat_id: m?m[1]:'', text: txt, parse_mode: 'Markdown' });
  }
}

const u = new URL(url);
const isH = u.protocol === 'https:';
const hReq = isH ? (await import('https')).request : (await import('http')).request;
const req = hReq({ hostname: u.hostname, port: u.port || (isH?443:80), path: u.pathname+u.search, method: 'POST', headers: {...headers, 'Content-Length': Buffer.byteLength(body)} });
req.write(body); req.end();
