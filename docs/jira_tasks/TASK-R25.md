# TASK-R25: Exercise Tutorial Search Link

> **For Human Readers:** This task adds a styled info icon (`ℹ️`) next to the exercise name in both `ExerciseCard.jsx` and `CircuitCard.jsx`. Clicking this icon opens a Google Search tab with tutorials/form instructions for the exercise.

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
    - TARGET_BRANCH: `TASK-R25`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Add a styled Google Search info link next to exercise names in ExerciseCard.jsx and CircuitCard.jsx. Stop click propagation.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files:
      - `gymlog-react/src/components/ExerciseCard.jsx`
      - `gymlog-react/src/components/CircuitCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Both target files.

    2. MODIFY `gymlog-react/src/components/ExerciseCard.jsx`:
       - Locate the line rendering the exercise name (approx line 405):
         ```jsx
         <div style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>{ex.name}</div>
         ```
       - Wrap this inside a flex container and append the search button:
         ```jsx
         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
             <div style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>{ex.name}</div>
             <button 
                 onClick={(e) => {
                     e.stopPropagation();
                     window.open(`https://www.google.com/search?q=${encodeURIComponent(ex.name + ' exercise tutorial')}`, '_blank');
                 }}
                 style={{
                     background: 'none',
                     border: 'none',
                     color: 'var(--accent)',
                     cursor: 'pointer',
                     fontSize: 14,
                     padding: '2px 6px',
                     borderRadius: 4,
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     opacity: 0.7,
                     transition: 'opacity 0.2s'
                 }}
                 onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                 onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
                 title="Search exercise info"
             >
                 ℹ️
             </button>
         </div>
         ```

    3. MODIFY `gymlog-react/src/components/CircuitCard.jsx`:
       - Locate the line rendering the exercise name (approx line 256):
         ```jsx
         <div style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>{ex.name}</div>
         ```
       - Wrap it in the identical layout containing the `ℹ️` button:
         ```jsx
         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
             <div style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>{ex.name}</div>
             <button 
                 onClick={(e) => {
                     e.stopPropagation();
                     window.open(`https://www.google.com/search?q=${encodeURIComponent(ex.name + ' exercise tutorial')}`, '_blank');
                 }}
                 style={{
                     background: 'none',
                     border: 'none',
                     color: 'var(--accent)',
                     cursor: 'pointer',
                     fontSize: 14,
                     padding: '2px 6px',
                     borderRadius: 4,
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     opacity: 0.7,
                     transition: 'opacity 0.2s'
                 }}
                 onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                 onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
                 title="Search exercise info"
             >
                 ℹ️
             </button>
         </div>
         ```

    4. AUDIT: Generate `audit_log_R25.md` documenting the additions.
    5. VERIFY: Run `npm run build` to confirm compilation is successful.
    6. EXECUTE: Run `git push origin TASK-R25` to push the branch to the remote repository.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
