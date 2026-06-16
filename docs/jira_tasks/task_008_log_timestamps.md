# Task 008: Log Timestamps and Prevent Legacy syncAll Wipes

**Recommended Model:** Gemini 3.5 Flash

## Git Setup (Mandatory)
Before writing any code, pull the latest state and isolate your changes on a new branch:
1. Ensure your local `main` is fresh:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Create and switch to a new task branch:
   ```bash
   git checkout -b task/008-log-timestamps
   ```

## Problem Description
1. We need to save the entry date with a local timestamp (time of entry) instead of a plain date to prevent day-shifts and allow users to see exactly when sets were logged.
2. We must make the date comparison on the frontend robust to handle time values and differing date format representations (e.g. comparing "6/16/2026, 3:38:56 PM" or "Jun 16, 2026, 3:38 PM" to "6/16/2026").
3. We need to format dates loaded from Sheets to display the timestamp (including hours/minutes) in the frontend.
4. We need to prevent legacy clients from triggering destructive `syncAll` POST calls that overwrite the entire Sheets history by requiring the Admin PIN (`5050`) on the backend action.

## Instructions for Developer

### 1. Update Apps Script Backend
Open [Combined_AppScript_v2.gs](file:///C:/Users/wance/Documents/Git/workout-program/Combined_AppScript_v2.gs):
- **Authentication Protection:** In `gymlog_handleSyncAll(payload)` (around line 412), check if `payload.pin` is equal to `ADMIN_PIN`. If not, return an error object:
  ```javascript
  if (payload.pin !== ADMIN_PIN) {
    return err("syncAll requires Admin PIN. Legacy web clients are not authorized to overwrite history.");
  }
  ```
- **Read Formatting:** In the `gymlog_doGet` function (around line 206), modify the formatting format from `"MMM d, yyyy"` to `"MMM d, yyyy, h:mm a"` to preserve the timestamp time when retrieving history:
  ```javascript
  date:     r[0] ? Utilities.formatDate(new Date(r[0]), Session.getScriptTimeZone(), "MMM d, yyyy, h:mm a") : "",
  ```

### 2. Update React Frontend Date Logging
- **Exercise Card Logging:** In [ExerciseCard.jsx](file:///C:/Users/wance/Documents/Git/workout-program/gymlog-react/src/components/ExerciseCard.jsx), find `handleSaveSet` (around line 142). Update lines 147, 168, and 188 where `new Date().toLocaleDateString('en-US')` is constructed. Change it to use `new Date().toLocaleString('en-US')`.
- **Circuit Card Logging:** In [CircuitView.jsx](file:///C:/Users/wance/Documents/Git/workout-program/gymlog-react/src/components/CircuitView.jsx), find `handleLogSet` (around line 158). Update lines 175 and 194 to use `new Date().toLocaleString('en-US')` instead of `toLocaleDateString('en-US')`.

### 3. Implement Robust Date Comparison
- **Exercise Card "Today" Filter:** In [ExerciseCard.jsx](file:///C:/Users/wance/Documents/Git/workout-program/gymlog-react/src/components/ExerciseCard.jsx), find the `todaysEntries` filter around line 150. Update the comparison to parse dates and compare them via `.toDateString()`:
  ```javascript
  const todaysEntries = ex.history.filter(h => {
      try {
          return new Date(h.date).toDateString() === new Date().toDateString();
      } catch (e) {
          return false;
      }
  });
  ```
- **Circuit View Deletion "Today" Filter:** In [CircuitView.jsx](file:///C:/Users/wance/Documents/Git/workout-program/gymlog-react/src/components/CircuitView.jsx), find `handleDeleteHistoryEntry` around line 300. Update the check `entry.date === todayStr` on line 319 to compare using `toDateString()`:
  ```javascript
  let isToday = false;
  try {
      isToday = new Date(entry.date).toDateString() === new Date().toDateString();
  } catch (e) {}
  if (isToday) {
  ```

### 4. Build Verification
- Open your terminal and run `npm run build` from the `gymlog-react` directory to verify that the build succeeds and no syntax errors are introduced.

## Audit Requirements
- Provide the exact git diff for the changes in the four files.
- Run `npm run build` and include the terminal build output to verify a successful bundle.
