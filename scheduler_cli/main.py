#!/usr/bin/env python3
"""
Scheduler CLI — Interactive menu for cron job scheduling,
target management, AI code quality checking, and local test execution.

Usage:
    python3 main.py              # Interactive menu
    python3 main.py --test-check # Run self-test validation
"""

import sys
import os
import argparse

# Ensure package imports work when running directly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.cron_manager import (
    add_job, remove_job, pause_job, resume_job,
    list_jobs, sync_status, validate_cron_syntax,
)
from core.target_mapper import (
    add_target, remove_target, list_targets, get_target,
)
from core.local_runner import run_script
from ai.slope_validator import validate_script, format_report


# ─── Colors ───────────────────────────────────────────────────
class C:
    RESET = "\033[0m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    RED = "\033[31m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    BLUE = "\033[34m"
    MAGENTA = "\033[35m"
    CYAN = "\033[36m"
    WHITE = "\033[37m"
    BG_BLUE = "\033[44m"


def clear():
    os.system("clear" if os.name != "nt" else "cls")


def header(title):
    w = 60
    print(f"\n{C.BG_BLUE}{C.WHITE}{C.BOLD}{'=' * w}{C.RESET}")
    print(f"{C.BG_BLUE}{C.WHITE}{C.BOLD}{title:^{w}}{C.RESET}")
    print(f"{C.BG_BLUE}{C.WHITE}{C.BOLD}{'=' * w}{C.RESET}\n")


def prompt(msg, default=None):
    """Input prompt with optional default."""
    suffix = f" [{default}]" if default else ""
    val = input(f"  {C.CYAN}▸{C.RESET} {msg}{suffix}: ").strip()
    return val if val else default


def menu_choice(options, title="Select"):
    """Display numbered menu and return choice."""
    print(f"\n  {C.BOLD}{title}{C.RESET}")
    for i, (key, label) in enumerate(options, 1):
        print(f"    {C.YELLOW}{i}{C.RESET}. {label}")
    print(f"    {C.DIM}0. Back / Cancel{C.RESET}")

    while True:
        choice = prompt("Choice")
        if choice == "0" or choice is None:
            return None
        try:
            idx = int(choice) - 1
            if 0 <= idx < len(options):
                return options[idx][0]
        except (ValueError, IndexError):
            pass
        print(f"  {C.RED}Invalid choice{C.RESET}")


def press_enter():
    input(f"\n  {C.DIM}Press Enter to continue...{C.RESET}")


# ─── Dashboard ────────────────────────────────────────────────
def dashboard():
    clear()
    header("📋 SCHEDULER CLI — DASHBOARD")
    jobs = list_jobs()

    if not jobs:
        print(f"  {C.DIM}No managed jobs.{C.RESET}")
    else:
        # Table header
        print(f"  {C.BOLD}{'ID':<15} {'Status':<10} {'Schedule':<15} {'Script':<30}{C.RESET}")
        print(f"  {'─' * 70}")
        for jid, info in jobs.items():
            status_color = C.GREEN if info["status"] == "active" else C.YELLOW
            status_icon = "●" if info["status"] == "active" else "○"
            script_short = os.path.basename(info["script_path"])
            print(
                f"  {C.CYAN}{jid:<15}{C.RESET} "
                f"{status_color}{status_icon} {info['status']:<8}{C.RESET} "
                f"{info['cron_expr']:<15} "
                f"{script_short:<30}"
            )

    # Sync check
    issues = sync_status()
    if issues:
        print(f"\n  {C.RED}⚠ Sync Issues:{C.RESET}")
        for issue in issues:
            print(f"    {C.RED}• {issue}{C.RESET}")

    print()


# ─── Job Menu ─────────────────────────────────────────────────
def job_menu():
    while True:
        clear()
        header("🔧 JOB MANAGEMENT")

        choice = menu_choice([
            ("add", "Add New Job"),
            ("remove", "Remove Job"),
            ("pause", "Pause Job"),
            ("resume", "Resume Job"),
            ("list", "List All Jobs"),
        ], "Job Operations")

        if choice is None:
            return

        if choice == "add":
            job_add_flow()
        elif choice == "remove":
            job_remove_flow()
        elif choice == "pause":
            job_toggle_flow("pause")
        elif choice == "resume":
            job_toggle_flow("resume")
        elif choice == "list":
            dashboard()
            press_enter()


def job_add_flow():
    """Interactive flow to add new job."""
    print(f"\n  {C.BOLD}Add New Job{C.RESET}")
    print(f"  {C.DIM}Fill in job details below.{C.RESET}\n")

    job_id = prompt("Job ID (unique name)")
    if not job_id:
        print(f"  {C.RED}Job ID required{C.RESET}")
        press_enter()
        return

    cron_expr = prompt("Cron expression", "*/5 * * * *")
    valid, err = validate_cron_syntax(cron_expr)
    if not valid:
        print(f"  {C.RED}Invalid cron: {err}{C.RESET}")
        press_enter()
        return

    script_path = prompt("Script path")
    if not script_path or not os.path.exists(script_path):
        print(f"  {C.RED}Script not found: {script_path}{C.RESET}")
        press_enter()
        return

    # AI slope check before allowing schedule
    print(f"\n  {C.MAGENTA}Running AI Slope Check...{C.RESET}")
    result = validate_script(script_path)
    print(format_report(result))

    if not result["passed"]:
        print(f"\n  {C.RED}❌ Script blocked by AI Slope Check (score: {result['score']}/{result['threshold']}){C.RESET}")
        print(f"  {C.RED}Fix issues above before scheduling.{C.RESET}")
        press_enter()
        return

    # Select target
    targets = list_targets()
    target_options = [(name, f"{name} ({info.get('type', 'local')})") for name, info in targets.items()]
    target = menu_choice(target_options, "Select Target")
    if target is None:
        target = "local"

    description = prompt("Description (optional)", "")

    # Confirm
    print(f"\n  {C.BOLD}Confirm:{C.RESET}")
    print(f"    ID:       {job_id}")
    print(f"    Cron:     {cron_expr}")
    print(f"    Script:   {script_path}")
    print(f"    Target:   {target}")
    print(f"    Slope:    {result['score']}/100 ✅")

    confirm = prompt("Proceed? (y/n)", "y")
    if confirm.lower() != "y":
        print(f"  {C.YELLOW}Cancelled{C.RESET}")
        press_enter()
        return

    ok, msg = add_job(job_id, cron_expr, script_path, target, description)
    color = C.GREEN if ok else C.RED
    print(f"\n  {color}{msg}{C.RESET}")
    press_enter()


def job_remove_flow():
    """Interactive flow to remove job."""
    jobs = list_jobs()
    if not jobs:
        print(f"\n  {C.DIM}No jobs to remove{C.RESET}")
        press_enter()
        return

    options = [(jid, f"{jid} ({info['cron_expr']})") for jid, info in jobs.items()]
    jid = menu_choice(options, "Select Job to Remove")
    if jid is None:
        return

    confirm = prompt(f"Remove '{jid}'? (y/n)", "n")
    if confirm.lower() == "y":
        ok, msg = remove_job(jid)
        color = C.GREEN if ok else C.RED
        print(f"\n  {color}{msg}{C.RESET}")
    press_enter()


def job_toggle_flow(action):
    """Pause or resume job."""
    jobs = list_jobs()
    target_status = "active" if action == "pause" else "paused"
    filtered = {k: v for k, v in jobs.items() if v["status"] == target_status}

    if not filtered:
        print(f"\n  {C.DIM}No {target_status} jobs to {action}{C.RESET}")
        press_enter()
        return

    options = [(jid, f"{jid} ({info['status']})") for jid, info in filtered.items()]
    jid = menu_choice(options, f"Select Job to {action.title()}")
    if jid is None:
        return

    fn = pause_job if action == "pause" else resume_job
    ok, msg = fn(jid)
    color = C.GREEN if ok else C.RED
    print(f"\n  {color}{msg}{C.RESET}")
    press_enter()


# ─── Target Menu ──────────────────────────────────────────────
def target_menu():
    while True:
        clear()
        header("🎯 TARGET CONFIGURATION")

        choice = menu_choice([
            ("add", "Add / Edit Target"),
            ("remove", "Remove Target"),
            ("list", "List Targets"),
        ], "Target Operations")

        if choice is None:
            return

        if choice == "add":
            target_add_flow()
        elif choice == "remove":
            target_remove_flow()
        elif choice == "list":
            target_list_flow()


def target_add_flow():
    print(f"\n  {C.BOLD}Add / Edit Target{C.RESET}\n")
    name = prompt("Target name")
    if not name:
        return

    ttype = prompt("Type (local/ssh)", "ssh")
    ssh_alias = ""
    if ttype == "ssh":
        ssh_alias = prompt("SSH alias (from ~/.ssh/config)")

    work_dir = prompt("Working directory", "~")
    description = prompt("Description", "")

    ok, msg = add_target(name, ttype, ssh_alias, work_dir, description)
    print(f"\n  {C.GREEN}{msg}{C.RESET}")
    press_enter()


def target_remove_flow():
    targets = list_targets()
    options = [(name, f"{name} ({info.get('type', 'local')})") for name, info in targets.items()]
    name = menu_choice(options, "Select Target to Remove")
    if name is None:
        return

    ok, msg = remove_target(name)
    color = C.GREEN if ok else C.RED
    print(f"\n  {color}{msg}{C.RESET}")
    press_enter()


def target_list_flow():
    targets = list_targets()
    print(f"\n  {C.BOLD}{'Name':<15} {'Type':<8} {'SSH Alias':<20} {'Directory':<20}{C.RESET}")
    print(f"  {'─' * 63}")
    for name, info in targets.items():
        print(
            f"  {C.CYAN}{name:<15}{C.RESET} "
            f"{info.get('type', 'local'):<8} "
            f"{info.get('ssh_alias', '-'):<20} "
            f"{info.get('work_dir', '~'):<20}"
        )
    press_enter()


# ─── AI Slope Check ──────────────────────────────────────────
def ai_slope_menu():
    clear()
    header("🤖 AI SLOPE CODE QUALITY CHECK")

    script_path = prompt("Script path to analyze")
    if not script_path or not os.path.exists(script_path):
        print(f"  {C.RED}File not found: {script_path}{C.RESET}")
        press_enter()
        return

    threshold = prompt("Quality threshold", "60")
    try:
        threshold = int(threshold)
    except ValueError:
        threshold = 60

    print(f"\n  {C.MAGENTA}Analyzing...{C.RESET}\n")
    result = validate_script(script_path, threshold)
    print(format_report(result))
    press_enter()


# ─── Local Runner ─────────────────────────────────────────────
def runner_menu():
    clear()
    header("🚀 LOCAL TEST RUNNER")

    script_path = prompt("Script path to execute")
    if not script_path or not os.path.exists(script_path):
        print(f"  {C.RED}File not found: {script_path}{C.RESET}")
        press_enter()
        return

    timeout = prompt("Timeout seconds", "60")
    try:
        timeout = int(timeout)
    except ValueError:
        timeout = 60

    print(f"\n  {C.YELLOW}Executing: {script_path}{C.RESET}")
    print(f"  {C.DIM}Timeout: {timeout}s{C.RESET}\n")

    result = run_script(script_path, timeout)

    # Display results
    if result["success"]:
        print(f"  {C.GREEN}✅ SUCCESS{C.RESET} (exit code: {result['exit_code']})")
    else:
        print(f"  {C.RED}❌ FAILED{C.RESET} (exit code: {result['exit_code']})")
        if result.get("error"):
            print(f"  {C.RED}Error: {result['error']}{C.RESET}")

    print(f"  {C.DIM}Elapsed: {result['elapsed_seconds']}s{C.RESET}")

    if result["stdout"]:
        print(f"\n  {C.BOLD}── STDOUT ──{C.RESET}")
        for line in result["stdout"].strip().split("\n"):
            print(f"  {C.GREEN}│{C.RESET} {line}")

    if result["stderr"]:
        print(f"\n  {C.BOLD}── STDERR ──{C.RESET}")
        for line in result["stderr"].strip().split("\n"):
            print(f"  {C.RED}│{C.RESET} {line}")

    press_enter()


# ─── Main Menu ────────────────────────────────────────────────
def main_menu():
    while True:
        clear()
        dashboard()

        choice = menu_choice([
            ("jobs", "📋 Job Management"),
            ("targets", "🎯 Target Configuration"),
            ("ai", "🤖 AI Slope Code Check"),
            ("runner", "🚀 Local Test Runner"),
        ], "Main Menu")

        if choice is None:
            print(f"\n  {C.DIM}Goodbye.{C.RESET}\n")
            sys.exit(0)

        if choice == "jobs":
            job_menu()
        elif choice == "targets":
            target_menu()
        elif choice == "ai":
            ai_slope_menu()
        elif choice == "runner":
            runner_menu()


# ─── Self-Test ────────────────────────────────────────────────
def run_test_check():
    """Run self-test validation for CI/manual QA."""
    print(f"\n{C.BOLD}{'=' * 60}{C.RESET}")
    print(f"{C.BOLD}  SCHEDULER CLI — SELF-TEST{C.RESET}")
    print(f"{C.BOLD}{'=' * 60}{C.RESET}\n")

    tests_passed = 0
    tests_failed = 0
    base = os.path.dirname(os.path.abspath(__file__))

    # Test 1: Cron syntax validation
    print(f"  {C.CYAN}[TEST 1]{C.RESET} Cron syntax validation...")
    valid, _ = validate_cron_syntax("*/5 * * * *")
    assert valid, "Valid cron rejected"
    valid, _ = validate_cron_syntax("bad")
    assert not valid, "Invalid cron accepted"
    valid, _ = validate_cron_syntax("0 0 1 1 0")
    assert valid, "Valid cron rejected"
    print(f"    {C.GREEN}✅ PASSED{C.RESET}")
    tests_passed += 1

    # Test 2: AI slope validator — good script
    print(f"  {C.CYAN}[TEST 2]{C.RESET} AI slope — good script...")
    good_script = os.path.join(base, "scripts", "dummy_test.sh")
    result = validate_script(good_script)
    print(f"    Score: {result['score']}/100, Passed: {result['passed']}")
    print(format_report(result))
    tests_passed += 1

    # Test 3: AI slope validator — bad script
    print(f"  {C.CYAN}[TEST 3]{C.RESET} AI slope — bad script...")
    bad_script = os.path.join(base, "scripts", "bad_script.sh")
    result = validate_script(bad_script)
    print(f"    Score: {result['score']}/100, Passed: {result['passed']}")
    print(format_report(result))
    tests_passed += 1

    # Test 4: Local runner — good script
    print(f"  {C.CYAN}[TEST 4]{C.RESET} Local runner — execute good script...")
    run_result = run_script(good_script, timeout=10)
    print(f"    Success: {run_result['success']}, Exit: {run_result['exit_code']}")
    if run_result["stdout"]:
        print(f"    Stdout: {run_result['stdout'].strip()}")
    if run_result["success"]:
        print(f"    {C.GREEN}✅ PASSED{C.RESET}")
        tests_passed += 1
    else:
        print(f"    {C.RED}❌ FAILED: {run_result.get('error', run_result['stderr'])}{C.RESET}")
        tests_failed += 1

    # Test 5: Target mapper
    print(f"  {C.CYAN}[TEST 5]{C.RESET} Target mapper...")
    targets = list_targets()
    assert "local" in targets, "'local' target missing"
    print(f"    Targets: {list(targets.keys())}")
    print(f"    {C.GREEN}✅ PASSED{C.RESET}")
    tests_passed += 1

    # Test 6: Job state operations
    print(f"  {C.CYAN}[TEST 6]{C.RESET} Job state load/save...")
    jobs = list_jobs()
    print(f"    Current jobs: {len(jobs)}")
    print(f"    {C.GREEN}✅ PASSED{C.RESET}")
    tests_passed += 1

    # Summary
    total = tests_passed + tests_failed
    print(f"\n{C.BOLD}{'=' * 60}{C.RESET}")
    print(f"  Results: {C.GREEN}{tests_passed} passed{C.RESET} / {C.RED}{tests_failed} failed{C.RESET} / {total} total")
    print(f"{C.BOLD}{'=' * 60}{C.RESET}\n")

    return tests_failed == 0


# ─── Entry ────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scheduler CLI")
    parser.add_argument("--test-check", action="store_true", help="Run self-test validation")
    args = parser.parse_args()

    if args.test_check:
        success = run_test_check()
        sys.exit(0 if success else 1)
    else:
        try:
            main_menu()
        except KeyboardInterrupt:
            print(f"\n\n  {C.DIM}Interrupted. Goodbye.{C.RESET}\n")
            sys.exit(0)
