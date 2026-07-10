# TASK-R48: Fix Background Sync Race Condition and Persistent Toast UX

> **For Human Readers:** This task solves two issues: (1) Toast notification text (like "Set Saved!") disappears too fast, causing users to miss confirmations. (2) When logging a set during the initial 6–60 second background load, the completed `syncAll` background call would overwrite and erase that newly logged set from the UI until a manual page refresh.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: SINGLE_FILE_FEATURE
    - REQUIRED_MODEL_TIER: MEDIUM_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R48`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Update the merge algorithm to prevent background sheet syncs from overwriting local un-synced entries.
    2. Make success toasts persist on the card until the user begins editing the inputs for their next set.
  </OBJECTIVE>
  <RESOURCES>
    - Frontend Merge Logic: `gymlog-react/src/context/dataMerge.js`
    - Card Component 1: `gymlog-react/src/components/ExerciseCard.jsx`
    - Card Component 2: `gymlog-react/src/components/CircuitCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ target files.

    2. MODIFY `gymlog-react/src/context/dataMerge.js`:
       - Refactor the mapping loops (around line 26 and line 53) to merge the sheet history with the local exercise history.
       - Any local entries from "today" that are NOT present in the spreadsheet history (checked by matching timestamp, person, reps, and weight) must be preserved in the exercise's history array instead of discarded:
         ```javascript
         const localHistory = ex.history || [];
         const mergedHistory = [...sheetHistory];
         
         localHistory.forEach(lh => {
             // Check if local history entry is from today
             const isToday = lh.date && new Date(lh.date).toDateString() === new Date().toDateString();
             if (!isToday) return;

             const isDuplicate = sheetHistory.some(sh => 
                 sh.person === lh.person && 
                 String(sh.reps) === String(lh.reps) && 
                 String(sh.weight) === String(lh.weight)
             );
             if (!isDuplicate) {
                 mergedHistory.push(lh);
             }
         });
         
         // Sort mergedHistory chronologically by date if needed (or keep original order)
         ```
       - Use `mergedHistory` instead of `sheetHistory` for the `history` property on line 46 and line 73.

    3. MODIFY `gymlog-react/src/components/ExerciseCard.jsx`:
       - Locate where `setToast` is set for successful saves (around line 330 or in `handleSaveSet` around line 256):
         - Remove any `setTimeout(() => setToast(""), ...)` timers that clear success messages like "Set Saved!" automatically.
       - Clear the `toast` message immediately when the user interacts with any inputs:
         - Inside `updateLogInput(personKey, field, val)` (around line 133):
           ```javascript
           if (toast) setToast("");
           ```
         - Inside the checkbox/phrase toggles (like `toggleNotePhrase` around line 31):
           ```javascript
           if (toast) setToast("");
           ```

    4. MODIFY `gymlog-react/src/components/CircuitCard.jsx`:
       - Apply the matching persistent toast changes:
         - Remove automatic `setTimeout` toast clear timers for success saves.
         - Inside `updateInput` (around line 125) and phrase toggle helpers, clear the toast message immediately on interaction:
           ```javascript
           if (toast) setToast("");
           ```

    5. AUDIT: Generate `audit_log_R48.md` detailing the background merge sync preservation and persistent toast UX implementation.
    6. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to confirm compilation succeeds cleanly.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
