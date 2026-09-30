# TASK-R88: Google Apps Script Backend Integration for GymLog_Sessions

> **For Human Readers:** This task delivers the complete Google Sheets backend integration for workout sessions in `Combined_AppScript_v2.gs`. It adds the `GymLog_Sessions` sheet tab, handles in-place session logging/upserting (`logSession`), session row deletion (`deleteSession`), and hydration on initial load (`getSessions`), providing full cloud synchronization between the React app and Google Sheets.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: MULTI_FILE_Refactoring
    - REQUIRED_MODEL_TIER: ["MEDIUM_TIER", "Gemini 3.8 Flash (Medium)", "Gemini 3.8 Flash", "Gemini 3.8 Pro"]
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R88`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Update `Combined_AppScript_v2.gs`:
       - Define constants:
         - `const SESSIONS_TAB = "GymLog_Sessions";`
         - `const SESSIONS_HEADERS = ["Session ID", "Date", "Program", "Workout Day", "Rep Range", "Start Time", "End Time", "Duration Minutes", "Start Timestamp", "End Timestamp"];`
       - In `doPost(e)`:
         - Route `if (payload.action === "logSession") return withLock(gymlog_handleLogSession, payload);`
         - Route `if (payload.action === "deleteSession") return withLock(gymlog_handleDeleteSession, payload);`
         - Route `if (payload.action === "getSessions") return gymlog_handleGetSessions();`
       - Implement `gymlog_handleLogSession(payload)`:
         - Opens or creates `SESSIONS_TAB` with `SESSIONS_HEADERS`.
         - Checks existing rows in Col 1 for matching `payload.id`.
         - If found, updates the row in-place with new `[id, date, program, workoutDay, repRange, startTime, endTime, durationMinutes, startTimestamp, endTimestamp]`.
         - If not found, appends the new row.
         - Returns `{ status: "success", id: payload.id }`.
       - Implement `gymlog_handleDeleteSession(payload)`:
         - Finds row matching `payload.id` in Col 1 and deletes the row.
         - Returns `{ status: "success", deletedId: payload.id }`.
       - Implement `gymlog_handleGetSessions()`:
         - Returns list of all session objects parsed from `SESSIONS_TAB`.

    2. Update `gymlog-react/src/context/AppContext.jsx`:
       - In `deleteSession(sessionId)`: Send background `sheetsPost({ action: 'deleteSession', id: sessionId })`.
       - In `syncAll` (or initial hydration): Merge server sessions from Google Sheets into local `sessionHistory`.

    3. Verification & Audit:
       - Generate `/audit_log_R88.md`.
       - Run `npm run build` inside `gymlog-react` to ensure clean frontend compilation.
  </OBJECTIVE>
  <RESOURCES>
    - Backend: `Combined_AppScript_v2.gs`
    - Frontend Context: `gymlog-react/src/context/AppContext.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `Combined_AppScript_v2.gs` and `gymlog-react/src/context/AppContext.jsx`.
    2. MODIFY `Combined_AppScript_v2.gs` to implement `SESSIONS_TAB`, `gymlog_handleLogSession`, `gymlog_handleDeleteSession`, and `gymlog_handleGetSessions`.
    3. MODIFY `gymlog-react/src/context/AppContext.jsx` to wire cloud deletion and session hydration.
    4. CREATE `/audit_log_R88.md`.
    5. RUN `npm run build` inside `gymlog-react` and verify clean build.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
