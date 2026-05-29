#!/usr/bin/env python3
import sys
import json
import os
import hashlib
import bcrypt
from datetime import datetime

# Add lib/python to path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'lib', 'python'))
from db import get_conn, init_db

def migrate():
    # 1. Init DB if not exists
    init_db()
    conn = get_conn()
    c = conn.cursor()
    
    # 2. Check if god user exists
    c.execute("SELECT COUNT(*) FROM users JOIN roles ON users.role_id = roles.id WHERE roles.name = 'god'")
    if c.fetchone()[0] == 0:
        print("Creating default god user 'maul'...")
        c.execute("SELECT id FROM roles WHERE name = 'god'")
        role_id = c.fetchone()['id']
        pwd = "Mandirisekuritas2026."
        hashed = bcrypt.hashpw(pwd.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')
        
        c.execute("""
            INSERT INTO users (username, password_hash, role_id, created_at)
            VALUES (?, ?, ?, ?)
        """, ('maul', hashed, role_id, datetime.utcnow().isoformat()))
        conn.commit()
        print("God user 'maul' created.")
    else:
        print("God user already exists. Skipping.")
        
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
