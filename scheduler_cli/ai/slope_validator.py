"""
AI Slope Validator — offline regex/heuristic-based code quality checker.
Scores scripts on multiple risk dimensions.
Blocks scheduling if score below threshold.

Slope Score: 0-100 (higher = better quality)
Threshold: 60 (configurable)
"""

import re
import os

DEFAULT_THRESHOLD = 60

# Risk patterns with severity weights
RISK_PATTERNS = [
    # General risks
    {"name": "rm_rf_root", "pattern": r"rm\s+-rf\s+/[^/\s]", "severity": 40,
     "desc": "Dangerous rm -rf targeting root paths", "lang": "shell"},
    {"name": "eval_usage", "pattern": r"\beval\b", "severity": 25,
     "desc": "eval usage — code injection risk", "lang": "all"},
    {"name": "curl_pipe_sh", "pattern": r"curl\s+.*\|\s*(ba)?sh", "severity": 30,
     "desc": "curl piped to shell — remote code execution risk", "lang": "shell"},
    {"name": "chmod_777", "pattern": r"chmod\s+777", "severity": 20,
     "desc": "chmod 777 — overly permissive", "lang": "shell"},
    {"name": "hardcoded_password", "pattern": r"(password|passwd|pwd)\s*=\s*['\"][^'\"]+['\"]",
     "severity": 25, "desc": "Hardcoded password detected", "lang": "all"},
    {"name": "sudo_nopasswd", "pattern": r"sudo\s+", "severity": 10,
     "desc": "sudo usage — may require password or elevated privileges", "lang": "shell"},
    {"name": "sleep_long", "pattern": r"sleep\s+(\d{3,})", "severity": 8,
     "desc": "Long sleep detected — possible design issue", "lang": "shell"},
    {"name": "infinite_loop", "pattern": r"while\s+(true|1|:)", "severity": 15,
     "desc": "Infinite loop detected — ensure exit condition exists", "lang": "shell"},
    {"name": "todo_fixme", "pattern": r"(TODO|FIXME|HACK|XXX)", "severity": 5,
     "desc": "Unresolved TODO/FIXME marker", "lang": "all"},
    {"name": "duplicate_lines", "pattern": None, "severity": 5,
     "desc": "Significant code duplication detected", "check_type": "duplication", "lang": "all"},

    # Shell specific risks
    {"name": "no_error_handling", "pattern": r"^(?!.*set\s+-e)", "severity": 10,
     "desc": "Missing 'set -e' — errors may be silently ignored", "check_type": "file_level", "lang": "shell"},

    # JS/K6 specific risks
    {"name": "console_log_spam", "pattern": r"console\.log\(", "severity": 5,
     "desc": "console.log in production test — use k6 metrics/logging instead", "lang": "js"},
    {"name": "hardcoded_ip", "pattern": r"https?://[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+", "severity": 15,
     "desc": "Hardcoded IP in test script — use DNS or config environments", "lang": "js"},
    {"name": "no_thresholds", "pattern": r"thresholds", "severity": 15,
     "desc": "Missing k6 thresholds configuration", "check_type": "file_level_absent", "lang": "js"},
]

# Quality bonus patterns
QUALITY_PATTERNS = [
    # Shell quality bonuses
    {"name": "has_shebang", "pattern": r"^#!", "bonus": 5,
     "desc": "Has shebang line", "lang": "shell"},
    {"name": "has_set_e", "pattern": r"set\s+-e", "bonus": 10,
     "desc": "Uses 'set -e' for error handling", "lang": "shell"},
    {"name": "has_set_u", "pattern": r"set\s+-u", "bonus": 5,
     "desc": "Uses 'set -u' for undefined variable checking", "lang": "shell"},
    {"name": "has_comments_shell", "pattern": r"^\s*#[^!]", "bonus": 5,
     "desc": "Has documentation comments", "check_type": "count", "min_count": 3, "lang": "shell"},

    # JS quality bonuses
    {"name": "has_comments_js", "pattern": r"^\s*(//|/\*)", "bonus": 5,
     "desc": "Has documentation comments", "check_type": "count", "min_count": 3, "lang": "js"},
    {"name": "has_k6_imports", "pattern": r"from\s+['\"]k6[^'\"]*['\"]", "bonus": 10,
     "desc": "Uses official k6 modules", "lang": "js"},

    # General quality bonuses
    {"name": "has_functions", "pattern": r"(\b\w+\s*\(\)\s*\{|\bfunction\b|\bconst\s+\w+\s*=\s*(\([^)]*\)|[^=])\s*=>)", "bonus": 5,
     "desc": "Uses functions/modules for organization", "lang": "all"},
    {"name": "has_logging", "pattern": r"(echo\s+\"\[|logger\s+|log_|console\.(log|info|warn|error))", "bonus": 5,
     "desc": "Has structured logging", "lang": "all"},
]


def _check_duplication(lines):
    """Check for significant code duplication."""
    stripped = [l.strip() for l in lines if l.strip() and not l.strip().startswith("#")]
    if len(stripped) < 5:
        return 0

    seen = {}
    duplicates = 0
    for line in stripped:
        if len(line) > 15:  # Only count meaningful lines
            seen[line] = seen.get(line, 0) + 1
            if seen[line] > 1:
                duplicates += 1

    dup_ratio = duplicates / len(stripped) if stripped else 0
    if dup_ratio > 0.3:
        return 2  # Heavy duplication
    elif dup_ratio > 0.15:
        return 1  # Moderate duplication
    return 0


