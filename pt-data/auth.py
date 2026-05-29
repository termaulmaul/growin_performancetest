import sys, json, hashlib, os, time
from datetime import datetime

USERS_FILE = 'pt-data/users.json'
RUN_FILE = 'pt-data/active_run.json'

def load_users():
    if not os.path.exists(USERS_FILE):
        return {"users": {}}
    with open(USERS_FILE, 'r') as f:
        return json.load(f)

def save_users(data):
    with open(USERS_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def hash_pwd(pwd):
    return hashlib.sha256(pwd.encode()).hexdigest()

def do_login(username, pwd):
    data = load_users()
    users = data.get("users", {})
    usr = users.get(username.lower())
    if not usr:
        return False, "User not found"
    if usr.get("password_hash") != hash_pwd(pwd):
        return False, "Wrong password"
    return True, f"{usr.get('display_name')}|{usr.get('role')}"

def do_add_user(god_username, new_user, new_pwd, display_name, role):
    data = load_users()
    users = data.get("users", {})
    if god_username.lower() not in users or users[god_username.lower()]["role"] != "god":
        return False, "Access denied. God role required."
    
    if new_user.lower() in users:
        return False, "User already exists."
        
    users[new_user.lower()] = {
        "display_name": display_name,
        "password_hash": hash_pwd(new_pwd),
        "role": role,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "created_by": god_username
    }
    save_users(data)
    return True, "User created successfully."

def load_run():
    if not os.path.exists(RUN_FILE):
        return {"runs": []}
    try:
        with open(RUN_FILE, 'r') as f:
            return json.load(f)
    except:
        return {"runs": []}

def save_run(data):
    with open(RUN_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def set_run(username, script, est_duration):
    data = load_run()
    data["runs"] = [{
        "user": username,
        "script": script,
        "est_duration": est_duration,
        "start_time": int(time.time())
    }]
    save_run(data)

def clear_run(username):
    data = load_run()
    if data.get("runs") and data["runs"][0]["user"] == username:
        data["runs"] = []
        save_run(data)

def get_run_status(current_user):
    data = load_run()
    runs = data.get("runs", [])
    if not runs:
        return f"{current_user} [Idle]"
    
    r = runs[0]
    elapsed = int(time.time()) - r["start_time"]
    
    # Parse est_duration e.g., "30s", "5m"
    est = r.get("est_duration", "0s")
    est_sec = 0
    if est.endswith('s'):
        est_sec = int(est[:-1] or 0)
    elif est.endswith('m'):
        est_sec = int(est[:-1] or 0) * 60
    elif est.endswith('h'):
        est_sec = int(est[:-1] or 0) * 3600
        
    rem = est_sec - elapsed
    if rem < 0: rem = 0
    
    rem_str = ""
    if rem > 60:
        rem_str = f"{rem//60}m remaining"
    else:
        rem_str = f"{rem}s remaining"
        
    return f"PT Ongoing [{r['script']}] [{rem_str}] by: {r['user']}"

def list_users():
    data = load_users()
    users = data.get("users", {})
    for k, v in users.items():
        print(f"{k}|{v.get('display_name')}|{v.get('role')}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(1)
        
    cmd = sys.argv[1]
    if cmd == "login":
        if len(sys.argv) < 4: sys.exit(1)
        ok, msg = do_login(sys.argv[2], sys.argv[3])
        print(msg)
        sys.exit(0 if ok else 1)
    elif cmd == "add_user":
        if len(sys.argv) < 7: sys.exit(1)
        ok, msg = do_add_user(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5], sys.argv[6])
        print(msg)
        sys.exit(0 if ok else 1)
    elif cmd == "set_run":
        if len(sys.argv) < 5: sys.exit(1)
        set_run(sys.argv[2], sys.argv[3], sys.argv[4])
    elif cmd == "clear_run":
        if len(sys.argv) < 3: sys.exit(1)
        clear_run(sys.argv[2])
    elif cmd == "status":
        if len(sys.argv) < 3: sys.exit(1)
        print(get_run_status(sys.argv[2]))
    elif cmd == "list_users":
        list_users()

