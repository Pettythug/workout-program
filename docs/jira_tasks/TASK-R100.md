# TASK-R100: Frontend Deletion Decoupling & Pure Local-First Buffering in Workout Cards

## 1. Overview & Objectives
In `TASK-R99`, the backend and `AppContext.jsx` were upgraded to support atomic batch deletions on workout completion via `batchSyncSession`. However, the individual card components (`ExerciseCard.jsx` and `CircuitView.jsx`) still contained legacy logic that fired immediate individual `deleteHistory` network calls and triggered blocking PIN prompts on every set deletion.

The objective of `TASK-R100` is to completely decouple set deletions from immediate network I/O in the frontend:
1. **Remove Immediate Network Calls**: Remove `await deleteHistory(...)` from `ExerciseCard.jsx` and `CircuitView.jsx`.
2. **Remove Blocking Deletion Prompts**: Remove `prompt("Admin PIN required:")` from active workout card set deletions.
3. **Pure 0ms Local-First Deletion**: When tapping the trash can on any set (logged today or historical), immediately execute `deleteSetFromLocalHistory(ex.name, entry)`.
4. **Deferred Cloud Deletion**: Ensure deleted rows are strictly buffered in `gymlog_pending_deletes` and sent to Google Sheets only when the user taps **COMPLETE WORKOUT** via `completeWorkoutBatch`.

---

## 2. Technical Scope of Changes

### A. `gymlog-react/src/components/ExerciseCard.jsx`
1. In `handleDeleteHistory(entry)`:
   - Remove `prompt("Admin PIN required:")` and `await deleteHistory(...)`.
   - Directly call `deleteSetFromLocalHistory(ex.name, entry)`.
   - Set toast: `"Entry removed from session"`.
2. In `handleDeleteLoggedSet(setEntries)`:
   - Remove `prompt("Admin PIN required:")` and `await deleteHistory(...)`.
   - Loop over `setEntries` and call `deleteSetFromLocalHistory(ex.name, entry)` for each.
   - Set toast: `"Set removed"`.

### B. `gymlog-react/src/components/CircuitView.jsx`
1. In `handleDeleteSet(exName, setEntries)`:
   - Remove `window.prompt(...)` and `await deleteHistory(...)`.
   - Call `deleteSetFromLocalHistory(exName, entry)` for each entry.
2. In `handleDeleteHistoryEntry(entry)`:
   - Remove `window.prompt(...)` and `await deleteHistory(...)`.
   - Call `deleteSetFromLocalHistory(exName, entry)`.

---

## 3. Acceptance Criteria
1. [ ] **0ms Instant UI Removal**: Tapping delete on any set in `ExerciseCard` or `CircuitView` removes it instantly with zero prompts, zero network delay, and zero loading spinners.
2. [ ] **Zero Intermediate Network Calls**: Deleting sets during an active workout produces 0 network calls in the browser DevTools Network tab.
3. [ ] **Google Sheets Untouched During Workout**: Google Sheets `GymLog_History` is not modified when sets are deleted during an active session.
4. [ ] **Atomic Deletion on Complete Workout**: Tapping **COMPLETE WORKOUT** sends `deletes` inside `batchSyncSession`, removing deleted rows from Google Sheets atomically in 1 transaction.
5. [ ] **Build & Lint Verification**: `npm.cmd run build` and `npx.cmd eslint src/` compile with 0 errors.
