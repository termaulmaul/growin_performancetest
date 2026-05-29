"""
Local Runner — execute scripts locally with subprocess.
Captures stdout, stderr, exit code, and elapsed time.
Supports timeout handling.
"""

import subprocess
import time
import os

DEFAULT_TIMEOUT = 300  # 5 minutes


def run_script(script_path, timeout=DEFAULT_TIMEOUT, env_override=None):
    """
    Execute script locally.
    Returns dict with: stdout, stderr, exit_code, elapsed_seconds, success.
    """
    abs_path = os.path.abspath(script_path)

    if not os.path.exists(abs_path):
        return {
            "stdout": "",
            "stderr": f"Script not found: {abs_path}",
            "exit_code": -1,
            "elapsed_seconds": 0,
            "success": False,
            "error": "FILE_NOT_FOUND",
        }

    if not os.access(abs_path, os.X_OK):
        return {
            "stdout": "",
            "stderr": f"Script not executable: {abs_path}. Run: chmod +x {abs_path}",
            "exit_code": -1,
            "elapsed_seconds": 0,
            "success": False,
            "error": "NOT_EXECUTABLE",
        }

    env = os.environ.copy()
    if env_override:
        env.update(env_override)

    start = time.time()
    try:
        result = subprocess.run(
            [abs_path],
            capture_output=True,
            text=True,
            timeout=timeout,
            env=env,
            cwd=os.path.dirname(abs_path),
        )
        elapsed = time.time() - start

        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "exit_code": result.returncode,
            "elapsed_seconds": round(elapsed, 3),
            "success": result.returncode == 0,
            "error": None,
        }
    except subprocess.TimeoutExpired:
        elapsed = time.time() - start
        return {
            "stdout": "",
            "stderr": f"Timeout after {timeout}s",
            "exit_code": -1,
            "elapsed_seconds": round(elapsed, 3),
            "success": False,
            "error": "TIMEOUT",
        }
    except PermissionError:
        elapsed = time.time() - start
        return {
            "stdout": "",
            "stderr": f"Permission denied: {abs_path}",
            "exit_code": -1,
            "elapsed_seconds": round(elapsed, 3),
            "success": False,
            "error": "PERMISSION_DENIED",
        }
    except Exception as e:
        elapsed = time.time() - start
        return {
            "stdout": "",
            "stderr": str(e),
            "exit_code": -1,
            "elapsed_seconds": round(elapsed, 3),
            "success": False,
            "error": "UNKNOWN",
        }
