# Audit Log - TASK-R6

## Objective
Display today's logged sets in the `ExerciseCard` UI.

## File Modified
`gymlog-react/src/components/ExerciseCard.jsx`

## Exact Changes
1. Added a `useMemo` hook to calculate `todaysSets` by filtering the `ex.history` array for any sets that match today's date (`new Date().toDateString()`).
2. Added a conditional rendering block immediately before the "LOG SET" button in the `LOG` tab UI.
3. The new block renders only if `todaysSets.length > 0`. It displays "Today's Sets" and maps over `todaysSets`, showing the person's name, set number, and the reps/weight (or duration if the exercise is timed).
