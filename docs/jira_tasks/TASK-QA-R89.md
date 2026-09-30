# TASK-QA-R89: Pre-Merge QA Validation for TASK-R89

> **For Human Readers:** This task validates the dynamic rep-range rest timer defaults (1-3 -> 3:00, 4-7 -> 2:00, 8-12 -> 1:30, 13+ -> 0:45) across AppContext.jsx, PlanView.jsx, FullBodyView.jsx, and CircuitView.jsx.

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
    - TARGET_BRANCH: `TASK-R89`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Verify getDefaultRestForRepRange in AppContext.jsx, 45S dropdown option across all views, dynamic rep range auto-defaulting, and clean build compilation.
  </OBJECTIVE>
  <RESOURCES>
    - Diff: `git diff main..TASK-R89`
  </RESOURCES>
  <SEQUENCE>
    1. READ modified files:
       - `gymlog-react/src/context/AppContext.jsx`: Verify `getDefaultRestForRepRange` maps 1-3 -> 180, 4-7 -> 120, 8-12 -> 90, 13+ -> 45.
       - `gymlog-react/src/components/PlanView.jsx`, `FullBodyView.jsx`, and `CircuitView.jsx`: Verify `45S REST` option in dropdown and rep-range sync effect when timer is idle.
    2. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation with 0 errors.
    3. REPORT:
       - State whether validation passes (`QA_PREMERGE_PASS`) or fails.
       - Provide compile output and diff summary.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
