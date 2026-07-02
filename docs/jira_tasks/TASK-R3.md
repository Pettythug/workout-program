# TASK-R3: Formula Injection & Backend Hardening

> **For Human Readers:** This task secures the backend against Google Sheets formula injection attacks (e.g. typing `=FORMULA()` in an input field), increases the write-lock timeout to prevent concurrency crashes, and removes the legacy "5050" Admin PIN fallback from the server entirely.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: SINGLE_FILE_FEATURE
    - REQUIRED_MODEL_TIER: MEDIUM_TIER
    - ACTION_REQUIRED: If you are not running on a MEDIUM_TIER or HIGH_TIER model, immediately halt and prompt the user.
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R3`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Patch Google Sheets formula injection vulnerabilities and harden the Apps Script backend.
  </OBJECTIVE>
  <RESOURCES>
    - Target File: `Combined_AppScript_v2.gs`
  </RESOURCES>
  <CONSTRAINTS>
    - DO NOT modify the React frontend.
  </CONSTRAINTS>
  <SEQUENCE>
    1. READ: `Combined_AppScript_v2.gs`.
    2. MODIFY: Locate the `ADMIN_PIN` constant (around line 30). Remove the `|| '5050'` fallback. If `ADMIN_PIN` is missing from `PropertiesService`, throw an Error: `"FATAL: ADMIN_PIN Script Property is not configured. Backend locked."`
    3. MODIFY: Locate `lock.waitLock(10000)` inside `withLock()` and increase it to `30000` to prevent concurrency timeouts.
    4. MODIFY: Add a helper function `function sanitizeInput(str) { if (typeof str !== 'string') return str; return str.replace(/^[=+\-@]/, ''); }` globally.
    5. MODIFY: In `gymlog_handleLogSet()`, wrap `entry.reps`, `entry.weight`, and `entry.note` with `sanitizeInput()` before appending the row to the sheet.
    6. AUDIT: Generate `audit_log_R3.md` documenting the exact changes.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
