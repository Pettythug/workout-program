# TASK-R34: Prevent Apps Script Overwriting Drive File IDs

> **For Human Readers:** This task corrects a legacy backend bug in `Combined_AppScript_v2.gs` where any File Reference that did not contain `.jpg` was automatically overwritten to `safeName.jpg`. This erroneously overrode valid alphanumeric Google Drive File IDs.

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
    - TARGET_BRANCH: `TASK-R34`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Prevent the backend from overwriting valid Google Drive File IDs in gymlog_doGet().
  </OBJECTIVE>
  <RESOURCES>
    - Target Files:
      - `Combined_AppScript_v2.gs`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Target file.

    2. MODIFY `Combined_AppScript_v2.gs`:
       - Locate the file reference assignment in `gymlog_doGet()` around line 268:
         ```javascript
         let fileRef = String(r[9] || "").trim();
         if (fileRef && !fileRef.includes('.jpg')) {
             fileRef = `${safeName}.jpg`;
         }
         ```
       - Update the conditional check so it preserves Google Drive File IDs (alphanumeric, no dots, length > 10) instead of overwriting them:
         ```javascript
         let fileRef = String(r[9] || "").trim();
         const isDriveId = fileRef && !fileRef.includes('.') && fileRef.length > 10;
         if (fileRef && !isDriveId && !fileRef.includes('.jpg')) {
             fileRef = `${safeName}.jpg`;
         }
         ```

    3. AUDIT: Generate `audit_log_R34.md` detailing the file reference override fix.
    4. VERIFY: Run `npm run build` (via cmd /c) to confirm compilation succeeds.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
