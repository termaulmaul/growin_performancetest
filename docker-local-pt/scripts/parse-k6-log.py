import sys
import re
import json

log_path = sys.argv[1]
out_path = sys.argv[2]
suite_name = sys.argv[3]

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

summary = {
    "mode": "Sandbox / Direct",
    "suite": suite_name,
    "scenario": "BP001",
    "platform": "Web",
    "variant": "original",
    "iterations": 0,
    "http_reqs": http_reqs,
    "http_req_failed_rate": failed_rate,
    "http_req_duration_p95": p95,
    "timestamp": ""
}

# Try extracting suite, scenario, platform from log header if printed by run-local.sh
m_suite = re.search(r'SUITE\s*:\s*([^\n]+)', text)
if m_suite: summary["suite"] = m_suite.group(1).strip()
m_scen = re.search(r'SCENARIO\s*:\s*([^\n]+)', text)
if m_scen: summary["scenario"] = m_scen.group(1).strip()
m_plat = re.search(r'PLATFORM\s*:\s*([^\n]+)', text)
if m_plat: summary["platform"] = m_plat.group(1).strip()

with open(out_path, 'w') as f:
    json.dump(summary, f, indent=2)
print("Parsed summary from log")
