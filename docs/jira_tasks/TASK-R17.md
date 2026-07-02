# TASK-R17: Update API URL

> **For Human Readers:** This task updates the hardcoded fallback API URL in the frontend so it points to the newly generated, uncorrupted Google Apps Script deployment.

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
    - TARGET_BRANCH: `TASK-R17`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Update the `DEFAULT_URL` constant in `useGymAPI.js` to the new deployment URL.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files: `gymlog-react/src/hooks/useGymAPI.js`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Target file.
    2. MODIFY: In `useGymAPI.js`, locate `const DEFAULT_URL = ...` (around line 4).
    3. REPLACE the string value with: `"https://script.google.com/macros/s/AKfycbwdz0gQXlt9-Gu7D-561vhMAiVxx6DjXssnPZp5SQdGvJpJbqnuhkFJiPsysajOAFvINQ/exec"`
    4. AUDIT: Generate `audit_log_R17.md` documenting the change.
    5. EXECUTE: Run `git push origin TASK-R17` to push the branch to the remote repository.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
