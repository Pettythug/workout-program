# TASK-R124: Preserve Multiple Identical Sets During Cloud Sync (`setNum` Deduplication)

- **Target Role:** `Sandbox_Developer`
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash`, `Claude Sonnet 4.6 (Thinking)`, `Gemini 3.5 Flash (High)`) or `HIGH_TIER`
- **Model Gatekeeper Check:** Verify your active model is in the Authorized Model Tier above before executing any file edits. If misaligned, halt and output the `Model Alignment Error` override.

## Overview
In `gymlog-react/src/utils/dataMerge.js`, `mergeExerciseLists(prevList, cloudList, pendingDeletedHistory)` merges local optimistic history entries with incoming Google Sheets history entries. Currently, it deduplicates sets using only:
- Date prefix (`YYYY-MM-DD` / date part before comma)
- `reps`
- `weight`
- `person`

Because **`setNum` is omitted** from the comparison, if a user logs multiple straight sets with the exact same weight and reps on the same day (e.g., Set 1: `10 reps × 135 lbs`, Set 2: `10 reps × 135 lbs`, Set 3: `10 reps × 135 lbs`), Sets 2 and 3 match Set 1 in `cloudHist` and are falsely discarded as duplicates during background merges.

Additionally, `logExerciseSet` in `AppContext.jsx` omits `setNum` and `targetRange` when constructing the local optimistic `newHistoryEntry` object, which causes newly logged sets to temporarily disappear if the user clicks a Rep Range filter pill (`1-3`, `4-7`, `8-12`, `13+`) in History before the next cloud reload.

---

## Technical Specifications & Requirements

### 1. Include `setNum` in `mergeExerciseLists` Deduplication (`dataMerge.js`)
1. In `gymlog-react/src/utils/dataMerge.js`, update the `alreadyInCloud` check inside `mergeExerciseLists` to compare `Number(cEntry.setNum || 1) === Number(lEntry.setNum || 1)` (alongside date, `reps`, `weight`, and `person`, or exact timestamp match if available).
2. Ensure straight sets (`Set 1`, `Set 2`, `Set 3` with identical weight and reps on the same day) are never collapsed into a single set.

### 2. Include `setNum` and `targetRange` in Local Optimistic Set Entries (`AppContext.jsx`)
1. In `AppContext.jsx` inside `logExerciseSet`, include `setNum: setData.setNum || 1` and `targetRange: setData.targetRange || ''` on `newHistoryEntry` so newly logged sets immediately work with the History Rep Range filter pills (`ALL | 1-3 | 4-7 | 8-12 | 13+`) and `dataMerge.js` deduplication.

---

## Target Files
- `gymlog-react/src/utils/dataMerge.js`
- `gymlog-react/src/context/AppContext.jsx`

---

## Submission Protocol for Developer
1. Execute all edits strictly within `gymlog-react/src/*`.
2. Verify production build with `cmd /c npm run build`.
3. Respond in chat with strictly the 4-line XML snippet below:
```xml
<TASK_HANDOFF>
  <TASK_ID>TASK-R124</TASK_ID>
  <ROLE>Sandbox_Developer</ROLE>
  <STATUS>DEVELOPMENT_TASK_COMPLETE</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</TASK_HANDOFF>
```
