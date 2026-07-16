# TASK-R73: Accessory Logging History Sync and Timer Fixes

> **For Human Readers:** This task fixes the accessory exercise set counter sticking at "LOG SET 1" and the rest timer failing to trigger when logging accessory sets.

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
    - TARGET_BRANCH: `TASK-R73`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Resolve stale accessory references in PlanView by looking up the groups dynamically in groupedExercises.
    2. Pass the onLogSet handler through AccessoryBlock down to the nested ExerciseCard instances to trigger the rest timer.
  </OBJECTIVE>
  <RESOURCES>
    - Plan View: `gymlog-react/src/components/PlanView.jsx`
    - Accessory Block: `gymlog-react/src/components/AccessoryBlock.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ modified target files.

    2. MODIFY `gymlog-react/src/components/PlanView.jsx`:
       - Extract the exercise grouping logic from `plannedExercises` `useMemo` into a separate `groupedExercises` `useMemo` block that depends on `exercises`.
       - Simplify `plannedExercises` `useMemo` to read from the memoized `groupedExercises` object.
       - Create a new `resolvedAccessories` `useMemo` block that maps the stale `accessoriesList` objects to their fresh versions in `groupedExercises`:
         ```javascript
         const resolvedAccessories = useMemo(() => {
             if (!accessoriesList || !groupedExercises) return [];
             return accessoriesList.map(item => {
                 const baseName = item && item.baseName ? item.baseName : item;
                 if (!baseName) return null;
                 const baseKey = baseName.toLowerCase();
                 return groupedExercises[baseKey] || item;
             }).filter(Boolean);
         }, [groupedExercises, accessoriesList]);
         ```
       - Locate the two `<AccessoryBlock>` JSX render instances (approx L289 and L384).
       - Change the `accessoriesList={accessoriesList}` prop to `accessoriesList={resolvedAccessories}`.
       - Pass `onLogSet={handleLogSetSaved}` as a new prop to both `<AccessoryBlock>` instances.

    3. MODIFY `gymlog-react/src/components/AccessoryBlock.jsx`:
       - Update the `AccessoryBlock` component signature to accept `onLogSet` as a destructured prop.
       - Locate the rendered `<ExerciseCard group={acc} />` inside the mapping block (approx L122).
       - Pass the `onLogSet` prop down to the card:
         `<ExerciseCard group={acc} onLogSet={onLogSet} />`

    4. AUDIT: Generate `/audit_log_R73.md` detailing the state sync and timer fixes.
    5. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to verify compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
