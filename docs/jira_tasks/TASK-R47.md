# TASK-R47: Add Weight Tracking to Timed Exercises

> **For Human Readers:** We want to allow users to optionally track weight (e.g., a weighted vest or plates on back) for timed exercises like planks. The backend and history formatting logic already support weight for timed sets, so we just need to expose the weight input field in the UI for timed exercises.

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
    - TARGET_BRANCH: `TASK-R47`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Expose the optional weight input field for timed exercises in `ExerciseCard.jsx` and `CircuitCard.jsx`.
  </OBJECTIVE>
  <RESOURCES>
    - Card Component 1: `gymlog-react/src/components/ExerciseCard.jsx`
    - Card Component 2: `gymlog-react/src/components/CircuitCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/ExerciseCard.jsx` and `gymlog-react/src/components/CircuitCard.jsx`.

    2. MODIFY `gymlog-react/src/components/ExerciseCard.jsx`:
       - Locate the input rendering area inside `PersonLogSection` (around line 56):
         ```javascript
         {ex.timed ? (
             <input 
                 placeholder="secs" 
                 type="text"
                 inputMode="numeric"
                 pattern="[0-9]*"
                 value={input.duration || ""} 
                 onChange={e => updateLogInput(key, "duration", e.target.value)}
                 style={{ background: '#0c0c0c', border: '1px solid var(--accent)', borderRadius: 8, padding: 8, width: 80, color: 'white', textAlign: 'center', fontSize: 16, fontFamily: 'var(--mono)', outline: 'none' }}
             />
         )
         ```
       - Change it to render BOTH the duration input and the optional weight input when `ex.timed` is true:
         ```javascript
         {ex.timed ? (
             <>
                 <input 
                     placeholder="secs" 
                     type="text"
                     inputMode="numeric"
                     pattern="[0-9]*"
                     value={input.duration || ""} 
                     onChange={e => updateLogInput(key, "duration", e.target.value)}
                     style={{ background: '#0c0c0c', border: '1px solid var(--accent)', borderRadius: 8, padding: 8, width: 70, color: 'white', textAlign: 'center', fontSize: 16, fontFamily: 'var(--mono)', outline: 'none' }}
                 />
                 <input 
                     placeholder="lbs" 
                     type="text"
                     inputMode="decimal"
                     value={input.weight || ""} 
                     onChange={e => updateLogInput(key, "weight", e.target.value)}
                     style={{ background: '#0c0c0c', border: '1px solid var(--accent)', borderRadius: 8, padding: 8, width: 70, color: 'white', textAlign: 'center', fontSize: 16, fontFamily: 'var(--mono)', outline: 'none' }}
                 />
             </>
         )
         ```

    3. MODIFY `gymlog-react/src/components/CircuitCard.jsx`:
       - Perform the identical modification inside `PersonRow` (around line 54) to show both duration and weight inputs for timed exercises:
         ```javascript
         {ex.timed ? (
             <>
                 <input 
                     placeholder="secs" 
                     type="text"
                     inputMode="numeric"
                     pattern="[0-9]*"
                     value={input.duration || ""} 
                     onChange={e => updateInput(key, "duration", e.target.value)}
                     style={{ background: '#0c0c0c', border: '1px solid var(--accent)', borderRadius: 8, padding: 8, width: 70, color: 'white', textAlign: 'center', fontSize: 16, fontFamily: 'var(--mono)', outline: 'none' }}
                 />
                 <input 
                     placeholder="lbs" 
                     type="text"
                     inputMode="decimal"
                     value={input.weight || ""} 
                     onChange={e => updateInput(key, "weight", e.target.value)}
                     style={{ background: '#0c0c0c', border: '1px solid var(--accent)', borderRadius: 8, padding: 8, width: 70, color: 'white', textAlign: 'center', fontSize: 16, fontFamily: 'var(--mono)', outline: 'none' }}
                 />
             </>
         )
         ```

    4. AUDIT: Generate `audit_log_R47.md` detailing the addition of optional weight tracking for timed exercises.
    5. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to confirm compilation succeeds cleanly.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
