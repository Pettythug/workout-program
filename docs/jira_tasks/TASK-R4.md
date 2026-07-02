# TASK-R4: Per-User PIN Protection

> **For Human Readers:** This task ensures that when a user logs a set under their specific name (e.g. "Brian" or "Danielle"), they must enter their unique personal PIN. This prevents users from accidentally (or intentionally) logging sets under someone else's profile.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: MULTI_FILE_FEATURE
    - REQUIRED_MODEL_TIER: HIGH_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R4`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Implement Per-User PIN Protection so that logging sets requires the user's personal PIN to validate identity on the backend.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files: `Combined_AppScript_v2.gs`, `gymlog-react/src/components/ExerciseCard.jsx`, `gymlog-react/src/components/CircuitView.jsx`, `gymlog-react/src/hooks/useGymAPI.js`
  </RESOURCES>
  <CONSTRAINTS>
    - Keep backend changes backward compatible if possible.
  </CONSTRAINTS>
  <SEQUENCE>
    1. READ: `Combined_AppScript_v2.gs` and identify `gymlog_handleLogSet()`.
    2. MODIFY: Update the backend to fetch a JSON dictionary of User PINs from `PropertiesService.getScriptProperties().getProperty('USER_PINS')` (e.g., `{"brian":"1234", "danielle":"5678"}`). Validate that the PIN provided in the payload matches the PIN assigned to the `person` the set is being logged for.
    3. MODIFY: Update `useGymAPI.js` to accept a `userPins` payload in the `logSet` function.
    4. MODIFY: Update `ExerciseCard.jsx` and `CircuitView.jsx` to prompt the user for their PIN before finalizing the `handleLogSet` action. 
    5. AUDIT: Generate `audit_log_R4.md` documenting the exact changes.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```

