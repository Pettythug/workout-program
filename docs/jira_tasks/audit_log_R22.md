# Audit Log: TASK-R22 (Unify Exercise Logging Logic)

## Overview
This document logs the changes made to unify the duplicate exercise logging logic currently shared between `ExerciseCard.jsx` and `CircuitView.jsx` by centralizing it into a single `logExerciseSet` action in `AppContext.jsx`.

## Changes Made
1. **AppContext.jsx**:
   - Extracted the `logSet` function from the `useGymAPI` hook.
   - Added the `logExerciseSet` function which handles constructing log entries from form inputs, determining the next set number, asking for user PINs if required, and syncing to the API and local history.
   - Exported `logExerciseSet` in the `contextValue`.
   
2. **ExerciseCard.jsx**:
   - Updated `useAppContext` to extract `logExerciseSet`.
   - Refactored `handleSaveSet` to leverage the centralized `logExerciseSet` function.

3. **CircuitView.jsx**:
   - Updated `useAppContext` to extract `logExerciseSet`.
   - Refactored `handleLogSet` to leverage the centralized `logExerciseSet` function.

## Verification
- Ran `npm run build` and confirmed the app builds successfully.
- Code deduplication achieved without affecting original logic and functionality.
