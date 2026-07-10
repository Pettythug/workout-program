# Audit Log: TASK-R42 - Track Timed Exercises in Seconds Instead of minutes:seconds

## Change Overview
Updated duration logs and inputs to record and format timed exercises in seconds (e.g. `60s` instead of `01:00` or just `60`).

## Details of Modifications

### 1. Frontend: `gymlog-react/src/components/ExerciseCard.jsx`
- Changed placeholder for timed duration input from `"mm:ss"` to `"secs"`.
- Set duration input attribute `type` to `"text"`, `inputMode="numeric"`, and `pattern="[0-9]*"`.
- Appended `s` to reps display for timed exercises in:
  - `getBest` helper (e.g. `60s` instead of `60`)
  - Today's sets list rendering
  - Logged sets history view
  - Recent history list view

### 2. Frontend: `gymlog-react/src/components/CircuitCard.jsx`
- Performed identical changes to match `ExerciseCard.jsx` styling and behaviors:
  - Timed duration input changed to type `"text"`, numeric input modes, and placeholder `"secs"`.
  - Staged logged sets formatted reps display now appends `s` if exercise is timed.
  - Recent history cards reps display now appends `s` if exercise is timed.

## Verification
- Verified that compiling via production builds succeeds without any issues.
