# TASK-R24: Plan Lifecycle Separation and Global Reset Sync

> **For Human Readers:** This task separates the Plan lifecycle into "Complete Workout" (locks view, preserves checks) and "Start Next Workout" (clears checks, increments day). It also connects the Circuit completion state with the global checkmarks, automatically clears checkmarks on new Circuit start, and adds a manual reset to Settings.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: MULTI_FILE_ARCHITECTURE
    - REQUIRED_MODEL_TIER: MEDIUM_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R24`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Implement split Complete/Start Next workout logic in PlanView.jsx. Sync CircuitView status changes with global exerciseStatus. Add manual and auto-reset mechanisms.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files:
      - `gymlog-react/src/context/AppContext.jsx`
      - `gymlog-react/src/components/SettingsModal.jsx`
      - `gymlog-react/src/components/PlanView.jsx`
      - `gymlog-react/src/components/CircuitView.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ: All four target files.

    2. MODIFY `gymlog-react/src/context/AppContext.jsx`:
       - Add `clearAllExerciseStatus` inside the `AppProvider` component:
         ```javascript
         const clearAllExerciseStatus = () => {
             setExerciseStatus({});
             localStorage.setItem('gymlog_exerciseStatus', JSON.stringify({}));
         };
         ```
       - Export `clearAllExerciseStatus` in the `contextValue` object.

    3. MODIFY `gymlog-react/src/components/SettingsModal.jsx`:
       - Extract `clearAllExerciseStatus` from context.
       - Add the manual reset button to the settings UI panel, styled cleanly:
         ```jsx
         <button 
             className="btn-danger" 
             onClick={() => {
                 if (window.confirm("Are you sure you want to clear all completed/skipped checkmarks for today?")) {
                     clearAllExerciseStatus();
                     alert("Checkmarks cleared.");
                 }
             }}
             style={{ width: "100%", padding: 12, marginTop: 16 }}
         >
             ⚠️ RESET TODAY'S CHECKMARKS
         </button>
         ```

    4. MODIFY `gymlog-react/src/components/PlanView.jsx`:
       - Import `clearAllExerciseStatus` from context.
       - Initialize state `isWorkoutComplete` from `localStorage`:
         ```javascript
         const [isWorkoutComplete, setIsWorkoutComplete] = useState(() => {
             return localStorage.getItem('gymlog_plan_complete') === 'true';
         });
         ```
       - Refactor `completeWorkout` to only toggle the UI state:
         ```javascript
         const completeWorkout = () => {
             setIsWorkoutComplete(true);
             localStorage.setItem('gymlog_plan_complete', 'true');
         };
         ```
       - Implement the progression action `startNextWorkout`:
         ```javascript
         const startNextWorkout = () => {
             // 1. Increment rotations
             plannedExercises.forEach(ex => {
                 if (ex && ex.rotationKey) {
                     const currentIdx = parseInt(localStorage.getItem('gymlog_rotation_' + ex.rotationKey) || '0', 10);
                     localStorage.setItem('gymlog_rotation_' + ex.rotationKey, currentIdx + 1);
                 }
             });

             // 2. Clear global checkmarks
             clearAllExerciseStatus();

             // 3. Progress day and swap type
             const newType = workoutType === 'Push' ? 'Pull' : 'Push';
             setWorkoutType(newType);
             localStorage.setItem('gymlog_workoutType', newType);
             updateWorkoutDay(workoutDay + 1);

             // 4. Reset completion state
             setIsWorkoutComplete(false);
             localStorage.setItem('gymlog_plan_complete', 'false');
         };
         ```
       - Update rendering:
         - If `isWorkoutComplete` is `true`:
           - Show a message `"🎉 Workout Day Complete!"`.
           - Hide/disable normal logging controls, or show the list as read-only.
           - Display a large button: **"START NEXT WORKOUT"** that triggers `startNextWorkout()`.
         - If `isWorkoutComplete` is `false`:
           - Render the normal list with the **"COMPLETE WORKOUT"** button at the bottom.

    5. MODIFY `gymlog-react/src/components/CircuitView.jsx`:
       - Extract `setExerciseDone`, `setExerciseSkipped`, `resetExerciseStatus`, and `clearAllExerciseStatus` from context.
       - Update generators to clear global statuses:
         In `startFullBodyCircuit()`, `startHitEveryMachine()`, and `startMimicCircuit()`:
         - Invoke `clearAllExerciseStatus();` at the beginning.
       - Update status transitions:
         - In `handleExplicitDone(exName)`: call `setExerciseDone(exName);`.
         - In `handleSkip(exName)`: call `setExerciseSkipped(exName);`.
         - In `handleUndo(exName)`: call `resetExerciseStatus(exName);`.
         - In `handleDeleteSet(exName, setEntries)`:
           If all sets for this exercise today are deleted (i.e. `todaysEntries` length becomes 0), invoke `resetExerciseStatus(exName);`. (Note: Since `handleDeleteSet` deletes set entries from the local history state, check if `ex.history` for today has no sets left, then reset status).

    6. AUDIT: Generate `audit_log_R24.md` documenting these lifecycle updates.
    7. VERIFY: Run `npm run build` to confirm compilation is successful.
    8. EXECUTE: Run `git push origin TASK-R24` to push the branch to the remote repository.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
