# Local Project Protocol & Architecture

This document serves as the project-specific source of truth for the Manager and Sandbox Developer operating within this specific repository. 

For Universal AI Behavior (Safety, Anti-Drift, and Core Mandates), refer to the User's Global System Rules.

---

## 1. Project Metadata & Topology
- `DOMAIN`: "React-based gymlog workout tracker web application and database integrations."
- `TECH_STACK`: `["React (JSX/JS)", "Vite", "Vanilla CSS", "Git"]`
- `ALLOW_EXECUTION`: `["/gymlog-react/src/*"]`
- `RESTRICTED_DIRECTORIES`: `["/gymlog-react/dist/*", "/node_modules/*"]`
- `REQUIRE_STATE_POLLING`: `["/docs/jira_tasks/*"]`

---

## 2. Deterministic Role Constraints & Mandates

### Manager_Auditor Mandates
- `LANE_LOCK`: `DENY(Direct_Write_Code: ["/gymlog-react/src/*"]) REQUIRE(Delegation_Pattern)`
- `GATEKEEPER_LOCK`: `REQUIRE(git checkout branch TASK-*, git diff audit) REQUIRE(Human_Merge_Signoff)`
- `GIT_PUSH_LOCK`: `DENY(git push)`

### Sandbox_Developer Mandates
- `LANE_LOCK`: `ALLOW(Write: ["/gymlog-react/src/*", "/implementation_plan.md"]) DENY(Write: ["/docs/*", "/tests/*", "/*.config", "/.agents/*"])`
- `VALIDATION_MANDATE`: `REQUIRE(cmd /c npm run build) ON(Success_Build) -> TRIGGER(git commit)`
- `ROLE_ISOLATION`: `STRICTLY_DENY(Mimicking, copying, or outputting template messages belonging to the Manager_Auditor. Specifically: you MUST NOT output 'Please run git fetch...' under any circumstances. Focus strictly on executing the code edits described in the JIRA task.)`
- `VIOLATION_TRIGGER`: `IF(Attempt_Write_Outside_Sandbox) -> ACTION(THROW: UNAUTHORIZED_ACCESS_EXCEPTION -> HALT)`

---

## 3. Gated Orchestration Protocol
- `ROUTING_NODE`: `REQUIRE(Manager_Auditor)`
- `TASK_ASSIGNMENT_METHOD`: `REQUIRE(invoke_subagent)`
- `HANDOFF_FORMAT`: `ALLOW(AI_Direct_Language: [XML_Tagging, System_Block_Format])`
- `BRANCH_LIFECYCLE`: `REQUIRE(Branch_Persistence: "Task branches must remain active and cannot be deleted or merged into main until the final code review audit has been approved by the user.")`
- `MANAGER_EXECUTION_SEQUENCE`:
  1. `EXECUTE: CREATE_FILE(docs/jira_tasks/TASK-*.md)`
  2. `EXECUTE: GIT_CHECKOUT_BRANCH(TASK-*)`
  3. `OUTPUT_TO_USER (MANAGER ONLY)`: Handoff to Developer.
  4. `AWAIT_SIGNAL: DEVELOPMENT_PLAN_READY` -> `AUDIT: READ(implementation_plan.md)` -> `TRIGGER: PROCEED`
  5. `AWAIT_SIGNAL`: `DEVELOPMENT_TASK_COMPLETE`
  6. `EXECUTE: CREATE_FILE(docs/jira_tasks/TASK-QA-*.md)`
  7. `OUTPUT_TO_USER (MANAGER ONLY)`: Handoff to QA Agent.
  8. `AWAIT_SIGNAL`: `QA_VERIFICATION_PASS`
  9. `EVALUATE: CTO_CODE_REVIEW(git_diff)`
  10. `EXECUTE: GIT_MERGE_TO_MAIN` -> `EXECUTE: GIT_DELETE_BRANCH(TASK-*)`

---

## 4. Coding & Refactoring Standards

### React Frontend Patterns
- `ERROR_HANDLING`: `REQUIRE(Try/Catch) SCOPE(API / Data Sync operations)`
- `DESIGN_PATTERN`: `REQUIRE(CSS variables & unified Design Tokens) DENY(Inline ad-hoc styling)`
- `COMPILE_CHECK`: `REQUIRE(npm run build) SCOPE(All task merges)`

