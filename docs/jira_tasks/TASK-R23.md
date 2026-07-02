# TASK-R23: Simplify Circuit State by Deriving Sets from History

> **For Human Readers:** This task refactors `CircuitCard.jsx` and `CircuitView.jsx` to dynamically derive logged sets from the persistent exercise history database (`ex.history`) instead of a separate session-based `sets` array inside the circuit's `completedMap` in `localStorage`. This fixes the bug where navigating away and back resets the current set to Set 1.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: MULTI_FILE_ARCHITECTURE
    - REQUIRED_MODEL_TIER: MEDIUM_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R23`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Remove sets caching from completedMap. Derive sets dynamically from ex.history for today. Simplify deletion and status updates.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files:
      - `gymlog-react/src/components/CircuitCard.jsx`
      - `gymlog-react/src/components/CircuitView.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Both target files.

    2. MODIFY `gymlog-react/src/components/CircuitCard.jsx`:
       - Import `useMemo` if not already imported.
       - Replace the sets extraction logic (approx line 104):
         **Before:**
         ```javascript
         const status = typeof completedStatus === 'string' ? completedStatus : (completedStatus?.status || 'active');
         const sets = typeof completedStatus === 'object' ? (completedStatus?.sets || []) : [];
         ```
         **After:**
         ```javascript
         const status = typeof completedStatus === 'string' ? completedStatus : (completedStatus?.status || 'active');
         
         const sets = useMemo(() => {
             if (!ex.history) return [];
             const todaysEntries = ex.history.filter(h => h.date && new Date(h.date).toDateString() === new Date().toDateString());
             
             // Group by setNum
             const groups = {};
             todaysEntries.forEach(h => {
                 const sNum = h.setNum || 1;
                 if (!groups[sNum]) groups[sNum] = [];
                 groups[sNum].push(h);
             });
             
             // Return sorted lists
             return Object.keys(groups)
                 .sort((a, b) => parseInt(a) - parseInt(b))
                 .map(key => groups[key]);
         }, [ex.history]);
         ```
       - In the "LOGGED SETS" render map (approx lines 399-405), modify the `onDeleteSet` click handler to pass the array of history entries instead of the index `sIdx`:
         **Before:**
         ```javascript
         onClick={() => onDeleteSet(ex.name, sIdx)}
         ```
         **After:**
         ```javascript
         onClick={() => onDeleteSet(ex.name, setEntries)}
         ```

    3. MODIFY `gymlog-react/src/components/CircuitView.jsx`:
       - Simplify `handleLogSet` to save status strings only and remove `.sets` updates:
         **Before:**
         ```javascript
         const currentData = newMap[ex.name] || { status: 'active', sets: [] };
         const currentSets = typeof currentData === 'string' ? [] : (currentData.sets || []);
         newMap[ex.name] = {
             status: typeof currentData === 'string' ? currentData : (currentData.status || 'active'),
             sets: [...currentSets, entries]
         };
         ```
         **After:**
         ```javascript
         const currentData = newMap[ex.name] || { status: 'active' };
         newMap[ex.name] = {
             status: typeof currentData === 'string' ? currentData : (currentData.status || 'active')
         };
         ```
       - Simplify `handleExplicitDone` (approx lines 294-297):
         **Before:**
         ```javascript
         const currentData = newMap[exName] || { status: 'active', sets: [] };
         const sets = typeof currentData === 'string' ? [] : (currentData.sets || []);
         newMap[exName] = { status: 'done', sets };
         ```
         **After:**
         ```javascript
         const currentData = newMap[exName] || { status: 'active' };
         newMap[exName] = { status: 'done' };
         ```
       - Simplify `handleSkip` (approx lines 311-314) and `handleUndo` (approx lines 319-322) similarly by setting status to `'skipped'` and `'active'` without carrying a `sets` property.
       - Refactor `handleDeleteSet` (approx lines 326-356) to directly consume history entries:
         **Before:**
         ```javascript
         const handleDeleteSet = async (exName, setIdx) => {
             const pin = window.prompt("Enter Admin PIN to confirm deletion:");
             if (pin === null) return;

             const currentData = completedMap[exName];
             if (!currentData || typeof currentData === 'string') return;
             
             const sets = currentData.sets || [];
             const setEntries = sets[setIdx];
             if (!setEntries) return;

             try {
                 for (const entry of setEntries) {
                     await deleteHistory({ ...entry, exercise: exName }, pin);
                     deleteSetFromLocalHistory(exName, entry);
                 }

                 const updatedSets = sets.filter((_, idx) => idx !== setIdx);
                 const newMap = {
                     ...completedMap,
                     [exName]: {
                         ...currentData,
                         sets: updatedSets
                     }
                 };
                 updateCircuitState(circuit, newMap);
             } catch (e) { ... }
         };
         ```
         **After:**
         ```javascript
         const handleDeleteSet = async (exName, setEntries) => {
             const pin = window.prompt("Enter Admin PIN to confirm deletion:");
             if (pin === null) return;

             try {
                 for (const entry of setEntries) {
                     await deleteHistory({ ...entry, exercise: exName }, pin);
                     deleteSetFromLocalHistory(exName, entry);
                 }
             } catch (e) {
                 console.error("Error deleting set:", e);
                 alert("Failed to delete set: " + e.message);
             }
         };
         ```
       - Delete the unused `handleDeleteHistoryEntry` block if it is no longer required or if it performs redundant `completedMap` modification logic, OR simply strip out the `completedMap` updates from inside `handleDeleteHistoryEntry` so it only deletes from database and local history. Keep it simple: remove the nested `if (entry.date...)` block inside `handleDeleteHistoryEntry` so it only handles the API deletion and local history update.

    4. AUDIT: Generate `audit_log_R23.md` detailing the unified state simplifications.
    5. VERIFY: Run `npm run build` to confirm compilation is successful.
    6. EXECUTE: Run `git push origin TASK-R23` to push the branch to the remote repository.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
