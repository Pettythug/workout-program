# TASK-R62: Persist Bonus Accessories Session State

> **For Human Readers:** This task lifts and persists the `accessoriesList` state in `PlanView.jsx` and `localStorage` so that added bonus accessories are not lost when switching between the active card view, the full checklist view, or other navigation tabs during a workout session.

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
    Persist the active session's bonus accessories array to local storage to prevent state loss on tab/view changes.
  </OBJECTIVE>
  <RESOURCES>
    - Plan View: `gymlog-react/src/components/PlanView.jsx`
    - Accessory Block: `gymlog-react/src/components/AccessoryBlock.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ target files.

    2. MODIFY `gymlog-react/src/components/PlanView.jsx`:
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
       d. Pass `accessoriesList` and `setAccessoriesList` as props to both `<AccessoryBlock />` render instances:
          `<AccessoryBlock accessoriesList={accessoriesList} setAccessoriesList={setAccessoriesList} />`

    3. MODIFY `gymlog-react/src/components/AccessoryBlock.jsx`:
       a. Remove the local `useState` hook for `accessoriesList` (line 7).
       b. Accept `accessoriesList` and `setAccessoriesList` as component props:
          `export default function AccessoryBlock({ accessoriesList, setAccessoriesList }) {`

    4. AUDIT: Generate `/audit_log_R62.md` in the workspace root detailing state lifting and session persistence changes.
    5. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to verify compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
