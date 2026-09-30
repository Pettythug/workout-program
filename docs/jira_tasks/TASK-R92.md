# TASK-R92: Mobile Sticky Rest Timer Stability & Session Timer Reset Controls

> **For Human Readers:** This task fixes the mobile rest timer detachment issue on phones by eliminating conflicting nested sticky headers in `PlanView.jsx`, `LiftView.jsx`, and `FullBodyView.jsx` and applying GPU hardware acceleration. Additionally, it implements session timer controls (Option 1: Manual reset in `SessionStatsModal.jsx`, and Option 3: Auto-cleanup on Warm-Up UNDO).

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
    1. Fix Mobile Sticky Rest Timer & Viewport Detachment:
       - In `PlanView.jsx`, `LiftView.jsx`, and `FullBodyView.jsx`:
         - Remove `position: 'sticky', top: 0, zIndex: 100` and `margin: '-16px -16px 16px'` from the inner subheaders.
         - Ensure the subheaders render as clean static headers with `marginBottom: 16` (matching `CircuitView.jsx`), eliminating z-index collisions with the top global sticky header.
       - In `index.css`:
         - Change `html, body { height: 100%; }` to `html, body { min-height: 100%; }`.
         - Add GPU compositing to `.sticky-header-container`:
           `transform: translate3d(0, 0, 0); -webkit-transform: translate3d(0, 0, 0); will-change: transform;`

    2. Session Timer Controls (Option 1: Manual Reset in Stats Modal):
       - In `SessionStatsModal.jsx`:
         - Extract `sessionStartTime`, `startSession`, and `resetSessionTime` from `useAppContext()`.
         - If `sessionStartTime` exists, render an "Active Session" control card at the top:
           - Displays start time and elapsed minutes.
           - `[ ? Reset to 0m ]` button -> calls `startSession(Date.now())` (resets the timer to right now).
           - `[ ?? Clear Session ]` button -> calls `resetSessionTime()` (clears active session).

    3. Session Timer Auto-Cleanup (Option 3: Warm-Up UNDO Reset):
       - In `PlanView.jsx` and `FullBodyView.jsx`:
         - When clicking `UNDO` on the warm-up (or in the Full List modal for warm-up):
           - Check if any other working sets have been completed (`Object.values(exerciseStatus).every(s => s === 'pending')`).
           - If no working sets are done/skipped, call `resetSessionTime()` to cleanly clear the session start time.

    4. Verification & Audit:
       - Run `npm run build` inside `gymlog-react/` and verify clean build with 0 errors.
       - Run `npx eslint src/` to verify 0 `no-undef` errors.
  </OBJECTIVE>
  <RESOURCES>
    - CSS: `gymlog-react/src/index.css`
    - Modal: `gymlog-react/src/components/SessionStatsModal.jsx`
    - Plan View: `gymlog-react/src/components/PlanView.jsx`
    - Lift View: `gymlog-react/src/components/LiftView.jsx`
    - Full Body View: `gymlog-react/src/components/FullBodyView.jsx`
    - Header: `gymlog-react/src/components/Header.jsx`
    - Context: `gymlog-react/src/context/AppContext.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `docs/jira_tasks/TASK-R92.md`.
    2. MODIFY `index.css`, `PlanView.jsx`, `LiftView.jsx`, and `FullBodyView.jsx` for mobile sticky timer stability.
    3. MODIFY `SessionStatsModal.jsx` to add active session reset and stop buttons.
    4. MODIFY `PlanView.jsx` and `FullBodyView.jsx` warm-up UNDO handlers for session time cleanup.
    5. RUN `npm run build` inside `gymlog-react` and verify clean build with 0 errors.
    6. SIGNAL `DEVELOPMENT_TASK_COMPLETE`.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
