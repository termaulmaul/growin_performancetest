#!/usr/bin/env python3
import sys, os, json
from datetime import datetime, timezone

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'lib', 'python'))
from db import get_conn

def migrate():
    conn = get_conn()
    c = conn.cursor()
    
    state_file = os.path.expanduser('scheduler_cli/data/jobs_state.json')
    if not os.path.exists(state_file):
        print("No jobs_state.json found. Skipping.")
        sys.exit(0)
        
    try:
        with open(state_file, 'r') as f:
            data = json.load(f)
    except Exception:
        print("Invalid JSON.")
        sys.exit(0)
        
    jobs = data.get('jobs', {})
    now = datetime.now(timezone.utc).isoformat()
    migrated = 0
    for jid, j in jobs.items():
        try:
            c.execute('''
                INSERT INTO scheduler_jobs (id, cron_expr, script_path, status, last_run, created_at, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (jid, j['cron_expr'], j['script_path'], j['status'], j.get('last_run'), now, 'system_migration'))
            migrated += 1
        except Exception as e:
            print(f"Skipping {jid}: {e}")
            
    conn.commit()
    print(f"Migrated {migrated} jobs to SQLite.")
    
    # Rename old file to prevent double-read if legacy code runs
    try:
        os.rename(state_file, state_file + '.bak')
    except:
        pass

if __name__ == '__main__':
    migrate()
