# TASK-R87: Session Deduplication & Upserting, Google Sheets Sync, and Circuit Warm-Up Parity

> **For Human Readers:** This task adds structured human-readable session IDs (`[Program]_[YYYY-MM-DD]_[HH:MM:SS]`), in-place session upserting (preventing duplicate time entries when a workout is undone/recompleted), Google Sheets cloud sync for completed sessions, and brings full Warm-Up & session duration tracking parity to `CircuitView.jsx`.

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
    - TARGET_BRANCH: `TASK-R87`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Update `gymlog-react/src/context/AppContext.jsx`:
       - Construct unique, human-readable session IDs formatted as:
         `${program}_${formatDate(startTimestamp)}_${formatTime(startTimestamp)}`
         (e.g., `Plan_2026-09-29_10:56:00`).
       - In `saveCompletedSession(sessionData)`:
         - Inspect existing `sessionHistory` by `id`.
         - If found, update the existing session record in-place (updating `endTime`, `durationMinutes`, `endTimestamp`, etc.).
         - If not found, prepend the new session record.
         - Persist updated array to `gymlog_session_history`.
       - Add `deleteSession(sessionId)` helper to remove outlier/test sessions from `sessionHistory` and `localStorage`.
       - Integrate background Google Sheets sync via `sheetsPost({ action: 'logSession', ...sessionData })`.
       - Expose `deleteSession` and updated handlers via `AppContext`.

    2. Update `gymlog-react/src/components/SessionStatsModal.jsx`:
       - Add a subtle delete icon (`🗑️` / `×`) on each historical session row with a quick confirmation prompt (`window.confirm`) that invokes `deleteSession(session.id)`.
       - Recalculate rep range averages dynamically whenever history updates.

    3. Update `gymlog-react/src/components/CircuitView.jsx` (Warm-Up & Session Duration Parity):
       - Single-Card Stepper Warm-Up:
         - Render `<WarmUpCard onAdvance={() => setViewingWarmUp(false)} />` when `warmUpStatus === 'pending'` as Step #0 before Exercise #1 of the circuit.
         - Include Warm-Up at the top of the Circuit `FULL LIST` modal with status badge (`✓ DONE`, `SKIPPED`, `PENDING`).
       - Session Duration & Completion Summary:
         - In `completeWorkout()`: Calculate duration from `sessionStartTime`, call `saveCompletedSession()`, and display the workout completion summary card (Total Time, Started/Finished, Rep Range) with button to open `SessionStatsModal`.
         - In `startNextWorkout()` (or reset): Reset `sessionStartTime` and `warmUpStatus`.

    4. Verification & Audit:
       - Generate `/audit_log_R87.md` detailing the deduplication, Google Sheets sync, and Circuit parity architecture.
       - Execute `npm run build` inside `gymlog-react` and ensure clean compilation with 0 errors.
  </OBJECTIVE>
  <RESOURCES>
    - Context: `gymlog-react/src/context/AppContext.jsx`
    - Modal: `gymlog-react/src/components/SessionStatsModal.jsx`
    - Circuit View: `gymlog-react/src/components/CircuitView.jsx`
    - Plan View: `gymlog-react/src/components/PlanView.jsx`
    - Full Body View: `gymlog-react/src/components/FullBodyView.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/context/AppContext.jsx`, `gymlog-react/src/components/SessionStatsModal.jsx`, and `gymlog-react/src/components/CircuitView.jsx`.
    2. MODIFY `gymlog-react/src/context/AppContext.jsx`:
       - Implement human-readable session ID generation and in-place upsert logic in `saveCompletedSession`.
       - Add `deleteSession` method.
       - Add Google Sheets sync for completed sessions.
    3. MODIFY `gymlog-react/src/components/SessionStatsModal.jsx`:
       - Add delete session button and dynamic average updates.
    4. MODIFY `gymlog-react/src/components/CircuitView.jsx`:
       - Add Warm-Up Step #0 single-card stepper integration.
       - Add completion duration logging and summary screen.
    5. CREATE `/audit_log_R87.md`.
    6. RUN `npm run build` inside `gymlog-react` and verify clean build.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
