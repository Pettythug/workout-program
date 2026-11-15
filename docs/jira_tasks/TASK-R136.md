# TASK-R136: Google Apps Script Backend Deduplication & Batch Insertion Optimization

- **Target Role:** `Sandbox_Developer`
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash (High)`, `Gemini 3.8 Flash`, `Claude Sonnet 4.6 (Thinking)`, `Gemini 3.5 Flash (High)`)
- **Model Gatekeeper Check:** Verify your active model is in the Authorized Model Tier above before executing any file edits. If misaligned, halt and output the `Model Alignment Error` override.
- **Target Branch:** `feat/TASK-R136-backend-dedup-and-batch-optimization`

---

## Overview & Bug Description

In `Combined_AppScript_v2.gs`, `gymlog_handleBatchSyncSession` had two critical limitations that allowed duplicate workouts in Google Sheets:
1. **Zero Set Deduplication:**
   When a batch of sets arrived, it blindly iterated through all entries and inserted them into `GymLog` without verifying if any entry with the exact same timestamp, person, exercise, and set number already existed. If a mobile device re-sent a batch after a network timeout, all sets were inserted a second and third time.
2. **Slow Row-by-Row Insertion (30s+ Latency):**
   `entries.forEach` called `histSheet.insertRowBefore(2)` and `getRange(...).setValues(...)` once for every single set. For a Full Body workout with 30 sets, this made 60 individual API calls, keeping the Apps Script execution open for 30–45+ seconds and causing mobile browsers to time out.

---

## Technical Specifications & Requirements

### 1. File to Modify: `Combined_AppScript_v2.gs`

1. **Deduplication Signature Check:**
   - In `gymlog_handleBatchSyncSession(payload)`:
     - When `payload.sets` is present and non-empty, fetch existing history rows from `histSheet`.
     - Build a `Set` of signatures for existing sets:
       ```javascript
       const existingSetSignatures = new Set();
       // Normalize timestamp string, lowercase person, lowercase exercise, and setNum
       // e.g. `${cleanDate}|${cleanPerson}|${cleanExercise}|${setNum}`
       ```
     - For each entry in `payload.sets`:
       - Verify PIN permissions as before.
       - Check if its signature is in `existingSetSignatures`.
       - If it already exists, **skip it** (log to console that duplicate set was safely ignored).
       - If not a duplicate, add to `newRows` array and add its signature to `existingSetSignatures`.

2. **Bulk Insertion (Single Atomic Write):**
   - After processing all set batches, if `newRows.length > 0`:
     - Perform a single bulk insertion:
       ```javascript
       histSheet.insertRowsBefore(2, newRows.length);
       histSheet.getRange(2, 1, newRows.length, HISTORY_HEADERS.length).setValues(newRows);
       ```
     - Only add an exercise to `exercisesToRecalc` if at least one new (non-duplicate) set was added for that exercise.

3. **Return Status:**
   - Return `{ synced: true, sessionId: session ? session.id : null, insertedCount: newRows.length }`.

---

## Target Files
- `Combined_AppScript_v2.gs`

---

## Submission Protocol for Developer
1. Execute all edits in `Combined_AppScript_v2.gs`.
2. Verify production build with `cd gymlog-react && cmd /c npm run build`.
3. Respond in chat with strictly the 4-line XML snippet inside a fenced code block:

```xml
<TASK_HANDOFF>
  <TASK_ID>TASK-R136</TASK_ID>
  <ROLE>Sandbox_Developer</ROLE>
  <STATUS>DEVELOPMENT_TASK_COMPLETE</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</TASK_HANDOFF>
```
