<claude-mem-context>
# Memory Context

# [growin_performancetest] recent context, 2026-05-29 12:55pm GMT+7

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (15,624t read) | 102,867t work | 85% savings

### May 27, 2026
S129 Fix spinner process hanging in pt-menu.sh Docker startup commands (May 27 at 9:12 PM)
S147 Ultra-focus fix and update pt-menu.sh and its functions. Investigate issues and improve the TUI menu system for performance testing orchestration. (May 27 at 9:18 PM)
### May 29, 2026
S148 Ensure all menu options in pt-menu.sh support proper back/cancel navigation (ESC keystroke handling) (May 29 at 9:27 AM)
S149 Fix menu back navigation and SSH remote execution in pt-menu.sh for growin_performancetest (May 29 at 9:40 AM)
870 9:43a 🔵 SSH Sandbox Container Repository Location Configuration
871 9:44a 🔵 Sandbox Repository Located at /home/qa/growin_performancetest, Not Root Home
872 " 🔴 SSH Command Fails: remote_base Fallback Broken in Non-Interactive Bash
873 9:45a 🔴 Added /home/qa/growin_performancetest to remote_base Fallback Chain
874 " ✅ SSH remote_base Fix Verified: Sandbox Repository Path Now Reachable
S150 Fix GitHub large file warning for app.apk exceeding 50 MB size limit (May 29 at 9:45 AM)
875 10:15a 🔵 Large APK file exceeding GitHub size limits
876 10:16a 🔵 APK file committed as part of feature development
877 " 🔵 APK files not excluded in .gitignore
878 " ✅ Git LFS configured for APK files
S151 Menu Navigation Audit and Fallback Handler Fixes - Ensure all menus handle cancellation/ESC/back navigation without executing invalid operations (May 29 at 10:16 AM)
879 10:20a 🔵 Menu Navigation Patterns Audit in pt-menu.sh
880 10:21a 🔵 Menu Fallback Gaps Found in ssh_menu and cron_scheduler_menu
881 " 🔴 Added Cancellation Guards to 6 Menu Code Paths
882 " ✅ Patch Verification Complete - All Cancellation Guards Applied and Validated
S152 Improve pt-menu.sh seamless menu transitions with better output handling and TUI appearance (May 29 at 10:21 AM)
883 10:27a 🔵 Menu script uses banner() + clear pattern for transitions
884 " 🔵 Menu transitions use explicit delays and blocking input pauses
885 10:28a 🔵 Script lacks signal trap handlers for graceful interruption handling
886 " ✅ Menu script updated with signal trap handler and streamlined transitions
887 " 🔵 All sleep 1 delays successfully removed from menu script
S153 Enhanced pt-menu.sh with keyboard-driven navigation: ESC to exit script, Backspace to navigate back to parent menu, maintaining Enter for normal selection (May 29 at 10:28 AM)
888 10:37a 🔵 pick_fzf function structure mismatch in pt-menu.sh
889 " 🔵 pick_fzf() actual structure revealed via hex inspection
890 10:38a ✅ Enhanced pt-menu.sh keyboard navigation with ESC/Backspace support
891 " 🔄 Refactored keyboard handling from return codes to global _FZF_KEY variable
892 " 🔴 Fixed indentation of ESC guard statements in pt-menu.sh
S154 Diagnose and fix backslash escaping bug in pt-menu.sh pick_fzf() function discovered during keyboard navigation enhancement (May 29 at 10:39 AM)
893 10:40a 🔴 Fixed over-escaped backslash continuations in pick_fzf() fzf command
894 10:48a 🔵 Local Docker Mock Execution Architecture in pt-menu.sh
895 10:49a 🔵 run-mock-suite.sh: Local Docker Mock Test Queue & Execution Engine
896 " 🔵 BP001 Growin_PT_Dev Scenario: Web Platform Local Docker Execution
897 " 🔵 list-scenarios.mjs: Scenario Discovery with MockReady Status
898 10:50a 🔵 Growin_2FA Suite: Multi-Format Test Scripts with Platform Variants
899 " 🔵 run-local.sh: K6 Container Entrypoint with Environment Configuration Cascade
900 10:51a 🔵 Growin_2FA_LoadTest.sh: Local k6 Binary Execution (Non-Docker)
901 " 🔵 run-mock-scenario.sh: Argument Parsing and Script Path Construction
902 " 🔵 docker-local-pt/sandbox: SSH-Based Test Sandbox Container
903 10:52a 🔵 Docker Container Network Topology: Two Isolated Test Execution Paths
904 10:53a 🔵 BP001.js: Environment-Driven Configuration via BP_CONFIG Variable
905 10:55a 🔵 Available Test Suites: 17 Feature and Integration Tests
906 10:57a 🔵 Script Directory vs Scenario Discovery Gap: 7 Unmapped Suites
907 10:59a 🔵 Scenario Metadata Schema: Unified k6 Mock Runner with Centralized Execution
908 " 🔵 list-scenarios.mjs Discovery Algorithm: Platform-Directory Filter + mockReady Rules
909 11:01a 🔵 run-mock-scenario.sh: Complete Mock Execution Orchestration with Config & Health Checks
910 11:02a 🔵 OMO_Android: Script Files Present but Structure Incompatible with Discovery Algorithm
911 11:04a 🔵 OMO_Android: Environment-Driven Base URL with Conditional Environment Routing
912 " 🔵 OMO_Android: Configuration-Driven base_url from Data Object
913 11:06a 🔵 OMO_Android: Exported Function with Data Parameter and Token Management
914 11:07a 🔵 OMO_Android: Missing setup() Function Despite Token Coordination Comment
915 11:09a 🔵 OMO_Android_LoadTest.js: Legacy Local k6 Script with Multi-Environment setup() and Auth Flow
916 11:11a 🟣 run_test_menu: Added Direct k6 Binary Execution Path with Mock-Ready Suite Labeling
917 11:14a ✅ pt-menu.sh: Local Sandbox Menu Label Updated with Mock-API Availability Note
S155 Audit and enable all test scripts to support local execution via Mock Docker K6 (docker-compose mock-api) or Local Sandbox Docker (127.0.0.1:2222 SSH) (May 29 at 11:17 AM)
918 11:20a ✅ pt-menu.sh: Refactored pick_fzf Function - Remove --expect Flag, Simplify Navigation
919 11:25a ✅ pt-menu.sh: Added Dynamic Terminal Width Detection for Menu Formatting

Access 103k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>
