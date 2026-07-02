# TASK-R15: Fix Optimistic UI State Wiping on API Load

> **For Human Readers:** This task fixes an annoying bug where if you start typing reps/weights immediately after loading the page, your typed numbers get wiped out a second later when the backend API finishes syncing.

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
    - TARGET_BRANCH: `TASK-R15`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Prevent `ExerciseCard.jsx` and `CircuitCard.jsx` from wiping out user input state when the `people` or `activePeople` context updates after a backend API sync.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files: `gymlog-react/src/components/ExerciseCard.jsx`, `gymlog-react/src/components/CircuitCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Target files.
    2. MODIFY: In `ExerciseCard.jsx`, update the `initLogInputs` function. Instead of completely overriding `setLogInputs(initial)`, use the functional state update to merge non-destructively:
       ```javascript
       const initLogInputs = () => {
           setLogInputs(prev => {
               const next = { ...prev };
               people.forEach(p => {
                   const key = p.toLowerCase();
                   if (!next[key]) {
                       next[key] = { reps: "", weight: "", duration: "", note: "" };
                   }
               });
               return next;
           });
       };
       ```
    3. MODIFY: In `CircuitCard.jsx`, add a `useEffect` to safely merge new people into the `inputs` state without wiping existing inputs when `activePeople` changes:
       ```javascript
       useEffect(() => {
           setInputs(prev => {
               const next = { ...prev };
               activePeople.forEach(p => {
                   const key = p.toLowerCase();
                   if (!next[key]) {
                       next[key] = { reps: "", weight: "", duration: "", note: "" };
                   }
               });
               return next;
           });
       }, [activePeople]);
       ```
    4. AUDIT: Generate `audit_log_R15.md` documenting the changes.
    5. EXECUTE: Run `git push origin TASK-R15` to push the branch to the remote repository.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
