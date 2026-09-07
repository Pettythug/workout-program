# TASK-QA-R81: Pre-Merge QA Validation for TASK-R81

> **For Human Readers:** This task validates the strict odd/even core alternation in `FullBodyView.jsx`.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: QA_VERIFICATION
    - REQUIRED_MODEL_TIER: LOW_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: QA_Engineer
    - SYSTEM_OVERRIDE: You are explicitly a read-only QA Agent. Write no source code files.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R81`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Verify that FullBodyView.jsx dynamically selects 'Plank Core' on odd days and 'Rotational Core' on even days, isolating rotationKey and swap lists.
  </OBJECTIVE>
  <RESOURCES>
    - Diff: `git diff main..TASK-R81`
  </RESOURCES>
  <SEQUENCE>
    1. READ modified `gymlog-react/src/components/FullBodyView.jsx`:
       - Confirm `activeCoreCategory` is computed as `fullBodyWorkoutDay % 2 !== 0 ? 'Plank Core' : 'Rotational Core'`.
       - Confirm `pick([activeCoreCategory])` is used for slot #8.
    2. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
    3. REPORT:
       - State whether the validation passes (`QA_PREMERGE_PASS`) or fails.
       - Provide the compile output block and details of the diff check.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
