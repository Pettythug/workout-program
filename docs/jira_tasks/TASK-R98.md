# TASK-R98: Deterministic Session ID Generation & Duplicate Session Prevention

## 1. Overview & Objectives
Currently, workout session IDs in `gymlog-react/src/context/AppContext.jsx` are generated using the clock's start timestamp (hours, minutes, seconds). If a user completes a workout, resets the session timer, or re-completes the same workout on the same calendar day, a new timestamped ID is produced, creating duplicate rows in the `GymLog_Sessions` Google Sheet and skewing duration/workout averages.

The objective of this task is to make the default Session ID strictly deterministic based on `[Program]_[Person]_[Date]_day[WorkoutDay]`. This allows Google Apps Script's existing ID-lookup logic to overwrite/update the existing session in place on the same date rather than creating redundant entries.

---

## 2. Implementation Scope
- **File:** `gymlog-react/src/context/AppContext.jsx`
- **Function:** `saveCompletedSession(sessionData, skipServerSync)`
- **Change:**
  Update the fallback `id` assignment:
  ```javascript
  const date = sessionData.date || new Date().toISOString().split('T')[0];
  const daySuffix = (sessionData.workoutDay !== undefined && sessionData.workoutDay !== null)
      ? `_day${sessionData.workoutDay}`
      : '';
  const id = sessionData.id || `${sessionData.program || 'Plan'}_${sessionData.people || 'User'}_${date}${daySuffix}`;
  ```

---

## 3. Acceptance Criteria
1. [ ] **Deterministic ID**: Completing Workout 25 for Brian on `2026-10-01` produces ID `Plan_Brian_2026-10-01_day25`.
2. [ ] **Safe Fallbacks**: If `workoutDay` is not passed or null, gracefully omit suffix without throwing undefined.
3. [ ] **Build & Quality Check**: `npm.cmd run build` and `npx.cmd eslint src/` compile with 0 errors.
