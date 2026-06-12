# Growin PT Framework — Enterprise Architecture Arbitration Report

**Classification:** Internal Engineering Review  
**Date:** 2026-05-29  
**Reviewer Role:** Principal Infrastructure Architect / PT Platform Engineer  
**Subject:** Architecture proposal evaluation — Kimi vs Manus vs DeepSeek  

---

## SECTION 1 — EXECUTIVE TECHNICAL VERDICT

**Strongest overall:** Kimi  
**Most production-realistic:** Kimi  
**Most overengineered:** DeepSeek  
**Weakest technically:** Manus  
**Safest operationally:** Kimi  
**Easiest to maintain:** Kimi (by design intent), Manus (by simplicity/incompleteness)  
**Most dangerous assumptions:** DeepSeek  

### One-paragraph verdict

Kimi produced a 2600-line RFC that reads like an actual principal engineer wrote it after spending a week inside the codebase. It correctly identifies the auth boundary (TUI-level, not SSH), proposes a single `~/.pt/var/pt.db` SQLite file with WAL mode, designs environment-scoped locks with a partial unique index (`WHERE status = 'active'`), provides production-grade Python CLI code with `click`, handles heartbeat via `os.fork()` with PID tracking and SIGTERM cleanup, and includes ADRs, operational runbooks, backward compatibility strategy, and a kill switch. It is the only proposal that preserves the existing repo layout while adding a `bin/` and `lib/` layer on top.

DeepSeek introduces a **Flask Coordinator service** as a mandatory architectural component. This is the single most dangerous design decision across all three proposals. It transforms a terminal-first internal tool into a client-server distributed system with a daemon dependency, IPC overhead, and a new failure mode (coordinator down = all PT blocked). It also proposes `/opt/growin-pt/` as the install path — ignoring that the framework lives in a Git repo cloned by engineers, not a system-installed package. The lock code has a recursive retry pattern that can loop under race conditions. The `dialog` dependency for the login screen is unnecessary when `read -s` works.

Manus produced a clean but shallow architecture. It correctly identifies the problem space and proposes the right components, but lacks implementation depth. No production code, no lock acquisition SQL, no heartbeat design, no crash recovery strategy, no stale lock cleanup, no status bar implementation, no migration plan. The 3-database split (`auth.db`, `runtime.db`, `audit.db`) adds unnecessary operational complexity. The RBAC uses a many-to-many join table pattern that is correct but over-normalized for 5 roles and ~30 permissions. It is a good first-draft requirements document, not an architecture RFC.

---

## SECTION 2 — DETAILED COMPARISON MATRIX

