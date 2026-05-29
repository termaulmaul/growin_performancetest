# Research Findings: Growin Performance Test Framework

## Current Architecture
- **Entry Point**: `pt-menu.sh` (Bash TUI).
- **Core Components**:
    - `Script/`: Test suites (k6 JS scripts).
    - `docker-local-pt/`: Local mock environment.
    - `scheduler_cli/`: Python-based scheduler.
    - `k6`: Custom k6 binary with extensions.
    - `tui/`: Additional TUI components.
- **Infrastructure**: Supports Local (Docker), Onprem (SSH Jump), and Oncloud (GCP IAP).

## Identified Hazards & Weaknesses
1. **Concurrency**: No locking mechanism for shared environments. Multiple users can run tests simultaneously, leading to resource contention and invalid results.
2. **Security**: SSH passwords stored in env vars or hardcoded defaults (`M@nsek.1234`). No user authentication or RBAC in the TUI.
3. **Observability**: Limited visibility into who is running what and where. No centralized execution state.
4. **Governance**: No audit logging of executions, configuration changes, or environment access.
5. **Architecture**: Heavy reliance on Bash for complex logic (SSH orchestration, menu navigation). Mixed Bash/Python/Go codebase.

## Modernization Opportunities
- **Hybrid Approach**: Retain Bash for the TUI frontend but move core logic (Auth, RBAC, Locking, State) to a Python-based service layer or a set of CLI tools.
- **Centralized State**: Use SQLite (as requested) for a local/shared state registry.
- **Distributed Locking**: Implement a file-based or DB-based locking mechanism for environment occupancy.
- **Enhanced TUI**: Use `fzf` more extensively or integrate with Python libraries like `Textual` or `Rich` for better dashboards.
