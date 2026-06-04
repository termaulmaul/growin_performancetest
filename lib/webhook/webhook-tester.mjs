#!/usr/bin/env node
/**
 * webhook-tester.mjs
 * Simple utility to send a test message to Telegram, Discord, Teams, or Brrr.
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

console.log(`🧪 Testing ${type} webhook...`);
console.log(`   URL: ${url}`);

let body = '';
let headers = { 'Content-Type': 'application/json' };

const text = `🧪 **growin_performancetest — PT Run Report**\n` +
             `**Status**\n` +
             `✓ PASSED\n` +
             `**Reason**\n` +
             `All metrics meet thresholds.\n` +
             `**Suite**\n` +
             `Webhook_Test / pt-menu.sh\n` +
             `**Target**\n` +
             `Local Sandbox 127.0.0.1:2222\n` +
             `**Run by**\n` +
             `qacentral\n` +
             `**Start → End**\n` +
             `${new Date(Date.now() - 30000).toISOString().replace('T',' ').slice(0,19)} → ${new Date().toISOString().replace('T',' ').slice(0,19)}\n` +
             `**Avg TPS**\n` +
             `87.10`;

if (type === 'teams') {
  body = JSON.stringify({
    "type": "message",
    "attachments": [
      {
        "contentType": "application/vnd.microsoft.card.adaptive",
        "content": {
          "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
          "type": "AdaptiveCard",
          "version": "1.5",
          "body": [
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
                { "title": "Suite", "value": "Webhook_Test / pt-menu.sh" },
                { "title": "Target", "value": "Local Sandbox 127.0.0.1:2222" },
                { "title": "Run by", "value": process.env.PT_USER || "qacentral" },
                { "title": "Execution", "value": "30s duration" },
                { "title": "Start", "value": new Date(Date.now() - 30000).toISOString().replace('T',' ').slice(0,19) },
                { "title": "End", "value": new Date().toISOString().replace('T',' ').slice(0,19) },
                { "title": "Avg TPS", "value": "87.10" }
              ]
            },
            {
              "type": "TextBlock",
              "text": "## ✅ PASSED",
              "color": "Good",
              "wrap": true
            },
            {
              "type": "TextBlock",
              "text": "**Reason:** All metrics meet thresholds.",
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
                    { "type": "TextBlock", "text": "10,454", "size": "Small", "spacing": "None" }
                  ]
                },
                {
                  "type": "Column",
                  "width": "stretch",
                  "items": [
                    { "type": "TextBlock", "text": "**Avg (P95)**", "weight": "Bolder", "size": "Small" },
                    { "type": "TextBlock", "text": "47.42 ms", "size": "Small", "spacing": "None", "color": "Good" },
                    { "type": "TextBlock", "text": "(<200ms)", "size": "Small", "isSubtle": true, "spacing": "None" }
                  ]
                },
                {
                  "type": "Column",
                  "width": "stretch",
                  "items": [
                    { "type": "TextBlock", "text": "**Error Rate**", "weight": "Bolder", "size": "Small" },
                    { "type": "TextBlock", "text": "0.00%", "size": "Small", "spacing": "None", "color": "Good" },
                    { "type": "TextBlock", "text": "(<0.1%)", "size": "Small", "isSubtle": true, "spacing": "None" }
                  ]
                },
                {
                  "type": "Column",
                  "width": "stretch",
                  "items": [
                    { "type": "TextBlock", "text": "**Total RPS**", "weight": "Bolder", "size": "Small" },
                    { "type": "TextBlock", "text": "348.40", "size": "Small", "spacing": "None", "color": "Attention" },
                    { "type": "TextBlock", "text": "(>=381)", "size": "Small", "isSubtle": true, "spacing": "None" }
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
                    { "type": "Column", "width": "5", "items": [{ "type": "TextBlock", "text": "**#**", "size": "Small", "weight": "Bolder" }] },
                    { "type": "Column", "width": "35", "items": [{ "type": "TextBlock", "text": "**API**", "size": "Small", "weight": "Bolder", "wrap": true }] },
                    { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "**Samp**", "size": "Small", "weight": "Bolder" }] },
                    { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "**Avg**", "size": "Small", "weight": "Bolder" }] },
                    { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "**P95**", "size": "Small", "weight": "Bolder" }] },
                    { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "**Err%**", "size": "Small", "weight": "Bolder" }] },
                    { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "**RPS**", "size": "Small", "weight": "Bolder" }] },
                    { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "**TPS**", "size": "Small", "weight": "Bolder" }] }
                  ]
                },
                {
                  "type": "ColumnSet",
                  "spacing": "Small",
                  "columns": [
                    { "type": "Column", "width": "5", "items": [{ "type": "TextBlock", "text": "1", "size": "Small" }] },
                    { "type": "Column", "width": "35", "items": [{ "type": "TextBlock", "text": "Marketdata DailyTrade", "size": "Small", "wrap": true, "weight": "Bolder" }] },
                    { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "10454", "size": "Small" }] },
                    { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "47.4", "size": "Small" }] },
                    { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "57.3", "size": "Small" }] },
                    { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "0.0%", "size": "Small", "color": "Good" }] },
                    { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "348.4", "size": "Small", "color": "Attention" }] },
                    { "type": "Column", "width": "12", "items": [{ "type": "TextBlock", "text": "348.4", "size": "Small" }] }
                  ]
                }
              ]
            }
          ]
        }
      }
    ]
  });
} else if (type === 'discord') {
  body = JSON.stringify({ content: text });
} else if (type === 'telegram') {
  const chatMatch = url.match(/[?&]chat_id=([^&]+)/);
  const chatId = chatMatch ? chatMatch[1] : '';
  body = JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'Markdown' });
} else if (type === 'brrr') {
  body = text;
  headers = { 'Content-Type': 'text/plain; charset=utf-8' };
} else {
  console.error(`❌ Unsupported type: ${type}`);
  process.exit(1);
}

const targetUrl = new URL(url);
const isHttps   = targetUrl.protocol === 'https:';

const { request: httpReq } = isHttps
  ? await import('https')
  : await import('http');

const options = {
  hostname: targetUrl.hostname,
  port:     targetUrl.port || (isHttps ? 443 : 80),
  path:     targetUrl.pathname + targetUrl.search,
  method:   'POST',
  headers: {
    ...headers,
    'Content-Length': Buffer.byteLength(body),
  },
};

const req = httpReq(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log(`✅ Success! Response (HTTP ${res.statusCode}): ${data}`);
      process.exit(0);
    } else {
      console.error(`❌ Failed (HTTP ${res.statusCode}): ${data}`);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Connection error: ${e.message}`);
  process.exit(1);
});

req.write(body);
req.end();
