# TASK-QA-R85: Pre-Merge QA Validation for TASK-R85

> **For Human Readers:** This task validates automated session duration tracking, live header session badge, workout completion summaries, and the rep range partition stats modal (`SessionStatsModal.jsx`).

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
    - TARGET_BRANCH: `TASK-R85`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Verify AppContext.jsx session start/end tracking and getRepRangeStats(), Header.jsx live session pill, PlanView.jsx / FullBodyView.jsx completion summaries, SettingsModal.jsx stats button, SessionStatsModal.jsx layout, and clean build compilation.
  </OBJECTIVE>
  <RESOURCES>
    - Diff: `git diff main..TASK-R85`
  </RESOURCES>
  <SEQUENCE>
    1. READ modified files:
       - `gymlog-react/src/context/AppContext.jsx`: Confirm `sessionStartTime` auto-starts on `logExerciseSet`, `saveCompletedSession`, `resetSessionTime`, and `getRepRangeStats` computation.
       - `gymlog-react/src/components/Header.jsx`: Confirm live `⏱️ Xm` badge renders when session is active and opens `SessionStatsModal`.
       - `gymlog-react/src/components/PlanView.jsx` & `FullBodyView.jsx`: Confirm completion screen duration display and `SessionStatsModal` button.
       - `gymlog-react/src/components/SessionStatsModal.jsx`: Confirm rep range brackets (1-3, 4-7, 8-12, 13+) display averages and recent session list.
       - `gymlog-react/src/components/SettingsModal.jsx`: Confirm `📊 Workout Time & Averages` button is added.
    2. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
    3. REPORT:
       - State whether the validation passes (`QA_PREMERGE_PASS`) or fails.
       - Provide the compile output block and details of the diff check.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
