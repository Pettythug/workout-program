# TASK-R55: Enable Negative Weight Logging for Assisted Exercises

> **For Human Readers:** This task updates the weight input sanitization to allow a leading negative sign (`-`), enabling users to log assisted weights (e.g. bodyweight minus counterweight) on machine lifts.

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
    - TARGET_BRANCH: `TASK-R55`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Modify weight input validation to permit a single leading negative sign in both ExerciseCard.jsx and CircuitCard.jsx.
  </OBJECTIVE>
  <RESOURCES>
    - Exercise Card: `gymlog-react/src/components/ExerciseCard.jsx`
    - Circuit Card: `gymlog-react/src/components/CircuitCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ target files.

    2. MODIFY `gymlog-react/src/components/ExerciseCard.jsx`:
       - Locate the `updateLogInput` weight block (around line 251).
       - Allow a single leading negative sign:
         ```javascript
         } else if (field === 'weight') {
             const isNegative = value.startsWith('-');
             let cleaned = value.replace(/[^0-9.]/g, '');
             const parts = cleaned.split('.');
             if (parts.length > 2) {
                 cleaned = parts[0] + '.' + parts.slice(1).join('');
             }
             sanitizedValue = (isNegative ? '-' : '') + cleaned;
         }
         ```

    3. MODIFY `gymlog-react/src/components/CircuitCard.jsx`:
       - Locate the `updateInput` weight block (around line 180).
       - Implement the identical negative-weight sanitization check as in Step 2.

    4. AUDIT: Generate `/audit_log_R55.md` in the workspace root detailing changes.
    5. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to verify compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
