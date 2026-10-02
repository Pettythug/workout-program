# TASK-QA-R99: QA Pre-Merge Verification Specification

## 1. Task Summary
- **Target App:** `gymlog-react` & `Combined_AppScript_v2.gs`
- **Branch:** `TASK-R99`
- **Focus Area:** Unified Deletion Buffer, 0ms Local Set Deletion, and Single Atomic Batch Deletion Sync on Complete Workout.

---

## 2. Changes Under Review
1. **`gymlog-react/src/context/AppContext.jsx`**:
   - `deleteSetFromLocalHistory`:
     - If the set is in `gymlog_pending_sets` (unsynced), filters it out directly in `localStorage` with **0 network requests**.
     - If the set is historical, buffers `{ exercise, ...entry }` in `gymlog_pending_deletes`.
     - Updates local `exercises` state in **0ms** (recalculating personal bests immediately).
     - Removed individual `sheetsPost({ action: 'deleteHistory' })` call during active workouts.
   - `completeWorkoutBatch`:
     - Reads `gymlog_pending_deletes` from `localStorage`.
     - Includes `deletes: pendingDeletes` in the `batchSyncSession` payload.
     - Clears `gymlog_pending_deletes` on successful sync.
2. **`Combined_AppScript_v2.gs`**:
   - `gymlog_handleBatchSyncSession`:
     - Processes `payload.deletes` under `withLock`, deletes matching rows in `GymLog_History`, and triggers recalculation for affected exercises.

---

## 3. QA Pre-Merge Checklist
1. [ ] **Automated Build & Linting**:
   - `npm.cmd run build` $\rightarrow$ 0 errors.
   - `npx.cmd eslint src/` $\rightarrow$ 0 errors.
2. [ ] **Local Deletion Zero-Latency Check**:
   - Log a set $\rightarrow$ tap delete $\rightarrow$ vanishes in 0ms without network delay.
3. [ ] **Atomic Complete Workout Payload**:
   - Verify `completeWorkoutBatch` dispatches `session`, `sets`, `deletes`, and `settings` atomically.

---

## 4. Signal Requirement
When all tests pass, output `QA_PREMERGE_PASS`.
