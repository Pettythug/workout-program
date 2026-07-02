# Audit Log: TASK-R18

## Changes Made
- Relocated the `SWAP` and `IMAGE` button block (and its associated `swapMode` conditional rendering logic under `group.originalBaseKey`) from the top of the `ExerciseCard.jsx` active panel to the absolute bottom of the active panel, below the LOG and HISTORY tabs.
- Added `marginTop: 16` to the relocated block wrapper so it spaces evenly from the tabs above it.
- Ran validation build using `npm run build` which successfully compiled without errors.

## Files Modified
- `gymlog-react/src/components/ExerciseCard.jsx`
