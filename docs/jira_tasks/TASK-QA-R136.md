# TASK-QA-R136: Pre-Merge QA Verification — Apps Script Deduplication & Batch Insertion Speedup

- **Target Role:** `QA_Engineer` (Read-Only Access; `DENY(Direct_Write_Code)`)
- **Authorized Model:** `Gemini 3.8 Flash (Low)` (Recommended) or `Gemini 3.8 Flash (High)`
- **STRICT MODEL GATEKEEPER CHECK (MANDATORY ON TURN 1):**
  - If your active model is in `HIGH_TIER` (e.g. `Gemini 4 Argon`, `Gemini 3.8 Pro`, `Claude Opus`):
    - **HALT IMMEDIATELY.** Do NOT run commands.
    - Output: `Model Alignment Error: Request Switch -> Model is too high for QA. Please switch to Gemini 3.8 Flash (Low) or (High) before proceeding.`
- **Target Branch:** `feat/TASK-R136-backend-dedup-and-batch-optimization`

---

## Verification Scope

Verify the implementation of `TASK-R136` in `Combined_AppScript_v2.gs`:

1. **Source Inspection (`Combined_AppScript_v2.gs`):**
   - Verify `gymlog_getSetSignatures` generates exact multi-format signatures (`date|person|exercise|setNum`) for safe matching.
   - Verify `gymlog_handleBatchSyncSession`:
     - Reads existing rows from `histSheet` and checks `existingSetSignatures.has(s)`.
     - Skips duplicate sets safely without throwing errors.
     - Performs a single atomic bulk insert (`histSheet.insertRowsBefore(2, newRows.length)` and `histSheet.getRange(...).setValues(newRows)`).
     - Only recalculates Personal Bests for exercises that actually received new sets.
     - Returns `{ synced: true, sessionId, insertedCount: newRows.length }`.

2. **Automated Dynamic Simulation Test Execution (MANDATORY):**
   - Run the dedicated automated test script:
     ```bash
     cd gymlog-react && node test_task_r136.cjs
     ```
   - Verify that:
     - Attempt 1 inserts 30 sets.
     - Attempt 2 (Retry 1 replay) inserts 0 sets (all duplicates rejected).
     - Attempt 3 (Retry 2 replay) inserts 0 sets (all duplicates rejected).
     - Total sheet row count remains strictly 30 (not 60 or 90).

3. **Production Build & Compilation Check:**
   - Run `cd gymlog-react && cmd /c npm run build` and ensure clean compilation with exit code 0.

---

## Submission Protocol for QA Engineer
**MANDATORY:** Output your response inside a fenced code block (`xml`) so the user can click the "Copy" button:

```xml
<QA_HANDOFF>
  <TASK_ID>TASK-R136</TASK_ID>
  <ROLE>QA_Engineer</ROLE>
  <STATUS>QA_PREMERGE_PASS</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</QA_HANDOFF>
```
