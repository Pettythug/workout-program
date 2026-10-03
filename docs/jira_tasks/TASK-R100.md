# TASK-R100: Frontend Deletion Decoupling, Exact-Second Timestamp Precision & Server-First Sync

## 1. Overview & Objectives
This task resolves all set deletion, timestamp precision, and workout day synchronization issues:
1. **0ms Instant UI Deletion**: Set deletions in `ExerciseCard.jsx` and `CircuitView.jsx` immediately update local state and buffer into `gymlog_pending_deletes` with zero blocking prompts and zero intermediate network calls.
2. **Exact-Second Precision**: Historical set logging and deletions must retain exact hour, minute, and second timestamps (`M/d/yyyy, h:mm:ss a`), combined with the exact Set # (`setNum`), ensuring zero collision or ambiguity even for sets logged with short rest periods.
3. **Server-First Workout Day Priority**: In `AppContext.jsx`, when switching `Device Owner` in `updateDeviceOwner`, the settings downloaded from Google Sheets (`GymLog_Settings`) must take precedence over stale browser `localStorage` (`gymlog_workout_day_*`).
4. **Clean Session IDs**: In `saveCompletedSession`, Session IDs must use ISO `YYYY-MM-DD` formatting (e.g. `Plan_Test_2026-10-02_day22`) with zero slash characters and guaranteed alignment with the completed workout day number.
5. **Atomic Backend Batch Sync**: `Combined_AppScript_v2.gs` must match deletions using exact timestamp down to the second and `setNum`, deleting target rows cleanly from `GymLog_History` in the same single lock as `GymLog_Sessions` and `GymLog_Settings`.

---

## 2. Technical Scope of Changes

### A. `gymlog-react/src/context/AppContext.jsx`
1. In `updateDeviceOwner(newOwner)`:
   - Read `rawSettings` for `newOwner` (e.g. `rawSettings['builder_workout_num_' + ownerLower]` or `rawSettings[newOwner + '_Plan_Day']`).
   - If present and valid, prioritize this server setting over `planCached`.
   - Update `setWorkoutDay`, `setCircuitWorkoutDay`, and `setFullBodyWorkoutDay` accordingly and save to `localStorage`.
2. In `saveCompletedSession(sessionData, skipServerSync)`:
   - Format `date` as ISO `YYYY-MM-DD` (e.g. `2026-10-02`) so Session IDs never contain slashes.
   - Construct deterministic ID: `${program}_${person}_${isoDate}_day${workoutDay}`.
3. In `deleteSetFromLocalHistory(exName, entryDetails)`:
   - Ensure `pendingDeletes` stores `date` (exact full timestamp with seconds), `setNum`, `exercise`, `person`, `reps`, `weight`, and `range`.

### B. `gymlog-react/src/components/ExerciseCard.jsx`
1. In `formatLogDate(dateStr)`:
   - Include `second: '2-digit'` in `toLocaleTimeString` so the UI displays the exact second (`Yesterday, 3:33:05 PM`).

### C. `Combined_AppScript_v2.gs`
1. In `gymlog_doGet()`:
   - In history mapping, format `date` to retain exact seconds:
     ```javascript
     date: r[0] ? (r[0] instanceof Date ? Utilities.formatDate(r[0], Session.getScriptTimeZone(), "M/d/yyyy, h:mm:ss a") : String(r[0])) : "",
     ```
   - Ensure `setNum: r[7]` is passed.
2. In `gymlog_handleBatchSyncSession(payload)`:
   - In `payload.deletes` matching loop:
     - Match exact timestamp: compare raw strings or `d1.getTime() === d2.getTime()`.
     - Match `setNum`: if `setNum` is provided, match `String(data[i][7]).trim() === String(setNum).trim()`.
     - Match `person`, `exercise`, `reps`, `weight`, `range`.
     - Delete matched row with `histSheet.deleteRow(i + 2)` and break.

---

## 3. Acceptance Criteria
1. [ ] **Instant Local Deletion**: Tapping the trash can removes the set immediately in 0ms without PIN popups or network delays.
2. [ ] **Exact Timestamp Display**: Recent History shows timestamps with seconds (`Yesterday, 3:33:05 PM`).
3. [ ] **Clean Session ID**: `GymLog_Sessions` receives IDs in `Plan_Test_YYYY-MM-DD_dayN` format with no slashes.
4. [ ] **Server-First Workout Day**: Switching Device Owner in Settings immediately pulls the correct workout day number from Google Sheets.
5. [ ] **Atomic Cloud Deletion**: Tapping **COMPLETE WORKOUT** cleanly deletes the target row from `GymLog_History` in Google Sheets.
6. [ ] **Build Verification**: `npm.cmd run build` compiles with 0 errors.