| Dimension | Kimi | Manus | DeepSeek | Notes |
|-----------|------|-------|----------|-------|
| **Architecture Quality** | 9/10 | 5/10 | 6/10 | Kimi: modular CLI tools + lib; Manus: correct components but no depth; DeepSeek: coordinator is over-architecture |
| **Auth Design** | 9/10 | 6/10 | 7/10 | Kimi: bcrypt+click CLI, session file cache, lockout; Manus: described but no code; DeepSeek: functional but coupled to coordinator |
| **Auth Boundary Correctness** | 10/10 | 8/10 | 5/10 | Kimi: explicitly TUI-level; Manus: TUI-level implied; DeepSeek: coordinator blurs the line, `k6runner` system user adds OS-level coupling |
| **RBAC Design** | 9/10 | 7/10 | 6/10 | Kimi: 5-tier hierarchy with permission tuples, wildcard god; Manus: correct M2M pattern; DeepSeek: JSON capabilities blob — less queryable |
| **Concurrency/Locking** | 9/10 | 5/10 | 7/10 | Kimi: partial unique index, heartbeat daemon, stale scanner, force takeover; Manus: described only; DeepSeek: IntegrityError catch + recursive retry is risky |
| **Heartbeat Design** | 9/10 | 3/10 | 7/10 | Kimi: forked daemon, PID tracked, SIGTERM cleanup; Manus: mentioned but no design; DeepSeek: bash background subshell, simpler but less robust |
| **Stale Lock Recovery** | 9/10 | 3/10 | 7/10 | Kimi: configurable timeout, auto-mark stale, startup cleanup; Manus: mentioned; DeepSeek: reaper thread in coordinator |
| **Crash Recovery** | 8/10 | 2/10 | 6/10 | Kimi: PID check, startup scan, god force release; Manus: not addressed; DeepSeek: coordinator restart needed |
| **SQLite Design** | 9/10 | 6/10 | 8/10 | Kimi: single pt.db, WAL, proper indexes, partial unique index; Manus: 3 DBs (unnecessary); DeepSeek: single DB, WAL, UNIQUE on resource_id |
| **TUI Integration** | 9/10 | 5/10 | 5/10 | Kimi: bash wrapper libs + fzf preserved + Go TUI parity path; Manus: basic menu filtering; DeepSeek: `dialog` dependency, `/opt/` path breaks git workflow |
| **Status Bar** | 10/10 | 6/10 | 7/10 | Kimi: 3-state color coded, occupancy map, full bash implementation; Manus: spec only; DeepSeek: functional but basic |
| **Security Posture** | 9/10 | 6/10 | 8/10 | Kimi: threat model, SSH_ASKPASS, command injection prevention, secret masking; Manus: generic recommendations; DeepSeek: chattr +a, HMAC tokens, sandboxing |
| **Code Quality** | 9/10 | 4/10 | 6/10 | Kimi: production-grade Python+bash, click CLI, JSON IPC; Manus: pseudocode; DeepSeek: functional but uses raw argparse, missing error handling |
| **Repo Compatibility** | 9/10 | 6/10 | 3/10 | Kimi: adds bin/lib alongside existing; Manus: restructures mildly; DeepSeek: moves everything to /opt/growin-pt/ |
| **Migration Strategy** | 9/10 | 4/10 | 6/10 | Kimi: phased 10-week, feature flags, legacy fallback, kill switch; Manus: 3 vague phases; DeepSeek: 3 phases with rollback but coordinator dependency blocks MVP |
| **Operational Runbooks** | 9/10 | 0/10 | 2/10 | Kimi: lock emergency, user lockout, DB backup; others: absent |
| **ADRs** | 10/10 | 0/10 | 0/10 | Kimi only. Critical for enterprise review |
| **Observability** | 9/10 | 5/10 | 7/10 | Kimi: terminal dashboard, audit with hash chain, correlation IDs; Manus: basic audit; DeepSeek: pt-top concept, audit |
| **Scheduler Integration** | 8/10 | 3/10 | 6/10 | Kimi: SQLite migration from jobs_state.json, lock-aware execution; Manus: not addressed; DeepSeek: scheduler daemon concept |
| **Scalability Path** | 8/10 | 5/10 | 7/10 | Kimi: rqlite for distributed, K8s future; Manus: generic; DeepSeek: coordinator REST API |
| **Documentation Quality** | 10/10 | 5/10 | 7/10 | Kimi: glossary, appendices, env vars, runbooks; Manus: clean but shallow; DeepSeek: adequate |
| **Dependency Surface** | 9/10 | 7/10 | 4/10 | Kimi: bcrypt, psutil, click (3 Python deps); Manus: bcrypt; DeepSeek: Flask, dialog, potentially Vue.js |
| **TOTAL** | **192/220** | **98/220** | **129/220** | |

---

## SECTION 3 — DEEP CRITIQUE OF EACH AI

### 3.1 Kimi — The RFC That Actually Works

**What it got right:**

1. **Auth boundary.** Explicitly documents that user management is TUI-level, not SSH/PAM/LDAP. Rejected alternatives section in ADRs proves the author understood the constraint. This is the single most important design decision and Kimi nailed it.

2. **Single SQLite database.** `~/.pt/var/pt.db` — one file, WAL mode, per-server. No unnecessary database splitting. The `PRAGMA journal_mode = WAL` ensures concurrent reads during writes (critical for heartbeat updates while TUI queries lock status).

3. **Partial unique index on locks.** `CREATE UNIQUE INDEX idx_locks_env_active ON locks(env) WHERE status = 'active'` — this is the correct way to enforce one-active-lock-per-environment at the database level. It prevents race conditions where two processes simultaneously acquire locks. Neither Manus nor DeepSeek uses this pattern.

