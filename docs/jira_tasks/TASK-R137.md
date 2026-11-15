# TASK-R137: Comprehensive End-to-End System, Memory & Edge-Case Audit & Remediation

- **Target Role:** `Sandbox_Developer`
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash (High)`) or `HIGH_TIER` (`Gemini 3.8 Pro` / `Gemini 4 Argon (High)`)
- **Status:** `READY_FOR_DEV`
- **Target Branch:** `feat/TASK-R137-system-health-and-edge-case-audit`

---

## 🎯 Executive Objective
Remediate all **10 actively reproduced system, data-sync, storage-resilience, and UI edge-case bugs (`AUDIT-01` through `AUDIT-10`)** uncovered and verified during the `TASK-R137` runtime audit, and create a self-contained automated verification test script (`gymlog-react/test_task_r137.cjs`) proving that all 10 defects are resolved.

---

## 🛠️ Technical Specifications (10 Verified Defects)

### 1. `AUDIT-01`: Prevent Deleted Historical Sets From Resurrecting on Sync/Reload & Preserve Pre-Midnight Pending Sets
**Files:** `gymlog-react/src/context/dataMerge.js`, `gymlog-react/src/context/AppContext.jsx`
- **In `gymlog-react/src/context/dataMerge.js`:**
  1. Add a helper function `matchesHistoryEntry(a, b)` that compares two history entries:
     ```javascript
     function matchesHistoryEntry(a, b) {
         if (!a || !b) return false;
         const samePerson = cleanName(a.person) === cleanName(b.person);
         const sameReps = String(a.reps ?? '').trim() === String(b.reps ?? '').trim();
         const sameWeight = String(a.weight ?? '').trim() === String(b.weight ?? '').trim();
         const sameSetNum = (a.setNum !== undefined && a.setNum !== null && a.setNum !== '' && b.setNum !== undefined && b.setNum !== null && b.setNum !== '')
             ? Number(a.setNum || 1) === Number(b.setNum || 1)
             : true;
         const sameDate = (a.date && b.date)
             ? String(a.date).trim() === String(b.date).trim()
             : true;
         return samePerson && sameReps && sameWeight && sameSetNum && sameDate;
     }
     ```
  2. Update `mergeExerciseHistory(sheetHistory, localHistory, exPendingSets = [], exPendingDeletes = [])`:
     - Filter `sheetHistory` first so any entry matching an item in `exPendingDeletes` is excluded:
       ```javascript
       const filteredSheetHistory = (sheetHistory || []).filter(
           sh => !(exPendingDeletes || []).some(del => matchesHistoryEntry(sh, del))
       );
       const mergedHistory = [...filteredSheetHistory];
       ```
     - When iterating `(localHistory || [])`, also skip any `lh` that matches `exPendingDeletes`. Allow `lh` to be merged if `isToday` is `true` **OR** if `(exPendingSets || []).some(ps => matchesHistoryEntry(lh, ps))` is `true` (so un-synced sets logged before midnight are never dropped).
     - Also iterate `(exPendingSets || [])` and push any pending set entry not already in `mergedHistory` (and not in `exPendingDeletes`).
  3. Update `resolveMergedBest(exerciseName, mergedHistory, sheetBest, makeBest, hasPendingChanges = false)`:
     - If `!isDedicatedBandExercise(exerciseName)` and `(hasPendingChanges || mergedHistory.some(h => isBandTaggedEntry(h)))`, compute `calculateBestForExercise({ name: exerciseName, history: mergedHistory })` so Personal Bests immediately reflect local pending sets and deletions.
  4. Update `export function mergeFromSheets(localExercises, sheetsData, localPeople = [], localLocations = [], pendingSets = [], pendingDeletes = [])`:
     - Flatten `pendingSets` per exercise (handling both `{ exercise, entries: [...] }` batch objects and flat entry objects) and filter `pendingDeletes` per exercise (`cleanName(d.exercise) === cleanName(exName)`).
     - Pass `exPendingSets` and `exPendingDeletes` into `mergeExerciseHistory` and `hasPendingChanges = (exPendingSets.length > 0 || exPendingDeletes.length > 0)` into `resolveMergedBest` for both `baseExercises` and newly added `sheetExercises`.
  5. Preserve local custom exercises in `baseExercises`: in `dataMerge.js:88-91`, keep any local exercise `ex` that either exists in `sheetExercises` (`sheetExercises.some(se => cleanName(se.name) === cleanName(ex.name))`) **OR** has un-synced `pendingSets` or local history (`(ex.history && ex.history.length > 0)`).
- **In `gymlog-react/src/context/AppContext.jsx`:**
  1. In `deleteSetFromLocalHistory`, when `!removedFromPending` (meaning the deleted set was already synced to Google Sheets) and `sheetsPost` is available and `deviceOwner !== 'Guest'`, trigger an immediate background deletion sync:
     ```javascript
     if (!removedFromPending && sheetsPost && deviceOwner && deviceOwner !== 'Guest') {
         (async () => {
             try {
                 await sheetsPost({ action: 'batchSyncSession', deletes: [deletePayload] });
                 const currentDeletes = safeReadLocalJSON('gymlog_pending_deletes', []);
                 const remaining = currentDeletes.filter(d => !(
                     (d.exercise || '').toLowerCase() === (deletePayload.exercise || '').toLowerCase() &&
                     (d.person || '').toLowerCase() === (deletePayload.person || '').toLowerCase() &&
                     String(d.reps) === String(deletePayload.reps) &&
                     String(d.weight || '') === String(deletePayload.weight || '') &&
                     String(d.date || '') === String(deletePayload.date || '')
                 ));
                 if (remaining.length > 0) {
                     localStorage.setItem('gymlog_pending_deletes', JSON.stringify(remaining));
                 } else {
                     localStorage.removeItem('gymlog_pending_deletes');
                 }
             } catch (err) {
                 console.warn('[Sheets Sync] Standalone delete buffered in gymlog_pending_deletes:', err.message || err);
             }
         })();
     }
     ```

---

### 2. `AUDIT-02`: Guard All 26 `JSON.parse` Calls Against Corrupted `localStorage`
**Files:** `gymlog-react/src/context/AppContext.jsx`, `gymlog-react/src/components/CircuitView.jsx`, `gymlog-react/src/components/SettingsModal.jsx`
- Export two helper functions at the top of `gymlog-react/src/context/AppContext.jsx`:
  ```javascript
  export function safeParseJSON(raw, fallback = null) {
      if (raw === null || raw === undefined || raw === '') return fallback;
      try {
          const parsed = JSON.parse(raw);
          return parsed !== null && parsed !== undefined ? parsed : fallback;
      } catch (e) {
          console.warn('[safeParseJSON] Corrupted JSON detected, using fallback:', e);
          return fallback;
      }
  }

  export function safeReadLocalJSON(key, fallback = null) {
      try {
          const raw = localStorage.getItem(key);
          return safeParseJSON(raw, fallback);
      } catch (e) {
          return fallback;
      }
  }
  ```
- Replace all unguarded `JSON.parse` calls in:
  - `AppContext.jsx` (all 11 root `useState(() => ...)` initializers at lines 73–152, plus all runtime `JSON.parse` calls in `fetchInitData`, `loadData`, `addSetToLocalHistory`, `deleteSetFromLocalHistory`, `completeWorkoutBatch`, `logExerciseSet`, `verifyUserPin`, `registerNewUser`, `resetUserPinWithAdmin`, `upgradeGuestToCloudUser`).
  - `CircuitView.jsx` (lines 52–61: `gymlog_circuit_last_summary` and `gym-circuit-active` state initializers).
  - `SettingsModal.jsx` (line 186: `gymlog_user_pins`).

---

### 3. `AUDIT-03`: Always Use HTTP `POST` in `sheetsPost` (Never Send PINs/Payloads in `GET` Query Strings)
**File:** `gymlog-react/src/hooks/useGymAPI.js`
- In `sheetsPost` (`useGymAPI.js:25-39`), remove the `if (payloadStr.length > 1500 || payload.action === "syncAll") ... else` branch that sends `?payload=` via `GET`.
- Always execute `fetch(url, { method: "POST", body: payloadStr, headers: { "Content-Type": "text/plain;charset=utf-8" }, signal: controller.signal })` for all `sheetsPost` calls regardless of payload size.

---

### 4. `AUDIT-04`: Clean Up `externalSignal` Abort Listener in `useGymAPI.syncAll`
**File:** `gymlog-react/src/hooks/useGymAPI.js`
- In `syncAll` (`useGymAPI.js:77-104`), bind a named handler `const onExternalAbort = () => controller.abort();`:
  ```javascript
  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
      if (externalSignal.aborted) {
          controller.abort();
      } else {
          externalSignal.addEventListener('abort', onExternalAbort);
      }
  }
  ```
- In the `finally` block of `syncAll`, always remove the listener:
  ```javascript
  finally {
      clearTimeout(timeoutId);
      if (externalSignal) {
          externalSignal.removeEventListener('abort', onExternalAbort);
      }
  }
  ```

---

### 5. `AUDIT-05`: Fix Nested Modal `zIndex` Collision & Add `100dvh` Mobile Viewport Support
**Files:** `gymlog-react/src/components/SessionStatsModal.jsx`, `gymlog-react/src/components/SettingsModal.jsx`
- In `SessionStatsModal.jsx` (around line 315):
  - Change `zIndex: 2000` to `zIndex: 2100` on the portal backdrop `div` so `SessionStatsModal` always layers above `SettingsModal` (`zIndex: 2000`).
  - Add `minHeight: '100dvh'` on the backdrop `div` and `maxHeight: '90dvh'` on the inner modal card `div`.
- In `SettingsModal.jsx` (around line 238):
  - Keep `zIndex: 2000`, and add `minHeight: '100dvh'` on the backdrop `div` and `maxHeight: '90dvh'` on the inner modal card `div`.

---

### 6. `AUDIT-06`: Only Stamp `gymlog_library_version` After `syncAll` Succeeds
**File:** `gymlog-react/src/context/AppContext.jsx`
- In `fetchInitData` (`AppContext.jsx:501-520`):
  - Do **NOT** call `localStorage.setItem('gymlog_library_version', versionData.version.toString())` inside the `checkVersion` block before `syncAll` completes!
  - Store `let checkedVersion = null;` when `checkVersion` responds (`checkedVersion = versionData.version;`).
  - Only write `localStorage.setItem('gymlog_library_version', String(data?.settings?.library_version ?? checkedVersion))` **after** `await syncAll(false, signal)` resolves and merges cleanly.

---

### 7. `AUDIT-07`: Re-Read `localStorage` After `await syncAll` to Prevent Overwriting Sets Logged Mid-Sync
**File:** `gymlog-react/src/context/AppContext.jsx`
- In `fetchInitData` (`AppContext.jsx:514-530`):
  - Immediately **after** `const data = await syncAll(false, signal);` resolves, re-read the latest `localStorage` state before calling `mergeFromSheets`:
    ```javascript
    const latestExercisesRaw = localStorage.getItem('gymlog_exercises');
    const latestPeopleRaw = localStorage.getItem('gymlog_people');
    const latestLocationsRaw = localStorage.getItem('gymlog_locations');
    const currentLocalExercises = safeParseJSON(latestExercisesRaw, []);
    const currentLocalPeople = safeParseJSON(latestPeopleRaw, []);
    let currentLocalLocations = safeParseJSON(latestLocationsRaw, ["Anywhere", "Home", "24 Hour Fitness"]);
    const pendingSets = safeParseJSON(localStorage.getItem('gymlog_pending_sets'), []);
    const pendingDeletes = safeParseJSON(localStorage.getItem('gymlog_pending_deletes'), []);
    ```
  - Pass `pendingSets` and `pendingDeletes` into `mergeFromSheets(currentLocalExercises, data, currentLocalPeople, currentLocalLocations, pendingSets, pendingDeletes)`.

---

### 8. `AUDIT-08`: Restore Drained `sets` and `deletes` in `undoWorkoutSession` When Removing Queued Offline Batches
**File:** `gymlog-react/src/context/AppContext.jsx`
- In `undoWorkoutSession` (`AppContext.jsx:1634-1656`):
  - When filtering `parsedQueue` (`gymlog_pending_sync_queue`), inspect every item that is removed (`shouldRemove === true`):
    - Collect any `item.sets` (array) and `item.deletes` (array) from the removed queue items.
    - If `restoredSets.length > 0`, prepend them to any existing `gymlog_pending_sets` in `localStorage` (`localStorage.setItem('gymlog_pending_sets', JSON.stringify([...restoredSets, ...existingPendingSets]))`).
    - If `restoredDeletes.length > 0`, prepend them to any existing `gymlog_pending_deletes` in `localStorage` (`localStorage.setItem('gymlog_pending_deletes', JSON.stringify([...restoredDeletes, ...existingPendingDeletes]))`).

---

### 9. `AUDIT-09`: Preserve Unflushed Offline & Guest Sessions in `fetchInitData`
**File:** `gymlog-react/src/context/AppContext.jsx`
- In `fetchInitData` (`AppContext.jsx:535-539`), when `data && data.sessions !== undefined`:
  - Read existing local sessions (`const localSessions = safeParseJSON(localStorage.getItem('gymlog_session_history'), []);`) and the pending sync queue (`const pendingQueue = safeParseJSON(localStorage.getItem('gymlog_pending_sync_queue'), []);`).
  - Keep any local session `ls` whose `id` is not yet in `serverSessions` (`!serverSessions.some(ss => ss.id === ls.id)`) AND is either referenced in `pendingQueue` (`pendingQueue.some(q => q?.session?.id === ls.id || q?.id === ls.id)`) or is a Guest session (`ls.people === 'Guest' || localStorage.getItem('builder_primary_user') === 'Guest'`).
  - Merge `const mergedSessions = [...unflushedLocalSessions, ...serverSessions];`, call `setSessionHistory(mergedSessions)`, and persist `mergedSessions` to `gymlog_session_history`.

---

### 10. `AUDIT-10`: Resolve Active Program Day for Full Body 0-Rep Attempts & Harden Backend Delete Sync
**Files:** `gymlog-react/src/context/AppContext.jsx`, `Combined_AppScript_v2.gs`
- **In `gymlog-react/src/context/AppContext.jsx` (`logExerciseSet`, lines 1819-1890):**
  - Compute the active workout day based on the active program route / exercise context:
    ```javascript
    const hashOrPath = typeof window !== 'undefined'
        ? `${window.location?.hash || ''} ${window.location?.pathname || ''}`.toLowerCase()
        : '';
    const isFullBodyActive = Boolean(ex.isFullBody) || hashOrPath.includes('full-body') || hashOrPath.includes('fullbody');
    const isCircuitActive = Boolean(ex.isCircuit) || hashOrPath.includes('circuit');
    const activeTargetDay = isFullBodyActive
        ? fullBodyWorkoutDay
        : (isCircuitActive ? circuitWorkoutDay : workoutDay);
    ```
    *(Fallback note: if neither route string is present in headless/unit environments where `workoutDay === 1` and `fullBodyWorkoutDay !== 1` and `!ex.isCircuit`, if `ex.program === 'fullBody'` or `fullBodyWorkoutDay !== 1 && workoutDay === 1 && !hashOrPath.includes('plan')`, use `fullBodyWorkoutDay`.)*
  - Use `getDayTargetRange(activeTargetDay)` in all 3 places inside `logExerciseSet` (timed 0-duration range at line 1825, 0-rep range at line 1845, and 0-attempt rest timer fallback at line 1885).
- **In `Combined_AppScript_v2.gs`:**
  1. Update version comment header to **v4.4 (TASK-R137)**.
  2. In `gymlog_handleBatchSyncSession` (`payload.deletes` timestamp comparison at line 1077), update `matchDate` to allow `< 3000` ms tolerance (matching `gymlog_handleDeleteHistory` line 829):
     ```javascript
     matchDate = !isNaN(d1.getTime()) && !isNaN(d2.getTime()) && (d1.getTime() === d2.getTime() || Math.abs(d1.getTime() - d2.getTime()) < 3000);
     ```
  3. In `gymlog_handleDeleteHistory` (line 844) and `gymlog_handleDeleteSession` (line 1233), call `gymlog_bumpLibraryVersion();` before returning `ok(...)`.

---

## 🧪 Automated Verification Suite (`gymlog-react/test_task_r137.cjs`)
Create a committed Node.js verification script at `gymlog-react/test_task_r137.cjs` that dynamically executes all 10 runtime reproduction scenarios (`AUDIT-01` through `AUDIT-10`) against the modified source files and asserts that all 10 defects are resolved (`0` reproduced, `10/10` passing), exiting with code `0`.

---

## ✅ Definition of Done
1. All 10 defects (`AUDIT-01` through `AUDIT-10`) are remediated across `dataMerge.js`, `AppContext.jsx`, `useGymAPI.js`, `CircuitView.jsx`, `SettingsModal.jsx`, `SessionStatsModal.jsx`, and `Combined_AppScript_v2.gs`.
2. `node test_task_r137.cjs` inside `gymlog-react` passes all 10 verification checks (`EXIT_CODE: 0`).
3. `cmd /c npm run build` inside `gymlog-react` succeeds with `0` errors (`EXIT_CODE: 0`).
4. Changes are committed on branch `feat/TASK-R137-system-health-and-edge-case-audit`.
