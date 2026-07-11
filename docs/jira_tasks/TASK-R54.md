# TASK-R54: Stack Settings Reset Buttons Vertically

> **For Human Readers:** The "RESET CHECKMARKS" and "CLEAR CACHED PINS" buttons inside the Settings Modal are currently placed side-by-side, causing horizontal overflow and a scrollbar on standard modal widths. This task changes the flex direction to vertical (`column`) so that they stack neatly at full width.

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
    - TARGET_BRANCH: `TASK-R54`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Align and stack the reset buttons vertically in the Settings modal to prevent horizontal scrollbars and text truncation.
  </OBJECTIVE>
  <RESOURCES>
    - Settings Component: `gymlog-react/src/components/SettingsModal.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/SettingsModal.jsx`.

    2. MODIFY `gymlog-react/src/components/SettingsModal.jsx`:
       - Locate the button container (around line 300).
       - Modify the container style to use `flexDirection: 'column'` and ensure both buttons take `width: '100%'` (or remove `flex: 1` and let them scale):
         ```jsx
         <div style={{ marginBottom: 24, borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
             <button 
                 className="btn-danger" 
                 onClick={() => {
                     if (window.confirm("Are you sure you want to clear all completed/skipped checkmarks for today?")) {
                         clearAllExerciseStatus();
                         alert("Checkmarks cleared.");
                     }
                 }}
                 style={{ width: "100%", padding: 12 }}
             >
                 ⚠️ RESET CHECKMARKS
             </button>
             <button 
                 className="btn-ghost btn-no-translate" 
                 onClick={() => {
                     if (window.confirm("Are you sure you want to clear your stored PIN numbers from this device? You will be prompted to enter them again next time you log a set.")) {
                         Object.keys(localStorage).forEach(key => {
                             if (key.startsWith('gymlog_pin_')) {
                                 localStorage.removeItem(key);
                             }
                         });
                         alert("Stored PINs cleared from device.");
                     }
                 }}
                 style={{ width: "100%", padding: 12, border: '1px solid var(--border)', color: 'white' }}
             >
                 🔑 CLEAR CACHED PINS
             </button>
         </div>
         ```

    3. AUDIT: Generate `audit_log_R54.md` detailing the alignment fix.
    4. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to confirm compilation succeeds cleanly.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
