# TASK-R32: Escalate Drive Scopes and Clean Up Apps Script

> **For Human Readers:** This task modifies `triggerDriveAuth()` to use a file-creation call (`DriveApp.createFile`) which forces Google to request the full write permission scope (`https://www.googleapis.com/auth/drive`). It also corrects the naming comment header to match the actual file name.

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
    - TARGET_BRANCH: `TASK-R32`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Escalate the triggerDriveAuth helper to use createFile, and correct the comment header.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files:
      - `Combined_AppScript_v2.gs`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Target file.

    2. MODIFY `Combined_AppScript_v2.gs`:
       - Change the header comment on line 2 from:
         `// Combined_AppScript_v3.gs`
         to:
         `// Combined_AppScript_v2.gs`
       - Update the `triggerDriveAuth` function at the bottom to call createFile:
         ```javascript
         function triggerDriveAuth() {
           // Force Google to detect and prompt for the full write permission scope:
           DriveApp.createFile("temp_auth_trigger.txt", "authorized");
         }
         ```

    3. AUDIT: Generate `audit_log_R32.md` detailing the changes.
    4. VERIFY: Run `npm run build` (via cmd /c) to confirm compilation succeeds.
    5. EXECUTE: Run `git push origin TASK-R32` to push the branch to the remote repository.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
