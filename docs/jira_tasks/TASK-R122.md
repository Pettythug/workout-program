# TASK-R122: Offline "Dead-Zone" Workout Sync Queue Flush & Auto-Retry Lifecycle

- **Target Role:** `Sandbox_Developer`
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash`, `Claude Sonnet 4.6 (Thinking)`, `Gemini 3.5 Flash (High)`) or `HIGH_TIER`
- **Model Gatekeeper Check:** Verify your active model is in the Authorized Model Tier above before executing any file edits. If misaligned, halt and output the `Model Alignment Error` override.

## Overview
When a user completes a workout in a gym dead zone (poor or dropped cellular signal) and the Google Sheets `completeWorkoutBatch` request fails, `AppContext.jsx` catches the network error and saves the failed payload into `localStorage` under `gymlog_pending_sync_queue`.

If a user hits **Undo Completion** while offline, the app previously left the failed completion payload inside `gymlog_pending_sync_queue`. When cellular/Wi-Fi signal returned later, `flushPendingSyncQueue` replayed that queue and uploaded the undone workout, resulting in phantom or duplicate sessions in Google Sheets (e.g. Day 2 and Day 3 both appearing with identical start times).

---

## Technical Specifications & Requirements

### 1. Implement `flushPendingSyncQueue()` in `AppContext.jsx`
1. Maintain the async helper `flushPendingSyncQueue` inside `AppContext.jsx` (using a `isFlushingQueueRef` lock to prevent concurrent flushes):
   - Read `const queue = JSON.parse(localStorage.getItem('gymlog_pending_sync_queue') || '[]')`.
   - If the queue is empty or `deviceOwner === 'Guest'`, return immediately.
   - Iterate through each queued item sequentially:
     - Each queued `item` can be `{ action: 'batchSyncSession', session, settings, sets, deletes }` or `{ action: 'deleteSession', id }`.
     - Call `await sheetsPost(item)`.
     - If successful (resolves without error), remove the item from the queue and persist the updated queue to `localStorage.setItem('gymlog_pending_sync_queue', JSON.stringify(remaining))`.
     - If an error occurs during sending, break out of iteration to preserve remaining queue items for the next reconnect/retry attempt.
   - If the queue becomes empty, remove the key: `localStorage.removeItem('gymlog_pending_sync_queue')`.

### 2. Multi-Trigger Reconnect & Retry Lifecycle in `AppContext.jsx`
1. **3-Second Reconnection Buffer on `online`:**
   - In `window.addEventListener('online')`: Wait 3 seconds (`setTimeout(flushPendingSyncQueue, 3000)`) so that cellular / Wi-Fi IP and DNS routing are fully established before dispatching HTTP requests. Clear timeout on unmount.
2. **Screen Unlock / Tab Focus Trigger (`visibilitychange` & `focus`):**
   - When the user unlocks their phone or switches back to the app (`visibilitychange` when `visible` and `focus`), check if `gymlog_pending_sync_queue` has items and trigger `flushPendingSyncQueue()`.
3. **Gentle 45-Second Retry Interval:**
   - Set an interval every 45 seconds (`45000ms`) that checks: if `localStorage.getItem('gymlog_pending_sync_queue')` has items and `navigator.onLine` is true, trigger `flushPendingSyncQueue()`. Clean up interval on unmount.
4. **Pre-Load Flush in `loadData()`:**
   - Await `flushPendingSyncQueue()` at the start of `loadData()` before `fetchInitData()`.

### 3. Purge Undone Workouts from Offline Queue (`undoWorkoutSession` in `AppContext.jsx`)
In `undoWorkoutSession`:
1. When rolling back a workout, inspect `gymlog_pending_sync_queue` in `localStorage`:
   ```javascript
   try {
       const rawQueue = localStorage.getItem('gymlog_pending_sync_queue');
       if (rawQueue) {
           const parsedQueue = JSON.parse(rawQueue);
           if (Array.isArray(parsedQueue)) {
               const filteredQueue = parsedQueue.filter(item => {
                   const itemId = item?.session?.id;
                   const itemDay = item?.session?.workoutDay;
                   const itemProg = (item?.session?.program || '').toLowerCase();
                   if (summary?.id && itemId === summary.id) return false;
                   if (itemProg === programKey.toLowerCase() && itemDay === (summary?.workoutDay || currentDay)) return false;
                   return true;
               });
               if (filteredQueue.length > 0) {
                   localStorage.setItem('gymlog_pending_sync_queue', JSON.stringify(filteredQueue));
               } else {
                   localStorage.removeItem('gymlog_pending_sync_queue');
               }
           }
       }
   } catch (e) {
       console.warn('[undoWorkoutSession] Failed to clean pending sync queue:', e);
   }
   ```
2. This guarantees that if a workout was completed and undone while offline, it is instantly removed from the queue and NEVER sent to Google Sheets when internet connection returns.

### 4. Queue Offline Session Deletions (`deleteSession` in `AppContext.jsx`)
In `deleteSession(sessionId)`:
1. If the background `sheetsPost({ action: 'deleteSession', id: sessionId })` fails due to network error:
   ```javascript
   catch (err) {
       console.warn('[Sheets Sync] Background session delete sync warning:', err.message || err);
       try {
           const queue = JSON.parse(localStorage.getItem('gymlog_pending_sync_queue') || '[]');
           queue.push({ action: 'deleteSession', id: sessionId });
           localStorage.setItem('gymlog_pending_sync_queue', JSON.stringify(queue));
       } catch (e) {}
   }
   ```

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
