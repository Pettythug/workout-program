# TASK-R75: Filter Deleted Exercises from Persisted Accessory List

> **For Human Readers:** This task prevents deleted exercises from persisting in the accessory bonus section after they have been removed from the exercise database.

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
    - TARGET_BRANCH: `TASK-R75`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Prevent exercises deleted from the spreadsheet from persisting in the accessory bonus section after a page refresh, by removing the stale item fallback in the `resolvedAccessories` useMemo block.
  </OBJECTIVE>
  <RESOURCES>
    - Plan View: `gymlog-react/src/components/PlanView.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/PlanView.jsx`.

    2. MODIFY `gymlog-react/src/components/PlanView.jsx`:
       - Locate the `resolvedAccessories` useMemo block (approx L120-L128).
       - On the line: `return groupedExercises[baseKey] || item;`
       - Change it to: `return groupedExercises[baseKey] || null;`
       - This ensures that if an exercise no longer exists in the live exercise database, it returns null, which is then stripped by the existing `.filter(Boolean)` call.

    3. AUDIT: Generate `/audit_log_R75.md` documenting the stale fallback removal.
    4. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to verify compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
