# Audit Log: TASK-R12

## Changes Made
- Modified the `withLock` function in `Combined_AppScript_v2.gs`.
- Separated lock acquisition and handler execution into two distinct `try/catch` blocks.
- If lock acquisition fails, it correctly returns `"Server is busy due to concurrent writes. Please try again."`
- If handler execution fails (e.g., unauthorized PIN), it now correctly returns the actual error message (`e.message`) instead of masking it.

## Files Modified
- `Combined_AppScript_v2.gs`
