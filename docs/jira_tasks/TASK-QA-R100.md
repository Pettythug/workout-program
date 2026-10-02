# TASK-QA-R100: QA Pre-Merge Verification Specification

## 1. Task Summary
- **Target App:** `gymlog-react`
- **Branch:** `TASK-R100`
- **Focus Area:** Decouple card set deletions from immediate network calls & verify local-first buffering until COMPLETE WORKOUT.

---

## 2. Changes Under Review
1. **`gymlog-react/src/components/ExerciseCard.jsx`**:
   - Stripped `prompt()` and `deleteHistory()` API calls from `handleDeleteHistory` and `handleDeleteLoggedSet`.
   - Unified on `deleteSetFromLocalHistory`.
2. **`gymlog-react/src/components/CircuitView.jsx`**:
   - Stripped `prompt()` and `deleteHistory()` API calls from `handleDeleteSet` and `handleDeleteHistoryEntry`.
   - Unified on `deleteSetFromLocalHistory`.

---

## 3. QA Pre-Merge Checklist
1. [ ] **Automated Build & Linting**:
   - `npm.cmd run build` $\rightarrow$ 0 errors.
   - `npx.cmd eslint src/` $\rightarrow$ 0 errors.
2. [ ] **0ms UI Deletion & No Prompts**:
   - Tapping delete on a set removes it in 0ms without prompting for PIN or firing network requests.
3. [ ] **Complete Workout Batch Sync**:
   - Verify `batchSyncSession` payload sends `deletes` array on workout completion.

---

## 4. Signal Requirement
When all tests pass, output `QA_PREMERGE_PASS`.
