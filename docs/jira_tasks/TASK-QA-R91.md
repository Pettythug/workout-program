# TASK-QA-R91: QA Pre-Merge Validation for Standalone Exercise Architecture, Modality Generator & Swap Dropdown

> **For Human & QA Readers:** This QA specification validates all deliverables in `TASK-R91` on branch `TASK-R91`.

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
    - TARGET_BRANCH: `TASK-R91`
    - TARGET_APP_PATH: `gymlog-react`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Compile and Scope Verification:
       - Run `npm run build` inside `gymlog-react/` to verify zero build errors.
       - Run AST scope check (`npx eslint src/`) to verify 0 `no-undef` errors.
    2. Deliverables Audit:
       - Verify `ExerciseCard.jsx` & `CircuitCard.jsx`:
         - Card header renders exact `exerciseName`.
         - Swap dropdown filters by `matchesLocation(alt.location, activeLocation)` and sorts alphabetically with `.sort((a, b) => a.name.localeCompare(b.name))`.
         - Legacy top pills and bottom toggle checkboxes are removed.
       - Verify `SettingsModal.jsx`:
         - Modality checkboxes (`Standard`, `Alternating`, `Singles`) generate standalone entries upon create.
       - Verify `PlanView.jsx` and `FullBodyView.jsx`:
         - Full list modal renders clean `displayName` and handles resets properly.
    3. Verification Output:
       - Report findings and output `QA_PREMERGE_PASS` if all checks succeed.
  </OBJECTIVE>
  <SEQUENCE>
    1. RUN `npm run build` in `gymlog-react`.
    2. RUN `npx eslint src/` in `gymlog-react`.
    3. REVIEW git diff on `TASK-R91`.
    4. SIGNAL `QA_PREMERGE_PASS`.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
