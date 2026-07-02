# Audit Log: TASK-R7

## Objective
Restore minor UI fixes (button padding, "Singles" renaming, timestamps) and improve aesthetic QoL.

## Changes Made

1. **Checkbox & Variation Rename ("Singles")**
   - Modified `ExerciseCard.jsx` and `CircuitCard.jsx` to rename the "Single Leg" checkbox to "Singles" (and updated logic checking notes for `Singles`).
   - Renamed the variation select button labels from `SINGLE` to `SINGLES`.

2. **History Timestamp Display**
   - Implemented a clean, human-readable helper `formatLogDate` in `ExerciseCard.jsx` and `CircuitCard.jsx` to format date-time strings to user-friendly formats like "Today, 10:13 AM", "Yesterday, 9:15 PM", etc.
   - Added human-readable timestamps to Today's Sets lists in `ExerciseCard.jsx`.
   - Added human-readable timestamps to Logged Sets sessions in `CircuitCard.jsx`.

3. **Button Spacing & Overflow Fixes**
   - Added the CSS helper class `.btn-no-translate` to `index.css` to disable hover translations on small utility buttons.
   - Applied the `btn-no-translate` class to variation toggles and metadata actions in `ExerciseCard.jsx` and `CircuitCard.jsx` to prevent them from clipping at boundaries.
   - Restored and aligned the bottom padding of card controls and unified `DONE`/`SKIP` action button padding to standard `10px` height.
   - Applied `btn-no-translate` to full list toggle buttons in `PlanView.jsx` and `CircuitView.jsx` for target consistency.
