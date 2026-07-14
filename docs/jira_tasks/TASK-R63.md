# TASK-R63: Preserve Accessories on Accidental Workout Completion

> **For Human Readers:** This task prevents the deletion of bonus accessories when clicking "Complete Workout" by delaying the accessories list cleanup until the user officially starts the next workout.

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
    - TARGET_BRANCH: `TASK-R63`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Move accessoriesList state cleanup from completeWorkout() to startNextWorkout() in PlanView.jsx.
  </OBJECTIVE>
  <RESOURCES>
    - Plan View: `gymlog-react/src/components/PlanView.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/PlanView.jsx`.

    2. MODIFY `gymlog-react/src/components/PlanView.jsx`:
       a. Locate `completeWorkout` (around line 169):
          - Remove the state clearing and local storage removal lines:
            ```javascript
            localStorage.removeItem('gymlog_session_accessories');
            setAccessoriesList([]);
            ```
          - The function should only manage completion flags:
            ```javascript
            const completeWorkout = () => {
                setIsWorkoutComplete(true);
                localStorage.setItem('gymlog_plan_complete', 'true');
            };
            ```
       b. Locate `startNextWorkout` (around line 176):
          - Add the state clearing and local storage removal lines so cleanup happens only when transitioning to the next session:
            ```javascript
            localStorage.removeItem('gymlog_session_accessories');
            setAccessoriesList([]);
            ```

    3. AUDIT: Generate `/audit_log_R63.md` in the workspace root detailing completion lifecycle updates.
    4. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to verify compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
