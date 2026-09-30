# TASK-QA-R90: Pre-Merge QA Validation for TASK-R90

> **For Human Readers:** This task validates the 16-day cycle rotation and dynamic rep-range progression (8-12, 1-3, 13+, 4-7) for Circuit Mode across AppContext.jsx and CircuitView.jsx.

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
    - TARGET_BRANCH: `TASK-R90`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Verify circuitWorkoutDay state in AppContext.jsx, dynamic getRepRange(circuitWorkoutDay) in CircuitView.jsx, workout completion and day advancement on startNextWorkout(), rest timer sync, and clean build compilation.
  </OBJECTIVE>
  <RESOURCES>
    - Diff: `git diff main..TASK-R90`
  </RESOURCES>
  <SEQUENCE>
    1. READ modified files:
       - `gymlog-react/src/context/AppContext.jsx`: Verify `circuitWorkoutDay` and `updateCircuitWorkoutDay`.
       - `gymlog-react/src/components/CircuitView.jsx`: Verify `getRepRange`, dynamic `completeWorkout()` payload, `startNextWorkout()` day progression, and rest timer sync.
    2. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation with 0 errors.
    3. REPORT:
       - State whether validation passes (`QA_PREMERGE_PASS`) or fails.
       - Provide compile output and diff summary.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
