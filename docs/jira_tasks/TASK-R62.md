# TASK-R62: Persist Bonus Accessories Session State and Defensive Prop Fallback

> **For Human Readers:** This task lifts and persists the `accessoriesList` state in `PlanView.jsx` and adds defensive prop default parameters to `AccessoryBlock.jsx` to resolve the runtime render crash and prevent state loss.

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
    - TARGET_BRANCH: `TASK-R62`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Lift accessories state to PlanView.jsx and add defensive default parameters in AccessoryBlock.jsx to resolve the TypeError crash.
  </OBJECTIVE>
  <RESOURCES>
    - Plan View: `gymlog-react/src/components/PlanView.jsx`
    - Accessory Block: `gymlog-react/src/components/AccessoryBlock.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ target files.

    2. MODIFY `gymlog-react/src/components/AccessoryBlock.jsx`:
       - Add a defensive default parameter to `accessoriesList` in the component signature to prevent runtime TypeError if props are not passed:
         `export default function AccessoryBlock({ excludeNames = [], accessoriesList = [], setAccessoriesList }) {`

    3. MODIFY `gymlog-react/src/components/PlanView.jsx`:
       a. Lift the state from `AccessoryBlock`. Retrieve/initialize `accessoriesList` from `localStorage` using a lazy initializer state hook:
          ```javascript
          const [accessoriesList, setAccessoriesList] = useState(() => {
              try {
                  const saved = localStorage.getItem('gymlog_session_accessories');
                  return saved ? JSON.parse(saved) : [];
              } catch (e) {
                  return [];
              }
          });
          ```
       b. Use an `useEffect` hook to write updates of `accessoriesList` to local storage:
          ```javascript
          useEffect(() => {
              localStorage.setItem('gymlog_session_accessories', JSON.stringify(accessoriesList));
          }, [accessoriesList]);
          ```
       c. Clear the session accessories from `localStorage` and reset the state when the workout officially completes:
          - Locate the `completeWorkout` function (around line 150).
          - Add:
            ```javascript
            localStorage.removeItem('gymlog_session_accessories');
            setAccessoriesList([]);
            ```
       d. Pass `accessoriesList`, `setAccessoriesList`, and `excludeNames` props to both `<AccessoryBlock />` render instances (lines 266 and 351):
          `<AccessoryBlock excludeNames={plannedExercises.map(e => e.baseName)} accessoriesList={accessoriesList} setAccessoriesList={setAccessoriesList} />`

    4. AUDIT: Generate `/audit_log_R62.md` in the workspace root detailing changes.
    5. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to verify compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
