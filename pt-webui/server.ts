import { serve } from "bun";
import * as fs from "fs";
import { join } from "path";

const PROJECT_ROOT = "../"; // points to growin_performancetest

serve({
  port: 3001,
  async fetch(req, server) {
    const url = new URL(req.url);

    // Add CORS headers
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (url.pathname === "/api/latest-report" && req.method === "GET") {
      try {
        const dirsToSearch = [
          join(PROJECT_ROOT, "Report", "Utilization"),
          join(PROJECT_ROOT, "get_grafana_data")
        ];
        
        let latestFile = null;
        let latestTime = 0;
        let serveDir = "";
        
        for (const dir of dirsToSearch) {
          if (!fs.existsSync(dir)) continue;
          const files = fs.readdirSync(dir);
          for (const file of files) {
            if (file.endsWith(".html")) {
              const stat = fs.statSync(join(dir, file));
              if (stat.mtimeMs > latestTime) {
                latestTime = stat.mtimeMs;
                latestFile = file;
                serveDir = dir;
              }
            }
          }
        }
        
        if (latestFile) {
          return new Response(Bun.file(join(serveDir, latestFile)), {
            headers: { "Content-Type": "text/html" }
          });
        }
        
        return new Response("No reports found", { status: 404 });
      } catch (err) {
        console.error("Error finding latest report:", err);
        return new Response("Error finding latest report", { status: 500 });
      }
    }

    if (url.pathname === "/api/run-test" && req.method === "POST") {
      try {
        const body = await req.json();
        const { script, config, target } = body;

        // Ensure script path is somewhat safe
        if (!script || script.includes('..')) {
           return new Response("Invalid script", { status: 400 });
        }

        const scriptPath = `Script/${script}`;
        const k6Binary = `${PROJECT_ROOT}/k6`; 
        
        // Build environment variables for k6
        const envVars = {
          ...process.env,
          VUS: config.vus.toString(),
          DURATION: config.duration,
          ENV: config.env,
          RUNBY: config.runby,
          PLATFORM: config.platform,
          SCENARIO: config.scenario === 'All' ? '' : config.scenario,
          NUMSTART: config.numStart.toString(),
        };

        if (config.baseUrl) {
          envVars.BASE_URL = config.baseUrl;
        }

        // We can upgrade to a WebSocket for real-time logs,
        // but for now, we'll just return a success message.
        // Or we can return a stream!
        console.log(`[Backend] Running: ${scriptPath} on target ${target}`);
        
        let cmd: string[];
        if (script.endsWith('.sh')) {
          // Wrapper script: execute via bash
          cmd = ["bash", scriptPath];
          // we already pass envVars into the environment below
        } else {
          // k6 script: pass explicit -e flags
          cmd = [
            "../k6", "run", scriptPath,
            "-e", `VUS=${envVars.VUS}`,
            "-e", `DURATION=${envVars.DURATION}`,
            "-e", `ENV=${envVars.ENV}`,
            "-e", `RUNBY=${envVars.RUNBY}`,
            "-e", `PLATFORM=${envVars.PLATFORM}`,
            "-e", `SCENARIO=${envVars.SCENARIO}`,
            "-e", `NUMSTART=${envVars.NUMSTART}`,
          ];
        }

        const proc = Bun.spawn(cmd, {
          cwd: PROJECT_ROOT,
          env: envVars,
          stdout: "pipe",
          stderr: "pipe",
        });

        // Use a Response stream to pipe logs to the frontend
        return new Response(proc.stdout, {
          headers: {
            "Content-Type": "text/plain",
            "Access-Control-Allow-Origin": "*",
          }
        });

      } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
      }
    }

    if (url.pathname === "/api/config" && req.method === "GET") {
      try {
        const envFile = Bun.file(`${PROJECT_ROOT}/configs/pt.env`);
        if (await envFile.exists()) {
          const content = await envFile.text();
          const config: Record<string, string> = {};
          content.split('\n').forEach(line => {
            if (line && !line.startsWith('#') && line.includes('=')) {
              const [key, ...rest] = line.split('=');
              config[key.trim()] = rest.join('=').trim();
            }
          });
          return new Response(JSON.stringify(config), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            }
          });
        } else {
          return new Response(JSON.stringify({}), { 
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            }
          });
        }
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { 
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        });
      }
    }

    if (url.pathname === "/api/config" && req.method === "POST") {
      try {
        const updates = await req.json();
        const envPath = `${PROJECT_ROOT}/configs/pt.env`;
        const envFile = Bun.file(envPath);
        if (await envFile.exists()) {
          let content = await envFile.text();
          const lines = content.split('\n');
          const newLines = lines.map(line => {
            if (line && !line.startsWith('#') && line.includes('=')) {
              const key = line.split('=')[0].trim();
              if (updates[key] !== undefined) {
                return `${key}=${updates[key]}`;
              }
            }
            return line;
          });
          
          // If there are new keys that didn't exist in the file, append them
          for (const [key, value] of Object.entries(updates)) {
            if (!lines.some(line => line.trim().startsWith(`${key}=`))) {
              newLines.push(`${key}=${value}`);
            }
          }

          await Bun.write(envPath, newLines.join('\n'));
          return new Response(JSON.stringify({ success: true }), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            }
          });
        } else {
          return new Response("pt.env not found", { 
            status: 404,
            headers: {
              "Access-Control-Allow-Origin": "*",
            }
          });
        }
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { 
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        });
      }
    }

    if (url.pathname === "/api/sys-status" && req.method === "GET") {
      try {
        const os = require('os');
        const interfaces = os.networkInterfaces();
        let ipAddress = '127.0.0.1';
        
        for (const devName in interfaces) {
          const iface = interfaces[devName];
          for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
              ipAddress = alias.address;
              break;
            }
          }
          if (ipAddress !== '127.0.0.1') break;
        }

        const envFile = Bun.file(`${PROJECT_ROOT}/configs/pt.env`);
        let hasWebhooks = false;
        if (await envFile.exists()) {
          const content = await envFile.text();
          hasWebhooks = content.includes('TEAMS_WEBHOOK=http') || content.includes('DISCORD_WEBHOOK=http') || content.includes('TELEGRAM_WEBHOOK=http') || content.includes('BRRR_WEBHOOK=http');
        }

        const k6StatusFile = Bun.file(`/tmp/.k6_target_status`);
        let k6Status = "IDLE";
        if (await k6StatusFile.exists()) {
          k6Status = (await k6StatusFile.text()).trim();
        }
        if (!k6Status || k6Status === "") k6Status = "IDLE";

        const grafanaPortFile = Bun.file(`/tmp/grafana_backend_port`);
        let grafanaStatus = "OFF";
        let grafanaPort = "";
        if (await grafanaPortFile.exists()) {
          const port = (await grafanaPortFile.text()).trim();
          if (port) {
            try {
              const res = await fetch(`http://127.0.0.1:${port}/health`);
              if (res.ok) {
                grafanaStatus = "ON";
                grafanaPort = port;
              }
            } catch(e) {}
          }
        }

        const recentFile = Bun.file(`${process.env.HOME}/.pt/var/recent_runs.json`);
        let lastRun = "none";
        if (await recentFile.exists()) {
          try {
            const data = await recentFile.json();
            if (Array.isArray(data) && data.length > 0 && data[0].entry) {
              lastRun = data[0].entry.substring(0, 80);
            }
          } catch(e) {}
        }

        return new Response(JSON.stringify({
          ip: ipAddress,
          webhooks: hasWebhooks ? "ON" : "OFF",
          grafana: grafanaStatus,
          grafanaPort: grafanaPort,
          k6: k6Status,
          lastRun: lastRun
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        });
      }
    }

    if (url.pathname === "/api/grafana/start" && req.method === "POST") {
      try {
        const cmd = [
          "bash", "-c", 
          `cd ${PROJECT_ROOT}/get_grafana_data && nohup bash start_backend.sh > /tmp/grafana_backend.log 2>&1 &`
        ];
        const proc = Bun.spawn(cmd, {
          stdout: "ignore",
          stderr: "ignore",
        });
        proc.unref();

        return new Response(JSON.stringify({ success: true }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        });
      }
    }

    if (url.pathname === "/api/grafana/stop" && req.method === "POST") {
      try {
        const cmd = [
          "bash", "-c", 
          `if [[ -f "/tmp/grafana_backend_port" ]]; then g_port=$(cat /tmp/grafana_backend_port 2>/dev/null); if [[ -n "$g_port" ]]; then g_pid=$(lsof -t -i:"$g_port" 2>/dev/null); if [[ -n "$g_pid" ]]; then kill -9 $g_pid; fi; fi; rm -f /tmp/grafana_backend_port; fi`
        ];
        Bun.spawn(cmd, {
          stdout: "ignore",
          stderr: "ignore",
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        });
      }
    }

    if (url.pathname === "/api/test-webhook" && req.method === "POST") {
      try {
        const { name, targetUrl } = await req.json();
        let payload: any = {};
        const type = name.toLowerCase();

        if (type.includes('teams')) {
          payload = {
            "type": "message",
            "attachments": [{
              "contentType": "application/vnd.microsoft.card.adaptive",
              "content": {
                "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                "type": "AdaptiveCard",
                "version": "1.5",
                "body": [ { "type": "TextBlock", "text": "✅ [TEST] growin_performancetest — Webhook connection successful!", "weight": "Bolder", "color": "Good" } ]
              }
            }]
          };
        } else if (type.includes('telegram')) {
          const m = targetUrl.match(/[?&]chat_id=([^&]+)/);
          payload = { chat_id: m ? m[1] : '', text: "✅ *[TEST]* growin_performancetest — Webhook connection successful!", parse_mode: "Markdown" };
        } else {
          // Discord or brrr
          payload = { content: "✅ **[TEST]** growin_performancetest — Webhook connection successful!" };
        }

        const fetchRes = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const statusText = fetchRes.ok ? "SUCCESS" : "FAILED";
        return new Response(JSON.stringify({ success: fetchRes.ok, status: fetchRes.status }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        });
      }
    }

    return new Response("Not Found", { 
      status: 404,
      headers: {
        "Access-Control-Allow-Origin": "*",
      }
    });
  },
});

console.log("PT WebUI Backend API running on http://localhost:3001");
