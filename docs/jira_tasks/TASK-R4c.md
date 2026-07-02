# TASK-R4c: Security Hotfix - PIN Validation Fail-Open Bug

> **For Human Readers:** This task patches a critical vulnerability where the backend silently accepted logs if the user's PIN was not configured in the cloud, rather than strictly rejecting them.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: SECURITY_AUDIT
    - REQUIRED_MODEL_TIER: HIGH_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R4c`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Patch the "Fail-Open" vulnerability in `gymlog_handleLogSet()` so that the server strictly rejects requests if a required PIN is undefined on the server.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files: `Combined_AppScript_v2.gs`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Target files.
    2. MODIFY: In `gymlog_handleLogSet()`, locate the `validPins` validation loop.
    3. MODIFY: Change the logic to explicitly ensure that a PIN exists in `validPins` for the requested user. If it does not exist, throw an Error (`"Unauthorized: No PIN configured on the server for [person]"`).
    4. MODIFY: If the PIN exists but does not match `userPins`, throw the existing invalid PIN Error.
    5. AUDIT: Generate `audit_log_R4c.md` documenting the exact changes.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
