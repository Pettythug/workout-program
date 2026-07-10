# Audit Log: TASK-R46 (Fix Duplicate Logging via Active People Deduplication)

## Overview
This document logs the changes made to prevent duplicate logging inside the React gym-logging application by deduplicating active roster members on load, state updates, context export, and log execution.

## Changes Made
1. **gymlog-react/src/context/AppContext.jsx**:
   - **State Initialization**: Updated the `activePeople` state initialization to filter out duplicate cached items loaded from `localStorage` using a `Set`.
   - **Roster Toggling**: Updated `togglePersonActive` to filter out duplicates from the new active roster array before persisting to `localStorage` and updating state.
   - **Device Owner Update**: Updated `updateDeviceOwner` to filter out duplicates when forcing the device owner into the active roster.
   - **Exercise Set Logging (`logExerciseSet`)**:
     - Added a `seenKeys` deduplication check in the mapping loops to prevent processing the same lowercased username more than once.
     - Added a `seenPinKeys` check in the user PIN validation loop to prevent prompts or duplicate PIN retrieval for the same lowercased username.
   - **Context Value Export**: Updated the `activePeople` property in `contextValue` to return only unique active roster members (filtered through `Set` and verified against the current roster).

## Verification
- Verified compilation by running `npm run build` inside `gymlog-react`.
