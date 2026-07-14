# TASK-R59: Fix Edit Exercise Button Text Overflow

> **For Human Readers:** This task shortens the `⚙️ EDIT EXERCISE` button label in the footer of `ExerciseCard.jsx` to `⚙️ EDIT` to prevent text clipping and alignment overflow on mobile devices.

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
    - TARGET_BRANCH: `TASK-R59`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Shorten the button text label for the inline settings edit panel toggle inside ExerciseCard.jsx.
  </OBJECTIVE>
  <RESOURCES>
    - Exercise Card: `gymlog-react/src/components/ExerciseCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/ExerciseCard.jsx`.

    2. MODIFY `gymlog-react/src/components/ExerciseCard.jsx`:
       - Locate the footer edit button (around line 747).
       - Change the label text from `⚙️ EDIT EXERCISE` to `⚙️ EDIT`.

    3. AUDIT: Generate `/audit_log_R59.md` in the workspace root detailing changes.
    4. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to verify compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
