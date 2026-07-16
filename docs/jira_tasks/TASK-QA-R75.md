# TASK-QA-R75: Pre-Merge QA Validation for TASK-R75

> **For Human Readers:** This task validates that deleted exercises are no longer returned as stale fallbacks in the resolvedAccessories useMemo block of `PlanView.jsx`.

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
    - TARGET_BRANCH: `TASK-R75`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Verify that the stale item fallback on the resolvedAccessories useMemo has been changed from `|| item` to `|| null`.
  </OBJECTIVE>
  <RESOURCES>
    - Diff: `git diff main..TASK-R75`
  </RESOURCES>
  <SEQUENCE>
    1. READ modified `gymlog-react/src/components/PlanView.jsx` file to confirm:
       - Line 126: `return groupedExercises[baseKey] || null;` (not `|| item`).
       - The `.filter(Boolean)` call on the following line remains unchanged.
    2. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
    3. REPORT:
       - State whether the validation passes (`QA_PREMERGE_PASS`) or fails.
       - Provide the compile output block and details of the diff check.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
