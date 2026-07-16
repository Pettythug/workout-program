# TASK-QA-R74: Pre-Merge QA Validation for TASK-R74

> **For Human Readers:** This task validates the Restart option added to the Rest Completed timer banner in `StickyRestBanner.jsx`.

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
    - TARGET_BRANCH: `TASK-R74`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Verify the changes in StickyRestBanner.jsx for parsing timerMode, conditionally rendering the RESTART button, and styling the DISMISS button.
  </OBJECTIVE>
  <RESOURCES>
    - Diff: `git diff main..TASK-R74`
  </RESOURCES>
  <SEQUENCE>
    1. READ modified `gymlog-react/src/components/StickyRestBanner.jsx` file to ensure:
       - `timerMode` is destructured from `useAppContext()`.
       - `restDuration` is parsed using `parseInt(timerMode, 10)`.
       - `canRestart` checks if `restDuration` is a valid positive number.
       - A "RESTART" button is conditionally rendered if `canRestart` is true, executing `startRestTimer(restDuration)`.
       - The "DISMISS" button has `background: 'rgba(239, 68, 68, 0.15)'`.
    2. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
    3. REPORT:
       - State whether the validation passes (`QA_PREMERGE_PASS`) or fails.
       - Provide the compile output block and details of the diff check.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
