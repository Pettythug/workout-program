# TASK-QA-R124: Pre-Merge QA Verification — Preserve Identical Sets During Cloud Sync

- **Target Role:** `QA_Engineer` (Read-Only Access; `DENY(Direct_Write_Code)`)
- **Authorized Model:** `Gemini 3.8 Flash (Low)` (Recommended) or `Gemini 3.8 Flash (High)`
- **STRICT MODEL GATEKEEPER CHECK (MANDATORY ON TURN 1):**
  - If your active model is in `HIGH_TIER` (e.g. `Gemini 4 Argon`, `Gemini 3.8 Pro`, `Claude Opus`):
    - **HALT IMMEDIATELY.** Do NOT run commands.
    - Output: `Model Alignment Error: Request Switch -> Model is too high for QA. Please switch to Gemini 3.8 Flash (Low) or (High) before proceeding.`
- **Target Branch:** `feat/TASK-R124-preserve-identical-sets-sync`

---

## Verification Scope

Verify the implementation of `TASK-R124` in `gymlog-react/src/context/dataMerge.js`:
1. Inspect `mergeExerciseHistory(sheetHistory, localHistory)`:
   - Verify `isDuplicate` checks `samePerson`, `sameReps`, `sameWeight`.
   - Verify `sameSetNum` checks `Number(sh.setNum || 1) === Number(lh.setNum || 1)`.
   - Verify `sameExactTime` checks `sh.date && lh.date && sh.date === lh.date`.
   - Verify `(sameExactTime || sameSetNum)` guard ensures multiple straight sets at identical weight & reps on the same day are never collapsed into a single set.
2. Compile Check:
   - Run `cd gymlog-react && cmd /c npm run build` and ensure exit code 0.

---

## Submission Protocol for QA Engineer
**MANDATORY:** Output your response inside a fenced code block (`xml`) so the user can click the "Copy" button:

```xml
<QA_HANDOFF>
  <TASK_ID>TASK-R124</TASK_ID>
  <ROLE>QA_Engineer</ROLE>
  <STATUS>QA_PREMERGE_PASS</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</QA_HANDOFF>
```
