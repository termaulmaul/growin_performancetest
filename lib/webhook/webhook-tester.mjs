#!/usr/bin/env node
/**
 * webhook-tester.mjs
 * Send a DEMO test message to Telegram, Discord, Teams, or Brrr.
 * Card structure and typography must stay in sync with send-summary-webhook.mjs.
 */

import { parseArgs } from 'util';

const { values: args, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    type: { type: 'string' },
    url:  { type: 'string' },
  },
  allowPositionals: true,
  strict: false,
});

const type = positionals[0] || args.type;
const url  = positionals[1] || args.url;

if (!type || !url) {
  console.error('❌ Usage: node webhook-tester.mjs [teams|discord|telegram|brrr] [url]');
  process.exit(1);
}

console.log(`\n🧪 Sending DEMO webhook to ${type}...`);
console.log(`   URL: ${url}`);

// ── DEMO data (mirrors what a real run would produce) ──────────────────────
const demoSuite   = 'Growin_Daily_Trade / Growin_Daily_Trade.js';
const demoTarget  = 'Onprem  10.82.15.72 → 10.184.120.48  [DEMO]';
const demoUser    = process.env.PT_USER || 'qacentral';
const demoDur     = '30s';
const demoStart   = new Date(Date.now() - 30000).toISOString().replace('T', ' ').slice(0, 19);
const demoEnd     = new Date().toISOString().replace('T', ' ').slice(0, 19);

// Threshold constants — keep in sync with send-summary-webhook.mjs
const tAvg = 200;
const tErr = 0.1;
const tRps = 381;

// Demo metrics
const overallAvg  = 47.42;
const overallErr  = 0.0;
const totalRps    = 348.40;
const avgTps      = 348.40;  // 1 API in demo
const totalReqs   = 10454;

const avgOk = overallAvg < tAvg;
const errOk = overallErr < tErr;
const rpsOk = totalRps >= tRps;

// ⚠️  RPS intentionally below threshold to demonstrate Warning state
const statusText  = '⚠️ PASSED with Warnings';
const statusColor = 'Warning';
const reason      = `Avg (${overallAvg.toFixed(1)}ms <${tAvg}ms) & Err% (${overallErr.toFixed(2)}% <${tErr}%) OK, but RPS (${totalRps.toFixed(1)} < ${tRps}) below threshold.`;

// Shared plain-text summary (Telegram / Discord / Brrr)
const text =
  `🧪 **growin_performancetest — PT Run Report**\n` +
  `**Status:** ${statusText}\n` +
  `**Reason:** ${reason}\n` +
  `**Suite:** ${demoSuite}\n` +
  `**Target:** ${demoTarget}\n` +
  `**Run by:** ${demoUser}\n` +
  `**Start → End:** ${demoStart} → ${demoEnd}\n` +
  `**Avg TPS:** ${avgTps.toFixed(2)}`;

let body    = '';
let headers = { 'Content-Type': 'application/json' };