4. **Heartbeat daemon via `os.fork()`.** The lock manager forks a child process that updates heartbeat timestamps every 15 seconds. The parent PID is stored in the lock record. On release, `SIGTERM` is sent to the heartbeat PID. On crash, the stale scanner detects missing heartbeats. This is operationally correct for a Linux CLI tool.

5. **CLI tool architecture.** `bin/pt-auth`, `bin/pt-lock`, `bin/pt-rbac` etc. — each is a standalone Python CLI using `click`. Bash TUI calls them and parses JSON stdout. This is the correct IPC pattern for bash/Python interop: subprocess invocation, not sockets, not REST, not pipes.

6. **Backward compatibility kill switch.** `PT_AUTH_BYPASS=1 ./pt-menu.sh` — emergency escape hatch. This single feature makes the migration safe. No other proposal has this.

7. **Preserves existing repo structure.** New files go into `bin/` and `lib/`. Existing `Script/`, `docker-local-pt/`, `scheduler_cli/`, `tui/` stay untouched. `pt-menu.sh` gets modified in-place. This means git history is preserved and engineers see familiar paths.

8. **Production-grade code.** The `pt-auth`, `pt-lock`, and status bar implementations are copy-paste ready. `click` for CLI parsing, `json.dumps` for IPC, `stty -echo` for password input, `jq` for bash-side JSON parsing. These are real engineering choices.

**What could improve:**

1. **Go TUI parity as Phase 4 is wasteful.** The Go TUI is experimental and duplicates effort. Recommend deprecating it or keeping it as a viewer-only dashboard. Maintaining two TUI codebases is a permanent maintenance tax.

2. **`os.fork()` for heartbeat has edge cases.** If the parent process is killed with `SIGKILL` (kill -9), the child heartbeat continues running and the lock stays "alive" even though the PT process is dead. Solution: the heartbeat should also check if the parent PID is alive via `os.getppid()` — if parent PID is 1 (reparented to init), exit. Kimi mentions PID tracking but doesn't implement this check.

3. **Session token in file cache creates a sync gap.** If the SQLite session is invalidated (admin force-logout) but the file cache hasn't been re-verified in 5 minutes, the user operates with a stale session. The 5-minute re-verify window is documented but could be tighter (60 seconds) for security-sensitive environments.

4. **Missing WAL checkpoint strategy.** WAL mode grows the `-wal` file over time. SQLite auto-checkpoints at 1000 pages, but for long-running PT servers, explicit `PRAGMA wal_checkpoint(TRUNCATE)` should be scheduled (e.g., daily cron).

5. **bcrypt cost 12 takes ~250ms.** On shared PT servers with limited CPU, this is fine for login (once per session). But if the stale lock scanner or audit integrity checker calls bcrypt per-user, it could cause latency. Kimi correctly scopes bcrypt to login-only.

**Hidden risks:**

- SQLite concurrent write contention: if 10 engineers simultaneously start PT, the `INSERT INTO locks` with WAL mode serializes writes. With `timeout=5` (5 second busy timeout), this is acceptable. But under extreme load (>50 concurrent lock attempts), SQLite will return SQLITE_BUSY. Production servers likely have <10 concurrent PT engineers, so this is acceptable.

- The `secrets.token_hex(32)` for session tokens is 256 bits — more than sufficient. No vulnerability here.

---

### 3.2 Manus — The Requirements Document That Stopped Early

**What it got right:**

1. **Problem identification is accurate.** The research findings document correctly identifies: hardcoded SSH password `M@nsek.1234`, no locking, no auth, no audit, no concurrency protection. This shows genuine repo analysis.

2. **Component identification is correct.** auth.py, rbac.py, runtime_registry.py, resource_monitor.py, audit_logger.py — all the right pieces are named.

3. **Status bar target spec matches requirements.** The idle vs active status bar format is exactly what was requested.

4. **Schema design is reasonable.** The tables are correctly normalized with foreign keys and appropriate columns.

