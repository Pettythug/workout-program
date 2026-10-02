# TASK-R99: Unified Deletion Buffer & Single Atomic Batch Sync on Complete Workout

## 1. Overview & Objectives
Currently, when deleting logged sets or historical mistakes from an exercise card, the application fires immediate individual network requests (`deleteHistory`) to Google Sheets. If multiple sets are deleted or corrected during a workout, each deletion forces Google Sheets to acquire script locks separately, creating latency, network contention, and potential sync failures in spotty gym reception.

The objective of this task is to unify all set deletions into the **Local-First Batch Pipeline**:
1. Deleting a set during a workout updates the UI and recalculates personal bests in **0ms locally**.
2. Deletions of unsynced sets drop directly from `gymlog_pending_sets` with **0 network calls**.
3. Deletions of historical sets are buffered in `gymlog_pending_deletes`.
4. When the user taps **COMPLETE WORKOUT**, a single atomic batch payload (`batchSyncSession`) sends completed session metadata, newly logged sets, deleted history rows, and updated progression counters to Google Sheets in **one single atomic lock**.

---

## 2. Technical Scope of Changes

### A. Frontend: `gymlog-react/src/context/AppContext.jsx`
1. **`deleteSetFromLocalHistory(exerciseName, entry)`**:
   - Check if `entry` exists in `gymlog_pending_sets`. If so, remove it from `gymlog_pending_sets` in `localStorage`.
   - If `entry` is historical (persisted to Google Sheets), append it to `gymlog_pending_deletes` in `localStorage`.
   - Update local `exercises` state immediately in **0ms** (removing the entry from state and updating personal bests).
   - Eliminate the immediate individual `sheetsPost({ action: 'deleteHistory' })` network call during active workouts.
2. **`completeWorkoutBatch(sessionData, updatedSettings)`**:
   - Read `pendingDeletes = JSON.parse(localStorage.getItem('gymlog_pending_deletes') || '[]')`.
   - Include `deletes: pendingDeletes` in the `batchSyncSession` payload.
   - On successful sync response, clear `gymlog_pending_deletes` from `localStorage`.

### B. Backend: `Combined_AppScript_v2.gs`
1. **`gymlog_handleBatchSyncSession(payload)`**:
   - Process `payload.deletes` array under the existing `withLock`:
     - For each deleted item: find matching row in `GymLog_History` by `person`, `exercise`, `reps`, `weight`, and `range` (normalized) and delete row.
     - Add affected exercise to `exercisesToRecalc` set.
   - All session insertion, history set prepending, history row deletions, and personal best recalculations occur atomically in 1 transaction.

---

## 3. Acceptance Criteria
1. [ ] **0ms UI Deletion**: Tapping delete on any set on an exercise card immediately removes it from the UI with zero network delay.
2. [ ] **Pending Set Removal**: Deleting an unsynced set logged in the current workout removes it from `gymlog_pending_sets` without touching the network.
3. [ ] **Historical Deletion Buffering**: Deleting a historical set buffers in `gymlog_pending_deletes`.
4. [ ] **Atomic Batch Execution**: Completing the workout dispatches `batchSyncSession` containing `session`, `sets`, `deletes`, and `settings`, cleanly cleaning up deleted rows and inserting new sets in Google Sheets.
5. [ ] **Build & Lint**: `npm.cmd run build` and `npx.cmd eslint src/` compile with 0 errors.
