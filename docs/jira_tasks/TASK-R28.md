# TASK-R28: Add Undo Option for Plan Completion

> **For Human Readers:** This task adds a styled "UNDO COMPLETION" button to the congrats/day complete screen inside `PlanView.jsx`. When tapped, this button toggles `isWorkoutComplete` to false and resets the local storage flag back to false, allowing users to return to their logged workout details immediately if they clicked the completion button by accident.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: SINGLE_FILE_FEATURE
    - REQUIRED_MODEL_TIER: LOW_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R28`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Add an UNDO COMPLETION button to the congrats screen in PlanView.jsx to unlock the workout interface.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files:
      - `gymlog-react/src/components/PlanView.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Target file.

    2. MODIFY `gymlog-react/src/components/PlanView.jsx`:
       - Locate the `isWorkoutComplete` congrats view rendering (approx lines 299-310):
         ```jsx
         if (isWorkoutComplete) {
             return (
                 <div style={{ textAlign: 'center', padding: 40, color: 'var(--success)', background: '#111', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                     <div style={{ fontSize: 40 }}>🎉</div>
                     <h2 style={{ fontSize: 22, fontWeight: 'bold' }}>Workout Day Complete!</h2>
                     <p style={{ color: 'var(--muted)', fontSize: 13 }}>Great job finishing all exercises.</p>
                     <button className="btn-success" onClick={startNextWorkout} style={{ padding: '12px 24px', fontWeight: 'bold', fontSize: 14 }}>
                         START NEXT WORKOUT
                     </button>
                 </div>
             );
         }
         ```
       - Refactor this congrats wrapper to insert a nested flex button container containing the UNDO option:
         ```jsx
         if (isWorkoutComplete) {
             return (
                 <div style={{ textAlign: 'center', padding: 40, color: 'var(--success)', background: '#111', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                     <div style={{ fontSize: 40 }}>🎉</div>
                     <h2 style={{ fontSize: 22, fontWeight: 'bold' }}>Workout Day Complete!</h2>
                     <p style={{ color: 'var(--muted)', fontSize: 13 }}>Great job finishing all exercises.</p>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: '240px' }}>
                         <button className="btn-success" onClick={startNextWorkout} style={{ padding: '12px 24px', fontWeight: 'bold', fontSize: 14, width: '100%' }}>
                             START NEXT WORKOUT
                         </button>
                         <button className="btn-ghost" onClick={() => {
                             setIsWorkoutComplete(false);
                             localStorage.setItem('gymlog_plan_complete', 'false');
                         }} style={{ padding: '8px 16px', fontSize: 11, fontWeight: 'bold', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                             UNDO COMPLETION
                         </button>
                     </div>
                 </div>
             );
         }
         ```

    3. AUDIT: Generate `audit_log_R28.md` documenting this addition.
    4. VERIFY: Run `npm run build` to confirm compilation is successful.
    5. EXECUTE: Run `git push origin TASK-R28` to push the branch to the remote repository.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
