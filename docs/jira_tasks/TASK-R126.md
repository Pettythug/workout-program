# TASK-R126: Accidental Set Deletion Confirmation Guard

- **Target Role:** `Sandbox_Developer`
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash`, `Claude Sonnet 4.6 (Thinking)`, `Gemini 3.5 Flash (High)`) or `HIGH_TIER`
- **Model Gatekeeper Check:** Verify your active model is in the Authorized Model Tier above before executing any file edits. If misaligned, halt and output the `Model Alignment Error` override.

## Overview
In `ExerciseCard.jsx` and `CircuitCard.jsx`, tapping the small `🗑` (trash can) icon inside the History drawer immediately deletes the historical set from local state and queues a permanent deletion in Google Sheets (`deleteHistoryRow`) without any confirmation prompt. On a mobile touch screen in the gym, it is very easy to accidentally tap the trash icon while scrolling or filtering history.

---

## Technical Specifications & Requirements

### 1. Add Deletion Confirmation Guard (`ExerciseCard.jsx`, `CircuitCard.jsx`)
1. In `ExerciseCard.jsx` (`handleDeleteEntry(entry, originalIndex)`):
   - Prompt the user for confirmation before executing the deletion:
     ```javascript
     const confirmMsg = `Delete this set (${entry.reps} ${isTimeBased ? 'secs' : 'reps'} @ ${entry.weight || 0} lbs on ${entry.date.split(',')[0]})?`;
     if (!window.confirm(confirmMsg)) return;
     ```
2. In `CircuitCard.jsx` (`handleDeleteEntry(entry, originalIndex)`):
   - Apply the same confirmation guard before calling `deleteSetFromLocalHistory` and `deleteHistoryRow`.

---

## Target Files
- `gymlog-react/src/components/ExerciseCard.jsx`
- `gymlog-react/src/components/CircuitCard.jsx`

---

## Submission Protocol for Developer
1. Execute all edits strictly within `gymlog-react/src/*`.
2. Verify production build with `cmd /c npm run build`.
3. Respond in chat with strictly the 4-line XML snippet below:
```xml
<TASK_HANDOFF>
  <TASK_ID>TASK-R126</TASK_ID>
  <ROLE>Sandbox_Developer</ROLE>
  <STATUS>DEVELOPMENT_TASK_COMPLETE</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</TASK_HANDOFF>
```
