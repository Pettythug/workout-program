# TASK-R43: Add Undo/Back Button on Circuit Complete Screen

> **For Human Readers:** When the last card in a circuit is completed or skipped, the app directly switches to a "Circuit Complete" screen. Currently, there is no quick way to undo a accidental last-card submission from this view. This task adds an "Undo Last Action" button on the completion screen.

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
    Add a button on the Circuit Complete screen in CircuitView.jsx to undo the last marked exercise.
  </OBJECTIVE>
  <RESOURCES>
    - Frontend: `gymlog-react/src/components/CircuitView.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/CircuitView.jsx`.

    2. MODIFY `gymlog-react/src/components/CircuitView.jsx`:
       - Inside the `activeIdx >= circuit.length` conditional block (around line 513):
         ```jsx
         if (activeIdx >= circuit.length) {
             return (
                 <div style={{ textAlign: 'center', padding: 40, color: 'var(--success)' }}>
                     <h2>🎉 Circuit Complete!</h2>
                     <p>Great job finishing the workout.</p>
                     <button className="btn-success" onClick={endCircuit} style={{ marginTop: 20, padding: 12 }}>Finish</button>
                 </div>
             );
         }
         ```
       - Add an "Undo Last Submission" button under the Finish button:
         ```jsx
         if (activeIdx >= circuit.length) {
             const lastExName = circuit[circuit.length - 1]?.name;
             return (
                 <div style={{ textAlign: 'center', padding: 40, color: 'var(--success)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                     <h2>🎉 Circuit Complete!</h2>
                     <p>Great job finishing the workout.</p>
                     <button className="btn-success" onClick={endCircuit} style={{ marginTop: 20, padding: 12, width: '200px' }}>Finish</button>
                     {lastExName && (
                         <button 
                             className="btn-ghost" 
                             onClick={() => handleUndo(lastExName)} 
                             style={{ border: '1px solid var(--border)', padding: 12, width: '200px', color: 'white', fontSize: 13 }}
                         >
                             &larr; Undo Last Submission
                         </button>
                     )}
                 </div>
             );
         }
         ```

    3. AUDIT: Generate `audit_log_R43.md` detailing the undo option addition.
    4. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to confirm compilation succeeds cleanly.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
