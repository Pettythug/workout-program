# TASK-R114: Alphabetical Sorting for Google Sheets (Exercises)
**Status:** In Progress
**Assignee:** Sandbox_Developer
**Objective:** Automatically sort the GymLog_Exercises tab alphabetically in Google Sheets whenever a new exercise (or modifier variation) is added via the API. This ensures grouped variations (e.g., "Bicep Curl", "Bicep Curl (Alt)") remain adjacent instead of dropping to the bottom.

## Implementation Details

### 1. Combined_AppScript_v2.gs
- Define a new helper function at the bottom of the file (or near the exercise handling functions):
  ``javascript
  function gymlog_sortExercisesAlphabetically() {
    const exSheet = getOrCreateSheet(EXERCISES_TAB, EXERCISES_HEADERS);
    const lastRow = exSheet.getLastRow();
    if (lastRow > 1) {
      // Sort range from Row 2 to Last Row, by Column 1 (Exercise Name) A-Z
      exSheet.getRange(2, 1, lastRow - 1, EXERCISES_HEADERS.length).sort({column: 1, ascending: true});
    }
  }
  ``
- Locate gymlog_handleSaveExercise(payload) (around line 600). After the exSheet.appendRow(newRow); block, invoke gymlog_sortExercisesAlphabetically();.
- Locate gymlog_handleSaveExerciseNote(payload) (around line 680). After the exSheet.appendRow(...) fallback block, invoke gymlog_sortExercisesAlphabetically();.
- Ensure that the backend syncs cleanly without errors.

## Expected Result
Whenever the user creates a new exercise or toggles a Single/Alternating variation on the frontend, the backend will immediately re-sort the Google Sheet alphabetically. The user will no longer have to manually scroll to the bottom of the sheet to find newly appended exercises.
