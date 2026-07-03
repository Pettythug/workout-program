# TASK-R27: Fix Input Glitches and Group-Level Highlights

> **For Human Readers:** This task replaces the reps/lbs inputs inside both `ExerciseCard` and `CircuitCard` with text inputs, setting their `inputMode` and applying regex validation to prevent values from glitching on rapid inputs during sync. It also updates the `ExerciseCard` border and header badges to evaluate status at the group level (across all variations like Standard, Singles, and Alt) so that completed exercises highlight correctly inside the Lift view directory list.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: MULTI_FILE_ARCHITECTURE
    - REQUIRED_MODEL_TIER: LOW_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R27`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Switch number inputs to text inputs with inputMode and regex sanitization. Implement group-level completion outlines and badges on ExerciseCard.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files:
      - `gymlog-react/src/components/ExerciseCard.jsx`
      - `gymlog-react/src/components/CircuitCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Both target files.

    2. MODIFY `gymlog-react/src/components/ExerciseCard.jsx`:
       
       - Locate the `updateLogInput` state updater helper. Refactor it to perform input sanitization:
         ```javascript
         const updateLogInput = (personKey, field, value) => {
             setLogInputs(prev => {
                 const next = { ...prev };
                 if (!next[personKey]) {
                     next[personKey] = { reps: "", weight: "", duration: "", note: "" };
                 }
                 let sanitizedValue = value;
                 if (field === 'reps') {
                     sanitizedValue = value.replace(/[^0-9]/g, ''); // Digits only
                 } else if (field === 'weight') {
                     sanitizedValue = value.replace(/[^0-9.]/g, ''); // Digits and decimal points
                     const parts = sanitizedValue.split('.');
                     if (parts.length > 2) {
                         sanitizedValue = parts[0] + '.' + parts.slice(1).join('');
                     }
                 }
                 next[personKey] = { ...next[personKey], [field]: sanitizedValue };
                 return next;
             });
         };
         ```

       - Locate where `isDone` and `isSkipped` are defined. Define `isGroupDone` and `isGroupSkipped` right below them using `useMemo`:
         ```javascript
         const hasVariations = Object.keys(variations).length > 1;
         const isDone = exerciseStatus[ex.name] === 'done';
         const isSkipped = exerciseStatus[ex.name] === 'skipped';

         const isGroupDone = useMemo(() => {
             return Object.values(variations).some(v => exerciseStatus[v.name] === 'done');
         }, [variations, exerciseStatus]);

         const isGroupSkipped = useMemo(() => {
             return Object.values(variations).some(v => exerciseStatus[v.name] === 'skipped');
         }, [variations, exerciseStatus]);
         ```

       - Inside the `PersonLogSection` subcomponent (near the top of the file), locate the `reps` and `lbs` input elements and switch them from `type="number"` to `type="text"` with `inputMode`:
         ```jsx
         <input 
             placeholder="reps" 
             type="text"
             inputMode="numeric"
             pattern="[0-9]*"
             value={input.reps || ""} 
             onChange={e => updateLogInput(key, "reps", e.target.value)}
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
         ```

       - Replace the root container's style object to evaluate the group-level hooks `isGroupDone` and `isGroupSkipped`:
         ```javascript
         style={{ 
             background: '#111', 
             border: `1px solid ${isGroupDone ? 'var(--success)' : isGroupSkipped ? 'var(--skip)' : isOpen ? 'var(--accent)' : 'var(--border)'}`, 
             borderRadius: 12, 
             opacity: isGroupSkipped && !isGroupDone ? 0.5 : 1,
             boxShadow: isGroupDone ? '0 4px 20px rgba(34, 197, 94, 0.12)' : 'none',
             overflow: 'hidden',
             marginBottom: 16
         }}
         ```

       - Replace the header badges layout to render badges based on `isGroupDone` and `isGroupSkipped`:
         ```jsx
         <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
             <div style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>{ex.name}</div>
             {isGroupDone && (
                 <span style={{ 
                     background: 'rgba(34, 197, 94, 0.15)', 
                     color: 'var(--success)', 
                     fontSize: 9, 
                     fontWeight: 800, 
                     padding: '2px 6px', 
                     borderRadius: 4, 
                     letterSpacing: 0.5 
                 }}>COMPLETED</span>
             )}
             {(isGroupSkipped && !isGroupDone) && (
                 <span style={{ 
                     background: 'rgba(239, 68, 68, 0.15)', 
                     color: 'var(--skip)', 
                     fontSize: 9, 
                     fontWeight: 800, 
                     padding: '2px 6px', 
                     borderRadius: 4, 
                     letterSpacing: 0.5 
                 }}>SKIPPED</span>
             )}
         </div>
         ```

    3. MODIFY `gymlog-react/src/components/CircuitCard.jsx`:

       - Locate the `updateInput` helper. Refactor it to perform input sanitization:
         ```javascript
         const updateInput = (personKey, field, value) => {
             setInputs(prev => {
                 let sanitizedValue = value;
                 if (field === 'reps') {
                     sanitizedValue = value.replace(/[^0-9]/g, '');
                 } else if (field === 'weight') {
                     sanitizedValue = value.replace(/[^0-9.]/g, '');
                     const parts = sanitizedValue.split('.');
                     if (parts.length > 2) {
                         sanitizedValue = parts[0] + '.' + parts.slice(1).join('');
                     }
                 }
                 return {
                     ...prev,
                     [personKey]: { ...prev[personKey], [field]: sanitizedValue }
                 };
             });
         };
         ```

       - Locate the `reps` and `lbs` input elements and replace them with standard text inputs with appropriate `inputMode` keypads:
         ```jsx
         <input 
             placeholder="reps" 
             type="text"
             inputMode="numeric"
             pattern="[0-9]*"
             value={input.reps || ""} 
             onChange={e => updateInput(key, "reps", e.target.value)}
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
         ```

    4. AUDIT: Generate `audit_log_R27.md` documenting these structural input and state fixes.
    5. VERIFY: Run `npm run build` to confirm compilation is successful.
    6. EXECUTE: Run `git push origin TASK-R27` to push the branch to the remote repository.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
