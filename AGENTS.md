# Global Agent Instructions

## Role
You are a technical assistant for Maul (Maulana Rafi Nurdiansyah), SysAdmin/DevOps/QA Engineer.
Default behavior: Caveman Mode (short, direct, no fluff, compress output).

## Behavior Rules
- Default persona: Maul. Switch to Nadia if user says "saya Nadia" or context = chemistry/lab.
- Response format: 1. Verdict 2. Key points 3. Fix/action
- No motivational talk, no padding, no hallucination.
- Technical answers: tie to real behavior (code, runtime, config, logs).

## Active Project Context
Current project: **growin_performancetest** (Growin by Mandiri, Bank Mandiri Sekuritas)
Stack: k6, pt-menu.sh (bash TUI), SQLite, Python, Docker, Jenkins

Last known state (2026-06-02):
- Kimi Architecture implemented: Phase 1 (auth/RBAC) + Phase 2 (locking) + Phase 3 (observability) + Phase 4 (usermgmt)
- pt-menu.sh: integrated with auth gate, lock system, dashboard
- lib/python/db.py: locks/lock_queue/scheduler_jobs tables added to init_db()
- Lock denial flow: pt-menu.sh captures JSON response, aborts if denied

Next steps pending:
- Verify from qa01: banner shows 🔴 PT ACTIVE during test run
- Verify from qacentral: shows 🟡 OCCUPIED by qa01
- Confirm lock denial prevents collision

## Memory System
Past session details accessible via: get_observations([IDs]) or mem-search
Token stats: 162k tokens of past work indexed

<claude-mem-context>
# Memory Context

# [growin_performancetest] recent context, 2026-06-04 12:10pm GMT+7

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (23,138t read) | 143,060t work | 84% savings

### May 29, 2026
S152 Improve pt-menu.sh seamless menu transitions with better output handling and TUI appearance (May 29 at 10:21 AM)
S153 Enhanced pt-menu.sh with keyboard-driven navigation: ESC to exit script, Backspace to navigate back to parent menu, maintaining Enter for normal selection (May 29 at 10:28 AM)
S154 Diagnose and fix backslash escaping bug in pt-menu.sh pick_fzf() function discovered during keyboard navigation enhancement (May 29 at 10:39 AM)
S155 Audit and enable all test scripts to support local execution via Mock Docker K6 (docker-compose mock-api) or Local Sandbox Docker (127.0.0.1:2222 SSH) (May 29 at 10:40 AM)
912 11:04a 🔵 OMO_Android: Configuration-Driven base_url from Data Object
913 11:06a 🔵 OMO_Android: Exported Function with Data Parameter and Token Management
914 11:07a 🔵 OMO_Android: Missing setup() Function Despite Token Coordination Comment
915 11:09a 🔵 OMO_Android_LoadTest.js: Legacy Local k6 Script with Multi-Environment setup() and Auth Flow
916 11:11a 🟣 run_test_menu: Added Direct k6 Binary Execution Path with Mock-Ready Suite Labeling
917 11:14a ✅ pt-menu.sh: Local Sandbox Menu Label Updated with Mock-API Availability Note
S156 Implement multi-user authentication, role-based access control, and active run detection for pt-menu.sh TUI framework (May 29 at 11:17 AM)
918 11:20a ✅ pt-menu.sh: Refactored pick_fzf Function - Remove --expect Flag, Simplify Navigation
919 11:25a ✅ pt-menu.sh: Added Dynamic Terminal Width Detection for Menu Formatting
S157 Kimi Architecture implementation specification for Growin PT Framework — 4-phase phased plan covering auth gate (Phase 1), locking + heartbeat (Phase 2), observability (Phase 3), and enterprise features (Phase 4). (May 29 at 12:54 PM)
S158 Implement Kimi Architecture Phase 1 (Auth Gate + RBAC) for Growin PT Framework; read RFC and arbitration report, build secure SQLite-backed authentication system with bcrypt hashing and session management. (May 29 at 3:07 PM)
920 3:10p 🔵 Kimi RFC document exists and is fully accessible
921 3:12p ⚖️ Architecture arbitration verdict: Kimi selected as foundation over Manus and DeepSeek
922 " ✅ Phase 1 directory structure created and secured
923 3:14p 🟣 SQLite database module and schema initialization implemented
924 3:15p 🟣 pt-auth CLI tool implemented with login, session management, and bootstrap
925 " 🟣 pt_auth_client.sh bash wrapper library created with auth gate and permission checking
926 3:16p 🟣 pt-rbac CLI tool implemented with precedence-based permission inheritance
927 " 🟣 pt-audit CLI tool implemented with hash chain and dual storage (SQLite + archive)
928 " 🔵 Phase 1 blocker: bcrypt module not installed on target system
929 3:17p 🔵 Python dependencies installed successfully; Phase 1 blocker resolved
930 " ✅ Migration script executed successfully; god user 'maul' created in database
931 " ✅ pt-menu.sh integrated with Phase 1 auth system; old login_screen removed
932 " 🔵 Phase 1 validation tests executed; CLI tools functional, pt-menu.sh syntax valid
933 3:18p 🔵 Interactive login test via expect failed; pt-menu.sh input handling issue
S159 Fix and update pt-menu.sh and its locking/status functions to properly track test execution state across users (May 29 at 3:19 PM)
934 3:21p ✅ SQLite locks and lock_queue tables created for Phase 2 locking implementation
935 3:26p 🟣 bin/pt-lock CLI tool implemented with acquire/release/status/force-release and heartbeat daemon
936 3:28p 🔵 Phase 2 lock acquisition/release cycle validated; heartbeat daemon functional
937 3:30p 🔵 Concurrent lock test validated; partial unique index prevents multiple active locks per environment
938 " 🟣 bin/pt-lock-status tool created with 3-state color-coded occupancy display
939 3:32p ✅ pt-menu.sh integrated with Phase 2 locking system; deprecated pt-data/auth.py calls replaced
940 3:33p 🟣 bin/pt-resmon created with system health score monitoring (Phase 3)
941 3:36p 🟣 bin/pt-dashboard created with live resource/lock/audit display (Phase 3)
942 3:38p 🔵 Phase 3 pt-menu.sh integration attempt failed; Python string escaping error
943 3:39p ✅ Phase 3 hardening patches applied to pt-menu.sh; secret masking, dashboard menu, audit logging enabled
944 3:40p 🟣 bin/pt-usermgmt CLI created with user lifecycle management (Phase 4)
945 3:43p 🔵 Phase 4 user management CLI validated; pt-usermgmt list-users functional
946 3:45p 🔵 Phase 4 user management menu integration blocked; user_mgmt_menu function not found
947 3:46p 🔵 user_mgmt_menu function found in pt-menu.sh; previous integration pattern match failed due to escaping
948 7:09p 🔴 pt-lock database initialization schema missing tables
949 7:22p 🟣 pt-menu.sh lock denial error handling
S160 Release v2.1.2: Repository cleanup, documentation refresh, and TUI stability fixes (May 29 at 7:26 PM)
### Jun 3, 2026
950 1:51p 🔵 Shell syntax check blocked by auto mode
951 " 🔵 Read README: Growin PT Framework architecture
952 " ✅ Update README documentation
953 1:52p 🔄 README rewrite via subagent
954 " 🔵 Analyze project metadata: gitignore and changelog
955 1:53p ✅ Update .gitignore for local artifacts
956 " ✅ Update CHANGELOG for version 2.1.2
957 " 🔵 Verify CHANGELOG.md update
958 1:54p ✅ Stage files and purge legacy artifacts
959 " ✅ Commit version 2.1.2 cleanup and fixes
960 1:58p ✅ Push version 2.1.2 to remote
961 " ✅ Subagent git sync confirmation
S161 Verify and push version 2.1.2 cleanup (Jun 3 at 1:58 PM)
**Investigated**: Verified that the local git working tree was fully updated with the v2.1.2 README.md rewrite, .gitignore additions, CHANGELOG.md entry, and pt-menu.sh fixes.

