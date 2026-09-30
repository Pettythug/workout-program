# TASK-QA-R92: QA Pre-Merge Validation for Mobile Sticky Timer, Session Reset Controls & User-Partitioned Stats

> **For Human & QA Readers:** This QA specification validates all deliverables in `TASK-R92` on branch `TASK-R92`.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: QA_PreMerge_Verification
    - REQUIRED_MODEL_TIER: ["LOW_TIER", "MEDIUM_TIER", "Gemini 3.8 Flash (Low)", "Gemini 3.5 Flash (Medium)"]
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: QA_Engineer
    - SYSTEM_OVERRIDE: You are strictly a Read-Only Quality Assurance Engineer. You do not modify code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R92`
    - TARGET_APP_PATH: `gymlog-react`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Compile and Scope Verification:
       - Run `npm run build` inside `gymlog-react/` to verify clean compilation (0 errors).
       - Run AST scope check (`npx eslint src/`) to verify 0 `no-undef` errors.
    2. Deliverables Audit:
       - Verify `index.css`, `PlanView.jsx`, `LiftView.jsx`, and `FullBodyView.jsx`:
         - Inner `position: sticky; top: 0` subheaders and negative margins are removed.
         - GPU hardware compositing is applied to `.sticky-header-container`.
       - Verify `SessionStatsModal.jsx`:
         - Active session card displays with `Reset to 0m` and `Clear Active Clock` actions.
         - Participant filter chips filter historical session stats dynamically.
       - Verify `AppContext.jsx` & `Combined_AppScript_v2.gs`:
         - Active participant(s) are attached to completed sessions and synced.
    3. Verification Output:
       - Report findings and output `QA_PREMERGE_PASS` when verified.
  </OBJECTIVE>
  <SEQUENCE>
    1. RUN `npm run build` in `gymlog-react`.
    2. RUN `npx eslint src/` in `gymlog-react`.
    3. REVIEW git diff on `TASK-R92`.
    4. SIGNAL `QA_PREMERGE_PASS`.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
