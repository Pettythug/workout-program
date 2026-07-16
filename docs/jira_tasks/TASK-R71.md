# TASK-R71: Refactor Single-User Log Button Layout

> **For Human Readers:** This task refactors the layout of the single-user set logger in `ExerciseCard.jsx` to move the "LOG SET" button to a full-width row below the notes input and stretch the numeric input boxes to take up the full horizontal space.

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
    - TARGET_BRANCH: `TASK-R71`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Relocate the green set logging button to the bottom of SingleUserLogSection as a full-width action row, and expand reps/lbs inputs to fill their row.
  </OBJECTIVE>
  <RESOURCES>
    - Exercise Card: `gymlog-react/src/components/ExerciseCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/ExerciseCard.jsx`.

    2. MODIFY `gymlog-react/src/components/ExerciseCard.jsx`:
       - Restructure the `SingleUserLogSection` subcomponent's render tree (approx L55-120):
         - Remove the submit `<button>` element from the inputs flex container.
         - In the inputs flex container (`style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}`), remove the explicit `width: 70` constraints from both `<input>` elements and replace them with `flex: 1` so that they expand to fill the horizontal row.
         - Append the submit `<button>` element at the very bottom of the component (below the notes text input).
         - Update the button styles:
           - `width: '100%'` (full block button)
           - `padding: 12`
           - `fontWeight: 'bold'`
           - `fontSize: '14px'`
           - `marginTop: 12`
         - Restore the button text string when not saving back to the full description: `` `LOG SET ${getNextSetNumber()}` ``.

    3. AUDIT: Generate `/audit_log_R71.md` detailing the layout refactor.
    4. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to verify compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
