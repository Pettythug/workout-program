# TASK-R68: Cohesive Logging Layout Refactor

> **For Human Readers:** This task refactors the exercise logging layout in `ExerciseCard.jsx` to ensure data inputs, checkboxes, and notes for each person remain logically grouped and unified, preventing disjointed interfaces in both single-user and multi-user configurations.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: SINGLE_FILE_FEATURE
    - REQUIRED_MODEL_TIER: MEDIUM_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R68`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Restore logical grouping (proximity) to the logging interface. Ensure reps/lbs inputs are never separated from their corresponding notes/checkboxes by the save button.
  </OBJECTIVE>
  <RESOURCES>
    - Exercise Card: `gymlog-react/src/components/ExerciseCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/ExerciseCard.jsx`.

    2. REFACTOR `gymlog-react/src/components/ExerciseCard.jsx`:
       - Eliminate `PersonInputsSection` and `PersonNotesSection` components.
       - Re-establish a single, cohesive logging structure for each user:
         - **Single-User Mode (`activePeople.length === 1`):**
           - Render a single cohesive container for the user.
           - Top: Target ranges.
           - Middle row: reps/lbs inputs on the left, compact `LOG SET X` button on the right (flex-row).
           - Bottom: Checkboxes (Singles, Alternating) and Notes text input grouped directly underneath the inputs row.
         - **Multi-User Mode (`activePeople.length > 1`):**
           - Render a cohesive block container for EACH active person.
           - Each person's container must contain:
             - Header: Person Name + Target ranges.
             - Inputs row: `[ reps ] [ lbs ]`.
             - Checkboxes and Notes text input directly below their inputs.
           - Render a single large green `LOG SET X` button *after* the list of active people (acting as the unified submit button for the form).
       - Ensure `SingleUserLogSection` remains clean and simple, with inputs, settings, and buttons grouped in a single container.

    3. AUDIT: Generate `/audit_log_R68.md` detailing the layout cleanup.
    4. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to verify compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
