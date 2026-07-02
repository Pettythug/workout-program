# TASK-R9: Fix Input Wipe Race Condition

> **For Human Readers:** This task fixes a critical UX bug where typing into the rep/weight inputs immediately after opening the app causes your input to be suddenly erased. This was caused by the asynchronous background data sync overriding your typing.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: SINGLE_FILE_FEATURE
    - REQUIRED_MODEL_TIER: MEDIUM_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R9`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Fix the race condition in `ExerciseCard.jsx` where the `people` dependency update triggers `initLogInputs()` and wipes user input.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files: `gymlog-react/src/components/ExerciseCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Target files.
    2. MODIFY: In `ExerciseCard.jsx`, locate the `useEffect` responsible for `initLogInputs()` (around line 146).
    3. MODIFY: The current dependency array is `[isOpen, people]`. Remove `people` from the dependency array, OR rewrite the logic using a `useRef` so that `initLogInputs` is only called when `isOpen` explicitly transitions from `false` to `true`.
    4. AUDIT: Generate `audit_log_R9.md` documenting the exact changes.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
