# TASK-R91: First-Class Standalone Exercise Architecture & Modality Generator

> **For Human Readers:** This task flattens the exercise model so every variation (Standard, Alt, Single) is a first-class standalone exercise. It cleans up `ExerciseCard.jsx` by removing the top variation pills and bottom checkboxes, and adds multi-modality checkboxes (`Standard`, `Alternating`, `Singles`) to the Add Exercise modal in `SettingsModal.jsx` so creating a movement can automatically generate all valid standalone variations.

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
       - Display the clean, exact exercise name in the header (e.g. `Dumbbell Snatch (Alt)` or `Side-to-Side Pushups (Single)`).
       - Maintain clean history and 1RM lookups mapped directly to the exact exercise name.

    2. Update `gymlog-react/src/components/SettingsModal.jsx` (Add Exercise Modal):
       - When adding a new exercise, provide modality selection checkboxes:
         - `☑️ Standard` (Base name, e.g. `Dumbbell Bench Press`)
         - `☑️ Alternating` (Appends `(Alt)`, e.g. `Dumbbell Bench Press (Alt)`)
         - `☑️ Singles` (Appends `(Single)`, e.g. `Dumbbell Bench Press (Single)`)
       - When submitting, automatically creates and saves each checked variation as a distinct row to `GymLog_Exercises` via `saveExercise`.

    3. Update `PlanView.jsx`, `FullBodyView.jsx`, and `CircuitView.jsx`:
       - Ensure the `🔄 SWAP` modal lists all standalone variations cleanly so users can easily swap to any specific modality.

    4. Verification & Audit:
       - Generate `/audit_log_R91.md`.
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
    1. READ `gymlog-react/src/components/ExerciseCard.jsx` and `gymlog-react/src/components/SettingsModal.jsx`.
    2. MODIFY `gymlog-react/src/components/ExerciseCard.jsx` & `CircuitCard.jsx` to remove top pills and duplicate checkboxes.
    3. MODIFY `gymlog-react/src/components/SettingsModal.jsx` to add modality generator checkboxes.
    4. CREATE `/audit_log_R91.md`.
    5. RUN `npm run build` inside `gymlog-react` and verify clean build.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
