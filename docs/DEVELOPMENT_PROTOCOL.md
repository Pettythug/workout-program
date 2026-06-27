# Local Project Protocol & Architecture

This document serves as the project-specific source of truth for the Manager and Sandbox Developer operating within this specific repository. 

For Universal AI Behavior (Safety, Anti-Drift, and Core Mandates), refer to the User's Global System Rules.

---

## 1. Project Metadata & Topology
- **Domain**: React-based gymlog workout tracker web application and database integrations.
- **Tech Stack**: `["React (JSX/JS)", "Vite", "Vanilla CSS", "Git"]`
- **Sandbox Directories**:
  - `ALLOW_EXECUTION`: `["/gymlog-react/src/*"]`
  - `RESTRICTED_DIRECTORIES`: `["/gymlog-react/dist/*", "/node_modules/*"]`
  - `REQUIRE_STATE_POLLING`: `["/docs/jira_tasks/*"]`

---

## 2. Sandbox Environment & Role Separation
- **Roles**: The Manager acts strictly as Project Manager, Architect, Auditor, and Git Gatekeeper. The Developer writes the code in an isolated Sandbox workspace.
- **Git Feature Branches**: All development work must live on a dedicated branch named `TASK-*` and must be reviewed and merged by the Manager to the `main` branch. Direct commits to `main` are prohibited.

---

## 3. Gated Orchestration Protocol
All tasks are executed via the following pipeline:
1. **Ticket Generation**: The Manager writes a task description file to `docs/jira_tasks/TASK-*.md`.
2. **Branch Isolation**: The Manager creates and switches to a git branch named `TASK-*`.
3. **Task Delegation**: The Manager invokes the Sandbox Developer subagent (`invoke_subagent`), passing the task description in the prompt.
4. **Developer Execution**: The Developer writes code in `/gymlog-react/src/*`, verifies compilation, commits to the branch, and outputs an audit log.
5. **Code Audit & Promotion**: The Manager reviews the developer's audit log, runs a production build to verify compilation, and requests User approval to merge the branch to `main`.

---

## 4. Coding & Refactoring Standards

### React Frontend Patterns
- **Error Handling**: Use explicit `try/catch` blocks for all API calls and local storage sync operations.
- **Zero-Drift Component Design**: Do not duplicate views or create ad-hoc styling layout blocks. Keep component styling aligned to predefined design CSS variables.
- **Build Checks**: Every task must compile successfully using `npm run build` before merge.

### SQL Database Standards
- **Headers**: Every `.sql` file must contain a multi-line comment header with **Author: Brian Wance**.
- **Formatting**: Use leading commas in lists. Use explicit field names in clauses (e.g., `GROUP BY business_unit`), not column numbers. Avoid correlated subqueries.
