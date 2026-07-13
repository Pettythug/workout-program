# TASK-R57: Fix Swap PIN Prompt Regression

> **For Human Readers:** This task resolves the issue where selecting an existing alternative exercise (like Bent Over Dumbbell Rows) from the swap list incorrectly prompts the user for the Admin PIN. It updates the exact name matches to trim whitespaces and adds base name match fallback evaluation during exercise swaps.

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
    - TARGET_BRANCH: `TASK-R57`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Investigate and fix the exercise swap logic to avoid Admin PIN prompt validation errors on existing alternative database entries.
  </OBJECTIVE>
  <RESOURCES>
    - Exercise Card: `gymlog-react/src/components/ExerciseCard.jsx`
    - Circuit Card: `gymlog-react/src/components/CircuitCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ target files.

    2. MODIFY `gymlog-react/src/components/ExerciseCard.jsx`:
       - Locate the `executeSwap` function (around line 406).
       - Refactor targetEx lookup to trim comparison values and check base names (to allow variations matching parent groups):
         ```javascript
         const getBaseName = (n) => n.replace(/\s*\((Single|Alt|DB|Cable)\)/i, "").trim();
         let targetEx = (exercises || []).find(e => {
             const cleanedE = e.name.trim().toLowerCase();
             const cleanedStd = stdName.trim().toLowerCase();
             return cleanedE === cleanedStd || getBaseName(e.name).trim().toLowerCase() === cleanedStd;
         });
         ```

    3. MODIFY `gymlog-react/src/components/CircuitCard.jsx`:
       - Locate the `executeSwap` function (around line 227).
       - Refactor targetEx lookup to trim values and support base name match evaluation (mirroring Step 2).

    4. AUDIT: Generate `/audit_log_R57.md` in the workspace root detailing the fix.
    5. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to verify compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
