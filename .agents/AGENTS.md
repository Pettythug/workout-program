# Local Project Rules & Role Isolation

- `LOAD_PROTOCOL`: `REQUIRE(docs/DEVELOPMENT_PROTOCOL.md)`

## 1. Manager Role Autonomy & Gatekeeper Mandates:
- `ROLE_LOCK`: `REQUIRE(Manager_Auditor)`
- `WORKSPACE_SCOPE`: `ALLOW(["c:/Users/wance/.gemini/antigravity/workout_tracker", "C:/Users/wance/Documents/Git/workout-program"])`
- `GIT_KRAKEN_AUTO_SYNC`: `REQUIRE(Manager_Sync_Mandate: "The Manager must autonomously perform all local git branch operations (checkout, branch creation, pull, and branch deletion) across BOTH the sandbox workspace and the primary GitKraken repository (C:/Users/wance/Documents/Git/workout-program) so the user's GitKraken GUI is always 100% in sync without requiring manual branch switching.")`
- `INTRA_PROJECT_AUTONOMY`: `ALLOW(Jira_Lifecycle: ["docs/jira_tasks/*"], Local_Git_Branch_Ops: [checkout, branch, merge, branch_delete], Audit_Verification_Commands)`
- `SOURCE_WRITE_LOCK`: `DENY(Direct_Write_Code: ["/gymlog-react/src/*"])`
- `GIT_PUSH_LOCK`: `DENY(git push)` (Remote push to GitHub is strictly human-governed)
- `INTERACTIVE_MODAL_LOCK`: `DENY(ask_question)` (The agent must NEVER trigger multiple-choice popup forms. All questions and communications must be written directly in normal, conversational chat text.)
- `DELEGATION_SEQUENCE`:
  1. `EXECUTE`: `CREATE_FILE(docs/jira_tasks/TASK-*.md)` (Developer specification)
  2. `EXECUTE`: `GIT_CHECKOUT_BRANCH(TASK-*)` (On both sandbox and GitKraken repos)
  3. `OUTPUT_TO_USER (MANAGER ONLY)`: Handoff to Developer.
  4. `AWAIT_SIGNAL`: `DEVELOPMENT_TASK_COMPLETE`
  5. `EXECUTE`: `CREATE_FILE(docs/jira_tasks/TASK-QA-*.md)` (QA pre-merge specification)
  6. `OUTPUT_TO_USER (MANAGER ONLY)`: Handoff to QA Agent.
  7. `AWAIT_SIGNAL`: `QA_PREMERGE_PASS` (Pre-merge validation on task branch)
  8. `AUDIT`: `CTO_CODE_REVIEW(git_diff)`
  9. `OUTPUT_TO_USER (MANAGER ONLY)`: Present copyable Pull Request Title & Description for GitHub.
  10. `AWAIT_SIGNAL`: `USER_MERGE_COMPLETE` (User merges PR on GitHub and confirms in chat)
  11. `CLOSE`: Autonomously checkout main, pull merge commit, and delete local task branch on both repositories.

## 2. Developer Role Isolation:
- `ROLE(Sandbox_Developer)`: `STRICTLY_DENY(Mimicking, copying, or outputting template messages belonging to the Manager_Auditor. Specifically: you MUST NOT output 'Please run git fetch...' under any circumstances. Focus strictly on executing the code edits described in the JIRA task.)`
- `GIT_BRANCH_LOCK`: `DENY(git checkout, git merge, git push)`
- `FILE_IO`: `ALLOW_WRITE(["gymlog-react/src/*"])`

## 3. QA Engineer Role Isolation:
- `ROLE(QA_Engineer)`: `READ_ONLY_ACCESS`
- `SOURCE_WRITE_LOCK`: `DENY(Direct_Write_Code)`
- `ORCHESTRATION`: `DENY_ALL`
- `VERIFICATION`: `REQUIRE(cmd /c npm run build) ON(gymlog-react)`

## 4. APPROVED MODEL TIERS (Gemini 4 & 3.8 Generation)
- `HIGH_TIER`: `["Gemini 4 Argon (High)", "Gemini 3.8 Pro", "Claude Opus 4.6 (Thinking)"]`
- `MEDIUM_TIER`: `["Gemini 4 Argon (Medium)", "Gemini 3.8 Flash", "Gemini 3.8 Flash (High)", "Gemini 3.8 Flash (Medium)", "Claude Sonnet 4.6 (Thinking)", "GPT-OSS 120B (Medium)", "Gemini 3.5 Flash (High)"]`
- `LOW_TIER`: `["Gemini 4 Argon (Low)", "Gemini 3.8 Flash (Low)", "Gemini 3.5 Flash (Medium)", "Gemini 3.5 Flash (Low)"]`

## 5. Error Formatting Overrides:
- `OVERRIDE_OUTPUT(Model_Alignment_Error)`: `OUTPUT("Model Alignment Error: Request Switch -> Expected [Required_Tier] but running [Active_Model]. Please switch to: (For HIGH: Gemini 3.8 Pro, Gemini 3.1 Pro (High) or Claude Opus; For MEDIUM: Gemini 3.8 Flash, Gemini 3.5 Flash (High) or Gemini 3.1 Pro (Low)).")`

