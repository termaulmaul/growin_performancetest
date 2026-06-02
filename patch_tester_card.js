import fs from 'fs';

let content = fs.readFileSync('docker-local-pt/scripts/webhook-tester.mjs', 'utf8');

const newTeamsLogic = `
if (type === 'teams') {
  body = JSON.stringify({
    "type": "message",
    "attachments": [
      {
        "contentType": "application/vnd.microsoft.card.adaptive",
        "content": {
          "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
          "type": "AdaptiveCard",
          "version": "1.4",
          "body": [
            {
              "type": "TextBlock",
              "text": "📊 PT Performance Report — Webhook Test",
              "weight": "Bolder",
              "size": "Large",
              "wrap": true
            },
            {
              "type": "FactSet",
              "facts": [
                { "title": "Suite", "value": "Webhook_Test" },
                { "title": "Target", "value": "Local Sandbox 127.0.0.1:2222" },
                { "title": "Mode", "value": "Direct · 1VU · 30s" },
                { "title": "Status", "value": "✅ PASSED" }
              ]
            },
            {
              "type": "TextBlock",
              "text": "📈 Global Summary",
              "weight": "Bolder",
              "spacing": "Medium"
            },
            {
              "type": "FactSet",
              "facts": [
                { "title": "Total Samples", "value": "10,454" },
                { "title": "Overall Avg (ms)", "value": "47.42" },
                { "title": "Overall Error Rate", "value": "0.00%" },
                { "title": "Total RPS", "value": "348.4" }
              ]
            },
            {
              "type": "TextBlock",
              "text": "📋 Per-API Performance (key metrics)",
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
                    { "type": "Column", "width": "40", "items": [{ "type": "TextBlock", "text": "**API**", "size": "Small", "weight": "Bolder", "wrap": true }] },
                    { "type": "Column", "width": "15", "items": [{ "type": "TextBlock", "text": "**Samp**", "size": "Small", "weight": "Bolder" }] },
                    { "type": "Column", "width": "15", "items": [{ "type": "TextBlock", "text": "**Avg**", "size": "Small", "weight": "Bolder" }] },
                    { "type": "Column", "width": "15", "items": [{ "type": "TextBlock", "text": "**P95**", "size": "Small", "weight": "Bolder" }] },
                    { "type": "Column", "width": "15", "items": [{ "type": "TextBlock", "text": "**Err%**", "size": "Small", "weight": "Bolder" }] },
                    { "type": "Column", "width": "15", "items": [{ "type": "TextBlock", "text": "**RPS**", "size": "Small", "weight": "Bolder" }] }
                  ]
                },
                {
                  "type": "ColumnSet",
                  "spacing": "Small",
                  "columns": [
                    { "type": "Column", "width": "5", "items": [{ "type": "TextBlock", "text": "1", "size": "Small" }] },
                    { "type": "Column", "width": "40", "items": [{ "type": "TextBlock", "text": "Marketdata DailyTrade", "size": "Small", "wrap": true, "weight": "Bolder" }] },
                    { "type": "Column", "width": "15", "items": [{ "type": "TextBlock", "text": "10,454", "size": "Small" }] },
                    { "type": "Column", "width": "15", "items": [{ "type": "TextBlock", "text": "47.4", "size": "Small" }] },
                    { "type": "Column", "width": "15", "items": [{ "type": "TextBlock", "text": "57.3", "size": "Small" }] },
                    { "type": "Column", "width": "15", "items": [{ "type": "TextBlock", "text": "0.0%", "size": "Small", "color": "Good" }] },
                    { "type": "Column", "width": "15", "items": [{ "type": "TextBlock", "text": "348.4", "size": "Small" }] }
                  ]
                }
              ]
            },
            {
              "type": "TextBlock",
              "text": "⚠️ Kolom Max, Min disembunyikan untuk keterbacaan di Teams.",
              "size": "Small",
              "color": "Warning",
              "wrap": true,
              "spacing": "Small"
            }
          ]
        }
      }
    ]
  });
} else if (type === 'brrr') {`;

const startIdx = content.indexOf("if (type === 'teams') {");
const endIdx = content.indexOf("} else if (type === 'brrr') {");

if (startIdx !== -1 && endIdx !== -1) {
  content = content.slice(0, startIdx) + newTeamsLogic + content.slice(endIdx + 29);
  fs.writeFileSync('docker-local-pt/scripts/webhook-tester.mjs', content);
  console.log("Patched webhook-tester.mjs successfully!");
} else {
  console.log("Could not find boundaries.");
}
