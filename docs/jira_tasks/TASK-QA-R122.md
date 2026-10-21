# TASK-QA-R122: Pre-Merge Quality Assurance for Offline "Dead-Zone" Sync Queue Flush & Retry Lifecycle

- **Target Role:** `QA_Engineer`
- **Authorized Model Tier:** `LOW_TIER` (`Gemini 3.8 Flash (Low)`, `Gemini 3.5 Flash (Medium)`, `Gemini 3.5 Flash (Low)`) or `MEDIUM_TIER` (`Gemini 3.8 Flash`, `Claude Sonnet 4.6 (Thinking)`)
- **Access Level:** `READ_ONLY_ACCESS` (No file modifications)

---

## 1. Scope & Verification Mandate
Verify the offline sync queue consumer, multi-trigger reconnect/retry lifecycle, and offline undo queue purging in `gymlog-react/src/context/AppContext.jsx`.

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
   - Verify items are read safely with `try/catch` from `gymlog_pending_sync_queue` and sent via `await sheetsPost(item)`.
   - Verify successful items are removed sequentially from the queue and persisted back to `localStorage`.
   - Verify errors halt iteration to preserve unsent queue items for the next retry.
   - Verify key is removed when queue is empty (`localStorage.removeItem('gymlog_pending_sync_queue')`).
2. **Orchestration with `loadData`:**
   - Verify `loadData` calls `await flushPendingSyncQueue()` *before* invoking `fetchInitData()`.
3. **Multi-Trigger Reconnect & Retry Lifecycle:**
   - **3-Second Buffer:** Verify `online` event listener debounces with a 3000ms `setTimeout` to allow phone DHCP/DNS negotiation before firing.
   - **Focus / Visibility:** Verify `visibilitychange` (when `visible`) and `focus` trigger `checkAndFlush()`.
   - **Zero-Network Idle State:** Verify that `checkAndFlush()` inspects `localStorage` first and executes **zero network calls** and **zero state changes** when the queue is empty.
   - **Cleanup:** Verify `onlineTimeoutId`, `retryInterval`, and event listeners are properly removed on unmount.
4. **Offline Undo & Deletion Queue Management:**
   - Verify `undoWorkoutSession` inspects `gymlog_pending_sync_queue` and purges matching session payloads so undone offline workouts are never uploaded when connection returns.
   - Verify `deleteSession` catches offline errors and buffers `{ action: 'deleteSession', id: sessionId }` into `gymlog_pending_sync_queue`.

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
