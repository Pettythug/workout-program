# TASK-R126: Accidental Set Deletion Confirmation Guard

- **Target Role:** `Sandbox_Developer`
- **Required Model:** `Gemini 3.8 Flash (High)` (`MEDIUM_TIER`)
- **STRICT MODEL GATEKEEPER CHECK (MANDATORY ON TURN 1):**
  1. Check your active model against `MEDIUM_TIER`: `["Gemini 3.8 Flash (High)", "Gemini 3.8 Flash", "Claude Sonnet 4.6 (Thinking)"]`.
  2. If running on a **HIGHER model** (e.g. `Gemini 4 Argon`, `Gemini 3.8 Pro`, `Claude Opus`):
     - **HALT IMMEDIATELY.** Do NOT read files or run tools.
     - Output: `Model Alignment Error: Request Switch -> Model is too high. Please switch to Gemini 3.8 Flash (High) before proceeding.`
  3. If running on a **LOWER model** (e.g. `Gemini 3.8 Flash (Low)`, `Gemini 3.5 Flash (Medium/Low)`):
     - **HALT IMMEDIATELY.** Do NOT read files or run tools.
     - Output: `Model Alignment Error: Request Switch -> Model is too low. Please switch to Gemini 3.8 Flash (High) before proceeding.`

---

## Overview
In `ExerciseCard.jsx` and `CircuitCard.jsx`, tapping the small `🗑` (trash can) icon inside the History drawer immediately deletes the historical set from local state and queues a permanent deletion in Google Sheets (`deleteHistoryRow`) without any confirmation prompt. On a mobile touchscreen in the gym, it is very easy to accidentally tap the trash icon while scrolling or filtering history.

We need to add a standard `window.confirm` dialog before executing the permanent deletion.

---

## Technical Specifications & Requirements

### 1. `gymlog-react/src/components/ExerciseCard.jsx`
- In `handleDeleteHistory(entry, targetIndex)`:
  - Add a confirmation check before calling `deleteSetFromLocalHistory`:
    ```javascript
    const datePart = entry.date ? entry.date.split(',')[0] : 'historical';
    const unit = ex.timed ? 'secs' : 'reps';
    const confirmMsg = `Are you sure you want to delete this set (${entry.reps} ${unit} @ ${entry.weight || 0} lbs on ${datePart})?`;
    if (!window.confirm(confirmMsg)) return;
    ```

### 2. `gymlog-react/src/components/CircuitCard.jsx`
- In `handleDeleteHistory(h, i)`:
  - Add the same confirmation guard before invoking `onDeleteHistoryEntry`:
    ```javascript
    const datePart = h.date ? h.date.split(',')[0] : 'historical';
    const unit = ex.timed ? 'secs' : 'reps';
    const confirmMsg = `Are you sure you want to delete this set (${h.reps} ${unit} @ ${h.weight || 0} lbs on ${datePart})?`;
    if (!window.confirm(confirmMsg)) return;
    ```

---

## Target Files
- `gymlog-react/src/components/ExerciseCard.jsx`
- `gymlog-react/src/components/CircuitCard.jsx`

---

## Validation & Verification Protocol
1. Verify production build passes with zero errors:
   ```cmd
   cmd /c npm run build
   ```
2. Respond strictly inside a markdown code block with the 4-line XML handoff snippet:
   ```xml
   <TASK_HANDOFF>
     <TASK_ID>TASK-R126</TASK_ID>
     <ROLE>Sandbox_Developer</ROLE>
     <STATUS>DEVELOPMENT_TASK_COMPLETE</STATUS>
     <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
   </TASK_HANDOFF>
   ```
