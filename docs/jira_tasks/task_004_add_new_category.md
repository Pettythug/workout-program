# Story 1.4: Port the "+ Add new category" UI and backend sheetsPost sync

## Background & Context
The legacy codebase (`gymlog-ultimate.html`) dynamically extracted available categories from the existing exercises array rather than maintaining a separate `categories` database table. To add a new category, the user would select the `+ Add new category...` option in a dropdown when editing or creating an exercise, which triggered a prompt. The custom string was then synced to the backend via the standard `saveExercise` or `renameExercise` API payload.

## Current State in React Migration
We have already partially ported this logic:
- `SettingsModal.jsx` (Create Exercise) currently features the `+ Add new...` option which prompts the user and saves the category.
- `ExerciseCard.jsx` (Inline Edit) also features the `+ Add new...` option, functioning exactly as the legacy app did and syncing via `saveExercise`.

## Remaining Work (The Task)
The final piece of this story is standardizing the custom category logic across all forms. Specifically, the `CircuitCard.jsx` Custom Swap UI is currently using a raw text `<input>` with a `<datalist>` rather than the standardized `<select>` dropdown with the `ADD_NEW` trigger.

## Acceptance Criteria
- [ ] Refactor the Category input in the `CircuitCard.jsx` custom swap form (around line 282) to use a `<select>` dropdown populated with `uniqueCategories`.
- [ ] Add the `<option value="ADD_NEW">+ Add new...</option>` trigger to that dropdown.
- [ ] Ensure selecting `ADD_NEW` triggers a `prompt()` for the new category name, saving the result to local state.
- [ ] Verify that submitting the custom swap sends the new category properly to the backend via the `executeSwap` logic (which should bundle it into the `saveExercise` payload).
