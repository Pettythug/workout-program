# TASK-R58: Relocate Exercise Card Edit Panel to Footer Bottom

> **For Human Readers:** This task moves the collapsible metadata edit buttons container (Rename, Category, Location, Reps/Timed, In Circuit) in `ExerciseCard.jsx` to render immediately below the footer button row (`SWAP`, `IMAGE`, `EDIT EXERCISE`) instead of at the top of the card.

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
    - TARGET_BRANCH: `TASK-R58`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Relocate the collapsible settings edit panel in ExerciseCard.jsx to render at the bottom of the card, immediately below the bottom buttons row.
  </OBJECTIVE>
  <RESOURCES>
    - Exercise Card: `gymlog-react/src/components/ExerciseCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/ExerciseCard.jsx`.

    2. MODIFY `gymlog-react/src/components/ExerciseCard.jsx`:
       a. Locate the conditional block rendering `showEditPanel && ( ... )` (currently around line 549, near the top of the expanded card).
       b. Remove this block from the top of the expanded card structure.
       c. Locate the bottom button bar row (containing `SWAP`, `IMAGE`, `EDIT EXERCISE`, around line 775).
       d. Insert the conditional block `showEditPanel && ( ... )` immediately below this button row.
       e. Add a clean visual distinction to the edit panel, such as:
          - A border-top (`1px dashed var(--border)`)
          - A margin-top (`12px`) and padding-top (`12px`)
          - A slightly darker background color to visually encapsulate the administrative configurations section.

    3. AUDIT: Generate `/audit_log_R58.md` in the workspace root detailing changes.
    4. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to verify compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
