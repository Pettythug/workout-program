# TASK-QA-R88: Pre-Merge QA Validation for TASK-R88

> **For Human Readers:** This task validates the Google Apps Script backend implementation for `GymLog_Sessions` in `Combined_AppScript_v2.gs` and the frontend hydration/deletion sync in `AppContext.jsx`.

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
    - TARGET_BRANCH: `TASK-R88`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Verify Combined_AppScript_v2.gs session handlers and routing, AppContext.jsx session hydration and deletion sync, and clean production build.
  </OBJECTIVE>
  <RESOURCES>
    - Diff: `git diff main..TASK-R88`
  </RESOURCES>
  <SEQUENCE>
    1. READ modified files:
       - `Combined_AppScript_v2.gs`: Verify `SESSIONS_TAB`, `SESSIONS_HEADERS`, `gymlog_handleLogSession`, `gymlog_handleDeleteSession`, `gymlog_handleGetSessions`, `doPost` routes, and `gymlog_doGet` payload.
       - `gymlog-react/src/context/AppContext.jsx`: Verify cloud session hydration on sync and cloud session deletion on `deleteSession`.
    2. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
    3. REPORT:
       - State whether validation passes (`QA_PREMERGE_PASS`) or fails.
       - Provide compile output and diff summary.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
