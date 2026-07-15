# Audit Log: TASK-R68 (Cohesive Logging Layout Refactor)

## Overview
This document logs the changes made to refactor the exercise logging layout in `ExerciseCard.jsx` to ensure that data inputs, checkboxes, and notes remain logically grouped and unified for each person, preventing disjointed interfaces in both single-user and multi-user configurations.

## Changes Made
1. **gymlog-react/src/components/ExerciseCard.jsx**:
   - Eliminated the `PersonInputsSection` and `PersonNotesSection` components.
   - Introduced a new unified component `MultiUserPersonLogSection` that handles a single user's log interface in Multi-User Mode. This component renders:
     - Header: Person Name + Target ranges.
     - Inputs row: `[ reps ] [ lbs ]` (or duration/weight if timed).
     - Checkboxes (Singles, Alternating) and Notes text input grouped directly underneath the inputs row.
   - Refactored the JSX in `ExerciseCard.jsx` (Multi-User Mode branch) to map over `activePeople` and render the new `MultiUserPersonLogSection` for each active user.
   - Positioned the large green `LOG SET X` button directly *after* the list of active people panels (serving as the unified form submit button).

## Verification
- Verified compilation by running `npm run build` cleanly inside `gymlog-react`.
