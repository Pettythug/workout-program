# Audit Log: TASK-R3

## Changes Implemented in `Combined_AppScript_v2.gs`:
1. **Removed `ADMIN_PIN` Fallback:**
   - Located the `ADMIN_PIN` constant initialization.
   - Removed the `|| '5050'` fallback value.
   - Added a hard requirement check: If `ADMIN_PIN` is missing from `PropertiesService`, the script now throws `Error("FATAL: ADMIN_PIN Script Property is not configured. Backend locked.")`.
2. **Increased Wait Lock Timeout:**
   - In `withLock()` handler, increased `lock.waitLock(10000)` to `lock.waitLock(30000)` to prevent concurrency timeouts during high traffic writes.
3. **Google Sheets Formula Injection Patch:**
   - Added a global helper function `sanitizeInput(str)` to strip leading formula characters (`=`, `+`, `-`, `@`).
   - In `gymlog_handleLogSet()`, wrapped the user-provided inputs `entry.reps`, `entry.weight`, and `entry.note` with `sanitizeInput()` prior to appending them to the spreadsheet.
