# TASK-R92: Mobile Sticky Timer, Session Reset Controls & User-Partitioned Session Stats

> **For Human Readers:** This task delivers three interconnected improvements: (1) Fixes the mobile sticky rest timer detachment by removing nested sticky subheaders and applying GPU compositing, (2) Implements session timer reset controls (manual restart in Stats modal and auto-cleanup on Warm-Up UNDO), and (3) Tags all completed workout sessions with active participant(s) (`Solo: Brian`, `Partner: Brian + Dad`) and adds user-partitioned pacing filters in the Stats modal so averages are never polluted by tests or mixed group sizes.

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
    - TARGET_BRANCH: `TASK-R92`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Mobile Sticky Rest Timer Stability:
       - In `PlanView.jsx`, `LiftView.jsx`, and `FullBodyView.jsx`:
         - Remove `position: 'sticky', top: 0, zIndex: 100` and `margin: '-16px -16px 16px'` from the inner view headers so they render as clean static headers with `marginBottom: 16`.
       - In `index.css`:
         - Update `html, body { height: 100%; }` to `html, body { min-height: 100%; }`.
         - Add GPU compositing to `.sticky-header-container`:
           `transform: translate3d(0, 0, 0); -webkit-transform: translate3d(0, 0, 0); will-change: transform;`

    2. Session Timer Controls:
       - In `SessionStatsModal.jsx`:
         - If `sessionStartTime` is active, render an "Active Session" control card at the top:
           - Displays start time and elapsed minutes.
           - `[ ? Reset Session to 0m ]` button -> calls `startSession(Date.now())` (resets session clock to right now).
           - `[ ?? Clear Active Clock ]` button -> calls `resetSessionTime()` (clears active session clock).
       - In `PlanView.jsx` and `FullBodyView.jsx`:
         - In the warm-up `UNDO` handler: If all exercise statuses are pending (no working sets logged), call `resetSessionTime()` to automatically cancel accidental starts.

    3. User-Partitioned Session Tagging & Stats Averages:
       - In `AppContext.jsx` (`saveCompletedSession`):
         - Capture `activePeople` on session completion.
         - Format human-readable ID: `${program}_${activePeopleStr}_${formatDate(startTs)}_${formatTime(startTs)}` (e.g. `Plan_Brian_2026-09-30_14:15:00` or `Plan_Brian+Dad_2026-09-30_14:15:00`).
         - Attach `people: (activePeople && activePeople.length > 0) ? activePeople.join(', ') : 'Solo'` to the session record and background sheets payload.
         - Update `getRepRangeStats(customHistory, filterPerson)` to compute averages partitioned by selected participant filter.
       - In `SessionStatsModal.jsx`:
         - Add participant filter tabs at the top (e.g. `[ ALL ]`, `[ Brian (Solo) ]`, `[ Brian + Dad (Partner) ]`, `[ Dad (Solo) ]`) derived dynamically from `sessionHistory`.
         - Compute rep-range averages (1-3, 4-7, 8-12, 13+) strictly for the active filter tab.
       - In `Combined_AppScript_v2.gs`:
         - Ensure `logSession` writes the `People` column to `GymLog_Sessions`.

    4. Verification & Audit:
       - Run `npm run build` inside `gymlog-react/` to ensure zero compilation errors.
       - Run `npx eslint src/` to verify 0 `no-undef` errors.
  </OBJECTIVE>
  <RESOURCES>
    - CSS: `gymlog-react/src/index.css`
    - Modal: `gymlog-react/src/components/SessionStatsModal.jsx`
    - Plan View: `gymlog-react/src/components/PlanView.jsx`
    - Lift View: `gymlog-react/src/components/LiftView.jsx`
    - Full Body View: `gymlog-react/src/components/FullBodyView.jsx`
    - AppContext: `gymlog-react/src/context/AppContext.jsx`
    - Backend: `Combined_AppScript_v2.gs`
  </RESOURCES>
  <SEQUENCE>
    1. READ `docs/jira_tasks/TASK-R92.md`.
    2. MODIFY `index.css`, `PlanView.jsx`, `LiftView.jsx`, and `FullBodyView.jsx` for mobile sticky rest timer stability.
    3. MODIFY `AppContext.jsx` and `Combined_AppScript_v2.gs` to attach participant(s) to sessions.
    4. MODIFY `SessionStatsModal.jsx` to add active session reset controls and participant filter tabs for averages.
    5. MODIFY `PlanView.jsx` and `FullBodyView.jsx` for warm-up UNDO auto-reset.
    6. RUN `npm run build` inside `gymlog-react/` and verify clean build with 0 errors.
    7. SIGNAL `DEVELOPMENT_TASK_COMPLETE`.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
