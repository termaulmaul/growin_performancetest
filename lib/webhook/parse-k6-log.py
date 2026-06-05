import sys
import re
import json

log_path = sys.argv[1]
out_path = sys.argv[2]
suite_name = sys.argv[3]
target = sys.argv[4] if len(sys.argv) > 4 else ""
mode = sys.argv[5] if len(sys.argv) > 5 else ""

with open(log_path, 'r') as f:
    text = f.read()

# Strip ANSI codes
ansi_escape = re.compile(r'(?:[@-Z\-_]|\[[0-?]*[ -/]*[@-~])')
text = ansi_escape.sub('', text)

# Extract metrics
# e.g., http_reqs..................: 10      0.255672/s
http_reqs = 0
m_reqs = re.search(r'http_reqs\.+:\s*(\d+)', text)
if m_reqs:
    http_reqs = int(m_reqs.group(1))

# e.g., http_req_duration..........: avg=0s ... p(95)=0s
p95 = 0.0
m_dur = re.search(r'http_req_duration\.+:[^\n]*p\(95\)=([0-9\.]+)(ms|µs|s|m)?', text)
if m_dur:
    val = float(m_dur.group(1))
    unit = m_dur.group(2)
    if unit == 's':
        val *= 1000
    elif unit == 'µs':
        val /= 1000
    p95 = val

# e.g., http_req_failed............: 100.00%
failed_rate = 0.0
m_fail = re.search(r'http_req_failed\.+:\s*([0-9\.]+)%', text)
if m_fail:
    failed_rate = float(m_fail.group(1)) / 100.0

# Extract duration from log (e.g., "default: 1 looping VUs for 30s" or "duration=30s")
duration_str = "30s"
m_dur_env = re.search(r'\bDURATION\s*[=:]\s*([0-9]+[smh])', text)
if m_dur_env:
    duration_str = m_dur_env.group(1)
else:
    m_dur_exec = re.search(r'for\s+([0-9]+[smh])\b', text)
    if m_dur_exec:
        duration_str = m_dur_exec.group(1)
    else:
        m_dur_flag = re.search(r'\-\-duration[= ]([0-9]+[smh])', text)
        if m_dur_flag:
            duration_str = m_dur_flag.group(1)

# Extract VUs
vus_str = "1"
m_vus = re.search(r'\b(?:K6_USERS|USER|VUs?)[= ]+([0-9]+)', text, re.IGNORECASE)
if m_vus:
    vus_str = m_vus.group(1)
else:
    m_vus2 = re.search(r'(\d+)\s+looping VUs', text)
    if m_vus2:
        vus_str = m_vus2.group(1)

import datetime
summary = {
    "mode": mode or "Unknown",
    "suite": suite_name,
    "scenario": "BP001",
    "platform": "Web",
    "variant": "original",
    "iterations": 0,
    "http_reqs": http_reqs,
    "http_req_failed_rate": failed_rate,
    "http_req_duration_p95": p95,
    "duration": duration_str,
    "vus": vus_str,
    "timestamp": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
}
if target:
    summary["base_url"] = target


# Try extracting suite, scenario, platform from log header if printed by run-local.sh
m_suite = re.search(r'SUITE\s*:\s*([^\n]+)', text)
if m_suite: summary["suite"] = m_suite.group(1).strip()
m_scen = re.search(r'SCENARIO\s*:\s*([^\n]+)', text)
if m_scen: summary["scenario"] = m_scen.group(1).strip()
m_plat = re.search(r'PLATFORM\s*:\s*([^\n]+)', text)
if m_plat: summary["platform"] = m_plat.group(1).strip()

# ── Extract top HTTP errors from log ─────────────────────────────────────
from collections import defaultdict
error_counts = defaultdict(lambda: {"count": 0, "status": "", "endpoint": ""})
for line in text.split("\n"):
    # Pattern: ✘ ERROR https://host/path || Status: NNN
    import re as _re
    m = _re.search(r'ERROR\s+https?://[^/]+(/[^\s|]+)\s*\|\|\s*Status:\s*(\d+)', line)
    if m:
        endpoint, status = m.group(1).split("?")[0], m.group(2)
        key = status + ":" + endpoint
        error_counts[key]["count"] += 1
        error_counts[key]["status"] = status
        error_counts[key]["endpoint"] = endpoint
        continue
    # Pattern: FAILED - Status: NNN || Body
    m = _re.search(r"FAILED.*?Status:[\s]*(\d{3}).*?(/[^\s|]+)", line)
    if m and int(m.group(1)) >= 400:
        endpoint, status = m.group(2).split("?")[0], m.group(1)
        key = status + ":" + endpoint
        error_counts[key]["count"] += 1
        error_counts[key]["status"] = status
        error_counts[key]["endpoint"] = endpoint

top_errors = sorted(error_counts.values(), key=lambda x: x["count"], reverse=True)[:5]
summary["errors"] = [
    {"status": e["status"], "endpoint": e["endpoint"], "count": e["count"]}
    for e in top_errors if e["count"] > 0
]

with open(out_path, 'w') as f:
    json.dump(summary, f, indent=2)
print("Parsed summary from log")