if (type === 'teams') {
  // ── Adaptive Card — typography identical to send-summary-webhook.mjs ──────
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
        { "title": "Suite",     "value": demoSuite  },
        { "title": "Target",    "value": demoTarget },
        { "title": "Run by",    "value": demoUser   },
        { "title": "Execution", "value": `${demoDur} duration` },
        { "title": "Start",     "value": demoStart  },
        { "title": "End",       "value": demoEnd    },
        { "title": "Avg TPS",   "value": avgTps.toFixed(2) }
      ]
    },
    {
      "type": "TextBlock",
      "text": statusText,
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
          "type": "Column", "width": "stretch",
          "items": [
            { "type": "TextBlock", "text": "**Samples**",  "weight": "Bolder", "size": "Small" },
            { "type": "TextBlock", "text": String(totalReqs), "size": "Small", "spacing": "None" }
          ]
        },
        {
          "type": "Column", "width": "stretch",
          "items": [
            { "type": "TextBlock", "text": "**Avg (P95)**", "weight": "Bolder", "size": "Small" },
            { "type": "TextBlock", "text": `${overallAvg.toFixed(2)} ms`, "size": "Small", "spacing": "None", "color": avgOk ? "Good" : "Attention" },
            { "type": "TextBlock", "text": `(<${tAvg}ms)`,  "size": "Small", "isSubtle": true, "spacing": "None" }
          ]
        },
        {
          "type": "Column", "width": "stretch",
          "items": [
            { "type": "TextBlock", "text": "**Error Rate**", "weight": "Bolder", "size": "Small" },
            { "type": "TextBlock", "text": `${overallErr.toFixed(2)}%`, "size": "Small", "spacing": "None", "color": errOk ? "Good" : "Attention" },
            { "type": "TextBlock", "text": `(<${tErr}%)`,  "size": "Small", "isSubtle": true, "spacing": "None" }
          ]
        },
        {
          "type": "Column", "width": "stretch",
          "items": [
            { "type": "TextBlock", "text": "**Total RPS**", "weight": "Bolder", "size": "Small" },
            { "type": "TextBlock", "text": totalRps.toFixed(2), "size": "Small", "spacing": "None", "color": rpsOk ? "Good" : "Attention" },
            { "type": "TextBlock", "text": `(>=${tRps})`,  "size": "Small", "isSubtle": true, "spacing": "None" }
          ]
        }
      ]
    },
    {
      "type": "TextBlock",
      "text": "📋 **Per-API Performance (key metrics)**",
      "weight": "Bolder",
      "spacing": "Medium"
    },
    {
      "type": "Container",
      "style": "emphasis",
      "items": [
        {
          "type": "ColumnSet",
          "columns": [
            { "type": "Column", "width": "5",  "items": [{ "type": "TextBlock", "text": "**#**",    "size": "Small", "weight": "Bolder" }] },
            { "type": "Column", "width": "35", "items": [{ "type": "TextBlock", "text": "**API**",  "size": "Small", "weight": "Bolder", "wrap": true }] },
            { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "**Samp**", "size": "Small", "weight": "Bolder" }] },
            { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "**Avg**",  "size": "Small", "weight": "Bolder" }] },
            { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "**P95**",  "size": "Small", "weight": "Bolder" }] },
            { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "**Err%**", "size": "Small", "weight": "Bolder" }] },
            { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "**RPS**",  "size": "Small", "weight": "Bolder" }] },
            { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "**TPS**",  "size": "Small", "weight": "Bolder" }] }
          ]
        },
        {
          "type": "ColumnSet",
          "spacing": "Small",
          "columns": [
            { "type": "Column", "width": "5",  "items": [{ "type": "TextBlock", "text": "1", "size": "Small" }] },
            { "type": "Column", "width": "35", "items": [{ "type": "TextBlock", "text": "Daily Trade Marketdata", "size": "Small", "wrap": true, "weight": "Bolder" }] },
            { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": String(totalReqs), "size": "Small" }] },
            { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "47.4", "size": "Small" }] },
            { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "57.3", "size": "Small" }] },
            { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "0.0%",  "size": "Small", "color": "Good" }] },
            { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": totalRps.toFixed(1), "size": "Small", "color": "Attention" }] },
            { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": avgTps.toFixed(1),  "size": "Small" }] }
          ]
        }
      ]
    }
  ];

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

} else if (type === 'discord') {
  body = JSON.stringify({ content: text });

} else if (type === 'telegram') {
  const chatMatch = url.match(/[?&]chat_id=([^&]+)/);
  const chatId = chatMatch ? chatMatch[1] : '';
  body = JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' });

} else if (type === 'brrr') {
  body = text;
  headers = { 'Content-Type': 'text/plain; charset=utf-8' };

} else {
  console.error(`❌ Unsupported type: ${type}`);
  process.exit(1);
}

// ── HTTP send ───────────────────────────────────────────────────────────────
const targetUrl = new URL(url);
const isHttps   = targetUrl.protocol === 'https:';
const { request: httpReq } = isHttps ? await import('https') : await import('http');

const options = {
  hostname: targetUrl.hostname,
  port:     targetUrl.port || (isHttps ? 443 : 80),
  path:     targetUrl.pathname + targetUrl.search,
  method:   'POST',
  headers:  { ...headers, 'Content-Length': Buffer.byteLength(body) },
};

const req = httpReq(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log(`✅  Success  (HTTP ${res.statusCode}): ${data}`);
      process.exit(0);
    } else {
      console.error(`❌  Failed   (HTTP ${res.statusCode}): ${data}`);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌  Connection error: ${e.message}`);
  process.exit(1);
});

req.write(body);
req.end();
