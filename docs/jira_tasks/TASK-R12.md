# TASK-R12: Fix Backend Error Masking in withLock

> **For Human Readers:** This task fixes a critical bug in the Apps Script backend where legitimate validation errors (like invalid PINs) were being swallowed by a global try/catch block and incorrectly reported as "Server is busy".

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    <AUTHORIZATION>ALLOW_WRITE</AUTHORIZATION>
    <SCOPE>Combined_AppScript_v2.gs</SCOPE>
  </GATEKEEPER>
</TASK_EXECUTION_PROTOCOL>
```

## Objective
The `withLock` wrapper function in `Combined_AppScript_v2.gs` currently wraps both the lock acquisition (`lock.waitLock()`) and the route handler (`handler(payload)`) inside a single `try/catch` block. If `handler(payload)` throws an error (e.g., `Unauthorized: Invalid PIN`), it is incorrectly caught and masked by the error message `"Server is busy due to concurrent writes."`.

We need to split the `try/catch` logic so that lock failures return the busy message, but handler failures return their actual error messages.

## Execution Steps

1. Open `Combined_AppScript_v2.gs`.
2. Locate the `withLock` function near line 62.
3. Replace the entire `withLock` function with the following isolated error handling logic:

```javascript
function withLock(handler, payload) {
  const lock = LockService.getScriptLock();
  
  // 1. Attempt to acquire lock
  try {
    lock.waitLock(30000); // Wait up to 30 seconds for the lock
  } catch (e) {
    return err("Server is busy due to concurrent writes. Please try again.");
  }

  // 2. Execute handler and release lock safely
  try {
    return handler(payload);
  } catch (e) {
    return err(e.message);
  } finally {
    lock.releaseLock();
  }
}
```

4. Do NOT modify any other files.
5. Create an audit log artifact named `audit_log_R12.md` documenting the change.
