# Audit Log: TASK-R71 (Refactor Single-User Log Button Layout)

## Overview
This document logs the changes made to `ExerciseCard.jsx` to refactor the Single-User logging interface. The "LOG SET" button has been moved to a full-width block below the notes section, and the numeric inputs for weight and reps/seconds have been expanded to occupy all available horizontal space in their row.

## Changes Made
1. **gymlog-react/src/components/ExerciseCard.jsx**:
   - Modified `SingleUserLogSection`:
     - Removed the submit `<button>` element from the inputs flex container.
     - Changed the inline styles of all `<input>` elements in the reps/duration and weight sections, replacing `width: 70` with `flex: 1` to allow them to stretch horizontally.
     - Placed the green `<button>` (with class `btn-success`) below the notes section.
     - Updated the button style to `width: '100%'`, `padding: 12`, `fontWeight: 'bold'`, `fontSize: '14px'`, and `marginTop: 12`.
     - Restored the text content of the button to ``{isSaving ? "SAVING..." : `LOG SET ${getNextSetNumber()}`}`` to align with the standard multi-user log button description.

## Verification
- Verified compilation by running `npm run build` in the `gymlog-react` directory.
