# TASK-QA-R117: Pre-Merge Validation for 0-Rep Logging, PB Exclusion & Clean RepRange

## Task Overview
- **Task ID:** TASK-QA-R117
- **Feature Branch:** `feature/TASK-R117-zero-rep-logging`
- **Target Files:**
  - `gymlog-react/src/context/AppContext.jsx`
  - `gymlog-react/src/components/ExerciseCard.jsx`
  - `gymlog-react/src/hooks/useTargetLock.js`
  - `Combined_AppScript_v2.gs`
- **Auditor Role:** QA_Engineer

---

## Verification Checklist

### 1. 0-Rep / 0-Sec Input Binding (TC-1)
- Verify `ExerciseCard.jsx` handles `reps === 0` and `duration === 0` cleanly.
- Verify typing `0` into the Reps or Seconds input field preserves `0` and does not revert to an empty string.

### 2. Day Target Rep Range Assignment (TC-2)
- In `AppContext.jsx`:
  - Verify `getDayTargetRange(dayNum)` maps workout days to the prescribed cycle rep ranges (`r8_12`, `r1_3`, `r13_plus`, `r4_7`).
  - Verify that when `reps === 0`, the logged set is tagged with the active workout day's target rep range instead of defaulting `0 <= 3` to `r1_3`.

### 3. Rest Timer Trigger on Failed Attempt (TC-3)
- In `AppContext.jsx` -> `logExerciseSet`:
  - Verify that logging a 0-rep set attempt triggers `startRestTimer` with the appropriate countdown duration for the active target rep range.

### 4. Frontend Personal Best Exclusion (TC-4)
- In `AppContext.jsx` and `useTargetLock.js`:
  - Verify `calculateBestForExercise` explicitly guards against `reps <= 0` and `timeSeconds <= 0`.
  - Verify `useTargetLock.js` guards `bestValue` so that failed attempts are NEVER rendered as PR/Max target locks.

### 5. Backend Personal Best Exclusion (TC-5)
- In `Combined_AppScript_v2.gs`:
  - Verify `gymlog_recalculateBestForExercise()` includes `if (newR <= 0) return;`.
  - Verify `migrateBestTab()` includes `if (newR <= 0) return;`.
  - Confirm failed attempts in the `History` sheet are excluded from the `Best` tab.

### 6. Clean Backend RepRange Handling (TC-6)
- In `Combined_AppScript_v2.gs`:
  - Verify `gymlog_cleanRepRange` is completely removed.
  - Verify `doGet` and `gymlog_handleGetSessions` read `repRange` directly from `r[4]` as clean text (`String(r[4] || "").replace(/^'+/, '').trim()`).

### 7. Google Sheets Text Write Formatting (TC-7)
- In `Combined_AppScript_v2.gs`:
  - Verify session writes in `batchSyncSession` and `logSession` prepend an apostrophe to `session.repRange` to enforce plain text storage.

### 8. Production Compilation & Build Integrity (TC-8)
- Verify `cmd /c npm run build` inside `gymlog-react` executes cleanly with exit code 0.

---

## Submission Protocol
The QA Engineer MUST execute build verification and output their report strictly within `<AUDIT_SUBMISSION>` XML tags with status `QA_PREMERGE_PASS`.
