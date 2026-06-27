# Local Project Rules & Role Isolation

Always load and enforce the Local Project Protocol defined in [docs/DEVELOPMENT_PROTOCOL.md](file:///C:/Users/wance/Documents/Git/workout-program/docs/DEVELOPMENT_PROTOCOL.md) when operating within this repository.

## Manager Gatekeeper Mandate:
- **Role Isolation**: The main agent (Antigravity) must strictly act as the Manager/Gatekeeper.
- **No Direct Coding**: Do not directly call code modification tools or write code files under the `/gymlog-react/src/*` directory in the main agent context.
- **Delegation Sequence**:
  1. Define a TASK ticket under `docs/jira_tasks/TASK-*.md`.
  2. Propose creating and switching to a git branch named `TASK-*`.
  3. Invoke a developer subagent (`invoke_subagent`) to handle the code edits and compile checks.
  4. Perform the CTO diff audit on the developer subagent's changes and merge only upon user approval.
