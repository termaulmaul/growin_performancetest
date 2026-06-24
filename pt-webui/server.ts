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
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PATCH, DELETE",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-username",
        },
      });
    }

    if (url.pathname === "/api/auth/login" && req.method === "POST") {
      try {
        const { username, password } = await req.json();
        const proc = Bun.spawn(["python3", "-W", "ignore", "bin/pt-auth", "login", username], {
          cwd: PROJECT_ROOT,
          stdin: "pipe",
        });
        proc.stdin.write(password);
        proc.stdin.flush(); proc.stdin.end();
        proc.stdin.end();

        const text = await new Response(proc.stdout).text();
        let resData: any = {};
        try { resData = JSON.parse(text); } catch (e) { resData = { status: "error", error: text }; }
        
        if (resData.status === "ok") {
          // Read token from file
          const tokenFile = Bun.file(`${process.env.HOME}/.pt/sessions/${username}.token`);
          if (await tokenFile.exists()) {
            const token = await tokenFile.text();
            resData.data.token = token.trim();
          }
        }
        return new Response(JSON.stringify(resData), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
      }
    }

    if (url.pathname === "/api/auth/session" && req.method === "GET") {
      try {
        const authHeader = req.headers.get("Authorization");
        const username = req.headers.get("x-username");
        if (!authHeader || !username) {
          return new Response(JSON.stringify({ status: "error", error: "Missing credentials" }), { status: 401, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
        }
        const token = authHeader.replace("Bearer ", "").trim();
        const hasher = new Bun.CryptoHasher("sha256");
        hasher.update(token);
        const tokenHash = hasher.digest("hex");

        const { Database } = require("bun:sqlite");
        const dbPath = process.env.PT_DB_PATH || `${process.env.HOME}/.pt/var/pt.db`;
        const db = new Database(dbPath);
        const row = db.query(`
          SELECT s.id, s.expires_at, u.username, r.name as role 
          FROM sessions s
          JOIN users u ON s.user_id = u.id
          JOIN roles r ON u.role_id = r.id
          WHERE s.token_hash = $tokenHash AND u.username = $username AND u.is_locked = 0
        `).get({ $tokenHash: tokenHash, $username: username }) as any;
        db.close();

        if (row) {
          const expires = new Date(row.expires_at + "Z");
          if (new Date() > expires) {
            return new Response(JSON.stringify({ status: "error", error: "Session expired" }), { status: 401, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
          }
          return new Response(JSON.stringify({ status: "ok", data: { username: row.username, role: row.role } }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
          });
        } else {
          return new Response(JSON.stringify({ status: "error", error: "Invalid session" }), { status: 401, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
        }
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
      }
    }

    if (url.pathname === "/api/auth/logout" && req.method === "POST") {
      try {
        const { username } = await req.json();
        const proc = Bun.spawn(["python3", "-W", "ignore", "bin/pt-auth", "logout", username], {
          cwd: PROJECT_ROOT,
        });
        const text = await new Response(proc.stdout).text();
        return new Response(text, {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
      }
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
        
        let envPath = `${PROJECT_ROOT}/configs/pt.env`;
        let envFile = Bun.file(envPath);
        if (!(await envFile.exists())) {
          envPath = `${PROJECT_ROOT}/docker-local-pt/configs/local.env`;
          envFile = Bun.file(envPath);
        }
        let testPwd = '';
        let testPin = '';
        if (await envFile.exists()) {
          const content = await envFile.text();
          content.split('\n').forEach(line => {
            if (line.startsWith('TEST_PASSWORD=')) testPwd = line.split('=')[1].trim();
            if (line.startsWith('TEST_PIN=')) testPin = line.split('=')[1].trim();
          });
        }

        let cmd: string[];
        let bashCmd = "";

        const parts = script.split('/');
        const suiteName = parts[0];
        const scriptRelPath = parts.slice(1).join('/');

        const platform = envVars.PLATFORM || 'Web';
        const scenarioLabel = envVars.SCENARIO || 'BP001';
        const runby = envVars.RUNBY || 'Manual';

        const now = new Date();
        const dateStr = `${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}`;
        const timeStr = `${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}`;
        
        let reportFile = "";
        if (target === 'Sandbox') {
          reportFile = `/tmp/Report/${suiteName}/${platform}/${scenarioLabel}/${runby}/${runby}_${target}_${dateStr}_${timeStr}_${scenarioLabel}.html`;
        } else {
          reportFile = `../../Report/${suiteName}/${platform}/${scenarioLabel}/${runby}/${runby}_${target}_${dateStr}_${timeStr}_${scenarioLabel}.html`;
        }

        if (script.endsWith('.sh')) {
          bashCmd = `cd Script/${suiteName} && bash ${scriptRelPath}`;
        } else {
          if (target === 'Sandbox') {
            bashCmd = `mkdir -p /tmp/Report/${suiteName}/${platform}/${scenarioLabel}/${runby} && cd Script/${suiteName} && ../../k6 run --compatibility-mode=experimental_enhanced ${scriptRelPath} -e RUNBY=${envVars.RUNBY} -e ENV=SANDBOX -e USER=${envVars.VUS} -e K6_USERS=${envVars.VUS} -e DURATION=${envVars.DURATION} -e SCENARIO=${envVars.SCENARIO} -e PLATFORM=${envVars.PLATFORM} -e BASE_URL=http://mock-api:8080 -e NUMSTART=${envVars.NUMSTART} -e TEST_PASSWORD=${testPwd} -e TEST_PIN=${testPin} -e SANDBOX_REPORT_DIR=/tmp/Report/${suiteName}/${platform}/${scenarioLabel}/${runby} --out dashboard=export=${reportFile}`;
          } else {
            bashCmd = `mkdir -p Report/${suiteName}/${platform}/${scenarioLabel}/${runby} && cd Script/${suiteName} && ../../k6 run ${scriptRelPath} -e USER=${envVars.VUS} -e K6_USERS=${envVars.VUS} -e DURATION=${envVars.DURATION} -e ENV=${envVars.ENV} -e RUNBY=${envVars.RUNBY} -e PLATFORM=${envVars.PLATFORM} -e SCENARIO=${envVars.SCENARIO} -e NUMSTART=${envVars.NUMSTART} -e TEST_PASSWORD=${testPwd} -e TEST_PIN=${testPin} --out dashboard=export=${reportFile}`;
          }
        }

        if (target === 'Oncloud') {
          cmd = ["gcloud", "compute", "ssh", "--zone", "asia-southeast2-c", "vm-pt-ksix-0", "--tunnel-through-iap", "--project", "compute-pt", "--command", bashCmd];
        } else if (target === 'Onprem') {
          cmd = ["bash", "-c", `ssh -o StrictHostKeyChecking=no -o ProxyCommand="ssh -o StrictHostKeyChecking=no -W %h:%p qa@10.82.15.72" qa@10.184.120.48 '${bashCmd}'`];
        } else if (target === 'Sandbox') {
          cmd = ["bash", "-c", `ssh -o StrictHostKeyChecking=no -p 2222 root@127.0.0.1 '${bashCmd}'`];
        } else {
          cmd = ["bash", "-c", bashCmd];
        }

        const username = req.headers.get("x-username") || "pt_webui";

        // Acquire pt-lock
        const lockProc = Bun.spawn(["python3", "-W", "ignore", "bin/pt-lock", "acquire", "--env", envVars.ENV, "--script", script, "--owner", username], {
          cwd: PROJECT_ROOT,
        });
        const lockText = await new Response(lockProc.stdout).text();
        const lockExit = await lockProc.exited;
        if (lockExit !== 0 || lockText.includes('"status": "error"') || lockText.includes('"status": "denied"')) {
           let errMsg = lockText;
           try {
             const j = JSON.parse(lockText);
             if (j.error) errMsg = j.error;
           } catch(e) {}
           // Send text stream response so frontend sees it as an error log
           const errStream = new ReadableStream({
             start(controller) {
               controller.enqueue(new TextEncoder().encode(`\x1b[31m[ERROR]\x1b[0m Failed to acquire lock for ${envVars.ENV}.\nReason: ${errMsg}\n`));
               controller.close();
             }
           });
           return new Response(errStream, { headers: { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*" } });
        }

        const proc = Bun.spawn(cmd, {
          cwd: PROJECT_ROOT,
          env: envVars,
          stdout: "pipe",
          stderr: "pipe",
        });

        // Add async post-execution hooks
        proc.exited.then(async () => {
          console.log(`[Backend] Test completed: ${scriptPath}. Running post-execution hooks...`);

          // 0. Release pt-lock
          try {
            const releaseProc = Bun.spawn(["python3", "-W", "ignore", "bin/pt-lock", "release", "--env", envVars.ENV, "--owner", username], {
              cwd: PROJECT_ROOT,
            });
            await releaseProc.exited;
            console.log(`[Backend] pt-lock released for ${envVars.ENV}`);
          } catch(e) {
            console.error(`[Backend] Failed to release pt-lock:`, e);
          }
          
          // 1. Generate Grafana Report
          try {
            const reportProc = Bun.spawn(["bash", "bin/pt-grafana-report"], {
              cwd: PROJECT_ROOT,
              stdout: "ignore",
              stderr: "ignore",
            });
            await reportProc.exited;
            console.log(`[Backend] Grafana report generated.`);
          } catch(e) {
            console.error(`[Backend] Failed to generate Grafana report:`, e);
          }

          // 2. Dispatch Webhooks
          try {
            // Find all configured webhooks
            const envFile = Bun.file(`${PROJECT_ROOT}/configs/pt.env`);
            if (await envFile.exists()) {
              const content = await envFile.text();
              const sendPromises: Promise<any>[] = [];
              
              if (content.includes('TEAMS_WEBHOOK=http')) {
                const urlMatch = content.match(/TEAMS_WEBHOOK=(http[^\n]+)/);
                if (urlMatch) {
                  sendPromises.push(Bun.spawn(["node", "lib/webhook/send-summary-webhook.mjs", "--type", "teams", "--webhook", urlMatch[1]], { cwd: PROJECT_ROOT }).exited);
                }
              }
              if (content.includes('DISCORD_WEBHOOK=http')) {
                const urlMatch = content.match(/DISCORD_WEBHOOK=(http[^\n]+)/);
                if (urlMatch) {
                  sendPromises.push(Bun.spawn(["node", "lib/webhook/send-summary-webhook.mjs", "--type", "discord", "--webhook", urlMatch[1]], { cwd: PROJECT_ROOT }).exited);
                }
              }
              if (content.includes('TELEGRAM_WEBHOOK=http')) {
                const urlMatch = content.match(/TELEGRAM_WEBHOOK=(http[^\n]+)/);
                if (urlMatch) {
                  sendPromises.push(Bun.spawn(["node", "lib/webhook/send-summary-webhook.mjs", "--type", "telegram", "--webhook", urlMatch[1]], { cwd: PROJECT_ROOT }).exited);
                }
              }
              if (content.includes('BRRR_WEBHOOK=http')) {
                const urlMatch = content.match(/BRRR_WEBHOOK=(http[^\n]+)/);
                if (urlMatch) {
                  sendPromises.push(Bun.spawn(["node", "lib/webhook/send-summary-webhook.mjs", "--type", "brrr", "--webhook", urlMatch[1]], { cwd: PROJECT_ROOT }).exited);
                }
              }
              
              await Promise.allSettled(sendPromises);
              console.log(`[Backend] Webhooks dispatched.`);
            }
          } catch(e) {
            console.error(`[Backend] Failed to dispatch webhooks:`, e);
          }

          // 3. Save to recent_runs.json
          try {
            const fs = require('fs');
            const ptVarDir = `${process.env.HOME}/.pt/var`;
            if (!fs.existsSync(ptVarDir)) {
              fs.mkdirSync(ptVarDir, { recursive: true });
            }
            const recentPath = `${ptVarDir}/recent_runs.json`;
            const recentFile = Bun.file(recentPath);
            let runs = [];
            if (await recentFile.exists()) {
              runs = await recentFile.json();
            }
            
            const newEntry = {
              ts: Date.now(),
              date: new Date().toISOString(),
              entry: `${script} [${envVars.ENV} | ${envVars.VUS} VUs | ${envVars.DURATION}]`,
              script: script,
              env: envVars.ENV,
              vus: envVars.VUS,
              duration: envVars.DURATION,
              platform: envVars.PLATFORM,
              scenario: envVars.SCENARIO
            };
            
            // Add to front, keep only last 5
            runs.unshift(newEntry);
            runs = runs.slice(0, 5);
            
            await Bun.write(recentPath, JSON.stringify(runs, null, 2));
            console.log(`[Backend] Added run to recent_runs.json.`);
          } catch(e) {
            console.error(`[Backend] Failed to save recent runs:`, e);
          }
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
        let envFile = Bun.file(`${PROJECT_ROOT}/configs/pt.env`);
        if (!(await envFile.exists())) {
          envFile = Bun.file(`${PROJECT_ROOT}/docker-local-pt/configs/local.env`);
        }
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
        let envPath = `${PROJECT_ROOT}/configs/pt.env`;
        let envFile = Bun.file(envPath);
        if (!(await envFile.exists())) {
          envPath = `${PROJECT_ROOT}/docker-local-pt/configs/local.env`;
          envFile = Bun.file(envPath);
        }
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

    if (url.pathname === "/api/scripts" && req.method === "GET") {
      try {
        const { readdirSync, statSync } = require('fs');
        const scriptDir = join(PROJECT_ROOT, "Script");
        let results: string[] = [];
        
        function walk(dir: string) {
          const list = readdirSync(dir);
          for (let file of list) {
            const fullPath = join(dir, file);
            const stat = statSync(fullPath);
            if (stat && stat.isDirectory()) {
              if (fullPath.includes("[ToDo]") || fullPath.includes("archive")) continue;
              walk(fullPath);
            } else {
              if (fullPath.endsWith(".js") || fullPath.endsWith(".sh")) {
                if (fullPath.includes("copy") || fullPath.includes("?")) continue;
                results.push(fullPath.replace(scriptDir + "/", ""));
              }
            }
          }
        }
        
        walk(scriptDir);
        return new Response(JSON.stringify({ scripts: results }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
      } catch(err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
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
        let grafanaPort = "5000";
        if (await grafanaPortFile.exists()) {
          const filePort = (await grafanaPortFile.text()).trim();
          if (filePort) grafanaPort = filePort;
        }
        
        try {
          const res = await fetch(`http://127.0.0.1:${grafanaPort}/health`);
          if (res.ok) {
            grafanaStatus = "ON";
          }
        } catch(e) {}

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

    if (url.pathname === "/api/audit-trail" && req.method === "GET") {
      try {
        const proc = Bun.spawn(["python3", "-W", "ignore", "bin/pt-audit", "tail", "--limit", "20", "--json"], {
          cwd: PROJECT_ROOT,
        });
        const text = await new Response(proc.stdout).text();
        return new Response(text, {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
      }
    }

    if (url.pathname === "/api/recent-runs" && req.method === "GET") {
      try {
        const recentFile = Bun.file(`${process.env.HOME}/.pt/var/recent_runs.json`);
        if (await recentFile.exists()) {
          const content = await recentFile.text();
          return new Response(content, { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
        }
        return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
      }
    }

    if (url.pathname === "/api/resmon" && req.method === "GET") {
      try {
        const proc = Bun.spawn(["python3", "-W", "ignore", "bin/pt-resmon", "snapshot"], {
          cwd: PROJECT_ROOT,
        });
        const jsonText = await new Response(proc.stdout).text();
        return new Response(jsonText, {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
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

    if (url.pathname === "/api/grafana/logs" && req.method === "GET") {
      try {
        const logFile = Bun.file("/tmp/grafana_backend.log");
        if (await logFile.exists()) {
          const text = await logFile.text();
          const lines = text.trim().split("\n");
          return new Response(JSON.stringify({ output: lines.slice(-50).join("\n") }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
        }
        return new Response(JSON.stringify({ output: "No logs found." }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
      }
    }

    if (url.pathname === "/api/grafana/dummy-report" && req.method === "POST") {
      try {
        const startTs = Date.now() - 3600000;
        const endTs = Date.now();
        const proc = Bun.spawn([
          "python3", "-W", "ignore", "bin/pt-grafana-report", 
          "--start", startTs.toString(), 
          "--end", endTs.toString(), 
          "--output", "/tmp/dummy_grafana_report.html"
        ], {
          cwd: PROJECT_ROOT,
        });
        await proc.exited;
        return new Response(JSON.stringify({ success: true, message: "Dummy report generated at /tmp/dummy_grafana_report.html" }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
      }
    }

    if (url.pathname === "/api/grafana/view-dummy" && req.method === "GET") {
      try {
        const reportFile = Bun.file("/tmp/dummy_grafana_report.html");
        if (await reportFile.exists()) {
          return new Response(reportFile, {
            headers: {
              "Content-Type": "text/html",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        return new Response("Dummy report not found.", { status: 404 });
      } catch (err) {
        return new Response(String(err), { status: 500 });
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

    // --- USER MANAGEMENT API ---
    if (url.pathname.startsWith("/api/users") && ["GET", "POST", "PATCH", "DELETE"].includes(req.method)) {
      const username = req.headers.get("x-username") || "";
      if (!username) return new Response("Unauthorized", { status: 401, headers: { "Access-Control-Allow-Origin": "*" } });

      const parts = url.pathname.split("/").filter(Boolean);
      const targetUser = parts[2]; // /api/users/:targetUser

      let cmd = ["python3", "-W", "ignore", "bin/pt-usermgmt"];
      let stdinInput = "";

      if (req.method === "GET") {
        cmd.push("list-users", "--by", username);
      } else if (req.method === "POST") {
        try {
          const body = await req.json();
          cmd.push("create", "--by", username, "--username", body.username, "--role", body.role || "readonly", "--password-stdin");
          stdinInput = body.password;
        } catch(e) {
          return new Response(JSON.stringify({error: "Bad Request"}), { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
        }
      } else if (req.method === "PATCH") {
        try {
          const body = await req.json();
          if (body.action === "lock") cmd.push("lock-user", "--by", username, "--username", targetUser);
          else if (body.action === "unlock") cmd.push("unlock-user", "--by", username, "--username", targetUser);
          else if (body.action === "assign-role") cmd.push("assign-role", "--by", username, "--username", targetUser, "--role", body.role);
          else if (body.action === "reset-password") {
            cmd.push("reset-password", "--by", username, "--username", targetUser, "--password-stdin");
            stdinInput = body.password;
          }
        } catch(e) {
          return new Response(JSON.stringify({error: "Bad Request"}), { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
        }
      } else if (req.method === "DELETE") {
        cmd.push("delete", "--by", username, "--username", targetUser);
      }

      const proc = Bun.spawn(cmd, { cwd: PROJECT_ROOT, stdin: "pipe", stderr: "pipe", stdout: "pipe" });
      if (stdinInput) {
        proc.stdin.write(stdinInput + "\n");
        proc.stdin.flush(); proc.stdin.end();
      }
      proc.stdin.end();

      const text = await new Response(proc.stdout).text();
      return new Response(text, { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
    }

    // --- CRON SCHEDULER API ---
    if (url.pathname.startsWith("/api/cron-jobs") && ["GET", "POST", "PATCH", "DELETE"].includes(req.method)) {
      const username = req.headers.get("x-username") || "";
      if (!username) return new Response("Unauthorized", { status: 401, headers: { "Access-Control-Allow-Origin": "*" } });

      const parts = url.pathname.split("/").filter(Boolean);
      const jobId = parts[2]; // /api/cron-jobs/:id

      let cmd = ["python3", "-W", "ignore", "bin/pt-scheduler"];

      if (req.method === "GET") {
        cmd.push("list");
      } else if (req.method === "POST") {
        try {
          const body = await req.json();
          cmd.push("add", "--id", body.id, "--cron", body.cron, "--script", body.script, "--by", username);
        } catch(e) {
          return new Response(JSON.stringify({error: "Bad Request"}), { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
        }
      } else if (req.method === "PATCH") {
        try {
          const body = await req.json();
          cmd.push("toggle", "--id", jobId, "--action", body.action); // pause | resume
        } catch(e) {
          return new Response(JSON.stringify({error: "Bad Request"}), { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
        }
      } else if (req.method === "DELETE") {
        cmd.push("remove", "--id", jobId);
      }

      const proc = Bun.spawn(cmd, { cwd: PROJECT_ROOT });
      const text = await new Response(proc.stdout).text();
      return new Response(text, { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
    }

    // --- TOOLS API ---
    if (url.pathname.startsWith("/api/tools") && ["GET", "POST"].includes(req.method)) {
      const toolName = url.pathname.split("/")[3]; // /api/tools/:toolName
      let cmd: string[] = [];
      let stdinInput = "";

      if (toolName === "resmon") {
        cmd = ["bash", "bin/pt-resmon", "snapshot"];
      } else if (toolName === "bootstrap-check") {
        cmd = ["bash", "bin/pt-bootstrap-check"];
      } else if (toolName === "lock-status") {
        const username = req.headers.get("x-username") || "system";
        cmd = ["python3", "-W", "ignore", "bin/pt-lock-status", username, "ALL"];
      } else if (toolName === "rescue") {
        cmd = ["python3", "-W", "ignore", "bin/pt-rescue"];
        if (req.method === "POST") {
          try {
            const body = await req.json();
            if (body.username && body.password) {
              stdinInput = `${body.username}\n${body.password}\n`;
            }
          } catch(e) {}
        }
      } else if (toolName === "audit-tail") {
        cmd = ["python3", "-W", "ignore", "bin/pt-audit", "tail", "--limit", "20"];
      } else {
        return new Response(JSON.stringify({ error: "Unknown tool" }), { status: 404, headers: { "Access-Control-Allow-Origin": "*" } });
      }

      const proc = Bun.spawn(cmd, { cwd: PROJECT_ROOT, stdin: stdinInput ? "pipe" : undefined });
      
      if (stdinInput && proc.stdin) {
        proc.stdin.write(stdinInput);
        proc.stdin.flush(); proc.stdin.end();
        proc.stdin.end();
      }

      const stdout = await new Response(proc.stdout).text();
      const stderr = await new Response(proc.stderr).text();

      return new Response(JSON.stringify({ output: stdout + stderr }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
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
