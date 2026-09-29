# TASK-R85: Workout Duration Tracking, Live Session Header Timer, and Rep Range Average Stats

> **For Human Readers:** This task adds automated workout start/end timestamp tracking, live session elapsed time in the header, workout completion time summaries, and a "📊 Session Time Stats & Averages" modal in Settings and completion screens that calculates average workout duration partitioned by rep range (1-3, 4-7, 8-12, 13+).

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
    - TARGET_BRANCH: `TASK-R85`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Update `gymlog-react/src/context/AppContext.jsx`:
       - Add session start tracking (`sessionStartTime`, `startSession()`, `endSession()`, `sessionHistory`, `saveCompletedSession()`).
       - Automatically trigger `startSession()` upon the first logged set of a session if `sessionStartTime` is not set.
       - Expose `sessionStartTime`, `sessionHistory`, `startSession`, `endSession`, `saveCompletedSession`, and `getRepRangeStats()`.
    2. Create `gymlog-react/src/components/SessionStatsModal.jsx`:
       - Renders modal displaying:
         - Average completion time partitioned by rep range bracket:
           - 1–3 Reps (Heavy)
           - 4–7 Reps (Strength)
           - 8–12 Reps (Hypertrophy)
           - 13+ Reps (Endurance)
         - Recent completed workout history list with date, program, day, rep range, start/end time, and total duration.
    3. Update `gymlog-react/src/components/Header.jsx` & `gymlog-react/src/components/StickyRestBanner.jsx`:
       - Display a subtle live session timer pill in the header when `sessionStartTime` is active (e.g. `⏱️ 34m`).
    4. Update `gymlog-react/src/components/PlanView.jsx` & `gymlog-react/src/components/FullBodyView.jsx`:
       - On `completeWorkout()`: Record end timestamp, calculate duration, save session record via `saveCompletedSession()`, and display the summary (Total Time, Started, Finished, Rep Range) on the completion screen with a button to open `SessionStatsModal`.
       - On `startNextWorkout()`: Reset `sessionStartTime`.
    5. Update `gymlog-react/src/components/SettingsModal.jsx`:
       - Add a **"📊 Workout Time & Averages"** button that opens `SessionStatsModal`.
  </OBJECTIVE>
  <RESOURCES>
    - Context: `gymlog-react/src/context/AppContext.jsx`
    - Plan View: `gymlog-react/src/components/PlanView.jsx`
    - Full Body View: `gymlog-react/src/components/FullBodyView.jsx`
    - Settings: `gymlog-react/src/components/SettingsModal.jsx`
    - Header: `gymlog-react/src/components/Header.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/context/AppContext.jsx`, `gymlog-react/src/components/PlanView.jsx`, `gymlog-react/src/components/FullBodyView.jsx`, `gymlog-react/src/components/SettingsModal.jsx`, and `gymlog-react/src/components/Header.jsx`.

    2. MODIFY `gymlog-react/src/context/AppContext.jsx`:
       - Add `sessionStartTime` state (persisted in `gymlog_session_start_time`).
       - Add `sessionHistory` state (persisted in `gymlog_session_history`, array of completed sessions).
       - In `logExerciseSet`: If `!sessionStartTime`, set `sessionStartTime = Date.now()` and persist.
       - Add `saveCompletedSession(sessionData)`:
         - Structure: `{ id, date, program, workoutDay, workoutType, repRange, startTime, endTime, durationMinutes }`.
         - Append to `sessionHistory` and save to `localStorage`.
       - Add `resetSessionTime()`: Clears `sessionStartTime` from state and `localStorage`.

    3. CREATE `gymlog-react/src/components/SessionStatsModal.jsx`:
       - Compute average durations for `1-3`, `4-7`, `8-12`, and `13+` rep ranges from `sessionHistory`.
       - Render clean modal layout with:
         - Top rep range average cards with sample size (e.g. `1-3 Reps: 58 mins (4 sessions)`).
         - Scrollable list of recent sessions.
         - Close button.

    4. MODIFY `gymlog-react/src/components/Header.jsx`:
       - If `sessionStartTime` exists, render a compact live badge showing elapsed session time (e.g. `⏱️ 42m`).

    5. MODIFY `gymlog-react/src/components/PlanView.jsx` & `gymlog-react/src/components/FullBodyView.jsx`:
       - In completion screen, display:
         - `Total Time: {duration} mins`
         - `Started: {startTimeFormatted} • Finished: {endTimeFormatted}`
         - `Rep Range: {repRange}`
         - Button: `📊 VIEW TIME STATS & AVERAGES`
       - In `completeWorkout()`: Compute duration and call `saveCompletedSession()`.
       - In `startNextWorkout()`: Call `resetSessionTime()`.

    6. MODIFY `gymlog-react/src/components/SettingsModal.jsx`:
       - Add button `📊 Workout Time & Averages` to open `SessionStatsModal`.

    7. AUDIT: Generate `/audit_log_R85.md` detailing the session duration tracking and stats system.
    8. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
