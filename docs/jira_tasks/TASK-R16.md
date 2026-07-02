# TASK-R16: Implement Background Sync Status Indicator

> **For Human Readers:** This task extracts the navigation header into its own component and adds a live red/green status dot next to the "GymLog" title so you know exactly when the background API sync completes.

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
    - TARGET_BRANCH: `TASK-R16`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Add an `isSyncing` state to `AppContext` and build a `Header` component with a red/green status dot to indicate background data synchronization.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files: `gymlog-react/src/context/AppContext.jsx`, `gymlog-react/src/App.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Target files.
    2. MODIFY: In `AppContext.jsx`, introduce `const [isSyncing, setIsSyncing] = useState(true);`. Set it to `true` at the start of `loadInitialData` and `false` in the `finally` block of that function. Export `isSyncing` in the Provider value.
    3. CREATE: Create a new file `gymlog-react/src/components/Header.jsx`.
    4. MODIFY: Extract the `<div className="header">` block from `App.jsx` into `Header.jsx`. Use `useAppContext` to consume `isSyncing`. Add a small circular `span` next to the "GymLog" text that renders red (`#ff4d4d`) when `isSyncing` is true, and green (`#4CAF50`) when false. Add a subtle `boxShadow` glow matching the color.
    5. MODIFY: In `App.jsx`, replace the hardcoded header div with the new `<Header />` component. Make sure to import `Header`.
    6. AUDIT: Generate `audit_log_R16.md` documenting the changes.
    7. EXECUTE: Run `git push origin TASK-R16` to push the branch to the remote repository.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
