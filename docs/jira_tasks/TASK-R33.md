# TASK-R33: Purge Drive Authorization Helper from Codebase

> **For Human Readers:** This task deletes the temporary helper function `triggerDriveAuth()` from the bottom of the Apps Script codebase now that the account has been successfully authorized, ensuring clean and production-ready code.

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
    - TARGET_BRANCH: `TASK-R33`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Remove the triggerDriveAuth helper function from the bottom of Combined_AppScript_v2.gs.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files:
      - `Combined_AppScript_v2.gs`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Target file.

    2. MODIFY `Combined_AppScript_v2.gs`:
       - Locate and delete the `triggerDriveAuth()` function lines at the very bottom of the file:
         ```javascript
         function triggerDriveAuth() {
           // Force Google to detect and prompt for the full write permission scope:
           DriveApp.createFile("temp_auth_trigger.txt", "authorized");
         }
         ```

    3. AUDIT: Generate `audit_log_R33.md` documenting the cleanup.
    4. VERIFY: Run `npm run build` (via cmd /c) to confirm compilation remains intact.
    5. EXECUTE: Run `git push origin TASK-R33` to push the branch to the remote repository.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
