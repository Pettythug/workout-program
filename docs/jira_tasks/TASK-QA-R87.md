# TASK-QA-R87: Pre-Merge QA Validation for TASK-R87

> **For Human Readers:** This task validates structured human-readable session IDs, session deduplication/in-place upserting, history row deletion in SessionStatsModal, Google Sheets cloud sync, and Circuit mode Warm-Up and duration tracking parity.

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
    - TARGET_BRANCH: `TASK-R87`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Verify AppContext.jsx structured session IDs and upserting, SessionStatsModal.jsx deletion and dynamic stats update, CircuitView.jsx Warm-Up and completion summary parity, and clean build compilation.
  </OBJECTIVE>
  <RESOURCES>
    - Diff: `git diff main..TASK-R87`
  </RESOURCES>
  <SEQUENCE>
    1. READ modified files:
       - `gymlog-react/src/context/AppContext.jsx`: Verify structured session ID generation (`[Program]_[YYYY-MM-DD]_[HH:MM:SS]`), in-place upsert logic in `saveCompletedSession()`, `deleteSession(sessionId)`, and background `sheetsPost({ action: 'logSession', ... })`.
       - `gymlog-react/src/components/SessionStatsModal.jsx`: Verify delete icon (`🗑️`), `deleteSession` integration with confirmation, and dynamic recalculation of rep range averages.
       - `gymlog-react/src/components/CircuitView.jsx`: Verify `<WarmUpCard />` as Step #0, Warm-Up item in `FULL LIST`, `completeWorkout()` session duration tracking and summary screen, and `startNextWorkout()` reset.
       - `gymlog-react/src/components/PlanView.jsx` & `gymlog-react/src/components/FullBodyView.jsx`: Verify canonical session object handling.
    2. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation with 0 errors.
    3. REPORT:
       - State whether validation passes (`QA_PREMERGE_PASS`) or fails.
       - Provide compile output and diff summary.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
