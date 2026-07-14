# TASK-R61: Prevent Duplicate Bonus Accessory Recommendations

> **For Human Readers:** This task prevents duplicate exercise recommendations in `AccessoryBlock.jsx` by filtering out exercises already in the active planned workout and those already added to the bonus accessories list.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: MULTI_FILE_Refactoring
    - REQUIRED_MODEL_TIER: MEDIUM_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R61`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Filter out duplicate exercises from the random accessory generation list inside AccessoryBlock.jsx.
  </OBJECTIVE>
  <RESOURCES>
    - Plan View: `gymlog-react/src/components/PlanView.jsx`
    - Accessory Block: `gymlog-react/src/components/AccessoryBlock.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ target files.

    2. MODIFY `gymlog-react/src/components/PlanView.jsx`:
       - Locate all `<AccessoryBlock />` render tags (two locations: inside normal tracker view around line 351, and inside completion card around line 266).
       - Pass a new prop `excludeNames={plannedExercises.map(e => e.baseName)}` to both `<AccessoryBlock />` elements:
         `<AccessoryBlock excludeNames={plannedExercises.map(e => e.baseName)} />`

    3. MODIFY `gymlog-react/src/components/AccessoryBlock.jsx`:
       a. Update the component signature to accept the `excludeNames` prop (defaulting to an empty array `[]`):
          `export default function AccessoryBlock({ excludeNames = [] }) {`
       b. Update the random selection logic in both `handleAddAccessory` and `handleSwapAccessory` to filter out matching names:
          - Helper function:
            `const getBaseName = (n) => n.replace(/\s*\((Single|Alt|DB|Cable)\)/i, "").trim();`
          - Filtering logic:
            ```javascript
            const targetBase = getBaseName(ex.name).toLowerCase();
            
            // Check if already in today's planned exercises
            const notPlanned = !excludeNames.some(name => getBaseName(name).toLowerCase() === targetBase);
            
            // Check if already added to the bonus accessories list
            const notAlreadyAdded = !accessoriesList.some(item => getBaseName(item.baseName).toLowerCase() === targetBase);
            
            return isAcc && locMatch && notPlanned && notAlreadyAdded;
            ```
          - If the filtered list of available accessories is empty, fallback to ignoring the `notAlreadyAdded` constraint to prevent errors when the catalog pool is exhausted.

    4. AUDIT: Generate `/audit_log_R61.md` in the workspace root detailing duplicate prevention changes.
    5. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to verify compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
