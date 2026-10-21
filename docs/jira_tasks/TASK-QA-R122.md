# TASK-QA-R122: Pre-Merge Quality Assurance for Offline "Dead-Zone" Sync Queue Flush

- **Target Role:** `QA_Engineer`
- **Authorized Model Tier:** `LOW_TIER` (`Gemini 3.8 Flash (Low)`, `Gemini 3.5 Flash (Medium)`, `Gemini 3.5 Flash (Low)`) or `MEDIUM_TIER` (`Gemini 3.8 Flash`, `Claude Sonnet 4.6 (Thinking)`)
- **Access Level:** `READ_ONLY_ACCESS` (No file modifications)

---

## 1. Scope & Verification Mandate
Verify the offline sync queue consumer implementation in `gymlog-react/src/context/AppContext.jsx`.

---

## 2. Automated Build Verification
Execute the production build command inside the `gymlog-react` directory:
```powershell
cmd /c npm run build
```
- **Pass Criteria:** Process exits cleanly with exit code 0 without syntax, JSX, or bundling errors.

---

## 3. Code Inspection Checklist
In `gymlog-react/src/context/AppContext.jsx`:
1. **`flushPendingSyncQueue` Logic:**
   - Verify `isFlushingQueueRef` lock prevents concurrent execution.
   - Verify items are read from `gymlog_pending_sync_queue` and sent via `sheetsPost(item)`.
   - Verify successful items are removed sequentially from the queue and persisted back to `localStorage`.
   - Verify errors halt iteration to preserve unsent queue items for the next retry.
   - Verify key is removed when queue is empty.
2. **Orchestration with `loadData`:**
   - Verify `loadData` calls `await flushPendingSyncQueue()` *before* invoking `fetchInitData()`.
3. **Browser `online` Listener:**
   - Verify a `window.addEventListener('online', handleOnline)` listener triggers `flushPendingSyncQueue()` on network reconnection and removes the listener on unmount.

---

## 4. Submission Protocol
Upon successful build and verification, output strictly the 4-line XML snippet below:
```xml
<AUDIT_SUBMISSION>
  <TASK_ID>TASK-QA-R122</TASK_ID>
  <ROLE>QA_Engineer</ROLE>
  <STATUS>QA_PREMERGE_PASS</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</AUDIT_SUBMISSION>
```
