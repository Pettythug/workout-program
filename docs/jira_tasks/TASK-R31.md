# TASK-R31: Add Google Drive Authorization Trigger Helper to Apps Script

> **For Human Readers:** This task adds a temporary helper function `triggerDriveAuth()` to the bottom of the Apps Script code. This allows the user to run it once in their Apps Script console to authorize the DriveApp file-creation permissions required for image uploads.

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
    - TARGET_BRANCH: `TASK-R31`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Append the triggerDriveAuth helper function to the bottom of Combined_AppScript_v2.gs.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files:
      - `Combined_AppScript_v2.gs`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Target file.

    2. MODIFY `Combined_AppScript_v2.gs`:
       - Append the following function to the very end of the file:
         ```javascript
         function triggerDriveAuth() {
           DriveApp.getRootFolder();
         }
         ```

    3. AUDIT: Generate `audit_log_R31.md` detailing the added helper function.
    4. VERIFY: Run `npm run build` to confirm compilation remains intact.
    5. EXECUTE: Run `git push origin TASK-R31` to push the branch to the remote repository.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
