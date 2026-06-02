import fs from 'fs';

let content = fs.readFileSync('docker-local-pt/scripts/send-summary-webhook.mjs', 'utf8');

const newTeamsLogic = `
if (type === 'teams') {
  const cardBody = [
    {
      "type": "TextBlock",
      "text": \`📊 PT Performance Report — \${result.suite || 'Direct Run'}\`,
      "weight": "Bolder",
      "size": "Large",
      "wrap": true
    },
    {
      "type": "FactSet",
      "facts": [
        { "title": "Suite", "value": result.suite || "—" },
        { "title": "Target", "value": result.base_url || "—" },
        { "title": "Mode", "value": result.mode || "—" },
        { "title": "Status", "value": statusOk ? "✅ PASSED" : "⚠️ ISSUES" }
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
        { "title": "Total Samples", "value": String(totalReqs) },
        { "title": "Overall Avg (ms)", "value": p95All.toFixed(2) },
        { "title": "Overall Error Rate", "value": ((result.http_req_failed_rate || 0) * 100).toFixed(2) + "%" },
        { "title": "Total RPS", "value": durS > 0 ? (totalReqs / durS).toFixed(2) : "—" }
      ]
    }
  ];

  if (apiRows.length > 0) {
    cardBody.push({
      "type": "TextBlock",
      "text": "📋 Per-API Performance (key metrics)",
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
            { "type": "Column", "width": "40", "items": [{ "type": "TextBlock", "text": "**API**", "size": "Small", "weight": "Bolder", "wrap": true }] },
            { "type": "Column", "width": "15", "items": [{ "type": "TextBlock", "text": "**Samp**", "size": "Small", "weight": "Bolder" }] },
            { "type": "Column", "width": "15", "items": [{ "type": "TextBlock", "text": "**Avg**", "size": "Small", "weight": "Bolder" }] },
            { "type": "Column", "width": "15", "items": [{ "type": "TextBlock", "text": "**P95**", "size": "Small", "weight": "Bolder" }] },
            { "type": "Column", "width": "15", "items": [{ "type": "TextBlock", "text": "**Err%**", "size": "Small", "weight": "Bolder" }] },
            { "type": "Column", "width": "15", "items": [{ "type": "TextBlock", "text": "**RPS**", "size": "Small", "weight": "Bolder" }] }
          ]
        }
      ]
    };

    apiRows.forEach((api, idx) => {
      const errRate = api.err_rate != null ? (api.err_rate * 100).toFixed(1) : "0.0";
      const failed = parseFloat(errRate) > 0;
      let displayName = api.name.replace(/_/g, ' ').replace(/^BP\d+\s+/, '').replace(/^001\s+01\s+\d+\s+/, '');
      if (displayName.length > 25) displayName = displayName.substring(0, 22) + '...';
      const rps = durS > 0 ? ((api.samples || 0) / durS).toFixed(1) : "—";
      
      rowsContainer.items.push({
        "type": "ColumnSet",
        "spacing": "Small",
        "columns": [
          { "type": "Column", "width": "5", "items": [{ "type": "TextBlock", "text": String(idx + 1), "size": "Small" }] },
          { "type": "Column", "width": "40", "items": [{ "type": "TextBlock", "text": displayName, "size": "Small", "wrap": true, "weight": "Bolder" }] },
          { "type": "Column", "width": "15", "items": [{ "type": "TextBlock", "text": String(api.samples || 0), "size": "Small" }] },
          { "type": "Column", "width": "15", "items": [{ "type": "TextBlock", "text": (api.dur_avg || 0).toFixed(1), "size": "Small" }] },
          { "type": "Column", "width": "15", "items": [{ "type": "TextBlock", "text": (api.dur_p95 || 0).toFixed(1), "size": "Small" }] },
          { "type": "Column", "width": "15", "items": [{ "type": "TextBlock", "text": errRate + "%", "size": "Small", "color": failed ? "Attention" : "Good" }] },
          { "type": "Column", "width": "15", "items": [{ "type": "TextBlock", "text": String(rps), "size": "Small" }] }
        ]
      });
    });

    cardBody.push(rowsContainer);
    cardBody.push({
      "type": "TextBlock",
      "text": "⚠️ Kolom Max, Min disembunyikan untuk keterbacaan di Teams.",
      "size": "Small",
      "color": "Warning",
      "wrap": true,
      "spacing": "Small"
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
          "version": "1.4",
          "body": cardBody
        }
      }
    ]
  });
} else if (type === 'brrr') {`;

const startIdx = content.indexOf("if (type === 'teams') {");
const endIdx = content.indexOf("} else if (type === 'brrr') {");

if (startIdx !== -1 && endIdx !== -1) {
  content = content.slice(0, startIdx) + newTeamsLogic + content.slice(endIdx + 29);
  fs.writeFileSync('docker-local-pt/scripts/send-summary-webhook.mjs', content);
  console.log("Patched send-summary-webhook.mjs successfully!");
} else {
  console.log("Could not find boundaries.");
}
