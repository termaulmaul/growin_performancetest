#!/usr/bin/env bash
# lib/bash/pt_profiles.sh — Run profile save/load/list/delete
# MEDIUM FIX (M3): Named configuration profiles for quick re-run
# Storage: ~/.pt/var/profiles.json
#
# Usage:
#   profile_save <name> key=value [key=value...]
#   profile_list                    -> formatted list to stdout
#   profile_load <name>             -> echoes key=value pairs
#   profile_delete <name>
#   profile_exists <name>           -> 0/1 return code

_PROFILES_FILE="${HOME}/.pt/var/profiles.json"

# Save current run config as named profile
# Args: name key1=val1 key2=val2 ...
profile_save() {
  local name="$1"; shift
  [[ -z "$name" ]] && { echo "profile_save: name required" >&2; return 1; }
  mkdir -p "$(dirname "$_PROFILES_FILE")"
  python3 - "$_PROFILES_FILE" "$name" "$@" <<'PYEOF' 2>/dev/null
import json, sys, os
f = sys.argv[1]; name = sys.argv[2]; pairs = sys.argv[3:]
profile = {"name": name}
for p in pairs:
    if "=" not in p: continue
    k, v = p.split("=", 1)
    profile[k.strip()] = v.strip()
data = {}
if os.path.exists(f):
    try: data = json.load(open(f))
    except: data = {}
data[name] = profile
json.dump(data, open(f, "w"), indent=2)
print(f"OK: profile '{name}' saved with {len(profile)-1} field(s)")
PYEOF
}

# List all profiles as formatted lines
profile_list() {
  [[ ! -f "$_PROFILES_FILE" ]] && return 0
  python3 -c "
import json, sys
try:
    d = json.load(open('$_PROFILES_FILE'))
except Exception:
    sys.exit(0)
if not d:
    sys.exit(0)
for name, p in d.items():
    suite = p.get('suite', '?')
    platform = p.get('platform', '?')
    scenario = p.get('scenario', '?')
    vus = p.get('vus', '?')
    dur = p.get('duration', '?')
    mode = p.get('mode', '?')
    print(f'{name}  |  {mode} · {suite} · {platform} · {scenario} · {vus}VU · {dur}')
" 2>/dev/null
}

# Load profile and echo key=value pairs (shell-eval safe)
# Output format: key=value (one per line)
profile_load() {
  local name="$1"
  [[ -z "$name" || ! -f "$_PROFILES_FILE" ]] && return 1
  python3 -c "
import json, sys
try:
    d = json.load(open('$_PROFILES_FILE'))
    p = d.get('$name')
    if not p:
        sys.exit(1)
    for k, v in p.items():
        if k == 'name': continue
        # Shell-safe: no quotes in value
        v = str(v).replace('\"', '').replace(\"'\", '')
        print(f'{k}={v}')
except Exception:
    sys.exit(1)
" 2>/dev/null
}

# Delete a profile by name
profile_delete() {
  local name="$1"
  [[ -z "$name" || ! -f "$_PROFILES_FILE" ]] && return 1
  python3 -c "
import json, sys
try:
    d = json.load(open('$_PROFILES_FILE'))
    if '$name' in d:
        del d['$name']
        json.dump(d, open('$_PROFILES_FILE', 'w'), indent=2)
        print('OK: profile $name deleted')
    else:
        print('ERR: profile $name not found')
        sys.exit(1)
except Exception as e:
    print(f'ERR: {e}')
    sys.exit(1)
" 2>/dev/null
}

# Check if profile exists (return code only)
profile_exists() {
  local name="$1"
  [[ -z "$name" || ! -f "$_PROFILES_FILE" ]] && return 1
  python3 -c "
import json, sys
try:
    d = json.load(open('$_PROFILES_FILE'))
    sys.exit(0 if '$name' in d else 1)
except: sys.exit(1)
" 2>/dev/null
}

# Get list of profile names (for fzf picker)
profile_names() {
  [[ ! -f "$_PROFILES_FILE" ]] && return 0
  python3 -c "
import json, sys
try:
    d = json.load(open('$_PROFILES_FILE'))
    for name in d.keys(): print(name)
except: pass
" 2>/dev/null
}
