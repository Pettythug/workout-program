# TASK-R26: Collapsed Card Highlight and Header Badges

> **For Human Readers:** This task adds green `COMPLETED` and red `SKIPPED` text badges next to exercise names in the collapsed headers of both `ExerciseCard.jsx` and `CircuitCard.jsx`. It also fixes card opacity (keeping completed cards fully opaque) and adds a subtle green box-shadow to completed cards for rapid visual scanning.

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
    - TARGET_BRANCH: `TASK-R26`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Display completed/skipped badges next to exercise names when collapsed. Maintain full card opacity with a soft green glow for completed cards.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files:
      - `gymlog-react/src/components/ExerciseCard.jsx`
      - `gymlog-react/src/components/CircuitCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Both target files.

    2. MODIFY `gymlog-react/src/components/ExerciseCard.jsx`:
       - Locate the style object of the main container (approx lines 373-379) and replace it:
         **Before:**
         ```javascript
         style={{ 
             background: 'var(--surface)', 
             border: `1px solid ${isDone ? 'var(--success)' : isSkipped ? 'var(--skip)' : isOpen ? 'var(--accent)' : 'var(--border)'}`, 
             borderRadius: 12, 
             opacity: isDone || isSkipped ? 0.6 : 1,
             overflow: 'hidden',
             marginBottom: 16
         }}
         ```
         **After:**
         ```javascript
         style={{ 
             background: 'var(--surface)', 
             border: `1px solid ${isDone ? 'var(--success)' : isSkipped ? 'var(--skip)' : isOpen ? 'var(--accent)' : 'var(--border)'}`, 
             borderRadius: 12, 
             opacity: isSkipped ? 0.5 : 1,
             boxShadow: isDone ? '0 4px 20px rgba(34, 197, 94, 0.12)' : 'none',
             overflow: 'hidden',
             marginBottom: 16
         }}
         ```
       - Locate the exercise name rendering inside the header row (approx line 405) and replace it:
         **Before:**
         ```jsx
         <div style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>{ex.name}</div>
         ```
         **After:**
         ```jsx
         <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
             <div style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>{ex.name}</div>
             {isDone && (
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
             {isSkipped && (
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
       - Ensure that the search/info button `ℹ️` remains correctly inside this flex wrapper next to the badges.

    3. MODIFY `gymlog-react/src/components/CircuitCard.jsx`:
       - Replace the main container style object (approx lines 233-238):
         **Before:**
         ```javascript
         style={{ 
             background: 'var(--surface)', 
             border: `1px solid ${isDone ? 'var(--success)' : isSkipped ? 'var(--skip)' : isOpen ? 'var(--accent)' : 'var(--border)'}`, 
             borderRadius: 12, 
             opacity: isDone || isSkipped ? 0.6 : 1,
             overflow: 'hidden'
         }}
         ```
         **After:**
         ```javascript
         style={{ 
             background: 'var(--surface)', 
             border: `1px solid ${isDone ? 'var(--success)' : isSkipped ? 'var(--skip)' : isOpen ? 'var(--accent)' : 'var(--border)'}`, 
             borderRadius: 12, 
             opacity: isSkipped ? 0.5 : 1,
             boxShadow: isDone ? '0 4px 20px rgba(34, 197, 94, 0.12)' : 'none',
             overflow: 'hidden'
         }}
         ```
       - Locate the exercise name rendering inside the header row (approx line 256) and replace it with the identical flex container and badges layout:
         ```jsx
         <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
             <div style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>{ex.name}</div>
             {isDone && (
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
             {isSkipped && (
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
       - Ensure that the search/info button `ℹ️` remains correctly inside this flex wrapper next to the badges.

    4. AUDIT: Generate `audit_log_R26.md` documenting these styling additions.
    5. VERIFY: Run `npm run build` to confirm compilation is successful.
    6. EXECUTE: Run `git push origin TASK-R26` to push the branch to the remote repository.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
