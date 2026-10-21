# TASK-R122: Offline "Dead-Zone" Workout Sync Queue Flush

- **Target Role:** `Sandbox_Developer`
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash`, `Claude Sonnet 4.6 (Thinking)`, `Gemini 3.5 Flash (High)`) or `HIGH_TIER`
- **Model Gatekeeper Check:** Verify your active model is in the Authorized Model Tier above before executing any file edits. If misaligned, halt and output the `Model Alignment Error` override.

## Overview
When a user completes a workout in a gym dead zone (poor or dropped cellular signal) and the Google Sheets `completeWorkoutBatch` request fails, `AppContext.jsx` catches the network error and saves the failed payload into `localStorage` under `gymlog_pending_sync_queue`.

However, **there is currently no consumer (`flushPendingSyncQueue`) anywhere in the codebase** that reads or replays `gymlog_pending_sync_queue` when network connectivity returns or when `loadData()` runs. As a result, on the next app reload or cloud sync, the user's offline workout completion and day progression are permanently overwritten by stale cloud data.

---

## Technical Specifications & Requirements

### 1. Implement `flushPendingSyncQueue()` in `AppContext.jsx`
1. Create an async helper `flushPendingSyncQueue` inside `AppContext.jsx` (using a `isFlushingQueueRef` lock to prevent concurrent flushes):
   - Read `const queue = JSON.parse(localStorage.getItem('gymlog_pending_sync_queue') || '[]')`.
   - If the queue is empty or `deviceOwner === 'Guest'`, return immediately.
   - Iterate through each queued item sequentially:
     - Each queued `item` is already a complete payload: `{ action: 'batchSyncSession', session, settings, sets, deletes }`.
     - Call `await sheetsPost(item)`.
     - If successful (resolves without error), remove the item from the queue and persist the updated queue to `localStorage.setItem('gymlog_pending_sync_queue', JSON.stringify(remaining))`.
     - If an error occurs during sending, break out of iteration to preserve remaining queue items for the next reconnect/retry attempt.
   - If the queue becomes empty, remove the key: `localStorage.removeItem('gymlog_pending_sync_queue')`.

### 2. Trigger Queue Flush Before Cloud Load & On Network Reconnect
1. **Before `loadData()`:**
   - At the start of `loadData(silent)` in `AppContext.jsx`, await `flushPendingSyncQueue()` *before* calling `fetchInitData()` so that any pending offline workouts are committed to Google Sheets before cloud state is pulled down.
2. **On Browser `online` Event:**
   - Register a `window.addEventListener('online', handleOnline)` listener inside a `useEffect` in `AppContext.jsx` that automatically triggers `flushPendingSyncQueue()` as soon as cellular/Wi-Fi connectivity returns. Clean up with `window.removeEventListener('online', handleOnline)`.

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
