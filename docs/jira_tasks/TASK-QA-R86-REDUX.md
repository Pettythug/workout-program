# TASK-QA-R86-REDUX: Pre-Merge QA Validation for TASK-R86-REDUX

> **For Human Readers:** This task validates the native single-card stepper warm-up implementation across AppContext.jsx, WarmUpCard.jsx, PlanView.jsx, and FullBodyView.jsx. It ensures that only ONE active card is rendered on screen at a time, the warm-up card matches the exact ExerciseCard frame and action buttons, the FULL LIST modal displays warm-up status, and the build compiles cleanly.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: QA_VERIFICATION
    - REQUIRED_MODEL_TIER: ["LOW_TIER", "Gemini 3.8 Flash (Low)", "Gemini 3.8 Flash (Medium)", "Gemini 3.8 Flash"]
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: QA_Engineer
    - SYSTEM_OVERRIDE: You are explicitly a read-only QA Agent. Write no source code files.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R86-REDUX`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Verify single-card stepper behavior in PlanView.jsx and FullBodyView.jsx, WarmUpCard.jsx styling, AppContext.jsx warm-up state, FULL LIST modal integration, and clean build compilation.
  </OBJECTIVE>
  <RESOURCES>
    - Diff: `git diff main..TASK-R86-REDUX`
  </RESOURCES>
  <SEQUENCE>
    1. READ modified files:
       - `gymlog-react/src/components/WarmUpCard.jsx`: Verify perimeter orange border, single subtitle, dropdown modalities, coaching cues tip box, and Orange DONE / Red SKIP buttons.
       - `gymlog-react/src/components/PlanView.jsx` & `gymlog-react/src/components/FullBodyView.jsx`: Verify single-card rendering (ONLY ONE card on screen), top active exercise counter, and FULL LIST modal warm-up integration.
       - `gymlog-react/src/context/AppContext.jsx`: Verify `warmUpStatus`, `selectedWarmUp`, `completeWarmUp()`, `skipWarmUp()`, `resetWarmUp()`, and session clock auto-start.
    2. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
    3. REPORT:
       - State whether validation passes (`QA_PREMERGE_PASS`) or fails.
       - Provide compile output and diff summary.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