**Learned**: The deployment of the Kimi Architecture framework updates and legacy artifact purge is now safely versioned on the remote origin.

**Completed**: Successfully pushed all repository cleanups, documentation updates, and bugfixes for version 2.1.2 to the `main` branch. A subagent independently confirmed the `git add`, `commit`, and `push` operations were successful.

**Next Steps**: Awaiting next user instruction as the v2.1.2 cleanup and deployment phase is complete.


Access 143k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context># QA Automation Engineer (Performance Testing) Context

|Section                   |Isi                                                                                             |
|--------------------------|------------------------------------------------------------------------------------------------|
|**1. Konteks Project**    |3S objectives (Speed, Scalability, Stability) + KPI utama                                       |
|**2. QA Fundamentals**    |QA mindset, testing approaches (black/white/gray box), test oracles                             |
|**3. Performance Testing**|7 tipe test (load, stress, spike, endurance, volume, scalability, capacity) + tool stack lengkap|
|**4. Testing Techniques** |Functional, non-functional, methodologies (TDD/BDD/ATDD/RCA), data management                   |
|**5. SDLC & Delivery**    |Agile, semua model, shift-left strategy                                                         |
|**6. CI/CD Integration**  |Pipeline stage order, performance gate + threshold contoh                                       |
|**7. Version Control**    |Git branching strategy untuk test scripts                                                       |
|**8. Backend & Frontend** |API testing, browser/headless testing, rendering knowledge                                      |
|**9. Test Management**    |Test plan template, tools (TestRail, qTest, Zephyr, Jira)                                       |
|**10. Aturan Agent**      |Rules saat generate script, analisis hasil, tulis config, folder convention                     |
|**11. Struktur Folder**   |Tree lengkap project directory                                                                  |
|**12. Referensi Metrik**  |Percentiles, throughput, error, resource metrics                                                |

## Performance Testing
Performance Testing is a subset of Performance Engineering. It is a process of evaluating a system’s behavior under various extreme conditions. The main intent of performance testing is monitoring and improving key performance indicators such as response time, throughput, memory, CPU utilization, and more.

There are three objectives (three S) of Performance testing to observe and evaluate: Speed, Scalability, and Stability.

Types of Performance Testing
Following are the commonly used performance testing types, but not limited to:
- Load Testing
- Stress Testing
- Spike Testing
- Endurance Testing
- Volume Testing
- Scalability Testing
- Capacity Testing
