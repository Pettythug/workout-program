# TASK-R82: Fix History/Best Sync, Sticky Stopwatch Banner, and Unified Set Counting

> **For Human Readers:** This task resolves three critical UX and data issues:
> 1. Normalizes history and personal best matching (trimming whitespace and case-insensitivity) so past exercise results and bests always display immediately without requiring page refresh.
> 2. Enables the floating sticky banner for the Stopwatch when scrolling down (with Pause/Reset controls).
> 3. Unifies set counting across all variations of an exercise card so selecting Singles or Alternating never locks the button to "LOG SET 1".

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: MULTI_FILE_Refactoring
    - REQUIRED_MODEL_TIER: MEDIUM_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R82`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Robust History & Best Matching (`gymlog-react/src/context/dataMerge.js` & `gymlog-react/src/components/ExerciseCard.jsx`):
       - Normalize exercise names with whitespace trimming and case-insensitive comparison when matching `allHistory` and `allBest`.
       - In `ExerciseCard.jsx` `getBest(personKey)`, if the active variation has no best entry, check the base exercise (`group.baseName` / `variations['Standard']`) so personal bests always display.
    2. Sticky Stopwatch Banner (`gymlog-react/src/components/StickyRestBanner.jsx`):
       - Update active condition to include running stopwatch: `const isStopwatchActive = timerIsRunning && !timerIsCountdown;`.
       - Render stopwatch banner with `⏱️ STOPWATCH` title, formatted time, and Pause/Reset buttons when scrolling.
    3. Unified Set Counting (`gymlog-react/src/components/ExerciseCard.jsx` & `gymlog-react/src/context/AppContext.jsx`):
       - In `ExerciseCard.jsx`, calculate `todaysSets` and `getNextSetNumber()` across all variations in `group.variations`.
       - In `AppContext.jsx` `logExerciseSet()`, calculate `nextSetNum` across all variations of the exercise.
  </OBJECTIVE>
  <RESOURCES>
    - Data Merge: `gymlog-react/src/context/dataMerge.js`
    - Sticky Banner: `gymlog-react/src/components/StickyRestBanner.jsx`
    - Exercise Card: `gymlog-react/src/components/ExerciseCard.jsx`
    - App Context: `gymlog-react/src/context/AppContext.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/context/dataMerge.js`, `gymlog-react/src/components/StickyRestBanner.jsx`, `gymlog-react/src/components/ExerciseCard.jsx`, and `gymlog-react/src/context/AppContext.jsx`.

    2. MODIFY `gymlog-react/src/context/dataMerge.js`:
       - Add a helper `const cleanName = n => (n || '').trim().toLowerCase();`.
       - Use `cleanName(h.exercise) === cleanName(ex.name)` when filtering `sheetHistory`.
       - Use `Object.keys(allBest).find(k => cleanName(k) === cleanName(ex.name))` when finding `sheetBest`.

    3. MODIFY `gymlog-react/src/components/StickyRestBanner.jsx`:
       - Allow banner to render when `(timerIsRunning && timerIsCountdown && timerSeconds > 0) || (timerIsRunning && !timerIsCountdown) || isCompleted`.
       - If `!timerIsCountdown && timerIsRunning`, display `⏱️ STOPWATCH` with `formatTimerTime(timerSeconds)`, along with Pause and Reset controls.

    4. MODIFY `gymlog-react/src/components/ExerciseCard.jsx`:
       - In `getBest(personKey)`, fall back to checking `variations["Standard"]?.best?.[personKey]` or baseName if active variation best is empty.
       - Calculate `allTodaysSets` across `Object.values(variations).flatMap(v => v.history || [])` for today's date.
       - Use `allTodaysSets` in `getNextSetNumber()` and in the `Today's Sets` list display.

    5. MODIFY `gymlog-react/src/context/AppContext.jsx`:
       - In `logExerciseSet(ex, logs)`, find all variations in `exercises` matching `getBaseName(ex.name)` and calculate `nextSetNum` using the maximum set number across all variations for today.

    6. AUDIT: Generate `/audit_log_R82.md` detailing all three bug fixes.
    7. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
