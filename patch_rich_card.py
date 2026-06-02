import fs from 'fs';

function patchFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    const newTeamsLogic = `if (type === 'teams') {
  // Thresholds defaults
  const tAvg = 200;
  const tErr = 0.1;
  const tRps = 381;

  const overallAvg = parseFloat(p95All);
  const overallErr = (result.http_req_failed_rate || 0) * 100;
  const totalRpsVal = durS > 0 ? (totalReqs / durS) : 0;

  const avgOk = overallAvg < tAvg;
  const errOk = overallErr < tErr;
  const rpsOk = totalRpsVal >= tRps;

  let statusText = "";
  let statusColor = "";
  let reason = "";

  if (avgOk && errOk && rpsOk) {
      statusText = "## ✅ PASSED";
      statusColor = "Good";
      reason = \`All metrics meet thresholds (Avg <\${tAvg}ms, Err <\${tErr}%, RPS >=\${tRps}).\`;
  } else if (avgOk && errOk && !rpsOk) {
      statusText = "## ⚠️ PASSED with Warnings";
      statusColor = "Warning";
      reason = \`Avg (\${overallAvg.toFixed(1)}ms <\${tAvg}ms) & Err% (\${overallErr.toFixed(2)}% <\${tErr}%) OK, but RPS (\${totalRpsVal.toFixed(1)} < \${tRps}) below threshold.\`;
  } else {
      statusText = "## ❌ FAILED";
      statusColor = "Attention";
      reason = \`Threshold violation: \`;
      if (!avgOk) reason += \`Avg (\${overallAvg.toFixed(1)}ms >= \${tAvg}ms). \`;
      if (!errOk) reason += \`Err% (\${overallErr.toFixed(2)}% >= \${tErr}%). \`;
  }

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
        { "title": "Execution", "value": \`\${result.duration || '30s'} duration\` }
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
      "text": \`**Reason:** \${reason}\`,
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
            { "type": "TextBlock", "text": "**Samples**", "weight": "Bolder" },
            { "type": "TextBlock", "text": String(totalReqs) }
          ]
        },
        {
          "type": "Column",
          "width": "stretch",
          "items": [
            { "type": "TextBlock", "text": "**Avg (P95)**", "weight": "Bolder" },
            { "type": "TextBlock", "text": \`\${overallAvg.toFixed(2)} ms\`, "color": avgOk ? "Good" : "Attention", "weight": "Bolder" },
            { "type": "TextBlock", "text": \`(<\${tAvg}ms)\`, "size": "Small", "isSubtle": true }
          ]
        },
        {
          "type": "Column",
          "width": "stretch",
          "items": [
            { "type": "TextBlock", "text": "**Error Rate**", "weight": "Bolder" },
            { "type": "TextBlock", "text": \`\${overallErr.toFixed(2)}%\`, "color": errOk ? "Good" : "Attention", "weight": "Bolder" },
            { "type": "TextBlock", "text": \`(<\${tErr}%)\`, "size": "Small", "isSubtle": true }
          ]
        },
        {
          "type": "Column",
          "width": "stretch",
          "items": [
            { "type": "TextBlock", "text": "**Total RPS**", "weight": "Bolder" },
            { "type": "TextBlock", "text": totalRpsVal.toFixed(2), "color": rpsOk ? "Good" : "Warning", "weight": "Bolder" },
            { "type": "TextBlock", "text": \`(>=\${tRps})\`, "size": "Small", "isSubtle": true }
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

    const rowsContainer = {
      "type": "Container",
      "style": "emphasis",
      "items": [
        {
          "type": "ColumnSet",
          "columns": [
            { "type": "Column", "width": "20", "items": [{ "type": "TextBlock", "text": "**API**", "size": "Small", "weight": "Bolder" }] },
            { "type": "Column", "width": "10", "items": [{ "type": "TextBlock", "text": "**Samp**", "size": "Small", "weight": "Bolder" }] },
            { "type": "Column", "width": "8", "items": [{ "type": "TextBlock", "text": "**Avg**", "size": "Small", "weight": "Bolder" }] },
            { "type": "Column", "width": "8", "items": [{ "type": "TextBlock", "text": "**Min**", "size": "Small", "weight": "Bolder" }] },
            { "type": "Column", "width": "8", "items": [{ "type": "TextBlock", "text": "**Max**", "size": "Small", "weight": "Bolder" }] },
            { "type": "Column", "width": "8", "items": [{ "type": "TextBlock", "text": "**P95**", "size": "Small", "weight": "Bolder" }] },
            { "type": "Column", "width": "10", "items": [{ "type": "TextBlock", "text": "**Err%**", "size": "Small", "weight": "Bolder" }] },
            { "type": "Column", "width": "10", "items": [{ "type": "TextBlock", "text": "**RPS**", "size": "Small", "weight": "Bolder" }] }
          ]
        }
      ]
    };

    apiRows.forEach((api) => {
      const errRate = api.err_rate != null ? (api.err_rate * 100).toFixed(1) : "0.0";
      const failed = parseFloat(errRate) >= tErr;
      let displayName = api.name.replace(/_/g, ' ').replace(/^BP\\d+\\s+/, '').replace(/^001\\s+01\\s+\\d+\\s+/, '');
      if (displayName.length > 25) displayName = displayName.substring(0, 22) + '...';
      const rps = durS > 0 ? ((api.samples || 0) / durS).toFixed(1) : "—";
      
      rowsContainer.items.push({
        "type": "ColumnSet",
        "spacing": "Small",
        "columns": [
          { "type": "Column", "width": "20", "items": [{ "type": "TextBlock", "text": displayName, "size": "Small", "wrap": true, "weight": "Bolder" }] },
          { "type": "Column", "width": "10", "items": [{ "type": "TextBlock", "text": String(api.samples || 0), "size": "Small" }] },
          { "type": "Column", "width": "8", "items": [{ "type": "TextBlock", "text": (api.dur_avg || 0).toFixed(1), "size": "Small" }] },
          { "type": "Column", "width": "8", "items": [{ "type": "TextBlock", "text": (api.dur_min || 0).toFixed(1), "size": "Small" }] },
          { "type": "Column", "width": "8", "items": [{ "type": "TextBlock", "text": (api.dur_max || 0).toFixed(1), "size": "Small" }] },
          { "type": "Column", "width": "8", "items": [{ "type": "TextBlock", "text": (api.dur_p95 || 0).toFixed(1), "size": "Small" }] },
          { "type": "Column", "width": "10", "items": [{ "type": "TextBlock", "text": errRate + "%", "size": "Small", "color": failed ? "Attention" : "Good" }] },
          { "type": "Column", "width": "10", "items": [{ "type": "TextBlock", "text": String(rps), "size": "Small" }] }
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
} else if (type === 'brrr') {`;

    const startIdx = content.indexOf("if (type === 'teams') {");
    const endIdx = content.indexOf("} else if (type === 'brrr') {");

    if (startIdx !== -1 && endIdx !== -1) {
        content = content.slice(0, startIdx) + newTeamsLogic + content.slice(endIdx + 29);
        fs.writeFileSync(filePath, content);
        console.log(`Patched ${filePath} successfully!`);
    } else {
        console.log(`Could not find boundaries in ${filePath}`);
    }
}

patchFile('docker-local-pt/scripts/send-summary-webhook.mjs');
patchFile('docker-local-pt/scripts/webhook-tester.mjs');
