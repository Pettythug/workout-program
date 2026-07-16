# TASK-R72: Fix Mobile Input Box Flexbox Overflow

> **For Human Readers:** This task fixes the CSS flexbox overflow in `ExerciseCard.jsx` where the single-user numeric inputs (`reps`/`secs` and `lbs`) overflow the card boundary, pushing the weight input off-screen on mobile devices.

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
    - TARGET_BRANCH: `TASK-R72`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Prevent browser input overflow by adding explicit width and min-width boundaries to the flex items inside SingleUserLogSection.
  </OBJECTIVE>
  <RESOURCES>
    - Exercise Card: `gymlog-react/src/components/ExerciseCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/ExerciseCard.jsx`.

    2. MODIFY `gymlog-react/src/components/ExerciseCard.jsx`:
       - Inside the `SingleUserLogSection` subcomponent (approx L55-103):
         - For all four `<input>` elements in the flex container (both the `timed` and `reps` branches):
           - Add `width: '100%'` and `minWidth: 0` to their inline styles to override the browser's default input width behavior and allow the flexbox algorithm to shrink them down to fit the container space.
           - Example style additions:
             `flex: 1, width: '100%', minWidth: 0`

    3. AUDIT: Generate `/audit_log_R72.md` detailing the flexbox layout fixes.
    4. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to verify compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
