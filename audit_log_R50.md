# Audit Log: TASK-R50 — Fix Exercise Metadata Overwrite/Corruption Bug

**Date:** 2026-07-10
**Branch:** TASK-R50
**Author:** Sandbox Developer (AI)

## Summary

Implemented a data integrity fallback in the Apps Script backend (`gymlog_handleSaveExercise`) to prevent column corruption when frontend payloads omit metadata fields. Also expanded frontend payloads in `ExerciseCard.jsx` and `CircuitView.jsx` to send complete exercise objects.

## Root Cause

When saving exercise metadata (e.g., toggling `timed` or `isCircuit`), the frontend payloads only included a subset of exercise properties. Since the backend wrote the entire row with `||` fallbacks to empty string, any property not explicitly sent was overwritten with `""` — corrupting columns like `manufacturer`, `fileReference`, `modelSeries`, etc.

## Changes Made

### 1. `Combined_AppScript_v2.gs` — Backend Fallback
- Refactored `gymlog_handleSaveExercise` to read the existing sheet row when updating.
- Introduced a `getVal(payloadVal, existingIdx, defaultVal)` helper that:
  - Uses the payload value if present (`!== undefined && !== null`).
  - Falls back to the existing row cell value if the exercise already exists.
  - Falls back to a safe default (`""`, `false`, `"Anywhere"`) for new exercises.
- Added `gymlog_recalculateBestForExercise(exercise)` call after save (was missing before).
- Same changes mirrored in `test_syntax.js`.

### 2. `gymlog-react/src/components/ExerciseCard.jsx` — Full Payload
- Updated `handleSaveInlineEdit` default payload to include all metadata fields:
  `timed`, `category`, `location`, `isCircuit`, `note`, `manufacturer`, `modelSeries`, `baseExercise`, `muscleGroups`, `fileReference`.

### 3. `gymlog-react/src/components/CircuitView.jsx` — Full Payload
- Updated `handleRemoveExerciseFromCircuit` `sheetsPost` call to send all exercise properties with safe defaults.

## Verification

- `npm run build` — **PASSED** (0 errors, 0 warnings)
