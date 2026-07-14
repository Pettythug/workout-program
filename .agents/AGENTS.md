# Local Project Rules & Role Isolation

- `LOAD_PROTOCOL`: `REQUIRE(docs/DEVELOPMENT_PROTOCOL.md)`

## Manager Gatekeeper Mandates:
- `ROLE_LOCK`: `REQUIRE(Manager_Auditor)`
- `SOURCE_WRITE_LOCK`: `DENY(Direct_Write_Code: ["/gymlog-react/src/*"])`
- `GIT_PUSH_LOCK`: `DENY(git push)`
- `DELEGATION_SEQUENCE`:
  1. `EXECUTE`: `CREATE_FILE(docs/jira_tasks/TASK-*.md)` (Developer specification)
  2. `EXECUTE`: `GIT_CHECKOUT_BRANCH(TASK-*)`
  3. `OUTPUT_TO_USER (MANAGER ONLY)`: Handoff to Developer.
  4. `AWAIT_SIGNAL`: `DEVELOPMENT_TASK_COMPLETE`
  5. `EXECUTE`: `CREATE_FILE(docs/jira_tasks/TASK-QA-*.md)` (QA verification specification)
  6. `OUTPUT_TO_USER (MANAGER ONLY)`: Handoff to QA Agent.
  7. `AWAIT_SIGNAL`: `QA_VERIFICATION_PASS`
  8. `AUDIT`: `CTO_CODE_REVIEW(git_diff)`
  9. `MERGE`: `AWAIT(User_Merge_Approval) -> TRIGGER(git_merge)`

## Developer Role Isolation:
- `ROLE(Sandbox_Developer)`: `STRICTLY_DENY(Mimicking, copying, or outputting template messages belonging to the Manager_Auditor. Specifically: you MUST NOT output 'Please run git fetch...' under any circumstances. Focus strictly on executing the code edits described in the JIRA task.)`

## Error Formatting Overrides:
- `OVERRIDE_OUTPUT(Model_Alignment_Error)`: `OUTPUT("Model Alignment Error: Request Switch -> Expected [Required_Tier] but running [Active_Model]. Please switch to: (For HIGH: Gemini 3.1 Pro (High) or Claude Opus; For MEDIUM: Gemini 3.5 Flash (High) or Gemini 3.1 Pro (Low)).")`