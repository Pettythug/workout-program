# TASK-R121: Centralized Workout Completion & Undo Lifecycle (Timer Restoration, Race Protection & Instant PB Recalculation)

- **Target Role:** `Sandbox_Developer`
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash`, `Claude Sonnet 4.6 (Thinking)`, `Gemini 3.5 Flash (High)`) or `HIGH_TIER`
- **Model Gatekeeper Check:** Verify your active model is in the Authorized Model Tier above before executing any file edits. If misaligned, halt and output the `Model Alignment Error` override.

## Overview
1. **Workout Timer Reset & Async Race Condition on Undo Completion:**
   - Previously, `PlanView.jsx`, `FullBodyView.jsx`, and `CircuitView.jsx` each maintained duplicate 90-line `handleFinishWorkout` and `handleUndoCompletion` functions.
   - When the user tapped **Complete Workout**, `clearSession()` immediately wiped `sessionStartTime` (`null`), while `setCompletedSummary(summaryData)` was delayed inside `completeWorkoutBatch(...).then()` (2–4 seconds later).
   - If the user tapped **UNDO COMPLETION** while the Google Sheets request was still in flight, the summary wasn't saved yet, and when the request finished a second later, `.then()` overwrote the Undo!
   - Even if the user waited for the sync to finish before tapping **UNDO COMPLETION**, `handleUndoCompletion` never restored `sessionStartTime` from `completedSummary.startTimestamp`. Logging one more set started a brand-new timer (e.g., resetting a 45-minute workout down to 5 minutes).
2. **In-Memory Personal Best Recalculation on Set Deletion:**
   - Deleting a historical set via the trash can (`🗑`) spliced the set out of `ex.history`, but left `ex.best` untouched until the next cloud reload.

This task resolves all of these issues by centralizing `completeWorkoutSession` and `undoWorkoutSession` inside `AppContext.jsx` with 0ms synchronous summary lock-in, full workout timer restoration (`startSession(summary.startTimestamp)`), in-flight sync race protection, and instant PB recalculation.

---

## Technical Specifications & Requirements

### 1. Centralized `completeWorkoutSession` & `undoWorkoutSession` in `AppContext.jsx`

Add a `completionSyncTokenRef = useRef(0)` and expose two centralized functions from `AppContext.jsx`:

#### A. `completeWorkoutSession(programKey, { currentDay, nextDay, nextType, exercisesList })`
1. **Increment Sync Token:**
   - `const syncToken = ++completionSyncTokenRef.current;`
2. **Compute Session Duration & Summary Synchronously (0ms):**
   - Capture `endTime = Date.now()` and read `sessionStartTime` *before* calling `clearSession()`.
   - Calculate `durationMins` (`>= 1` and `<= 300`), active participants, and dominant `repRange` from `exercisesList`.
   - Build `summaryData` (`{ id, date, startTimestamp: sessionStartTime, endTimestamp: endTime, durationMins, repRange, participants, workoutDay: currentDay, program: programKey }`).
3. **Lock In State Synchronously Before Network Call:**
   - Save `summaryData` immediately to `localStorage.setItem(\`gymlog_\${programKey}_last_summary\`, JSON.stringify(summaryData))` and `localStorage.setItem(\`gymlog_\${programKey}_complete\`, 'true')`.
   - Append `summaryData` to `sessionHistory` state and `gymlog_session_history` in `localStorage`.
   - Advance the active workout day (`updateWorkoutDay(nextDay, true)` / `updateFullBodyWorkoutDay(nextDay, true)` / `updateCircuitWorkoutDay(nextDay, true)`).
   - Clear the active timer (`clearSession()`) and clear the warm-up storage key (`gymlog_warmup_${programKey}_day_${currentDay}`).
   - Reset active roster to solo owner (`[deviceOwner]`) if not Guest.
4. **Fire Background Cloud Sync with Race Guard:**
   - Build the settings payload (`builder_workout_num`, `${owner}_Plan_Day` / `FullBody_Day` / `Circuit_Day`, etc.).
   - Call `completeWorkoutBatch(settingsPayload, summaryData)` asynchronously. If `completionSyncTokenRef.current !== syncToken` when it resolves, ignore any post-sync callback so an in-flight request can never overwrite an Undo.
5. **Return `summaryData` synchronously** so the calling view can immediately `setCompletedSummary(summaryData)` and `setIsWorkoutComplete(true)`.

#### B. `undoWorkoutSession(programKey, { currentDay })`
1. **Invalidate Any In-Flight Completion Sync:**
   - `++completionSyncTokenRef.current;`
2. **Read Saved Summary & Restore Active Workout Clock:**
   - Read `summary` from `localStorage.getItem(\`gymlog_\${programKey}_last_summary\`)`.
   - **Restore Timer:** If `summary?.startTimestamp` exists, call `startSession(summary.startTimestamp)` so `sessionStartTime` and `gymlog_session_start` are restored to the original workout start time (preserving the user's 45-minute elapsed clock!).
   - **Delete Session Log:** If `summary?.id` exists, call `deleteSession(summary.id)` to remove it from `sessionHistory` and queue backend session deletion.
3. **Clear Completion Flags & Roll Back Day:**
   - Remove `gymlog_${programKey}_last_summary` and set `gymlog_${programKey}_complete` to `'false'`.
   - **Restore Warm-Up Status:** Call `setWarmUpStatus('completed')` and set `localStorage.setItem('gymlog_active_warmup_status', 'completed')` so the user is returned directly to their exercise list and not forced to redo or click DONE on the pre-workout warm-up stepper.
   - Compute `prevDay = Math.max(1, currentDay - 1)` and roll back the active day (`updateWorkoutDay(prevDay, true)` / `updateFullBodyWorkoutDay` / `updateCircuitWorkoutDay`).
4. **Sync Rolled-Back Day Settings to Google Sheets:**
   - If not Guest, call `sheetsPost({ action: 'saveSettings', settings: rollbackSettings })` with the rolled-back day and Push/Pull type.

---

### 2. Refactor `PlanView.jsx`, `FullBodyView.jsx`, and `CircuitView.jsx`
- Replace the duplicated completion and undo logic in all three views with clean calls to `completeWorkoutSession` and `undoWorkoutSession` from `useAppContext()`.
- Ensure `completedSummary` is set synchronously on completion and cleared on Undo.

---

### 3. In-Memory Personal Best Recalculation on Set Deletion (`AppContext.jsx`)
- Ensure `deleteSetFromLocalHistory(exName, entryDetails, targetIndex)` recalculates `ex.best` via `calculateBestForExercise({ ...ex, history: newHistory })` whenever a set is spliced out of `ex.history`.

---

## Target Files
- `gymlog-react/src/context/AppContext.jsx`
- `gymlog-react/src/components/PlanView.jsx`
- `gymlog-react/src/components/FullBodyView.jsx`
- `gymlog-react/src/components/CircuitView.jsx`

---

## Submission Protocol for Developer
1. Execute all edits strictly within `gymlog-react/src/*`.
2. Verify production build with `cmd /c npm run build`.
3. Respond in chat with strictly the 4-line XML snippet below:
```xml
<TASK_HANDOFF>
  <TASK_ID>TASK-R121</TASK_ID>
  <ROLE>Sandbox_Developer</ROLE>
  <STATUS>DEVELOPMENT_TASK_COMPLETE</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</TASK_HANDOFF>
```
