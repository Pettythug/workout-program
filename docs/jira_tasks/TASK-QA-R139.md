# TASK-QA-R139: Pre-Merge QA Verification — Exercise Rename & Historical Record Merge

- **Target Role:** `QA_Engineer` (Read-Only Access; `DENY(Direct_Write_Code)`)
- **Authorized Model:** `Gemini 3.8 Flash (Low)` (Recommended) or `Gemini 3.8 Flash (High)`
- **STRICT MODEL GATEKEEPER CHECK (MANDATORY ON TURN 1):**
  - If your active model is in `HIGH_TIER` or any `Gemini 4 Argon` / `Gemini 3.8 Pro` / `Claude Opus` model:
    - **HALT IMMEDIATELY.** Do NOT run commands.
    - Output: `Model Alignment Error: Request Switch -> Model is too high for QA. Please switch to Gemini 3.8 Flash (Low) or (High) before proceeding.`
- **Target Branch:** `feat/TASK-R139-exercise-rename-and-merge`

---

## Verification Scope

Verify the implementation of `TASK-R139`:

1. **Source Inspection:**
   - `gymlog-react/src/hooks/useGymAPI.js`: Verify `renameExercise` is implemented and exported, dispatching `{ action: "renameExercise", oldName, newName, mergeConfirmed, exactOnly, pin }` via `sheetsPost`.
   - `gymlog-react/src/context/AppContext.jsx`: Verify `renameExerciseInLocalState(oldName, newName, isMerge)` merges history arrays, removes the old exercise on merge, recalculates personal bests via `calculateBestForExercise`, re-tags pending sets/deletes in `localStorage`, and updates `gymlog_exercises`.
   - `gymlog-react/src/components/ExerciseCard.jsx`: Verify `handleSaveInlineEdit` for rename checks if target exists, prompts for merge confirmation, calls `renameExercise`, updates local state with `renameExerciseInLocalState`, and displays appropriate toasts.
   - `Combined_AppScript_v2.gs`: Verify version header is updated to `v4.5`, and `gymlog_handleRenameExercise` respects `payload.exactOnly === true` to avoid greedy wildcard renaming.

2. **Automated Verification Suite (MANDATORY):**
   - Run the dedicated automated test script:
     ```bash
     cd gymlog-react && node test_task_r139.cjs
     ```
   - Verify all tests pass with `EXIT_CODE: 0`.

3. **Production Build & Compilation Check (MANDATORY):**
   - Run `cd gymlog-react && cmd /c npm run build` and ensure clean compilation with exit code `0`.

---

## Submission Protocol for QA Engineer
**MANDATORY:** Output your response inside a fenced code block (`xml`) so the user can click the "Copy" button:

```xml
<QA_HANDOFF>
  <TASK_ID>TASK-R139</TASK_ID>
  <ROLE>QA_Engineer</ROLE>
  <STATUS>QA_PREMERGE_PASS</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</QA_HANDOFF>
```
