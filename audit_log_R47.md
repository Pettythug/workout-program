# Audit Log: TASK-R47 (Add Weight Tracking to Timed Exercises)

## Overview
This document logs the changes made to the frontend logging cards to support optional weight tracking for timed exercises (e.g., weighted planks, weighted hangs). Exposing the weight input field allows users to specify an optional weight for timed sets, which is already supported by the backend and history parsing.

## Changes Made
1. **gymlog-react/src/components/ExerciseCard.jsx**:
   - Inside `PersonLogSection` (when `ex.timed` is true), modified the duration input to display both duration (secs, width: 70px) and optional weight (lbs, width: 70px) inputs wrapped in a React fragment.

2. **gymlog-react/src/components/CircuitCard.jsx**:
   - Inside `PersonRow` (when `ex.timed` is true), modified the duration input to display both duration (secs, width: 70px) and optional weight (lbs, width: 70px) inputs wrapped in a React fragment.

## Verification
- Confirmed compilation with `npm run build` in `gymlog-react`.
