# TASK-R117: 0-Rep / 0-Sec Attempt Logging, PB Exclusion & Sheet RepRange Display Fix

## Overview
Currently in GymLog, when a user attempts a heavy lift or hold but fails the attempt (0 reps or 0 seconds completed):
1. The app either prevents logging 0 reps, or improperly treats `reps <= 3` as a `1-3` heavy PR/Max, which falsely records failed attempts as Personal Bests.
2. Tagging a 0-rep set defaults to `r1_3` instead of the active workout day's prescribed target rep range (e.g. `r8_12`, `r4_7`, `r13_plus`).
3. Failed attempts should still trigger the rest countdown timer and record notes so the user can track what they attempted and why they failed.
4. Additionally, Google Apps Script in `Combined_AppScript_v2.gs` reads the `Sessions` tab with `.getValues()`, causing Google Sheets to coerce `1-3`, `4-7`, and `8-12` into Date objects (`"Wed Aug 12..."`).

This task implements complete support for 0-rep/0-sec attempt logging with Personal Best exclusion across frontend and backend, and resolves the Google Sheets session repRange data formatting at the root cause.

---

## Technical Context & Requirements

### 1. Frontend 0-Rep / 0-Sec Attempt Logging (`AppContext.jsx`)
- In `logExerciseSet`:
  - Allow `reps === 0` (or `timeSeconds === 0`) to be logged as a valid attempt.
  - When `reps === 0`:
    - Assign the set's `repRange` to the **active workout day's target rep range** (e.g. `r8_12`, `r1_3`, `r13_plus`, or `r4_7`) rather than categorizing 0 reps as `r1_3`.
    - Trigger the automatic rest countdown timer as normal so the lifter gets their prescribed rest period after an attempt.
    - Preserve any notes entered by the user (e.g. "Attempted 500 lbs, couldn't break floor").
- In `calculateBestForExercise` (and any local PR/Max calculation in `AppContext.jsx`):
  - Strictly guard against 0-rep or 0-second entries: sets with `reps <= 0` or `timeSeconds <= 0` must **never** be considered for Max Weight, Max Reps, or estimated 1RM.

### 2. Backend Personal Best Exclusion (`Combined_AppScript_v2.gs`)
- In `gymlog_recalculateBestForExercise()` and `migrateBestTab()`:
  - Add strict checks: `if (!reps || Number(reps) <= 0) continue;`
  - Ensure failed attempts logged in the `History` tab are never aggregated into the `Best` tab.

### 3. Backend Sessions RepRange Display Fix (`Combined_AppScript_v2.gs`)
- In `doGet` / `doPost` session read handlers (around lines 355–370 and lines 1160–1175):
  - Instead of extracting `repRange` from raw `getValues()` (which turns `8-12` into Date object `Wed Aug 12...`), read `sessionsSheet.getRange(...).getDisplayValues()` for the `repRange` column (or sanitize Date objects into clean `M-D` strings).
  - This guarantees Google Apps Script outputs clean strings (`"1-3"`, `"4-7"`, `"8-12"`, `"13+"`) directly to the client JSON payload.

---

## Detailed Acceptance Criteria

1. **Attempt Logging:**
   - Logging 0 reps with weight (e.g. 500 lbs x 0 reps) saves successfully to local history and syncs to Google Sheets.
   - The set is tagged with the current day's target rep range (`r8_12`, `r4_7`, etc.).
   - The rest timer immediately triggers and starts counting down.
2. **Personal Best Integrity:**
   - A 0-rep set is NEVER recorded or displayed as a Personal Best / PR on either frontend or Google Sheets backend.
3. **Session RepRange Root Cause:**
   - In `Combined_AppScript_v2.gs`, session `repRange` values are retrieved as clean display strings (`1-3`, `4-7`, `8-12`, `13+`).
4. **Build Verification:**
   - `npm run build` passes with zero errors or warnings.

---

## Target Files
- `gymlog-react/src/context/AppContext.jsx`
- `Combined_AppScript_v2.gs`
