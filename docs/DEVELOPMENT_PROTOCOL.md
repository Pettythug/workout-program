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

### Manager Mandates
- `LANE_LOCK`: `DENY(Direct_Write_Code: ["/gymlog-react/src/*"]) REQUIRE(Delegation_Pattern)`
- `GATEKEEPER_LOCK`: `REQUIRE(git checkout branch TASK-*, git diff audit) REQUIRE(Human_Merge_Signoff)`

### Sandbox_Developer Mandates
- `LANE_LOCK`: `ALLOW(Write: ["/gymlog-react/src/*"]) DENY(Write: ["/docs/*", "/tests/*", "/*.config", "/.agents/*"])`
- `VALIDATION_MANDATE`: `REQUIRE(cmd /c npm run build) ON(Success_Build) -> TRIGGER(git commit)`
- `VIOLATION_TRIGGER`: `IF(Attempt_Write_Outside_Sandbox) -> ACTION(THROW: UNAUTHORIZED_ACCESS_EXCEPTION -> HALT)`

---



## 4. Coding & Refactoring Standards

### React Frontend Patterns
- `ERROR_HANDLING`: `REQUIRE(Try/Catch) SCOPE(API / Data Sync operations)`
- `DESIGN_PATTERN`: `REQUIRE(CSS variables & unified Design Tokens) DENY(Inline ad-hoc styling)`
- `COMPILE_CHECK`: `REQUIRE(npm run build) SCOPE(All task merges)`

### SQL Database Standards
- `HEADERS`: `REQUIRE(Multi-line block comment: Author: Brian Wance) LOCATION(File Header)`
- `FORMATTING`: `REQUIRE(Leading commas in lists)`
- `FIELD_CLAUSES`: `REQUIRE(Explicit field names) DENY(Column numbers)`
- `SUBQUERIES`: `DENY(Correlated subqueries)`
