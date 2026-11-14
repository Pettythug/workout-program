# TASK-R133: Pre-Workout Warm-Up Start Workout Button & Timer Alignment

- **Target Role:** `Sandbox_Developer`
- **Required Model:** `Gemini 3.8 Flash (High)` (`MEDIUM_TIER`)
- **STRICT MODEL GATEKEEPER CHECK (MANDATORY ON TURN 1):**
  1. Check your active model against `MEDIUM_TIER`: `["Gemini 3.8 Flash (High)", "Gemini 3.8 Flash", "Claude Sonnet 4.6 (Thinking)"]`.
  2. If running on a **HIGHER model** (e.g. `Gemini 4 Argon`, `Gemini 3.8 Pro`, `Claude Opus`):
     - **HALT IMMEDIATELY.** Do NOT read files or run tools.
     - Output: `Model Alignment Error: Request Switch -> Model is too high. Please switch to Gemini 3.8 Flash (High) before proceeding.`
  3. If running on a **LOWER model** (e.g. `Gemini 3.8 Flash (Low)`, `Gemini 3.5 Flash (Medium/Low)`):
     - **HALT IMMEDIATELY.** Do NOT read files or run tools.
     - Output: `Model Alignment Error: Request Switch -> Model is too low. Please switch to Gemini 3.8 Flash (High) before proceeding.`

---

## Overview
Currently, the pre-workout warm-up card only starts the session timer (`sessionStartTime`) when the user taps **`DONE`** *after* completing their warm-up. This fails to account for the 2–5 minutes the user spent warming up, under-reporting total workout duration.

We want an explicit **`▶ START WORKOUT`** button when entering the gym. The user taps `▶ START WORKOUT` to start warming up, the workout session timer begins running immediately, and the button changes to **`✓ WARM-UP DONE`**. Tapping `✓ WARM-UP DONE` marks the warm-up complete and advances to the first exercise while preserving the original session start time.

---

## Technical Specifications & Requirements

### Target File: `gymlog-react/src/components/WarmUpCard.jsx`
1. **Context Consumption:**
   - In `WarmUpCard`, extract `sessionStartTime`, `startSession`, and `endSession` from `useAppContext()`.
2. **Session Start State & Flow:**
   - If `!sessionStartTime` (workout session has not started yet):
     - The primary action button displays: **`▶ START WORKOUT`**.
     - Tapping `▶ START WORKOUT` calls `startSession()`.
   - If `sessionStartTime` exists and `warmUpStatus === 'pending'`:
     - The primary action button displays: **`✓ WARM-UP DONE`**.
     - Display a clean status badge/banner above the action buttons indicating the workout timer is active:
       - e.g.: `⏱ Workout Started • Active Warm-Up` with a subtle `Reset` button (calling `endSession()`) in case tapped accidentally.
     - Tapping `✓ WARM-UP DONE` calls `handleDone()`, executing `completeWarmUp(selectedWarmUp)` and calling `onAdvance()` to move to the first exercise.
3. **Skip Button Alignment:**
   - In `handleSkip()`: If `!sessionStartTime`, call `startSession()` before `skipWarmUp()` and `onAdvance()` so skipping the warm-up still initializes `sessionStartTime` for Exercise 1.

---

## Target Files
- `gymlog-react/src/components/WarmUpCard.jsx`

---

## Validation & Verification Protocol
1. Verify production build passes with zero errors:
   ```cmd
   cmd /c npm run build
   ```
2. Respond strictly with the 4-line XML handoff snippet:
   ```xml
   <TASK_HANDOFF>
     <TASK_ID>TASK-R133</TASK_ID>
     <ROLE>Sandbox_Developer</ROLE>
     <STATUS>DEVELOPMENT_TASK_COMPLETE</STATUS>
     <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
   </TASK_HANDOFF>
   ```
