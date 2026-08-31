# TASK-QA-R79: Pre-Merge QA Validation for TASK-R79

> **For Human Readers:** This task validates the wall-clock rest timer engine in `AppContext.jsx` and the rest timer & sticky banner integration in `LiftView.jsx`.

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
    - TARGET_BRANCH: `TASK-R79`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Verify the timestamp timer calculations, visibilitychange sync listeners, and LiftView rest timer banner integration.
  </OBJECTIVE>
  <RESOURCES>
    - Diff: `git diff main..TASK-R79`
  </RESOURCES>
  <SEQUENCE>
    1. READ modified files:
       - `gymlog-react/src/context/AppContext.jsx`: Confirm `targetEndTimeRef` and `startTimeRef` track wall-clock time, `updateFromTimestamp` calculates remaining/elapsed seconds, `visibilitychange` & `focus` listeners are registered, and beep sound triggers at 0.
       - `gymlog-react/src/components/LiftView.jsx`: Confirm `<StickyRestBanner />` is rendered, and `onLogSet={handleLogSetSaved}` is passed to all `<ExerciseCard>` instances.
    2. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
    3. REPORT:
       - State whether the validation passes (`QA_PREMERGE_PASS`) or fails.
       - Provide the compile output block and details of the diff check.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