**What it got wrong:**

1. **Three separate databases.** `auth.db`, `runtime.db`, `audit.db` — this is unnecessary operational complexity for an internal tool. Cross-database queries are impossible in SQLite (without `ATTACH`). If you need to join `users` (auth.db) with `active_runs` (runtime.db), you need `ATTACH DATABASE`. This is fragile and adds code complexity. **Kimi's single `pt.db` is strictly superior.**

2. **No concurrency mechanism beyond description.** The RFC says "implement heartbeat" and "stale lock cleanup" but never designs HOW. No SQL, no partial unique index, no heartbeat interval, no stale timeout, no crash recovery strategy, no force takeover SQL. This is the most important section and it's empty.

3. **No production code.** The code examples are trivial (basic bcrypt check, basic RBAC query). No CLI tool architecture, no JSON IPC, no error handling, no session management implementation. The `auth_tui.sh` example passes password as a CLI argument (`python3 auth/auth.py login "$username" "$password"`) — this exposes the password in `ps` output, the exact same vulnerability the framework currently has with `sshpass`.

4. **Missing heartbeat design entirely.** This is the most critical gap. Without heartbeat, stale locks will accumulate after crashes and engineers will be permanently locked out of environments until someone manually deletes lock records.

5. **`performance_metrics` table in runtime.db is premature.** Storing per-API metrics (samples, avg_ms, p95, etc.) in SQLite during a PT run creates significant write load. k6 already writes to InfluxDB. Duplicating this in SQLite adds complexity with no benefit.

6. **RBAC is over-normalized.** Separate `roles`, `permissions`, `role_permissions`, `user_roles` tables with M2M joins — for 5 roles and ~30 permissions. Kimi's approach (role_id FK on users + permissions table with role_id FK) is simpler and sufficient. Role inheritance via `inherits_from` or precedence field is better than M2M join tables for a hierarchy.

**Dangerous patterns:**

- Password passed as CLI argument (visible in `ps`)
- No lock integrity mechanism (no partial unique index, no transaction isolation strategy)
- Three separate database files to manage, backup, and version
- No migration plan from current system
- No backward compatibility strategy

---

### 3.3 DeepSeek — The Coordinator That Nobody Asked For

**What it got right:**

1. **Lock acquisition code is functional.** The `acquire_lock()` function demonstrates SQLite `IntegrityError` catch for concurrent lock attempts, heartbeat staleness check, and recursive retry. The pattern is recognizable as a distributed lock implementation.

2. **Security threat model is comprehensive.** `chattr +a` for append-only audit logs, HMAC session tokens, dedicated `k6runner` system user, filesystem ACLs, and command injection prevention via array passing. Some of these are genuinely good ideas.

3. **Role inheritance via `inherits_from` FK.** This allows `operator` to inherit all `readonly` permissions automatically. Clean schema design.

4. **Queue mode concept.** The idea of enqueuing PT requests when a lock is held (instead of just denying) is a genuinely useful feature that neither Kimi nor Manus fully designs.

**What it got critically wrong:**

1. **Flask Coordinator service.** This is the fatal flaw. The document proposes a Python Flask process as the mandatory intermediary for ALL operations. This means:
   - A daemon must be running before any PT work can happen
   - If the coordinator crashes, ALL PT operations are blocked
   - The coordinator introduces network IPC (socket or HTTP) where subprocess calls suffice
   - It requires process management (systemd unit, restart policy, log rotation)
   - It's a new single point of failure in what was a zero-infrastructure tool
   
   The document tries to soften this by saying "initially local daemon, later REST API" — but the architecture is fundamentally client-server from day one. This violates the core requirement of operational simplicity.

2. **`/opt/growin-pt/` installation path.** The framework is a Git repository that engineers clone and run. Moving to `/opt/` implies system-level installation with root permissions, package management, and a deployment pipeline. This is a complete paradigm shift that the requirements explicitly warned against.

3. **Recursive lock retry.** In `acquire_lock()`, if a stale lock is detected and deleted, the function calls itself recursively: `return acquire_lock(resource_name, owner_user_id, run_id, force=False)`. Under race conditions where two processes simultaneously detect staleness and both delete + retry, this could loop. The recursion should be bounded (max 1 retry) or replaced with an iterative approach.

