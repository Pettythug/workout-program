# Audit Log R81

## Odd/Even Core Alternation Logic

Implemented strict odd/even core alternation in `FullBodyView.jsx`.

-   **Odd Days**: On odd workout days (`fullBodyWorkoutDay % 2 !== 0`), the 8th exercise slot exclusively selects from the `Plank Core` category.
-   **Even Days**: On even workout days (`fullBodyWorkoutDay % 2 === 0`), the 8th exercise slot exclusively selects from the `Rotational Core` category.

### Implementation Details:
1.  In `plannedExercises`, evaluated `activeCoreCategory` dynamically based on `fullBodyWorkoutDay`.
2.  Passed `[activeCoreCategory]` to `pick()` instead of hardcoding `['Rotational Core', 'Plank Core']`.
3.  As a direct result of passing a single category to `pick()`, `rotationKey` automatically tracks and saves progress for `PlankCore` on odd days and `RotationalCore` on even days.
4.  No changes were necessary for `startNextWorkout()`, because it natively increments the `rotationKey` of whatever exercises are present in the `plannedExercises` array for that day.
5.  Swap alternatives for slot #8 now naturally contain only exercises from that day's active core category.
