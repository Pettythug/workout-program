# TASK-QA-R133: Pre-Merge QA Verification — Warm-Up Start Workout Button & Timer Alignment

- **Target Role:** `QA_Engineer` (Read-Only Access; `DENY(Direct_Write_Code)`)
- **Authorized Model:** `Gemini 3.8 Flash (Low)` (Recommended) or `Gemini 3.8 Flash (High)`
- **STRICT MODEL GATEKEEPER CHECK (MANDATORY ON TURN 1):**
  - If your active model is in `HIGH_TIER` (e.g. `Gemini 4 Argon`, `Gemini 3.8 Pro`, `Claude Opus`):
    - **HALT IMMEDIATELY.** Do NOT run commands.
    - Output: `Model Alignment Error: Request Switch -> Model is too high for QA. Please switch to Gemini 3.8 Flash (Low) or (High) before proceeding.`
- **Target Branch:** `feat/TASK-R133-start-workout-warmup-button`

---

## Verification Scope

Verify the implementation of `TASK-R133` in `gymlog-react/src/components/WarmUpCard.jsx`:
1. Context imports: `sessionStartTime`, `startSession`, `endSession` from `useAppContext()`.
2. Button state:
   - When `!sessionStartTime`: displays `▶ START WORKOUT` and triggers `startSession()`.
   - When `sessionStartTime` exists and `warmUpStatus === 'pending'`:
     - Displays status banner: `⏱ Workout Started • Active Warm-Up` with `Reset` button (calling `endSession()`).
     - Primary button displays: `✓ WARM-UP DONE` and triggers `handleDone()`.
3. Skip behavior:
   - In `handleSkip()`: If `!sessionStartTime`, calls `startSession()` before `skipWarmUp()` and `onAdvance()`.
4. Compile check:
   - Run `cd gymlog-react && cmd /c npm run build` and ensure exit code 0.

---

## Submission Protocol for QA Engineer
**MANDATORY:** Output your response inside a fenced code block (`xml`) so the user can click the "Copy" button:

```xml
<QA_HANDOFF>
  <TASK_ID>TASK-R133</TASK_ID>
  <ROLE>QA_Engineer</ROLE>
  <STATUS>QA_PREMERGE_PASS</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</QA_HANDOFF>
```
