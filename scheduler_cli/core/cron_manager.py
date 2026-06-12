"""
Cron Manager — safe crontab parser/writer.
Manages only tagged jobs (# SCHEDULER_CLI:job_id).
Leaves all other crontab entries untouched.
"""

import subprocess
import re
import json
import os
from datetime import datetime

STATE_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "jobs_state.json")
TAG_PREFIX = "# SCHEDULER_CLI:"


def _state_path():
    return os.path.abspath(STATE_FILE)


def load_state():
    """Load jobs state from JSON."""
    path = _state_path()
    if not os.path.exists(path):
        return {"jobs": {}}
    with open(path, "r") as f:
        return json.load(f)


def save_state(state):
    """Save jobs state to JSON."""
    path = _state_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(state, f, indent=2, default=str)


def _read_crontab():
    """Read current user crontab. Returns list of lines."""
    try:
        result = subprocess.run(
            ["crontab", "-l"],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode != 0:
            # No crontab for user
            return []
        return result.stdout.strip().split("\n") if result.stdout.strip() else []
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return []


def _write_crontab(lines):
    """Write lines to user crontab atomically."""
    content = "\n".join(lines) + "\n"
    proc = subprocess.run(
        ["crontab", "-"],
        input=content, capture_output=True, text=True, timeout=10
    )
    if proc.returncode != 0:
        raise RuntimeError(f"crontab write failed: {proc.stderr}")


def validate_cron_syntax(expr):
    """
    Basic cron syntax validation (5 fields).
    Returns (valid: bool, error: str|None).
    """
    parts = expr.strip().split()
    if len(parts) != 5:
        return False, f"Expected 5 fields, got {len(parts)}"

    ranges = [
        (0, 59, "minute"),
        (0, 23, "hour"),
        (1, 31, "day of month"),
        (1, 12, "month"),
        (0, 7, "day of week"),
    ]

    for i, (lo, hi, name) in enumerate(ranges):
        field = parts[i]
        if field == "*":
            continue
        # Handle */N
        if re.match(r"^\*/\d+$", field):
            continue
        # Handle N-M
        if re.match(r"^\d+-\d+$", field):
            a, b = field.split("-")
            if not (lo <= int(a) <= hi and lo <= int(b) <= hi):
                return False, f"{name}: range {field} out of bounds ({lo}-{hi})"
            continue
        # Handle comma-separated
        if "," in field:
            for v in field.split(","):
                if not v.isdigit() or not (lo <= int(v) <= hi):
                    return False, f"{name}: value {v} out of bounds ({lo}-{hi})"
            continue
        # Single number
        if field.isdigit():
            if not (lo <= int(field) <= hi):
                return False, f"{name}: {field} out of bounds ({lo}-{hi})"
            continue
        return False, f"{name}: invalid field '{field}'"

    return True, None


def _remove_tagged_lines(lines, tag):
    """
    Remove the tag line (active or paused) and the immediately following cron line.
    """
    new_lines = []
    skip = False
    for i, line in enumerate(lines):
        if skip:
            skip = False
            continue
        cleaned = line.strip()
        if cleaned == tag or cleaned == f"# PAUSED {tag}":
            skip = True
            continue
        new_lines.append(line)
    return new_lines


def add_job(job_id, cron_expr, script_path, target="local", description=""):
    """
    Add managed job to crontab and state file.
    Returns (success: bool, message: str).
    """
    valid, err = validate_cron_syntax(cron_expr)
    if not valid:
        return False, f"Invalid cron: {err}"

    abs_script = os.path.abspath(script_path)
    if not os.path.exists(abs_script):
        return False, f"Script not found: {abs_script}"

    state = load_state()

    # Build cron lines (tag on comment line, cron on next line)
    tag = f"{TAG_PREFIX}{job_id}"
    cron_line = f"{cron_expr} {abs_script}"

    # Update crontab
    lines = _read_crontab()
    # Remove old entry if exists (tag line + following cron line)
    lines = _remove_tagged_lines(lines, tag)
    lines.append(tag)
    lines.append(cron_line)
    _write_crontab(lines)

    # Update state
    state["jobs"][job_id] = {
        "cron_expr": cron_expr,
        "script_path": abs_script,
        "target": target,
        "description": description,
        "status": "active",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }
    save_state(state)

    return True, f"Job '{job_id}' added → {cron_expr} {abs_script}"


def remove_job(job_id):
    """Remove managed job from crontab and state."""
    state = load_state()
    tag = f"{TAG_PREFIX}{job_id}"

    # Remove from crontab (tag line + following cron line)
    lines = _read_crontab()
    new_lines = _remove_tagged_lines(lines, tag)
    if len(new_lines) != len(lines):
        _write_crontab(new_lines)

    # Remove from state
    if job_id in state["jobs"]:
        del state["jobs"][job_id]
        save_state(state)
        return True, f"Job '{job_id}' removed"
    return False, f"Job '{job_id}' not found in state"


def pause_job(job_id):
    """Comment out job in crontab, mark paused in state."""
    state = load_state()
    if job_id not in state["jobs"]:
        return False, f"Job '{job_id}' not found"

    tag = f"{TAG_PREFIX}{job_id}"
    lines = _read_crontab()
    new_lines = []
    found = False
    skip = False
    for i, l in enumerate(lines):
        if skip:
            skip = False
            continue
        if l.strip() == tag:
            new_lines.append(f"# PAUSED {l}")
            if i + 1 < len(lines):
                next_line = lines[i + 1]
                if not next_line.strip().startswith("#"):
                    new_lines.append(f"# {next_line}")
                else:
                    new_lines.append(next_line)
                skip = True
            found = True
        else:
            new_lines.append(l)

    if found:
        _write_crontab(new_lines)
        state["jobs"][job_id]["status"] = "paused"
        state["jobs"][job_id]["updated_at"] = datetime.now().isoformat()
        save_state(state)
        return True, f"Job '{job_id}' paused"
    return False, f"Job '{job_id}' not found in crontab"


def resume_job(job_id):
    """Uncomment paused job in crontab."""
    state = load_state()
    if job_id not in state["jobs"]:
        return False, f"Job '{job_id}' not found"

    tag = f"{TAG_PREFIX}{job_id}"
    lines = _read_crontab()
    new_lines = []
    found = False
    skip = False
    for i, l in enumerate(lines):
        if skip:
            skip = False
            continue
        if l.strip() == f"# PAUSED {tag}":
            new_lines.append(tag)
            if i + 1 < len(lines):
                next_line = lines[i + 1]
                restored_line = re.sub(r"^#\s*", "", next_line)
                new_lines.append(restored_line)
                skip = True
            found = True
        else:
            new_lines.append(l)

    if found:
        _write_crontab(new_lines)
        state["jobs"][job_id]["status"] = "active"
        state["jobs"][job_id]["updated_at"] = datetime.now().isoformat()
        save_state(state)
        return True, f"Job '{job_id}' resumed"
    return False, f"Job '{job_id}' not found as paused in crontab"


def list_jobs():
    """Return dict of all managed jobs from state."""
    state = load_state()
    return state.get("jobs", {})


def sync_status():
    """
    Verify state file matches actual crontab.
    Returns list of discrepancies.
    """
    state = load_state()
    lines = _read_crontab()
    issues = []

    for job_id, job in state.get("jobs", {}).items():
        tag = f"{TAG_PREFIX}{job_id}"
        tag_present = any(l.strip() == tag for l in lines)
        paused_present = any(f"# PAUSED {tag}" in l for l in lines)
        if not tag_present and not paused_present and job["status"] == "active":
            issues.append(f"Job '{job_id}' active in state but missing from crontab")
        elif tag_present and job["status"] == "paused":
            issues.append(f"Job '{job_id}' marked paused but active in crontab")

    return issues
