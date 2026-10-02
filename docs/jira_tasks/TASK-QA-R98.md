# TASK-QA-R98: QA Pre-Merge Verification Specification

## 1. Task Summary
- **Target App:** `gymlog-react`
- **Branch:** `TASK-R98`
- **Developer Commit:** `105e939`
- **Focus Area:** Deterministic Session ID Generation & In-Place Google Sheets Session Overwrites.

---

## 2. Changes Under Review
- **`gymlog-react/src/context/AppContext.jsx`**:
  - In `saveCompletedSession`:
    - Generates Session ID using format: `[Program]_[Person]_[Date]_day[WorkoutDay]`.
    - Handles safe fallbacks for missing `workoutDay` or `people`.
    - Overwrites existing session object in `gymlog_session_history` and dispatches `batchSyncSession` with deterministic ID.

---

## 3. QA Pre-Merge Checklist
1. [ ] **Automated Build & Linting**:
   - `npm.cmd run build` $\rightarrow$ Must exit with 0 errors.
   - `npx.cmd eslint src/` $\rightarrow$ Must exit with 0 errors.
2. [ ] **Deterministic ID Output**:
   - Verify `saveCompletedSession` produces clean IDs (e.g. `Plan_Brian_2026-10-01_day25`).
3. [ ] **Duplicate Prevention Simulation**:
   - Completing a workout twice on the same day updates the existing session entry rather than generating two separate IDs.

---

## 4. Signal Requirement
When all tests pass, output `QA_PREMERGE_PASS`.
