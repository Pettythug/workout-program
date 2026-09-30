# TASK-R91: First-Class Standalone Exercise Architecture, Modality Generator & Swap Sorting

> **For Human Readers:** This task flattens the exercise model so every variation (Standard, Alt, Single) is a first-class standalone exercise. It cleans up `ExerciseCard.jsx` and `CircuitCard.jsx` by removing redundant top variation pills and bottom checkboxes, adds multi-modality checkboxes (`Standard`, `Alternating`, `Singles`) to the Add Exercise modal in `SettingsModal.jsx`, and ensures the Swap dropdown displays all standalone variations filtered by active location and sorted alphabetically.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: MULTI_FILE_Refactoring
    - REQUIRED_MODEL_TIER: ["MEDIUM_TIER", "Gemini 3.8 Flash (Medium)", "Gemini 3.8 Flash", "Gemini 3.8 Pro"]
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R91`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Update `gymlog-react/src/components/ExerciseCard.jsx` & `gymlog-react/src/components/CircuitCard.jsx`:
       - Remove top variation switcher pills (`STANDARD | SINGLES | ALT`).
       - Remove bottom checkboxes (`[ ] Singles` and `[ ] Alternating`).
       - Display the clean, exact exercise name in the header.
       - Ensure the Swap dropdown lists all standalone exercises filtered by `matchesLocation(alt.location, activeLocation)` and sorted alphabetically: `.sort((a, b) => a.name.localeCompare(b.name))`.

    2. Update `gymlog-react/src/components/SettingsModal.jsx` (Add Exercise Modal):
       - When adding a new exercise, provide modality selection checkboxes:
         - `[x] Standard` (Base name, e.g. `Dumbbell Bench Press`)
         - `[x] Alternating` (Appends `(Alt)`, e.g. `Dumbbell Bench Press (Alt)`)
         - `[x] Singles` (Appends `(Single)`, e.g. `Dumbbell Bench Press (Single)`)
       - When submitting, automatically creates and saves each checked variation as a distinct row to `GymLog_Exercises` via `saveExercise`.

    3. Update `PlanView.jsx` and `FullBodyView.jsx`:
       - Ensure `pick()` and `plannedExercises` map functions resolve exact standalone exercise names.

    4. Verification & Audit:
       - Run `npm run build` inside `gymlog-react` and verify clean build with 0 errors.
  </OBJECTIVE>
  <RESOURCES>
    - Card: `gymlog-react/src/components/ExerciseCard.jsx`
    - Circuit Card: `gymlog-react/src/components/CircuitCard.jsx`
    - Settings: `gymlog-react/src/components/SettingsModal.jsx`
    - Plan View: `gymlog-react/src/components/PlanView.jsx`
    - Full Body View: `gymlog-react/src/components/FullBodyView.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `docs/jira_tasks/TASK-R91.md`.
    2. In `ExerciseCard.jsx`, add `.sort((a, b) => a.name.localeCompare(b.name))` to the swap dropdown list.
    3. RUN `npm run build` inside `gymlog-react` and verify clean build.
    4. SIGNAL `DEVELOPMENT_TASK_COMPLETE`.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
