# TASK-R124: Preserve Multiple Identical Sets During Cloud Sync (`setNum` Deduplication)

- **Target Role:** `Sandbox_Developer`
- **Required Model:** `Gemini 3.8 Flash (High)` (`MEDIUM_TIER`)
- **STRICT MODEL GATEKEEPER CHECK (MANDATORY ON TURN 1):**
  1. Check your active model against `MEDIUM_TIER`: `["Gemini 3.8 Flash (High)", "Gemini 3.8 Flash", "Claude Sonnet 4.6 (Thinking)"]`.
  2. If running on a **HIGHER model** (e.g. `Gemini 4 Argon`, `Gemini 3.8 Pro`, `Claude Opus`):
     - **HALT IMMEDIATELY.** Do NOT read files or run tools.
     - Output: `Model Alignment Error: Request Switch -> Model is too high. Please switch to Gemini 3.8 Flash (High) before proceeding.`
  3. If running on a **LOWER model** (e.g. `Gemini 3.8 Flash (Low)`, `Gemini 3.5 Flash (Medium/Low)`):
     - **HALT IMMEDIATELY.** Do NOT read files or run tools.
     - Output: `Model Alignment Error: Request Switch -> Model is too low. Please switch to Gemini 3.8 Flash (High) before proceeding.`

---

## Overview
In `gymlog-react/src/context/dataMerge.js`, `mergeExerciseHistory(sheetHistory, localHistory)` merges local optimistic history entries with incoming Google Sheets history entries. Currently, it deduplicates sets using only:
- `sh.person === lh.person`
- `String(sh.reps) === String(lh.reps)`
- `String(sh.weight) === String(lh.weight)`

Because **`setNum` is omitted** from this comparison, if a user logs multiple straight sets with the exact same weight and reps on the same day (e.g. Set 1: `10 reps × 135 lbs`, Set 2: `10 reps × 135 lbs`, Set 3: `10 reps × 135 lbs`), Sets 2 and 3 match Set 1 in `sheetHistory` and are falsely discarded as duplicates during background merges while waiting for cloud sync to complete.

---

## Technical Specifications & Requirements

### Target File: `gymlog-react/src/context/dataMerge.js`
1. Update `mergeExerciseHistory(sheetHistory, localHistory)`:
   - Enhance the duplicate detection logic so that entries for the same person with identical reps and weight are only considered duplicates if they also share the same `setNum` (or exact timestamp match).
   - Implementation:
     ```javascript
     const isDuplicate = sheetHistory.some(sh => {
         const samePerson = cleanName(sh.person) === cleanName(lh.person);
         const sameReps = String(sh.reps) === String(lh.reps);
         const sameWeight = String(sh.weight) === String(lh.weight);
         const sameSetNum = (sh.setNum !== undefined && lh.setNum !== undefined)
             ? Number(sh.setNum || 1) === Number(lh.setNum || 1)
             : true;
         const sameExactTime = Boolean(sh.date && lh.date && sh.date === lh.date);

         return samePerson && sameReps && sameWeight && (sameExactTime || sameSetNum);
     });
     ```
2. Verify straight sets (`Set 1`, `Set 2`, `Set 3` with identical weight and reps on the same day) are preserved in `mergedHistory` without collapsing.

---

## Target Files
- `gymlog-react/src/context/dataMerge.js`

---

## Validation & Verification Protocol
1. Verify production build passes with zero errors:
   ```cmd
   cmd /c npm run build
   ```
2. Respond strictly inside a markdown code block with the 4-line XML handoff snippet:
   ```xml
   <TASK_HANDOFF>
     <TASK_ID>TASK-R124</TASK_ID>
     <ROLE>Sandbox_Developer</ROLE>
     <STATUS>DEVELOPMENT_TASK_COMPLETE</STATUS>
     <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
   </TASK_HANDOFF>
   ```
