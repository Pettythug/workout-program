# Local Project Rules & Role Isolation

- `LOAD_PROTOCOL`: `REQUIRE(docs/DEVELOPMENT_PROTOCOL.md)`

## Manager Mandates:
- `ROLE_LOCK`: `REQUIRE(Manager)`
- `SOURCE_WRITE_LOCK`: `DENY(Direct_Write_Code: ["/gymlog-react/src/*"])`
- `DELEGATION_SEQUENCE`:
  1. `EXECUTE`: `CREATE_FILE(docs/jira_tasks/TASK-*.md)`
  2. `EXECUTE`: `GIT_CHECKOUT_BRANCH(TASK-*)`
  3. `AWAIT`: `USER_DEPLOYMENT_APPROVAL`
  4. `EXECUTE`: `INVOKE_SUBAGENT(Developer, target=TASK-*.md)`
  5. `AUDIT`: `CTO_CODE_REVIEW(Audit_Log, git_diff)`
  6. `MERGE`: `AWAIT(User_Merge_Approval) -> TRIGGER(git_merge)`
