# Audit Log: TASK-R15

## Changes Made
- Modified the `initLogInputs` function in `ExerciseCard.jsx` to merge new people into the `logInputs` state non-destructively instead of overriding it completely.
- Modified `CircuitCard.jsx` to import the `useEffect` hook.
- Added a `useEffect` hook in `CircuitCard.jsx` that triggers when `activePeople` changes to merge new people into the `inputs` state without wiping existing user-entered values.
- Ran validation build using `npm run build` which successfully completed without errors.

## Files Modified
- `gymlog-react/src/components/ExerciseCard.jsx`
- `gymlog-react/src/components/CircuitCard.jsx`