4. **`dialog` dependency for login screen.** `dialog` is not universally installed on enterprise Linux servers. `read -s` (built into bash) does the same thing without dependencies. Adding `dialog`/`whiptail` as a required package for a terminal tool is unnecessary friction.

5. **`k6runner` system user.** The document proposes running k6 under a dedicated system user with reduced capabilities. This means: creating a system user on every PT server, configuring sudo rules, managing file permissions across two users, and potentially breaking Docker group membership. This directly contradicts the requirement that SSH hosts remain unchanged. The PT framework should run as the engineering user, not a service account.

6. **Session token stored in `/tmp/pt-session`.** tmpfs is wiped on reboot and accessible to other processes under the same user. Kimi's `~/.pt/sessions/{user}.token` with mode 600 is more secure and persistent.

7. **Missing partial unique index.** The locks table uses `resource_id UNIQUE NOT NULL` — this means the locks table can only hold ONE row per resource EVER (not one active row). If you release a lock and try to insert a new one for the same resource, it fails. This is fundamentally broken for lock lifecycle tracking. You'd need to DELETE released locks instead of marking them, losing audit history.

**Dangerous patterns:**

- Flask coordinator as single point of failure
- Recursive lock retry under race conditions
- `/opt/` installation path breaks Git workflow
- `resource_id UNIQUE` prevents lock history retention
- `k6runner` system user adds OS-level coupling
- `dialog` dependency for login
- `$TMPDIR` for session storage

---

## SECTION 4 — FINAL ARCHITECTURE DECISION

**Winner: Kimi**, with targeted improvements from DeepSeek.

Kimi is the foundation architecture. It is the only proposal that:

1. Correctly scopes auth to TUI-level
2. Preserves existing repo structure
3. Uses a single SQLite database with WAL
4. Implements partial unique index for lock safety
5. Provides production-grade CLI code
6. Includes ADRs, runbooks, and backward compatibility
7. Has a credible 10-week phased migration
8. Includes a kill switch for emergency bypass

