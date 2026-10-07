# TASK-R113: Add Exercise Modalities (Single/Alternating) to Edit Panel
**Status:** In Progress
**Assignee:** Sandbox_Developer
**Objective:** Port the "Singles" and "Alternating" checkbox logic from the Create flow (SettingsModal.jsx) into the Edit flow (ExerciseCard.jsx). When editing an exercise, checking/unchecking these boxes should dynamically add or delete the corresponding (Single) or (Alt) string variations from the Google Sheet backend via useGymAPI.

## Implementation Details

### 1. ExerciseCard.jsx
- Extract deleteExercise from useGymAPI() (currently only destructured for logSet, deleteHistory, saveExercise).
- In the showEditPanel section (around where Rename, Category, etc. are located), add a "Generate Modalities" checkbox group visually matching the one from SettingsModal.jsx.
- **State Hydration:** 
  - Compute the base name: const baseName = ex.name.replace(/\s*\((Single|Alt|DB|Cable)\)/i, "").trim();
  - Determine if the variations already exist in the global exercises array (from useAppContext()):
    const hasSingle = exercises.some(e => e.name === \\${baseName} (Single)\\);
    const hasAlt = exercises.some(e => e.name === \\${baseName} (Alt)\\);
- **Checkbox Behavior (Immediate Action):**
  - **Unchecking (Delete):** If a user unchecks a previously checked box, prompt for the admin PIN, then invoke deleteExercise passing the specific variation name (e.g., \${baseName} (Single)\`), followed by emoveExerciseFromLocalState.
  - **Checking (Create):** If a user checks a previously unchecked box, prompt for the admin PIN, then invoke createExerciseMeta passing the exact variation flag (createSingle: true or createAlt: true) while setting createStandard: false so it doesn't duplicate the base exercise.
- **UI:** Ensure the UI for these checkboxes sits comfortably inside the showEditPanel and matches the dark-theme aesthetic used in the rest of the file.

## Expected Result
When a user clicks "EDIT" on an exercise card, they will see checkboxes for "Singles" and "Alternating". These checkboxes will accurately reflect if those variations exist in the database. Clicking a checkbox instantly adds or removes that specific variation from the Google Sheet backend.
