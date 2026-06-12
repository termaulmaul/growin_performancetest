"""
Target Mapper — manages execution targets (local or SSH alias).
"""

import json
import os

TARGETS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "targets.json")


def _targets_path():
    return os.path.abspath(TARGETS_FILE)


def load_targets():
    """Load targets config."""
    path = _targets_path()
    if not os.path.exists(path):
        return {"targets": {"local": {"type": "local", "description": "Local machine"}}}
    with open(path, "r") as f:
        return json.load(f)


def save_targets(data):
    """Save targets config."""
    path = _targets_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


def add_target(name, target_type="ssh", ssh_alias="", work_dir="~", description=""):
    """
    Add or update target.
    target_type: 'local' | 'ssh'
    """
    data = load_targets()
    data["targets"][name] = {
        "type": target_type,
        "ssh_alias": ssh_alias,
        "work_dir": work_dir,
        "description": description,
    }
    save_targets(data)
    return True, f"Target '{name}' saved"


def remove_target(name):
    """Remove target by name."""
    data = load_targets()
    if name == "local":
        return False, "Cannot remove 'local' target"
    if name not in data["targets"]:
        return False, f"Target '{name}' not found"
    del data["targets"][name]
    save_targets(data)
    return True, f"Target '{name}' removed"


def list_targets():
    """Return all targets."""
    data = load_targets()
    return data.get("targets", {})


def get_target(name):
    """Get single target config."""
    data = load_targets()
    return data["targets"].get(name)
