# TASK-QA-R91: QA Pre-Merge Validation for Standalone Exercise Architecture & Modality Generator

> **For Human & QA Readers:** This QA specification validates the changes made in `TASK-R91` on branch `TASK-R91`. It ensures that variations (`Standard`, `Alt`, `Single`) are treated as standalone first-class exercises, the UI cards are clean of redundant pills/checkboxes, and new exercises can be created with modality generator checkboxes.

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
    1. Compile and Syntax Audit:
       - Run `npm run build` inside `gymlog-react/` to verify zero build errors.
    2. Code Audit (TASK-R91 Deliverables):
       - Verify `ExerciseCard.jsx` & `CircuitCard.jsx`:
         - Legacy top variation pills (`STANDARD | SINGLES | ALT`) are removed.
         - Duplicate bottom checkboxes (`[ ] Singles`, `[ ] Alternating`) are removed.
         - Card title cleanly displays the exact exercise name.
         - History and 1RM lookups map directly to the exact exercise name.
       - Verify `SettingsModal.jsx`:
         - Modality checkboxes (`Standard`, `Alternating`, `Singles`) exist in the Add Exercise modal.
         - `createExerciseMeta` dispatches independent exercise entries for all selected modalities.
       - Verify `PlanView.jsx`, `FullBodyView.jsx`, and `CircuitView.jsx`:
         - Swap modal and tracker state operate cleanly with flattened standalone exercises.
    3. Verification Output:
       - Report findings and signal `QA_PREMERGE_PASS` if all checks succeed.
  </OBJECTIVE>
  <SEQUENCE>
    1. RUN `npm run build` in `gymlog-react`.
    2. REVIEW git diff on `TASK-R91`.
    3. OUTPUT QA summary and `QA_PREMERGE_PASS` signal.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
