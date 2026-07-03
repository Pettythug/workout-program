# Audit Log for TASK-R26

## Styling Additions
- Added `COMPLETED` and `SKIPPED` text badges next to exercise names in the collapsed headers of both `ExerciseCard.jsx` and `CircuitCard.jsx`.
- Badges are displayed conditionally based on `isDone` and `isSkipped` state.
- They are rendered within a flex container (`flexWrap: 'wrap'`) alongside the exercise name and the search/info button.
- Updated the main container style to fix card opacity (keeping completed cards fully opaque, while skipped cards are set to `0.5`).
- Added a subtle green `boxShadow` (`0 4px 20px rgba(34, 197, 94, 0.12)`) to completed cards to enhance visibility.
