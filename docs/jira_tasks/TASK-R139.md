# TASK-R139: Exercise Rename & Historical Record Merge

- **Target Role:** `Sandbox_Developer` (`DENY(git checkout, git merge, git push)`)
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash (High)` / `Claude Sonnet 4.6 (Thinking)`) or `HIGH_TIER` (`Gemini 4 Argon (High)` / `Gemini 3.8 Pro` / `Claude Opus 4.6 (Thinking)`)
- **STRICT MODEL GATEKEEPER CHECK (MANDATORY ON TURN 1):**
  - If your active model is in `LOW_TIER` (`Gemini 4 Argon (Low)`, `Gemini 3.8 Flash (Low)`):
    - **HALT IMMEDIATELY.** Do NOT edit files or run commands.
    - Output: `Model Alignment Error: Request Switch -> Expected MEDIUM_TIER or HIGH_TIER for feature development. Please switch to Gemini 3.8 Flash (High), Claude Sonnet 4.6 (Thinking), or Gemini 4 Argon (High).`
- **Target Branch:** `feat/TASK-R139-exercise-rename-and-merge`

---

## 1. Problem Statement
When a user renames an exercise on `ExerciseCard.jsx` (e.g. renaming `Hammer Strength Iso-Lateral High Row (Plate Loaded)` to an existing target like `Hammer Strength Iso-Lateral High Row (Plate Loaded) - Overhand` to combine them):
1. `ExerciseCard.jsx` calls `saveExercise(payload, pin)` (`action: "saveExercise"`). `gymlog_handleSaveExercise` in `Combined_AppScript_v2.gs` only updates minor metadata (location, category, timed) and completely ignores `payload.newName`.
2. The server responds with success, and the frontend displays `"Updated!"`, but nothing is renamed or merged.
3. The dedicated backend function `gymlog_handleRenameExercise` (`action: "renameExercise"`) is never called because `useGymAPI.js` never exposed `renameExercise`.
4. `AppContext.jsx` lacks a `renameExerciseInLocalState` handler, so local exercise state, history arrays, and personal bests are not merged or updated in memory.

---

## 2. Implementation Scope

### Step 1: Update `gymlog-react/src/hooks/useGymAPI.js`
1. Implement and export `renameExercise`:
   ```javascript
   const renameExercise = useCallback(async (oldName, newName, mergeConfirmed = false, pin = null, exactOnly = true) => {
       return await sheetsPost({
           action: "renameExercise",
           oldName,
           newName,
           mergeConfirmed: Boolean(mergeConfirmed),
           exactOnly: Boolean(exactOnly),
           pin
       });
   }, [sheetsPost]);
   ```
2. Export `renameExercise` in the return object of `useGymAPI()`.

### Step 2: Update `gymlog-react/src/context/AppContext.jsx`
1. Implement `renameExerciseInLocalState(oldName, newName, isMerge = false)`:
   - Normalize names (trim).
   - If `isMerge`:
     - Locate `oldEx = exercises.find(e => e.name.toLowerCase() === oldName.toLowerCase())`.
     - Locate `targetEx = exercises.find(e => e.name.toLowerCase() === newName.toLowerCase())`.
     - If both exist:
       - Combine history: map `oldEx.history` entries to `{ ...entry, exercise: targetEx.name }` and prepend/append to `targetEx.history`.
       - Deduplicate any identical entries.
       - Recalculate personal bests on `targetEx` via `calculateBestForExercise(targetEx)`.
       - Filter out `oldEx` from `exercises`.
     - If only `oldEx` exists, treat as a rename.
   - If simple rename (`!isMerge`):
     - Update matching exercise's `.name` to `newName`.
     - Update all entries in its `.history` array to `{ ...entry, exercise: newName }`.
   - Update `gymlog_pending_sets` and `gymlog_pending_deletes` in `localStorage`:
     - If any pending item has `exercise === oldName`, re-tag it to `newName`.
   - Update `dailySwaps` and `fullBodySwaps` if `oldName` is present in them.
   - Persist updated `exercises` to `localStorage.setItem('gymlog_exercises', JSON.stringify(next))`.
2. Export `renameExerciseInLocalState` in `useAppContext()` and the context provider value.

### Step 3: Update `gymlog-react/src/components/ExerciseCard.jsx`
1. Consume `renameExercise` from `useGymAPI()` and `renameExerciseInLocalState` from `useAppContext()`.
2. In `handleSaveInlineEdit`:
   - If `typeToSave === 'rename'`:
     - If `!finalValue || finalValue.trim() === ex.name.trim()`: exit edit mode.
     - Check if target exercise already exists in `exercises`:
       `const targetExists = exercises.some(e => e.name.trim().toLowerCase() === finalValue.trim().toLowerCase());`
     - If `targetExists`:
       - Prompt confirmation:
         `const confirmMerge = window.confirm(`'${finalValue.trim()}' already exists in your library.\n\nDo you want to merge '${ex.name}' into '${finalValue.trim()}'?\n\nAll past history and sets will be combined.`);`
       - If user cancels: abort and return.
     - Prompt for Admin PIN:
       `const pin = prompt("Admin PIN required to rename/merge:");`
       If `pin === null`, return.
     - Set toast: `setToast(targetExists ? "Merging exercise records..." : "Renaming exercise...");`
     - Call:
       `const res = await renameExercise(ex.name, finalValue.trim(), targetExists, pin, true);`
     - If `res && res.status === "requiresMerge"`:
       - Prompt confirmation with `res.message`.
       - If confirmed, re-call `renameExercise(ex.name, finalValue.trim(), true, pin, true)`.
     - On success:
       - Call `renameExerciseInLocalState(ex.name, finalValue.trim(), targetExists);`
       - Close edit mode (`setEditMode(null)`).
       - Show toast: `setToast(targetExists ? "Merged successfully!" : "Renamed successfully!");`
       - Clear toast after 2000ms.

### Step 4: Update `Combined_AppScript_v2.gs` (v4.5)
1. In `gymlog_handleRenameExercise(payload)`:
   - Accept `payload.exactOnly`.
   - If `payload.exactOnly === true`:
     Set `variationsToRename = [{ old: oldName.trim(), new: newName.trim(), oldLower: oldName.trim().toLowerCase(), newLower: newName.trim().toLowerCase() }];`
     (Skipping the greedy `oldBaseLower` wildcard expansion so only the specific exercise is renamed/merged).
   - Verify `gymlog_bumpLibraryVersion()` is called so all clients reload fresh data on next SWR check.
   - Bump version header to `Version 4.5 of the GymLog backend (TASK-R139 Exercise Rename & Merge)`.

### Step 5: Automated Verification Suite (`gymlog-react/test_task_r139.cjs`)
1. Create `gymlog-react/test_task_r139.cjs` to test:
   - Exercise rename in local state updates name and history entries.
   - Exercise merge in local state combines histories, recalculates Personal Bests, and removes old duplicate.
   - `renameExercise` payload construction in `useGymAPI.js`.
   - `Combined_AppScript_v2.gs` `exactOnly` handling in `gymlog_handleRenameExercise`.
2. Run `cd gymlog-react && node test_task_r139.cjs` and `cd gymlog-react && cmd /c npm run build` and ensure both pass with `EXIT_CODE: 0`.

---

## 3. Submission Protocol for Sandbox Developer
Output your completion signal inside a fenced XML block:
```xml
<TASK_HANDOFF>
  <SIGNAL>DEVELOPMENT_TASK_COMPLETE</SIGNAL>
  <TASK_ID>TASK-R139</TASK_ID>
  <BRANCH>feat/TASK-R139-exercise-rename-and-merge</BRANCH>
  <BUILD_VERIFICATION>PASS</BUILD_VERIFICATION>
  <TEST_VERIFICATION>PASS</TEST_VERIFICATION>
</TASK_HANDOFF>
```
