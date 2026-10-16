# TASK-R115: Prevent Workout Number Skipping & Reset Timers on Completion

## Overview
Currently, completing a workout can cause workout day numbers to jump/skip (e.g., from Workout #25 directly to Workout #27) when the user returns to the app on a subsequent day or refreshes the page. In addition, when completing a workout, both the background session clock and active rest/stopwatch timer continue to run in the background.

This task resolves the double-increment lifecycle bug, adds automatic new-day cleanup of the completion screen, and properly resets all active timers when "Complete Workout" is tapped.

---

## Technical Context & Root Causes

1. **Double-Increment on Completion & App Reload:**
   - In `PlanView.jsx`, `FullBodyView.jsx`, and `CircuitView.jsx`, tapping `completeWorkout()` calculates `nextDay = workoutDay + 1` and persists it to Google Sheets (`builder_workout_num`, etc.) via `completeWorkoutBatch()`. However, it leaves the local UI in the "Workout Day Complete!" state (`gymlog_plan_complete = 'true'`) without immediately advancing `workoutDay` in local state.
   - When the user opens the app on a subsequent day, `AppContext.jsx`'s `loadInitialData` fetches the already-incremented day (`26`) from Google Sheets settings and sets `workoutDay(26)`.
   - When the user then taps **START NEXT WORKOUT** (`startNextWorkout()`), the button handler executes `updateWorkoutDay(workoutDay + 1)` using the already-synced value (`26 + 1`), skipping directly to **`27`**.
   - **Fix:** 
     - When `completeWorkout()` is executed, ensure the local workout day state is updated consistently with what is synced to the backend, OR ensure `startNextWorkout()` only resets the completion screen (`isWorkoutComplete = false`) without adding an extra `+ 1` if the day was already incremented during completion.
     - Specifically: align `PlanView.jsx`, `FullBodyView.jsx`, and `CircuitView.jsx` so that the day advancement occurs cleanly and deterministically only once per workout.

2. **New Calendar Day Auto-Reset:**
   - In `AppContext.jsx` (lines 276–294), when a new calendar day is detected (`lastActiveDate && lastActiveDate !== today`):
     - Daily statuses and swaps are reset (`gymlog_exerciseStatus`, `gymlog_dailySwaps`, etc.).
     - **Add:** Also clear `gymlog_plan_complete`, `gymlog_fullBody_complete`, `gymlog_circuit_complete`, and their last summaries (`gymlog_plan_last_summary`, etc.) so the user does not stay trapped on yesterday's "Workout Complete!" screen on a brand new day.

3. **Timer & Session Clock Shutdown on Workout Completion:**
   - In `PlanView.jsx`, `FullBodyView.jsx`, and `CircuitView.jsx`, when `completeWorkout()` is clicked:
     - Stop and reset the active timer (`resetTimer()`).
     - Stop and clear the session clock (`endSession()` / `resetSessionTime()`).

---

## Detailed Acceptance Criteria

1. **Workout Day Increment Integrity:**
   - Completing a Plan, Full Body, or Circuit workout must advance the day number exactly by `1`.
   - Refreshing the browser or reopening the app after completing a workout must NOT double-increment the day number when clicking "Start Next Workout".
2. **New Calendar Day Behavior:**
   - When launching the app on a new calendar date, completion states (`gymlog_plan_complete`, `gymlog_fullBody_complete`, `gymlog_circuit_complete`) must be cleared automatically so the user is directly presented with the active card for the new day.
3. **Timer Reset:**
   - Tapping **Complete Workout** in `PlanView`, `FullBodyView`, and `CircuitView` must immediately stop any active countdown or stopwatch (`resetTimer()`) and clear the background session start time (`resetSessionTime()`).
4. **Build Verification:**
   - `npm run build` must succeed without warnings or errors.

---

## Target Files
- `gymlog-react/src/context/AppContext.jsx`
- `gymlog-react/src/components/PlanView.jsx`
- `gymlog-react/src/components/FullBodyView.jsx`
- `gymlog-react/src/components/CircuitView.jsx`
