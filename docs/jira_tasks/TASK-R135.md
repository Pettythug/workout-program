# TASK-R135: Frontend Completion In-Flight Lock, Immediate Set Drain & Offline Queue Deduplication

- **Target Role:** `Sandbox_Developer`
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash (High)`, `Gemini 3.8 Flash`, `Claude Sonnet 4.6 (Thinking)`, `Gemini 3.5 Flash (High)`)
- **Model Gatekeeper Check:** Verify your active model is in the Authorized Model Tier above before executing any file edits. If misaligned, halt and output the `Model Alignment Error` override.
- **Target Branch:** `feat/TASK-R135-frontend-completion-lock-and-dedup`

---

## Overview & Bug Description

In Full Body workouts (which contain 8 exercises + accessories, totaling 24–30+ sets), completing a workout takes 30–45+ seconds on Google Apps Script. On mobile gym connections, this caused two major duplicate-logging vulnerabilities:
1. **Re-entrant Taps & Non-Drained Pending Sets:**
   `completeWorkoutBatch` in `AppContext.jsx` read `gymlog_pending_sets` from `localStorage`, but only cleared `gymlog_pending_sets` AFTER the 45-second network call completed. If the user tapped "Complete Workout" more than once, or if views re-rendered, subsequent calls read the exact same 30 sets and dispatched duplicate batches to Google Sheets.
2. **Missing In-Flight Locks on Completion Buttons:**
   `FullBodyView.jsx`, `PlanView.jsx`, and `CircuitView.jsx` lacked disabled/loading states on their "Complete Workout" buttons, allowing rapid repeated clicks during slow mobile network latency.
3. **Queue Deduplication Deficiency:**
   When network timeouts or phone sleep triggered error catches, duplicate payloads could be queued into `gymlog_pending_sync_queue`, which were then replayed by `flushPendingSyncQueue`.

---

## Technical Specifications & Requirements

### 1. `gymlog-react/src/context/AppContext.jsx`
1. **Immediate Pending Sets Drain:**
   - In `completeWorkoutBatch`:
     - Read `pendingSets` and `pendingDeletes` into local constants (`const setsToSync = [...pendingSets]; const deletesToSync = [...pendingDeletes];`).
     - **IMMEDIATELY** clear `localStorage.setItem('gymlog_pending_sets', '[]')` and `localStorage.setItem('gymlog_pending_deletes', '[]')` *before* the network call begins.
     - Attach a unique `batchId` to the batch payload: `batchId: payload.batchId || `${newSession.id}_${Date.now()}`.
2. **Queue Deduplication Guard:**
   - In the `catch` block of `completeWorkoutBatch`:
     - If the network fails, read `gymlog_pending_sync_queue`.
     - Check if an item with the same `batchId` or `session.id` is already in the queue. Only push if not already present.
3. **In-Flight Re-entrancy Lock in `completeWorkoutSession`:**
   - If `inFlightBatchPromiseRef.current` is active, log a warning and return the existing cached summary rather than firing a duplicate sync call.

### 2. `gymlog-react/src/components/FullBodyView.jsx`
1. **Button Disabled & Loading State:**
   - Consume `isSyncing` from `useAppContext()` (or add an `isCompleting` local state).
   - On both the "All 8 Exercises Done!" button (line ~413) and the bottom "Complete Workout" button (line ~498):
     - Disable the button when `isSyncing` is true (`disabled={isSyncing}`).
     - Display `"SAVING WORKOUT..."` with slightly reduced opacity (`opacity: isSyncing ? 0.6 : 1`, `cursor: isSyncing ? 'not-allowed' : 'pointer'`) when in progress.
     - Prevent executing `completeWorkout` if `isSyncing` is true.

### 3. `gymlog-react/src/components/PlanView.jsx`
1. Apply the same in-flight guard and disabled state on the `Complete Workout` buttons (both the end-of-workout card button and the bottom bar button) so it cannot be double-tapped during sync.

### 4. `gymlog-react/src/components/CircuitView.jsx`
1. Apply the same in-flight guard and disabled state on the circuit completion button.

---

## Target Files
- `gymlog-react/src/context/AppContext.jsx`
- `gymlog-react/src/components/FullBodyView.jsx`
- `gymlog-react/src/components/PlanView.jsx`
- `gymlog-react/src/components/CircuitView.jsx`

---

## Submission Protocol for Developer
1. Execute all edits strictly within `gymlog-react/src/*`.
2. Verify production build with `cd gymlog-react && cmd /c npm run build`.
3. Respond in chat with strictly the 4-line XML snippet inside a fenced code block:

```xml
<TASK_HANDOFF>
  <TASK_ID>TASK-R135</TASK_ID>
  <ROLE>Sandbox_Developer</ROLE>
  <STATUS>DEVELOPMENT_TASK_COMPLETE</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</TASK_HANDOFF>
```
