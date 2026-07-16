# TASK-R70: Exercise Rotation Index Trace and Safe Guards

> **For Human Readers:** This task adds safety checks and debug audit logging to the rotation index parser in `PlanView.jsx` to trace and prevent issues with Pull day category rotation.

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
    - TARGET_BRANCH: `TASK-R70`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Integrate parse guards and verbose console logs into PlanView's pick and complete-workout sequence to verify rotation index state transitions.
  </OBJECTIVE>
  <RESOURCES>
    - Plan View: `gymlog-react/src/components/PlanView.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/PlanView.jsx`.

    2. MODIFY `gymlog-react/src/components/PlanView.jsx`:
       - Inside the `pick` function (approx L74):
         - Force checks on the index value returned from `localStorage` to guarantee it never returns `NaN` or a negative number:
           ```javascript
           let idxVal = parseInt(localStorage.getItem('gymlog_rotation_' + rotationKey) || '0', 10);
           if (isNaN(idxVal) || idxVal < 0) idxVal = 0;
           ```
         - Update the subset array selector to use `idxVal`:
           `const originalPick = subset[idxVal % subset.length];`
       - Inside the `startNextWorkout` function (approx L181):
         - Apply the same defensive parser guards.
         - Add a `console.log` statement so the user or QA agent can see the exact indices moving in their browser developer console when completing a workout:
           ```javascript
           plannedExercises.forEach(ex => {
               if (ex && ex.rotationKey) {
                   let currentIdx = parseInt(localStorage.getItem('gymlog_rotation_' + ex.rotationKey) || '0', 10);
                   if (isNaN(currentIdx) || currentIdx < 0) currentIdx = 0;
                   const nextIdx = currentIdx + 1;
                   localStorage.setItem('gymlog_rotation_' + ex.rotationKey, nextIdx.toString());
                   console.log(`[Rotation Audit] Incremented key: ${ex.rotationKey} | Old: ${currentIdx} | New: ${nextIdx}`);
               }
           });
           ```

    3. AUDIT: Generate `/audit_log_R70.md` detailing the rotation traces.
    4. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to verify compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