def validate_script(script_path, threshold=DEFAULT_THRESHOLD):
    """
    Validate script quality.
    Returns dict with: score, passed, findings[], recommendations[].
    """
    abs_path = os.path.abspath(script_path)

    if not os.path.exists(abs_path):
        return {
            "score": 0,
            "passed": False,
            "threshold": threshold,
            "findings": [{"severity": "CRITICAL", "msg": f"File not found: {abs_path}"}],
            "recommendations": [],
        }

    with open(abs_path, "r") as f:
        content = f.read()

    lines = content.split("\n")
    score = 100
    findings = []
    recommendations = []

    # Get language based on extension
    _, ext = os.path.splitext(abs_path)
    lang = "js" if ext.lower() == ".js" else "shell"

    # Check risk patterns
    for risk in RISK_PATTERNS:
        rlang = risk.get("lang", "all")
        if rlang != "all" and rlang != lang:
            continue

        check_type = risk.get("check_type", "regex")

        if check_type == "file_level":
            # Check if pattern is NOT present in entire file
            if risk["pattern"].startswith("^(?!"):
                if not re.search(r"set\s+-e", content):
                    score -= risk["severity"]
                    findings.append({
                        "severity": "MEDIUM" if risk["severity"] < 15 else "HIGH",
                        "name": risk["name"],
                        "msg": risk["desc"],
                        "line": None,
                    })
                    recommendations.append(f"Add 'set -e' at script start")
            continue

        if check_type == "file_level_absent":
            if not re.search(risk["pattern"], content):
                score -= risk["severity"]
                findings.append({
                    "severity": "MEDIUM" if risk["severity"] < 15 else "HIGH",
                    "name": risk["name"],
                    "msg": risk["desc"],
                    "line": None,
                })
                if risk["name"] == "no_thresholds":
                    recommendations.append("Add k6 performance SLO thresholds configuration (e.g. thresholds: { http_req_duration: ['p(95)<500'] })")
            continue

        if check_type == "duplication":
            dup_level = _check_duplication(lines)
            if dup_level > 0:
                deduction = risk["severity"] * dup_level
                score -= deduction
                findings.append({
                    "severity": "MEDIUM" if dup_level == 1 else "HIGH",
                    "name": risk["name"],
                    "msg": risk["desc"],
                    "line": None,
                })
                recommendations.append("Refactor duplicated code into functions")
            continue

        # Standard regex check
        if risk["pattern"]:
            for i, line in enumerate(lines, 1):
                if re.search(risk["pattern"], line, re.IGNORECASE):
                    score -= risk["severity"]
                    findings.append({
                        "severity": "CRITICAL" if risk["severity"] >= 20 else "HIGH" if risk["severity"] >= 10 else "MEDIUM",
                        "name": risk["name"],
                        "msg": f"Line {i}: {risk['desc']}",
                        "line": i,
                    })

    # Check quality bonuses
    for quality in QUALITY_PATTERNS:
        qlang = quality.get("lang", "all")
        if qlang != "all" and qlang != lang:
            continue

        check_type = quality.get("check_type", "regex")

        if check_type == "count":
            matches = len(re.findall(quality["pattern"], content, re.MULTILINE))
            if matches >= quality.get("min_count", 1):
                score += quality["bonus"]
        elif check_type == "regex":
            if re.search(quality["pattern"], content, re.MULTILINE):
                score += quality["bonus"]
        else:
            if re.search(quality["pattern"], content, re.MULTILINE):
                score += quality["bonus"]

    # Clamp score
    score = max(0, min(100, score))

    # Generate recommendations if score low
    if score < threshold:
        if lang == "shell":
            if not re.search(r"set\s+-e", content):
                recommendations.append("Add 'set -e' for error handling")
            if not re.search(r"set\s+-u", content):
                recommendations.append("Add 'set -u' for undefined variable checking")
            if not re.search(r"set\s+-o\s+pipefail", content):
                recommendations.append("Add 'set -o pipefail' for pipeline error handling")
        elif lang == "js":
            if not re.search(r"thresholds", content):
                recommendations.append("Configure performance thresholds in your k6 script (SLOs)")

    passed = score >= threshold

    return {
        "score": score,
        "passed": passed,
        "threshold": threshold,
        "findings": findings,
        "recommendations": list(set(recommendations)),
        "script_path": abs_path,
        "line_count": len(lines),
    }


def format_report(result):
    """Format validation result as readable report string."""
    lines = []
    lines.append("=" * 60)
    lines.append("  AI SLOPE CODE QUALITY REPORT")
    lines.append("=" * 60)
    lines.append(f"  Script: {result.get('script_path', 'unknown')}")
    lines.append(f"  Lines:  {result.get('line_count', 0)}")
    lines.append(f"  Score:  {result['score']}/100  (threshold: {result['threshold']})")

    status = "✅ PASSED" if result["passed"] else "❌ BLOCKED"
    lines.append(f"  Status: {status}")
    lines.append("-" * 60)

    if result["findings"]:
        lines.append("\n  📋 FINDINGS:")
        for f in result["findings"]:
            icon = {"CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡"}.get(f["severity"], "⚪")
            loc = f"  (line {f['line']})" if f.get("line") else ""
            lines.append(f"    {icon} [{f['severity']}] {f['msg']}{loc}")

    if result["recommendations"]:
        lines.append("\n  💡 RECOMMENDATIONS:")
        for r in result["recommendations"]:
            lines.append(f"    → {r}")

    lines.append("=" * 60)
    return "\n".join(lines)
