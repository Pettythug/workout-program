# TASK-QA-R70: Pre-Merge QA Validation for TASK-R70

> **For Human Readers:** This task validates the rotation index safeguards and console trace logs in `PlanView.jsx`.

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
    - TARGET_BRANCH: `TASK-R70`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Verify the rotation parse guards and trace log implementation in PlanView.jsx, ensuring clean compilation and correct index math.
  </OBJECTIVE>
  <RESOURCES>
    - Diff: `git diff main..TASK-R70`
  </RESOURCES>
  <SEQUENCE>
    1. READ modified `gymlog-react/src/components/PlanView.jsx` file to ensure:
       - The `pick` function loads `localStorage` and wraps it in an `isNaN(idxVal) || idxVal < 0` check.
       - The index used for mapping is `idxVal`.
       - The `startNextWorkout` function wraps `currentIdx` with same safeguards and outputs a console log message prefixed with `[Rotation Audit]`.
    2. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
    3. REPORT:
       - State whether the validation passes (`QA_PREMERGE_PASS`) or fails.
       - Provide the compile output block and code verification check.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
