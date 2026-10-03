# TASK-R100: Frontend Deletion Decoupling, Exact-Second Precision & Index-Safe Sync

## 1. Overview & Objectives
This task guarantees that set deletions in the active workout UI are 100% deterministic, instant (0ms), and free of collision:
1. **0ms Local Deletion & Deletion Buffering**: Set deletions in `ExerciseCard.jsx` and `CircuitCard.jsx` immediately remove the targeted set from the UI in 0ms with zero PIN prompts and zero intermediate network calls.
2. **Index-Safe Deletion Targeting**: When deleting from a list of historical entries, the exact index `i` (or unique set identifier) is used so that the app removes the exact item clicked without falling back to searching from the top of the array (`findIndex(0)`).
3. **Exact-Second & Set # Multi-Factor Precision**: Historical sets retain exact timestamps with seconds (`M/d/yyyy, h:mm:ss a`) and exact Set Numbers (`setNum`), ensuring that sets performed in the same minute with short rest periods are completely distinct.
4. **Server-First Workout Day Priority**: In `AppContext.jsx` (`updateDeviceOwner`), settings downloaded from Google Sheets (`GymLog_Settings`) take precedence over stale browser `localStorage`.
5. **Clean ISO Session IDs**: In `saveCompletedSession`, Session IDs are generated as `${program}_${person}_${YYYY-MM-DD}_day${workoutDay}` with zero slash characters.
6. **Atomic Backend Deletion**: `Combined_AppScript_v2.gs` matches deletions on `date` + `setNum` + `person` + `exercise` + `reps` + `weight`, deleting the exact target row from `GymLog_History` in the same single lock as `GymLog_Sessions` and `GymLog_Settings`.

---

## 2. Technical Scope of Changes

### A. `gymlog-react/src/components/ExerciseCard.jsx` & `CircuitCard.jsx`
1. In `RECENT HISTORY` mapping:
   ```jsx
   ex.history.filter(...).slice(0, 5).map((h, i) => (
     ...
     <button onClick={() => handleDeleteHistory(h, i)} ...>🗑</button>
   ))
   ```
2. In `handleDeleteHistory(entry, index)`:
   - Pass both `entry` and `index` to `deleteSetFromLocalHistory(ex.name, entry, index)`.
3. In `formatLogDate(dateStr)`:
   - Include `second: '2-digit'` in `toLocaleTimeString` so the UI displays seconds (`Yesterday, 3:33:05 PM`).

### B. `gymlog-react/src/context/AppContext.jsx`
1. In `deleteSetFromLocalHistory(exName, entryDetails, targetIndex = null)`:
   - If `entryDetails` is a historical set, buffer `{ exercise, person, reps, weight, range, date, setNum }` into `gymlog_pending_deletes`.
   - When modifying `ex.history` in local state:
     - If `targetIndex !== null` and valid, splice at `targetIndex`.
     - Otherwise, match on `date` + `setNum` + `reps` + `weight` + `person`.
2. In `updateDeviceOwner(newOwner)`:
   - Prioritize `rawSettings['builder_workout_num_' + ownerLower]` or `rawSettings[newOwner + '_Plan_Day']` over `planCached`.
3. In `saveCompletedSession(sessionData, skipServerSync)`:
   - Format `isoDate` as `YYYY-MM-DD` (e.g. `2026-10-03`).
   - Construct deterministic ID: `${prog}_${cleanPerson}_${isoDate}${daySuffix}`.

### C. `Combined_AppScript_v2.gs`
1. In `gymlog_doGet()`:
   - Format history date: `r[0] ? (r[0] instanceof Date ? Utilities.formatDate(r[0], Session.getScriptTimeZone(), "M/d/yyyy, h:mm:ss a") : String(r[0])) : ""`.
   - Pass `setNum: r[7]`.
2. In `gymlog_handleBatchSyncSession(payload)` and `gymlog_handleDeleteHistory(payload)`:
   - Match on `person`, `exercise`, `reps`, `weight`, `range`, exact `date`, and `setNum`.
   - Delete matched row with `histSheet.deleteRow(i + 2)` and break.

---

## 3. Acceptance Criteria
1. [ ] **0ms Instant UI Removal**: Tapping delete removes the item immediately in 0ms without PIN prompts.
2. [ ] **Index-Safe Deletion**: Tapping the second entry on screen removes the second entry on screen.
3. [ ] **Exact Timestamp Display**: Timestamps display seconds in Recent History (`Yesterday, 3:33:05 PM`).
4. [ ] **Clean Session IDs**: Session IDs format as `Plan_Test_YYYY-MM-DD_dayN` (no slashes).
5. [ ] **Server-First Workout Day**: Switching users in Settings pulls the latest workout day from Google Sheets.
6. [ ] **Atomic Backend Deletion**: Tapping Complete Workout deletes the exact targeted row from Google Sheets.
7. [ ] **Build Verification**: `npm.cmd run build` compiles with 0 errors.
