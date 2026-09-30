# TASK-R92: Mobile Sticky Timer, Session Reset Controls & User-Partitioned Session Stats

> **For Human Readers:** This task fixes: (1) Mobile sticky rest timer detachment via GPU compositing, (2) Centers all modals using `createPortal` so CSS transforms don't clip them, (3) Fixes Google Sheets session history sync so deleting rows in Sheets immediately purges local cache on refresh, (4) Adds active session reset/clear controls, and (5) Implements user-partitioned session tagging and pacing filters.

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
    1. Fix Modal Viewport Clipping (`createPortal`):
       - In `SessionStatsModal.jsx`, `SettingsModal.jsx`, and `ImageModal.jsx`:
         - Wrap the modal JSX with `createPortal(..., document.body)` imported from `react-dom`.
         - This ensures modals escape the `.sticky-header-container` `transform: translate3d(0,0,0)` containing block and render perfectly centered in the viewport.

    2. Fix Google Sheets Session History Sync & Deletion Cache:
       - In `AppContext.jsx` (around line 300 where `data.sessions` is received):
         - Replace the union merge (`[...serverSessions, ...localSessions]`) with direct server hydration:
           ```javascript
           if (data.sessions !== undefined) {
               const serverSessions = data.sessions || [];
               setSessionHistory(serverSessions);
               localStorage.setItem('gymlog_session_history', JSON.stringify(serverSessions));
           }
           ```
         - This ensures that when rows are deleted in Google Sheets, refreshing the browser immediately reflects the true sheet state without local storage re-injecting deleted records.

    3. Mobile Sticky Rest Timer Stability:
       - In `PlanView.jsx`, `LiftView.jsx`, and `FullBodyView.jsx`: Ensure subheaders render as static headers with `marginBottom: 16`.
       - In `index.css`: `html, body { min-height: 100%; }` and `.sticky-header-container` GPU compositing.

    4. Session Timer Controls & User Partitioning:
       - In `SessionStatsModal.jsx`: Active session controls (`Reset to 0m`, `Clear Active Clock`) and participant filter tabs.
       - In `PlanView.jsx` and `FullBodyView.jsx`: Warm-up UNDO auto-resets session start time if no working sets are completed.
       - In `AppContext.jsx`: Attaches active participant(s) to sessions.

    5. Verification & Audit:
       - Run `npm run build` inside `gymlog-react/` to ensure zero compilation errors.
       - Run `npx eslint src/` to verify 0 `no-undef` errors.
  </OBJECTIVE>
  <RESOURCES>
    - Modal: `gymlog-react/src/components/SessionStatsModal.jsx`
    - Settings: `gymlog-react/src/components/SettingsModal.jsx`
    - Image Modal: `gymlog-react/src/components/ImageModal.jsx`
    - Context: `gymlog-react/src/context/AppContext.jsx`
    - CSS: `gymlog-react/src/index.css`
  </RESOURCES>
  <SEQUENCE>
    1. READ `docs/jira_tasks/TASK-R92.md`.
    2. In `SessionStatsModal.jsx`, `SettingsModal.jsx`, and `ImageModal.jsx`, wrap modal JSX with `createPortal(..., document.body)`.
    3. In `AppContext.jsx`, update `data.sessions` handling to directly take `serverSessions`.
    4. RUN `npm run build` and `npx eslint src/` to confirm 0 errors.
    5. SIGNAL `DEVELOPMENT_TASK_COMPLETE`.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
