# TASK-R53: Stored User PIN Reset and Invalid PIN Auto-Clear

> **For Human Readers:** If a user enters an incorrect PIN number, it gets cached in `localStorage` under `gymlog_pin_<name>`. Because it is cached, the app skips the prompt and continues submitting logs with the wrong PIN, deadlocking the user. This task adds: (1) a "CLEAR CACHED PINS" button in Settings, and (2) auto-clearing logic in `AppContext.jsx` that automatically deletes a cached PIN from `localStorage` if the server rejects it.

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
    - TARGET_BRANCH: `TASK-R53`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Provide manual settings controls and automatic backend error catches to reset/clear stored user PINs when a wrong PIN is typed.
  </OBJECTIVE>
  <RESOURCES>
    - App Context: `gymlog-react/src/context/AppContext.jsx`
    - Settings Component: `gymlog-react/src/components/SettingsModal.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ target files.

    2. MODIFY `gymlog-react/src/context/AppContext.jsx`:
       - Locate `logExerciseSet` (around line 460).
       - Wrap the `await logSet(...)` call in a `try/catch` block.
       - If it throws an error containing "Invalid PIN", parse the name or clear all active cached pins from `localStorage`:
         ```javascript
         try {
             await logSet(ex.name, entries, userPins);
         } catch (err) {
             if (err.message && err.message.toLowerCase().includes("invalid pin")) {
                 // Clean up stored localStorage keys to force re-prompt
                 activePeople.forEach(p => {
                     localStorage.removeItem('gymlog_pin_' + p.toLowerCase());
                 });
             }
             throw err;
         }
         ```

    3. MODIFY `gymlog-react/src/components/SettingsModal.jsx`:
       - Locate the footer reset button container (around line 300).
       - Replace the single `RESET TODAY'S CHECKMARKS` button with a flex container holding both the reset button and a new `🔑 CLEAR CACHED PINS` button:
         ```jsx
         <div style={{ marginBottom: 24, borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', gap: 12 }}>
             <button 
                 className="btn-danger" 
                 onClick={() => {
                     if (window.confirm("Are you sure you want to clear all completed/skipped checkmarks for today?")) {
                         clearAllExerciseStatus();
                         alert("Checkmarks cleared.");
                     }
                 }}
                 style={{ flex: 1, padding: 12 }}
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
                 style={{ flex: 1, padding: 12, border: '1px solid var(--border)', color: 'white' }}
             >
                 🔑 CLEAR CACHED PINS
             </button>
         </div>
         ```

    4. AUDIT: Generate `audit_log_R53.md` detailing the PIN reset/clearing implementation.
    5. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to confirm compilation succeeds cleanly.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
