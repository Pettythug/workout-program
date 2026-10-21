# TASK-R122: Offline "Dead-Zone" Workout Sync Queue Flush & Auto-Retry Lifecycle

- **Target Role:** `Sandbox_Developer`
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash`, `Claude Sonnet 4.6 (Thinking)`, `Gemini 3.5 Flash (High)`) or `HIGH_TIER`
- **Model Gatekeeper Check:** Verify your active model is in the Authorized Model Tier above before executing any file edits. If misaligned, halt and output the `Model Alignment Error` override.

## Overview
When a user completes a workout in a gym dead zone (poor or dropped cellular signal) and the Google Sheets `completeWorkoutBatch` request fails, `AppContext.jsx` catches the network error and saves the failed payload into `localStorage` under `gymlog_pending_sync_queue`.

While initial loading (`loadData`) flushes this queue, real-world cellular/Wi-Fi reconnection requires a resilient trigger and retry lifecycle:
1. When cell signal or Wi-Fi reconnects (`online` event), phones take 2–3 seconds to establish DNS and routing (DHCP lag). Firing at millisecond 0 fails before the connection is established.
2. If the initial reconnect fails, there must be a gentle periodic retry loop and app-focus triggers so the workout automatically uploads when the user walks out of the gym or unlocks their phone in the parking lot.

---

## Technical Specifications & Requirements

### 1. Implement `flushPendingSyncQueue()` in `AppContext.jsx`
1. Maintain the async helper `flushPendingSyncQueue` inside `AppContext.jsx` (using a `isFlushingQueueRef` lock to prevent concurrent flushes):
   - Read `const queue = JSON.parse(localStorage.getItem('gymlog_pending_sync_queue') || '[]')`.
   - If the queue is empty or `deviceOwner === 'Guest'`, return immediately.
   - Iterate through each queued item sequentially:
     - Each queued `item` is already a complete payload: `{ action: 'batchSyncSession', session, settings, sets, deletes }`.
     - Call `await sheetsPost(item)`.
     - If successful (resolves without error), remove the item from the queue and persist the updated queue to `localStorage.setItem('gymlog_pending_sync_queue', JSON.stringify(remaining))`.
     - If an error occurs during sending, break out of iteration to preserve remaining queue items for the next reconnect/retry attempt.
   - If the queue becomes empty, remove the key: `localStorage.removeItem('gymlog_pending_sync_queue')`.

### 2. Multi-Trigger Reconnect & Retry Lifecycle in `AppContext.jsx`
Wire `flushPendingSyncQueue` into a resilient `useEffect` lifecycle with three complementary triggers:
1. **3-Second Reconnection Buffer on `online`:**
   - In `window.addEventListener('online')`: Do not fire at millisecond 0. Use `setTimeout(flushPendingSyncQueue, 3000)` so that cellular / Wi-Fi IP and DNS routing are fully established before dispatching HTTP requests. Clear timeout on unmount.
2. **Screen Unlock / Tab Focus Trigger (`visibilitychange` & `focus`):**
   - When the user unlocks their phone or switches back to the app (`document.addEventListener('visibilitychange')` when `document.visibilityState === 'visible'`, and `window.addEventListener('focus')`), check if `gymlog_pending_sync_queue` has items and trigger `flushPendingSyncQueue()`.
3. **Gentle 45-Second Retry Interval:**
   - Set an interval every 45 seconds (`45000ms`) that checks: if `localStorage.getItem('gymlog_pending_sync_queue')` has items and `navigator.onLine` is true, trigger `flushPendingSyncQueue()`. Clean up interval on unmount.
4. **Pre-Load Flush in `loadData()`:**
   - Continue awaiting `flushPendingSyncQueue()` at the start of `loadData()` before `fetchInitData()`.

---

## Target Files
- `gymlog-react/src/context/AppContext.jsx`

---

## Submission Protocol for Developer
1. Execute all edits strictly within `gymlog-react/src/*`.
2. Verify production build with `cmd /c npm run build`.
3. Respond in chat with strictly the 4-line XML snippet below:
```xml
<TASK_HANDOFF>
  <TASK_ID>TASK-R122</TASK_ID>
  <ROLE>Sandbox_Developer</ROLE>
  <STATUS>DEVELOPMENT_TASK_COMPLETE</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</TASK_HANDOFF>
```