From DeepSeek, incorporate:
- Role `inherits_from` FK pattern (cleaner than Kimi's flat permission inserts)
- `chattr +a` on audit log archive files (good defense-in-depth)
- Queue mode concept (implement in Phase 3/Enterprise)
- HMAC-based token validation (optional hardening)

From Manus, incorporate:
- Nothing architecturally. The `performance_metrics` table concept is useful but belongs in InfluxDB, not SQLite.

---

## SECTION 5 — FINAL RECOMMENDED ARCHITECTURE

### Stack Decision

| Component | Choice | Rationale |
|-----------|--------|-----------|
| TUI | Bash (primary) + fzf | Existing, proven, zero-dependency |
| Business Logic | Python 3.9+ CLI tools | bcrypt, SQLite, psutil, click |
| State Store | SQLite WAL (single `pt.db`) | Zero infra, ACID, sufficient for <50 users |
| IPC | Subprocess + JSON stdout | No sockets, no REST, no daemon |
| Heartbeat | Forked Python process + PID tracking | Reliable, killable, detectable |
| Go TUI | Deprioritize/deprecate | Maintenance burden, duplicated logic |
| Lock scope | Environment-level (`INT`, `STG`, `PROD`, `LOCAL`) | Matches PT execution model |
| Session | SQLite authoritative + file cache for fast check | <50ms auth on TUI render |
| Audit | Append-only SQLite + daily gz archive | Hash chain for tamper detection |

### Final Lock Mechanism

```sql
-- Partial unique index: only ONE active lock per environment
CREATE UNIQUE INDEX idx_locks_env_active ON locks(env) WHERE status = 'active';
```

Lock acquisition uses `BEGIN IMMEDIATE` transaction:

```python
conn.execute("BEGIN IMMEDIATE")  # Serializes writes immediately
try:
    conn.execute(
        "INSERT INTO locks (env, script_name, owner, ...) VALUES (?, ?, ?, ...)",
        (env, script, user, ...)
    )
    conn.commit()
except sqlite3.IntegrityError:
    conn.rollback()
    # Lock exists — query for details and return DENIED
```

`BEGIN IMMEDIATE` prevents the race condition where two processes both read "no active lock" and then both try to insert. The first `INSERT` succeeds; the second hits the unique constraint and gets `IntegrityError`.

### Heartbeat Strategy

```
Interval: 15 seconds
Stale threshold: 60 seconds (4 missed beats)
Implementation: os.fork() child process
Parent check: heartbeat daemon checks os.getppid() != 1 (not reparented to init)
Startup cleanup: pt-lock cleanup --auto runs on pt-menu.sh launch, marks locks with dead heartbeat_pid as 'stale'
Stale scanner: cron job every 2 minutes OR lazy check on every lock query
```

### Crash Recovery Strategy

1. **Normal shutdown:** `pt-lock release` → SIGTERM to heartbeat → lock marked `released`
2. **Process crash (SIGKILL):** Heartbeat daemon detects `getppid() == 1` → self-terminates → heartbeat stops → stale scanner marks lock stale after 60s
3. **Server crash:** All heartbeats stop → on server restart, `pt-lock cleanup --auto` marks all locks with `last_heartbeat < boot_time` as stale
4. **Heartbeat daemon crash:** Lock heartbeat stops updating → stale scanner catches it in 60s
5. **God emergency:** `pt-lock release --env INT --force` → immediate release regardless of state

### RBAC Model

```
god → admin → operator → readonly → guest
 ↑ inherits all   ↑ inherits all   ↑ inherits all   ↑ inherits all
```

Stored as:
```sql
CREATE TABLE roles (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    precedence INTEGER NOT NULL,  -- god=1, admin=2, operator=3, readonly=4, guest=5
    description TEXT
);

CREATE TABLE permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id INTEGER NOT NULL,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    UNIQUE(role_id, resource, action)
);
```

Permission check: `SELECT 1 FROM permissions WHERE role_id <= (SELECT role_id FROM users WHERE username = ?) AND resource = ? AND action = ?` — the `<=` leverages precedence for inheritance. God (precedence 1) matches all. Simpler than join-based inheritance.

### Session Strategy

- Token: `secrets.token_hex(32)` (256-bit)
- Storage: SQLite `sessions` table (authoritative) + `~/.pt/sessions/{user}.token` (file cache)
- Lifetime: 8 hours inactivity timeout
- Fast path: bash reads file cache, checks expiry locally (no Python call if < 5 min since last verify)
- Invalidation: admin force-logout deletes from SQLite; file cache becomes stale on next verify

### Active PT Detection (Status Bar)

```bash
# Called every TUI render cycle (5 seconds with tput refresh)
lock_json=$(pt-lock status --env "$ENV" 2>/dev/null)
lock_status=$(echo "$lock_json" | jq -r '.locks[0].status // "free"')

case "$lock_status" in
    "active")
        owner=$(echo "$lock_json" | jq -r '.locks[0].owner')
        script=$(echo "$lock_json" | jq -r '.locks[0].script_name')
        if [[ "$owner" == "$PT_USER" ]]; then
            # My lock: red, show ETA
            status="🔴 PT ACTIVE | $script | ETA: ${eta}"
        else
            # Someone else's lock: yellow, show owner
            status="🟡 OCCUPIED | $script | By: $owner"
        fi
        ;;
    *)
        status="🟢 Available | $PT_USER [Idle]"
        ;;
esac
```

---

## SECTION 6 — IMPLEMENTATION PLAN

### Phase 1: MVP Foundation (Weeks 1-2)

**Goal:** Login gate + basic RBAC on pt-menu.sh. No locks yet.

**Tasks:**
1. Create `~/.pt/` directory structure and SQLite schema
2. Implement `bin/pt-auth` (login, verify-session, bootstrap, logout)
3. Implement `bin/pt-rbac` (check permission)
4. Create `lib/bash/pt_auth_client.sh` (bash wrapper)
5. Modify `pt-menu.sh`: add auth gate at startup, filter menus by role
6. Write `migrate-v1-to-v2.py` (import jobs_state.json, create god user)
7. Implement basic `pt-audit` (login/logout events)

**Backward compatibility:** If `~/.pt/var/pt.db` doesn't exist, `pt-menu.sh` runs in legacy mode (no auth). Feature flag: `PT_AUTH_BYPASS=1`.

**Rollback:** Delete `~/.pt/` directory, revert `pt-menu.sh` to previous commit.

### Phase 2: Concurrency Protection (Weeks 3-4)

**Goal:** One PT per environment. Heartbeat + stale cleanup.

**Tasks:**
1. Implement `bin/pt-lock` (acquire, release, status, force-release, cleanup)
2. Implement heartbeat daemon (forked from pt-lock acquire)
3. Implement `bin/pt-registry` (active run tracking)
4. Add lock check to ALL execution paths in `pt-menu.sh` (remote runner, local runner, scheduler)
5. Enhance status bar with lock state + owner + ETA
6. Add stale lock scanner (lazy on pt-lock status + cron every 2 min)
7. Test crash scenarios: SIGKILL, server reboot, network disconnect

**Rollback:** Disable lock checks with `PT_LOCK_BYPASS=1`.

### Phase 3: Observability & Hardening (Weeks 5-6)

**Goal:** Full audit trail, resource monitoring, security hardening.

**Tasks:**
1. Full `pt-audit` with hash chain, correlation IDs, severity levels
2. `pt-resmon` with health score (CPU/RAM/Docker/k6/load)
3. `pt-dashboard.sh` terminal dashboard (occupancy map, active tests, recent activity)
4. Deprecate `sshpass` → migrate to SSH keys or `SSH_ASKPASS`
5. Secret masking in ENV editor for non-god users
6. Command injection prevention (replace string concat with array passing)
7. Add audit calls to all actions

### Phase 4: Enterprise (Weeks 7-10)

**Goal:** Queue mode, user management TUI, scheduler SQLite migration.

**Tasks:**
1. `pt-usermgmt` CLI (create, delete, lock, unlock, reset-password, assign-role)
2. User management menu in pt-menu.sh (admin/god only)
3. Queue mode for locks (FIFO with notification)
4. Scheduler migration from `jobs_state.json` to SQLite `scheduler_jobs` table
5. Lock-aware scheduler execution (skip if env occupied)
6. Force takeover with audit justification

---

## SECTION 7 — FINAL TECHNICAL VERDICT

| Question | Answer |
|----------|--------|
| Which AI output is BEST overall? | **Kimi** — by a significant margin |
| Which is MOST REALISTIC? | **Kimi** — production-ready code, correct repo integration, phased migration |
| Which is MOST DANGEROUS? | **DeepSeek** — Flask coordinator is a SPOF; `/opt/` breaks git; `UNIQUE` on resource_id breaks lock history; recursive lock retry risks infinite loop |
| Which is MOST OVERENGINEERED? | **DeepSeek** — coordinator service, system user, Flask, dialog dependency, REST API in MVP |
| Which FITS THE CURRENT REPO BEST? | **Kimi** — adds bin/lib, preserves everything else |
| Which should become FOUNDATION? | **Kimi**, with targeted cherry-picks from DeepSeek (role inheritance, chattr+a, queue concept) |

### Final Recommendation

Use Kimi's RFC as the implementation specification. Begin Phase 1 immediately. The framework's core problem (concurrent PT collisions) will be fully solved by end of Phase 2 (4 weeks). Everything after that is progressive hardening.

The single highest-impact change is the environment-scoped lock with heartbeat and the enhanced status bar. An engineer SSHing into a PT server and running `./pt-menu.sh` will immediately see whether the environment is occupied, by whom, running what script, and when it's expected to finish. This alone eliminates 90% of the operational chaos.

Do not build a coordinator service. Do not introduce Flask. Do not move to `/opt/`. Do not add `dialog` as a dependency. Do not create a dedicated `k6runner` system user. Do not split into 3 databases. Keep it simple: bash TUI calls Python CLIs, Python CLIs talk to one SQLite file, SQLite does the heavy lifting.
