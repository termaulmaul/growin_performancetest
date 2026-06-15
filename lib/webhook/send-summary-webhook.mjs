import { readFileSync, existsSync } from 'fs';
import { parseArgs } from 'util';

const { values: args, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    webhook: { type: 'string' },
    type: { type: 'string' },
    'run-no': { type: 'string' },
    'utilization-url': { type: 'string' },
  },
  allowPositionals: true,
  strict: false,
});

const RESULT_PATH = positionals[0];
const type = args.type;
const url = args.webhook;
const utilizationUrl = args['utilization-url'] || '';

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
        { "title": "End", "value": endTs }
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
      "type": "Table",
      "gridStyle": "accent",
      "firstRowAsHeader": true,
      "showGridLines": true,
      "columns": [
        { "width": 1 },
        { "width": 1 },
        { "width": 1 },
        { "width": 1 },
        { "width": 1 },
        { "width": 1 }
      ],
      "rows": [
        {
          "type": "TableRow",
          "style": "accent",
          "cells": [
            { "type": "TableCell", "items": [{ "type": "TextBlock", "text": "**Samples**", "weight": "Bolder", "size": "Small" }] },
            { "type": "TableCell", "items": [{ "type": "TextBlock", "text": "**Avg**", "weight": "Bolder", "size": "Small" }] },
            { "type": "TableCell", "items": [{ "type": "TextBlock", "text": "**Avg (p95)**", "weight": "Bolder", "size": "Small" }] },
            { "type": "TableCell", "items": [{ "type": "TextBlock", "text": "**Error Rate**", "weight": "Bolder", "size": "Small" }] },
            { "type": "TableCell", "items": [{ "type": "TextBlock", "text": "**Total RPS**", "weight": "Bolder", "size": "Small" }] },
            { "type": "TableCell", "items": [{ "type": "TextBlock", "text": "**TPS**", "weight": "Bolder", "size": "Small" }] }
          ]
        },
        {
          "type": "TableRow",
          "cells": [
            { "type": "TableCell", "items": [{ "type": "TextBlock", "text": String(totalReqs), "weight": "Bolder" }] },
            { "type": "TableCell", "items": [{ "type": "TextBlock", "text": `${overallAvg.toFixed(2)} ms ${avgOk ? "✓" : "✗"}`, "color": avgOk ? "Good" : "Attention" }] },
            { "type": "TableCell", "items": [{ "type": "TextBlock", "text": `${p95All.toFixed ? p95All.toFixed(2) : p95All} ms ${avgOk ? "✓" : "✗"}`, "color": avgOk ? "Good" : "Attention" }] },
            { "type": "TableCell", "items": [{ "type": "TextBlock", "text": `${overallErr.toFixed(2)}% ${errOk ? "✓" : "✗"}`, "color": errOk ? "Good" : "Attention" }] },
            { "type": "TableCell", "items": [{ "type": "TextBlock", "text": `${totalRpsVal.toFixed(2)} ${rpsOk ? "✓" : "✗"}`, "color": rpsOk ? "Good" : "Attention" }] },
            { "type": "TableCell", "items": [{ "type": "TextBlock", "text": `${avgTps.toFixed(2)} ${rpsOk ? "✓" : "✗"}`, "color": rpsOk ? "Good" : "Attention" }] }
          ]
        }
      ]
    }
  ];

  if (apiRows.length > 0) {
    cardBody.push({
      "type": "TextBlock",
      "text": "📋 **Per-API Performance**",
      "weight": "Bolder",
      "spacing": "Medium"
    });

    // Build Table rows
    const apiTableRows = [
      {
        "type": "TableRow",
        "style": "accent",
        "cells": [
          { "type": "TableCell", "items": [{ "type": "TextBlock", "text": "**#**", "weight": "Bolder", "size": "Small" }] },
          { "type": "TableCell", "items": [{ "type": "TextBlock", "text": "**API**", "weight": "Bolder", "size": "Small" }] },
          { "type": "TableCell", "items": [{ "type": "TextBlock", "text": "**Samp**", "weight": "Bolder", "size": "Small" }] },
          { "type": "TableCell", "items": [{ "type": "TextBlock", "text": "**Avg**", "weight": "Bolder", "size": "Small" }] },
          { "type": "TableCell", "items": [{ "type": "TextBlock", "text": "**P95**", "weight": "Bolder", "size": "Small" }] },
          { "type": "TableCell", "items": [{ "type": "TextBlock", "text": "**Err%**", "weight": "Bolder", "size": "Small" }] },
          { "type": "TableCell", "items": [{ "type": "TextBlock", "text": "**RPS**", "weight": "Bolder", "size": "Small" }] },
          { "type": "TableCell", "items": [{ "type": "TextBlock", "text": "**Err**", "weight": "Bolder", "size": "Small" }] }
        ]
      }
    ];

    let totalSamples = 0, totalErrSamples = 0;
    apiRows.forEach((api, idx) => {
      const errRate = api.err_rate != null ? (api.err_rate * 100).toFixed(2) : "0.00";
      const failed = parseFloat(errRate) >= tErr;
      const samples = api.samples || 0;
      const errExact = api.err_exact || api.err_count || 0;
      const rps = durS > 0 ? (samples / durS).toFixed(2) : "0";
      totalSamples += samples;
      totalErrSamples += errExact;

      apiTableRows.push({
        "type": "TableRow",
        "cells": [
          { "type": "TableCell", "items": [{ "type": "TextBlock", "text": String(idx + 1), "size": "Small" }] },
          { "type": "TableCell", "items": [{ "type": "TextBlock", "text": api.name.replace(/_/g, ' '), "size": "Small", "wrap": true }] },
          { "type": "TableCell", "items": [{ "type": "TextBlock", "text": String(samples), "size": "Small" }] },
          { "type": "TableCell", "items": [{ "type": "TextBlock", "text": (api.dur_avg || 0).toFixed(2), "size": "Small" }] },
          { "type": "TableCell", "items": [{ "type": "TextBlock", "text": (api.dur_p95 || 0).toFixed(2), "size": "Small" }] },
          { "type": "TableCell", "items": [{ "type": "TextBlock", "text": errRate + "%", "size": "Small", "color": failed ? "Attention" : "Good" }] },
          { "type": "TableCell", "items": [{ "type": "TextBlock", "text": String(rps), "size": "Small" }] },
          { "type": "TableCell", "items": [{ "type": "TextBlock", "text": String(errExact), "size": "Small", "color": errExact > 0 ? "Attention" : "Default" }] }
        ]
      });
    });

    // TOTAL row
    const totalRps = durS > 0 ? (totalSamples / durS).toFixed(2) : "0";
    apiTableRows.push({
      "type": "TableRow",
      "style": "accent",
      "cells": [
        { "type": "TableCell", "items": [{ "type": "TextBlock", "text": "", "size": "Small" }] },
        { "type": "TableCell", "items": [{ "type": "TextBlock", "text": "**TOTAL**", "weight": "Bolder", "size": "Small" }] },
        { "type": "TableCell", "items": [{ "type": "TextBlock", "text": `**${totalSamples}**`, "weight": "Bolder", "size": "Small" }] },
        { "type": "TableCell", "items": [{ "type": "TextBlock", "text": `**${overallAvg.toFixed(2)}**`, "weight": "Bolder", "size": "Small" }] },
        { "type": "TableCell", "items": [{ "type": "TextBlock", "text": `**${p95All.toFixed ? p95All.toFixed(2) : p95All}**`, "weight": "Bolder", "size": "Small" }] },
        { "type": "TableCell", "items": [{ "type": "TextBlock", "text": `**${overallErr.toFixed(2)}%**`, "weight": "Bolder", "size": "Small" }] },
        { "type": "TableCell", "items": [{ "type": "TextBlock", "text": `**${totalRps}**`, "weight": "Bolder", "size": "Small" }] },
        { "type": "TableCell", "items": [{ "type": "TextBlock", "text": `**${totalErrSamples}**`, "weight": "Bolder", "size": "Small" }] }
      ]
    });

    cardBody.push({
      "type": "Table",
      "gridStyle": "accent",
      "firstRowAsHeader": true,
      "showGridLines": true,
      "columns": [
        { "width": 1 },
        { "width": 4 },
        { "width": 2 },
        { "width": 1 },
        { "width": 1 },
        { "width": 1 },
        { "width": 1 },
        { "width": 1 }
      ],
      "rows": apiTableRows
    });
  }

  // ── Error section (top HTTP errors if any) ──────────────────────────────
  const topErrors = result.errors || [];
  if (topErrors.length > 0) {
    cardBody.push({
      "type": "TextBlock",
      "text": `❌ **Top Errors (${topErrors.length})**`,
      "weight": "Bolder",
      "color": "Attention",
      "spacing": "Medium"
    });
    const errLines = topErrors.map(e =>
      `• [${e.status}] ${e.endpoint} — ${e.count}×`
    ).join("\n");
    cardBody.push({
      "type": "TextBlock",
      "text": errLines,
      "wrap": true,
      "spacing": "Small",
      "color": "Attention"
    });
  }

  // ── Utilization Report Button ──────────────────────────────────────────
  if (utilizationUrl) {
    cardBody.push({
      "type": "ActionSet",
      "actions": [
        {
          "type": "Action.OpenUrl",
          "title": "📈 View Utilization Report",
          "url": utilizationUrl.startsWith('http') ? utilizationUrl : `file:///${utilizationUrl}`,
          "style": "positive"
        }
      ]
    });
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
          "msteams": { "width": "Full" },
          "body": cardBody
        }
      }
    ]
  });

} else if (type === 'brrr') {
  body = text;
  headers = { 'Content-Type': 'text/plain; charset=utf-8' };
} else if (type === 'telegram') {
  // Escape HTML helper for Telegram parse_mode: HTML
  const esc = (s) => String(s || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Rich HTML format for Telegram
  let html = `<b>🧪 PT Run Report — ${esc(result.suite || 'Direct Run')}</b>\n`;
  
  let statusEmoji = avgOk && errOk && rpsOk ? '✅' : (avgOk && errOk && !rpsOk ? '⚠️' : '❌');
  html += `<b>Status:</b> ${statusEmoji} ${esc(statusText.replace(/^##\s*/, ''))}\n`;
  html += `<b>Reason:</b> ${esc(reason)}\n`;
  html += `<b>Target:</b> ${esc(targetUrl)}\n`;
  html += `<b>Run by:</b> ${process.env.PT_USER || 'qacentral'}\n`;
  html += `<b>Start → End:</b> ${startTs} → ${endTs}\n`;
  html += `<b>Avg TPS:</b> ${avgTps.toFixed(2)}\n\n`;

  html += `<b>📈 Global Summary vs Thresholds</b>\n`;
  html += `<pre>`;
  html += `Samp: ${totalReqs}\n`;
  html += `Avg : ${overallAvg.toFixed(2)} ms ${avgOk ? '✓' : '✗'}\n`;
  html += `P95 : ${p95All.toFixed ? p95All.toFixed(2) : p95All} ms ${avgOk ? '✓' : '✗'}\n`;
  html += `Err : ${overallErr.toFixed(2)}% ${errOk ? '✓' : '✗'}\n`;
  html += `RPS : ${totalRpsVal.toFixed(2)} ${rpsOk ? '✓' : '✗'}\n`;
  html += `</pre>\n`;

  if (apiRows.length > 0) {
    html += `<b>📋 Per-API Performance</b>\n`;
    html += `<pre>\n`;
    html += `API          |Samp|Avg|P95|Err% |RPS\n`;
    html += `--------------------------------------\n`;
    for (const r of apiRows) {
      let n = r.name.replace(/^BP\d+_|001_01_/g,'').substring(0,12).padEnd(12);
      const samp = String(r.samples||0).padStart(4);
      const avg = (r.dur_avg||r.dur_p95||0).toFixed(0).padStart(3);
      const p95 = (r.dur_p95||0).toFixed(0).padStart(3);
      const err = (r.err_rate!=null?r.err_rate*100:0).toFixed(1).padStart(4) + '%';
      const rps = (durS > 0 ? ((r.samples||0)/durS).toFixed(1) : '0').padStart(3);
      html += `${n}|${samp}|${avg}|${p95}|${err}|${rps}\n`;
    }
    html += `</pre>\n`;
  }
  
  const topErrors = result.errors || [];
  if (topErrors.length > 0) {
    html += `<b>❌ Top Errors (${topErrors.length})</b>\n`;
    for (const e of topErrors) {
      html += `• [${e.status}] ${esc(e.endpoint)} — ${e.count}×\n`;
    }
    html += `\n`;
  }

  if (utilizationUrl) {
    html += `<a href="${esc(utilizationUrl)}">📈 View Utilization Report</a>`;
  }

  const m = url.match(/[?&]chat_id=([^&]+)/);
  // Ensure we send as JSON matching Telegram's bot API sendMessage
  body = JSON.stringify({ chat_id: m ? m[1] : '', text: html, parse_mode: 'HTML' });
} else {
  // Plain text table for Discord
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
  if (utilizationUrl) {
    txt += `\n\n📈 **Utilization Report:** ${utilizationUrl}`;
  }

  body = JSON.stringify({ content: txt });
}

const u = new URL(url);
const isH = u.protocol === 'https:';
const hReq = isH ? (await import('https')).request : (await import('http')).request;

// HIGH FIX (H4): wire up error + response handlers so silent failures
// (DNS, TLS, 4xx/5xx) become visible to the operator and the audit trail.
function _logWebhookEvent(level, msg) {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, type, msg });
  process.stderr.write(line + "\n");
}

const req = hReq({
  hostname: u.hostname,
  port: u.port || (isH ? 443 : 80),
  path: u.pathname + u.search,
  method: 'POST',
  rejectUnauthorized: false, // Bypass corporate SSL interception
  headers: { ...headers, 'Content-Length': Buffer.byteLength(body) },
  timeout: 10_000,
});

req.on('error', (e) => {
  _logWebhookEvent('error', `webhook send failed: ${e.code || e.message}`);
});
req.on('timeout', () => {
  _logWebhookEvent('error', 'webhook send timed out after 10s');
  req.destroy(new Error('timeout'));
});
req.on('response', (res) => {
  const ok = res.statusCode >= 200 && res.statusCode < 300;
  let chunks = '';
  res.on('data', (c) => { if (chunks.length < 512) chunks += c.toString(); });
  res.on('end', () => {
    if (ok) {
      _logWebhookEvent('info', `delivered ${res.statusCode}`);
    } else {
      _logWebhookEvent('error',
        `webhook responded ${res.statusCode}: ${chunks.slice(0, 200).replace(/\s+/g, ' ')}`);
    }
  });
});

req.write(body);
req.end();
