# TASK-R121: Workout Completion Undo Day Rollback, Settings Re-Sync & In-Memory PB Recalculation

## Overview
When a workout is completed in `PlanView`, `FullBodyView`, or `CircuitView`, the workout day number is incremented and saved to Google Sheets settings. However, clicking **UNDO COMPLETION** previously only dismissed the completion screen without rolling back the active workout day, leaving the user on the next workout day (e.g., Workout #2 instead of Workout #1), and leaving the completed session recorded in duration analytics.

Additionally, deleting a historical set via the trash can (🗑) in `ExerciseCard` or `CircuitCard` spliced the set out of `ex.history`, but left `ex.best` untouched, causing deleted maxes to persist indefinitely as ghost Personal Bests.

This task resolves both issues by implementing a complete rollback lifecycle on "Undo Completion" and wiring set deletion into in-memory PB recalculation.

---

## Technical Specifications & Requirements

### 1. Undo Completion Day Rollback & Settings Re-sync (`PlanView.jsx`, `FullBodyView.jsx`, `CircuitView.jsx`)

For all three workout views (`PlanView`, `FullBodyView`, `CircuitView`):
1. **Day Rollback:**
   - In `handleUndoCompletion` (or the `UNDO COMPLETION` button onClick handler):
   - Calculate previous workout day: `prevDay = Math.max(1, currentDay - 1)`.
   - Update the local state via `updateWorkoutDay(prevDay, true)` (or `updateFullBodyWorkoutDay` / `updateCircuitWorkoutDay`).
2. **Session Summary Cleanup:**
   - If a completed summary exists (`completedSummary?.id` or `localStorage.getItem(...)`):
   - Remove it from `sessionHistory` via `deleteSession(summaryId)`.
   - Clear the local storage cache (`gymlog_plan_last_summary`, etc.) and set `setCompletedSummary(null)`.
3. **Completion Flags Reversion:**
   - Set `setIsWorkoutComplete(false)` and `localStorage.setItem('gymlog_plan_complete', 'false')` (and matching keys for Full Body / Circuit).
4. **Google Sheets Settings Re-Sync:**
   - Revert the settings in the cloud so reloading the app or opening on mobile stays on the rolled-back day:
   - Call `sheetsPost({ action: 'saveSettings', settings: rollbackSettings })` with:
     - `builder_workout_num_${ownerLower}: prevDay`
     - `builder_workout_type_${ownerLower}: (prevDay % 2 === 1 ? 'Push' : 'Pull')`
     - `builder_workout_num: prevDay`
     - `builder_workout_type: (prevDay % 2 === 1 ? 'Push' : 'Pull')`
     - `${owner}_Plan_Day: prevDay`
     (Apply corresponding keys for Full Body and Circuit modes).

---

### 2. In-Memory Personal Best Recalculation on Set Deletion (`AppContext.jsx`)

In `AppContext.jsx`:
1. In `deleteSetFromLocalHistory(exName, entryDetails, targetIndex)`:
   - When the set is spliced out of `ex.history` (`newHistory = [...hist]; newHistory.splice(removeIdx, 1);`):
   - Immediately recalculate `ex.best` using `calculateBestForExercise({ ...ex, history: newHistory })`.
   - Return `{ ...ex, history: newHistory, best: updatedBest }`.
2. This ensures that deleting a set instantly updates `ex.best` in memory:
   - If the deleted set was a Personal Best, the PB reverts to the next best remaining set or becomes empty (`null`) if no sets remain.
   - The exercise card's `Best:` display and Target Lock brackets immediately reflect the true state with 0ms latency.

---

### 3. Build & Parity Integrity
- Maintain exact architectural and UX parity across `PlanView.jsx`, `FullBodyView.jsx`, and `CircuitView.jsx`.
- Verify `cmd /c npm run build` inside `gymlog-react` executes cleanly with exit code 0.

---

## Target Files
- `gymlog-react/src/components/PlanView.jsx`
- `gymlog-react/src/components/FullBodyView.jsx`
- `gymlog-react/src/components/CircuitView.jsx`
- `gymlog-react/src/context/AppContext.jsx`

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
