# Audit Log R27

- Refactored `reps` and `lbs` inputs in `ExerciseCard` to use text inputs with `inputMode` and regex sanitization.
- Refactored `reps` and `lbs` inputs in `CircuitCard` to use text inputs with `inputMode` and regex sanitization.
- Updated `ExerciseCard` to evaluate group-level `isGroupDone` and `isGroupSkipped` hooks.
- Applied group-level state to root container outline/opacity and header badges.
