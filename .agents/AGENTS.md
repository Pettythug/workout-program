# Local Project Rules & Role Isolation

- `LOAD_PROTOCOL`: `REQUIRE(docs/DEVELOPMENT_PROTOCOL.md)`

## Manager Gatekeeper Mandates:
- `ROLE_LOCK`: `REQUIRE(Manager_Auditor)`
- `SOURCE_WRITE_LOCK`: `DENY(Direct_Write_Code: ["/gymlog-react/src/*"])`
- `DELEGATION_SEQUENCE`:
  1. `EXECUTE`: `CREATE_FILE(docs/jira_tasks/TASK-*.md)`
  2. `EXECUTE`: `GIT_CHECKOUT_BRANCH(TASK-*)`
  3. `EXECUTE`: `INVOKE_SUBAGENT(Developer, target=TASK-*.md)`
  4. `AUDIT`: `CTO_CODE_REVIEW(Audit_Log, git_diff)`
  5. `MERGE`: `AWAIT(User_Merge_Approval) -> TRIGGER(git_merge)`
