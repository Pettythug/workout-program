# TASK-R30: Remove Custom API URL Settings & Auto-Clean Legacy Storage

> **For Human Readers:** This task simplifies the settings interface and eliminates browser storage corruption bugs by removing custom API URL configuration inputs from the Settings modal and injecting an auto-cleanup command on boot inside the AppContext loader.

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
    - TARGET_BRANCH: `TASK-R30`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Remove custom API URL inputs from SettingsModal.jsx and add auto-cleanup for gym_api_url in AppContext.jsx.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files:
      - `gymlog-react/src/components/SettingsModal.jsx`
      - `gymlog-react/src/context/AppContext.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Target files.

    2. MODIFY `gymlog-react/src/components/SettingsModal.jsx`:
       - Remove `const [apiUrl, setApiUrl] = useState(...)` from hooks.
       - Remove `const handleSaveApiUrl = () => { ... }` function.
       - Locate and completely remove the "API Configuration" block from the JSX layout (including the input field, the SAVE URL button, and its container).

    3. MODIFY `gymlog-react/src/context/AppContext.jsx`:
       - Inside the main loading `useEffect` (around line 60), add a cleanup line that purges any legacy `gym_api_url` variables from local storage:
         ```javascript
         useEffect(() => {
             // Auto-cleanup legacy custom URL overrides to ensure fallback to corrected built-in default
             if (localStorage.getItem('gym_api_url')) {
                 localStorage.removeItem('gym_api_url');
             }
             // ... rest of the existing code ...
         ```

    4. AUDIT: Generate `audit_log_R30.md` detailing the UI cleanup and auto-migration command.
    5. VERIFY: Run `npm run build` to confirm compilation is successful.
    6. EXECUTE: Run `git push origin TASK-R30` to push the branch to the remote repository.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
