# Audit Log: TASK-R55

## Enable Negative Weight Logging for Assisted Exercises

1. **`gymlog-react/src/components/ExerciseCard.jsx`**:
   - Modified the `updateLogInput` weight block.
   - Replaced basic digit/decimal sanitization with an algorithm that checks if the user entered a leading negative sign (`-`), strips non-numeric characters from the rest, checks for a single decimal point, and then restores the leading negative sign if it was present.

2. **`gymlog-react/src/components/CircuitCard.jsx`**:
   - Modified the `updateInput` weight block.
   - Implemented the identical leading-negative-sign logic for weight input validation as used in `ExerciseCard.jsx`.

## Verification Details
- Successfully modified weight sanitization to support input values starting with `-`.
- Verified compilation and build of the React application.
