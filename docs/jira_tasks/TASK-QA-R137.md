# TASK-QA-R137: Pre-Merge QA Verification — Comprehensive End-to-End System, Memory & Edge-Case Audit Remediation

- **Target Role:** `QA_Engineer` (Read-Only Access; `DENY(Direct_Write_Code)`)
- **Authorized Model:** `Gemini 3.8 Flash (Low)` (Recommended) or `Gemini 3.8 Flash (High)`
- **STRICT MODEL GATEKEEPER CHECK (MANDATORY ON TURN 1):**
  - If your active model is in `HIGH_TIER` (e.g. `Gemini 4 Argon`, `Gemini 3.8 Pro`, `Claude Opus`):
    - **HALT IMMEDIATELY.** Do NOT run commands.
    - Output: `Model Alignment Error: Request Switch -> Model is too high for QA. Please switch to Gemini 3.8 Flash (Low) or (High) before proceeding.`
- **Target Branch:** `feat/TASK-R137-system-health-and-edge-case-audit`

---

## Verification Scope

Verify the implementation of all 10 remediations (`AUDIT-01` through `AUDIT-10`) in `TASK-R137`:

1. **Source Inspection:**
   - `gymlog-react/src/utils/safeStorage.js`: Verify `safeGetJSON`, `safeSetJSON`, and `safeParseJSON` safely catch `SyntaxError` and `QuotaExceededError`.
   - `gymlog-react/src/context/dataMerge.js`: Verify `mergeFromSheets()` filters `sheetHistory` against `gymlog_pending_deletes` (with `< 3000` ms tolerance), overlays all un-synced `gymlog_pending_sets` regardless of date, and recalculates `personalBests` from the filtered/merged history when local mutations exist.
   - `gymlog-react/src/hooks/useGymAPI.js`: Verify `sheetsPost` forces HTTP `POST` (`text/plain;charset=utf-8`) for `verifyPin` payloads, and `syncAll` cleans up its `externalSignal` `'abort'` event listener in `finally`.
   - `gymlog-react/src/context/AppContext.jsx`:
     - Verify all `JSON.parse` calls use `safeGetJSON` / `safeParseJSON`.
     - Verify `fetchInitData` only updates `gymlog_library_version` after `syncAll` succeeds, reads a fresh `localStorage.getItem('gymlog_exercises')` snapshot after `await syncAll`, and preserves un-synced local/offline sessions when merging `gymlog_session_history`.
     - Verify `deleteSetFromLocalHistory` flushes standalone deletions via `deleteHistoryRow` (online) or queues them (offline).
     - Verify `undoWorkoutSession` restores `.sets` and `.deletes` from removed `batchSyncSession` queue items back to `gymlog_pending_sets` and `gymlog_pending_deletes`.
     - Verify `logExerciseSet` (`0`-rep / `0`-sec failed set handling) checks `ex.isFullBody ? fullBodyWorkoutDay : (ex.isCircuit ? circuitWorkoutDay : workoutDay)`.
   - `gymlog-react/src/components/CircuitView.jsx`, `SettingsModal.jsx`, `SessionStatsModal.jsx`: Verify `safeGetJSON`/`safeParseJSON` usage, `zIndex: 2100` on `SessionStatsModal`, and `100dvh`/`90dvh` viewport support.
   - `Combined_AppScript_v2.gs`: Verify version `v4.4`, `< 3000` ms timestamp tolerance on `batchSyncSession` deletions, and `gymlog_bumpLibraryVersion()` on history/session deletions.

2. **Automated 10-Bug Regression Suite Execution (MANDATORY):**
   - Run the dedicated automated regression test suite:
     ```bash
     cd gymlog-react && node test_task_r137.cjs
     ```
   - Verify all 10 tests (`AUDIT-01` through `AUDIT-10`) report `PASS` with `EXIT_CODE: 0`.

3. **Production Build & Compilation Check (MANDATORY):**
   - Run `cd gymlog-react && cmd /c npm run build` and ensure clean compilation with exit code `0`.

---

## Submission Protocol for QA Engineer
**MANDATORY:** Output your response inside a fenced code block (`xml`) so the user can click the "Copy" button:

```xml
<QA_HANDOFF>
  <TASK_ID>TASK-R137</TASK_ID>
  <ROLE>QA_Engineer</ROLE>
  <STATUS>QA_PREMERGE_PASS</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</QA_HANDOFF>
```
