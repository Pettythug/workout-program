# TASK-R60: Post-Completion Access and Multi-Accessory Workflows

> **For Human Readers:** This task adds a `📋 VIEW LIST` button to the `All Exercises Done!` completion card in `PlanView.jsx` to let users go back to their list, and updates `AccessoryBlock.jsx` to support adding and swapping *multiple* sequential accessory exercises when users want to do extra workout volume.

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
    - TARGET_BRANCH: `TASK-R60`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Enable view details/go-back link on workout completion cards, keep the AccessoryBlock visible, and refactor AccessoryBlock to handle multiple sequential accessory exercises.
  </OBJECTIVE>
  <RESOURCES>
    - Plan View: `gymlog-react/src/components/PlanView.jsx`
    - Accessory Block: `gymlog-react/src/components/AccessoryBlock.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ target files.

    2. MODIFY `gymlog-react/src/components/PlanView.jsx`:
       a. Locate the `activeIdx >= plannedExercises.length` completion block (around line 252).
       b. Render `<AccessoryBlock />` immediately below the completion container.
       c. Add a `📋 VIEW LIST` button next to `Complete Workout` inside the completion container that switches the view to `"full-list"` (`setView('full-list')`).

    3. MODIFY `gymlog-react/src/components/AccessoryBlock.jsx`:
       a. Replace the singular `selectedAccessory` state hook with an array state hook:
          `const [accessoriesList, setAccessoriesList] = useState([]);`
       b. Update `handleGenerate` to append the new group object to `accessoriesList`:
          ```javascript
          const handleAddAccessory = () => {
              if (!exercises) return;
              const accessories = exercises.filter(ex => {
                  const isAcc = ex.category && ex.category.toLowerCase().includes('accessory');
                  const locMatch = activeLocation === "all" || ex.location === "Anywhere" || !ex.location || ex.location === activeLocation;
                  return isAcc && locMatch;
              });
              if (accessories.length === 0) return;

              const randomIdx = Math.floor(Math.random() * accessories.length);
              const accessory = accessories[randomIdx];
              const group = {
                  baseName: accessory.name,
                  category: accessory.category,
                  variations: { "Standard": accessory }
              };
              setAccessoriesList(prev => [...prev, group]);
          };
          ```
       c. Implement `handleSwapAccessory(index)` to generate a random replacement and swap the accessory at the specified index in the state array.
       d. Render the UI:
          - If `accessoriesList.length === 0`, show the primary dashed button: `Got More in the Tank? +` (calling `handleAddAccessory`).
          - If `accessoriesList.length > 0`, map through `accessoriesList` and render an `ExerciseCard` for each one with a small `Swap Bonus` button below it.
          - Below the list, render a clean secondary button: `➕ ADD ANOTHER ACCESSORY` (or `Got More in the Tank? +`) to append additional cards.

    4. AUDIT: Generate `/audit_log_R60.md` detailing completion flow and multi-accessory list state updates.
    5. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to verify compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
