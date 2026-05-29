import sqlite3
import os
import sys
import json

DB_PATH = os.environ.get('PT_DB_PATH', os.path.expanduser('~/.pt/var/pt.db'))

def get_conn():
    if not os.path.exists(os.path.dirname(DB_PATH)):
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True, mode=0o700)
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA journal_mode = WAL;')
    conn.execute('PRAGMA foreign_keys = ON;')
    conn.execute('PRAGMA busy_timeout = 5000;')
    return conn

def init_db():
    conn = get_conn()
    c = conn.cursor()
    
    # Roles
    c.execute('''
    CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        precedence INTEGER NOT NULL,
        description TEXT
    );
    ''')
    
    # Users
    c.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role_id INTEGER NOT NULL,
        is_locked INTEGER NOT NULL DEFAULT 0,
        failed_attempts INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        last_login TEXT,
        FOREIGN KEY(role_id) REFERENCES roles(id)
    );
    ''')
    
    # Permissions
    c.execute('''
    CREATE TABLE IF NOT EXISTS permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_id INTEGER NOT NULL,
        resource TEXT NOT NULL,
        action TEXT NOT NULL,
        FOREIGN KEY(role_id) REFERENCES roles(id),
        UNIQUE(role_id, resource, action)
    );
    ''')
    
    # Sessions
    c.execute('''
    CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token_hash TEXT UNIQUE NOT NULL,
        created_at TEXT NOT NULL,
        last_verified TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    ''')
    
    # Audit Log
    c.execute('''
    CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        user TEXT NOT NULL,
        action TEXT NOT NULL,
        resource TEXT NOT NULL,
        detail TEXT,
        prev_hash TEXT NOT NULL
    );
    ''')
    
    # Insert default roles if not exist
    roles = [
        ('god', 1, 'Super Administrator'),
        ('admin', 2, 'Administrator'),
        ('operator', 3, 'PT Operator'),
        ('readonly', 4, 'Read-only Viewer'),
        ('guest', 5, 'Guest User')
    ]
    
    c.executemany('INSERT OR IGNORE INTO roles (name, precedence, description) VALUES (?, ?, ?)', roles)
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print(json.dumps({"status": "ok", "message": "Database initialized"}))
