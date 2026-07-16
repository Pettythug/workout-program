# Audit Log: TASK-R72

## Fix Mobile Input Box Flexbox Overflow

1. **`gymlog-react/src/components/ExerciseCard.jsx`**:
   - Inside the `SingleUserLogSection` subcomponent, updated the styling of all four input fields (`secs`, `lbs` for timed exercises, and `reps`, `lbs` for standard reps-based exercises).
   - Added `width: '100%'` and `minWidth: 0` to their inline styles to override the default browser input width behavior and prevent them from overflowing the parent flex container on mobile viewports.
