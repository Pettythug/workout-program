# Audit Log: TASK-R48 (Fix Background Sync Race Condition and Persistent Toast UX)

## Overview
This document logs the changes made to prevent background sheet syncs from overwriting local un-synced entries and to make success toasts persist on cards until the user starts editing their next set.

## Changes Made
1. **gymlog-react/src/context/dataMerge.js**:
   - Refactored both mapping loops (for existing local exercises and new sheet-derived exercises) to merge spreadsheet history with local history.
   - Preserves local un-synced entries from "today" that are not present in the spreadsheet history (checked by matching person, reps, and weight stats).

2. **gymlog-react/src/components/ExerciseCard.jsx**:
   - Modified `PersonLogSection` to accept `toast` and `setToast` props.
   - Clears `toast` immediately on checkbox/phrase toggle inside `toggleNotePhrase`.
   - Clears `toast` immediately on input edits inside `updateLogInput`.
   - Verified that no automatic `setTimeout` timers clear the success message "Set Saved!" automatically.

3. **gymlog-react/src/components/CircuitCard.jsx**:
   - Modified `PersonRow` to accept `toast` and `setToast` props.
   - Added success toast confirmation `"Set Saved!"` to `handleSave` on successful save.
   - Clears `toast` immediately on checkbox/phrase toggle inside `toggleNotePhrase`.
   - Clears `toast` immediately on input edits inside `updateInput`.

## Verification
- Confirmed compilation with `npm run build` in `gymlog-react`.
