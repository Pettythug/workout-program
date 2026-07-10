# TASK-R44: Remove Exercises from Circuit Generator Inline in Circuit View

> **For Human Readers:** If a machine is broken or unusable, there is no way to remove it from the active circuit or circuit eligibility without going back to the Lift tab. This task adds a "Remove" button inside the `CircuitCard` which marks the exercise as not circuit eligible in the database and filters it out of the current circuit locally.

> **STATUS: BACKLOG — Not yet scheduled for execution.**

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
  <OBJECTIVE>
    Add a REMOVE button in CircuitCard.jsx that sets `isCircuit = false` in the database and removes the exercise from the active circuit.
  </OBJECTIVE>
  <RESOURCES>
    - Frontend:
      - `gymlog-react/src/components/CircuitCard.jsx`
      - `gymlog-react/src/components/CircuitView.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ target files.

    2. MODIFY `gymlog-react/src/components/CircuitCard.jsx`:
       - Add `onRemove` callback prop to `CircuitCard`.
       - Inside the button footer (around line 445), add a REMOVE button:
         ```jsx
         <button 
             onClick={handleRemoveClick}
             className="btn-ghost btn-no-translate"
             style={{ flex: 1, minWidth: '75px', padding: '10px 4px', fontSize: 11, color: 'var(--skip)', borderColor: 'var(--skip)' }}
         >
             ❌ REMOVE
         </button>
         ```
       - Implement the click handler:
         ```javascript
         const handleRemoveClick = async () => {
             if (window.confirm(`Are you sure you want to remove "${ex.name}" from the Circuit Generator permanently?`)) {
                 try {
                     await onRemove(ex.name);
                 } catch (err) {
                     alert("Failed to remove exercise from circuit: " + err.message);
                 }
             }
         };
         ```

    3. MODIFY `gymlog-react/src/components/CircuitView.jsx`:
       - Add a handler `handleRemoveExerciseFromCircuit(exName)`:
         ```javascript
         const handleRemoveExerciseFromCircuit = async (exName) => {
             const exObj = exercises.find(e => e.name === exName);
             if (!exObj) return;
             
             // 1. Save metadata to Sheets (setting isCircuit to false)
             const pin = window.prompt("Admin PIN required to modify exercise metadata:");
             if (pin === null) return;
             
             await sheetsPost({
                 action: "saveExercise",
                 exercise: exObj.name,
                 timed: exObj.timed,
                 category: exObj.category,
                 location: exObj.location,
                 isCircuit: false,
                 pin: pin
             });
             
             // 2. Update local state
             setCircuit(prev => prev.filter(e => e.name !== exName));
             updateExerciseInLocalState(exName, { isCircuit: false });
         };
         ```
       - Pass `handleRemoveExerciseFromCircuit` to `CircuitCard` as `onRemove` prop (inside the card generator mapping, around line 541).

    4. AUDIT: Generate `audit_log_R44.md` detailing the inline exercise removal implementation.
    5. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to confirm compilation succeeds cleanly.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
