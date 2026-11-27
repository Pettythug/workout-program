# TASK-QA-R141: Pre-Merge QA Verification — Full Body Rep Range Highlight Fix (`useTargetLock`)

- **Target Role:** `QA_Engineer` (Read-Only Access; `DENY(Direct_Write_Code)`)
- **Authorized Model:** `Gemini 3.8 Flash (Low)` (Recommended) or `Gemini 3.8 Flash (High)`
- **STRICT MODEL GATEKEEPER CHECK (MANDATORY ON TURN 1):**
  - If your active model is in `HIGH_TIER` or any `Gemini 4 Argon` / `Gemini 3.8 Pro` / `Claude Opus` model:
    - **HALT IMMEDIATELY.** Do NOT run commands.
    - Output: `Model Alignment Error: Request Switch -> Model is too high for QA. Please switch to Gemini 3.8 Flash (Low) or (High) before proceeding.`
- **Target Branch:** `TASK-R141`

---

## Verification Scope

Verify the implementation of `TASK-R141` on branch `TASK-R141`:

1. **Strict Isolation Check (`git diff main --name-only`):**
   - Confirm changes are strictly limited to:
     - `docs/jira_tasks/TASK-R141.md`
     - `docs/jira_tasks/TASK-QA-R141.md`
     - `gymlog-react/src/hooks/useTargetLock.js`
     - `gymlog-react/src/components/ExerciseCard.jsx`
     - `gymlog-react/src/components/FullBodyView.jsx`
     - `gymlog-react/src/components/PlanView.jsx`
     - `gymlog-react/src/components/AccessoryBlock.jsx`
     - `gymlog-react/src/components/CircuitView.jsx`
     - `gymlog-react/src/components/CircuitCard.jsx`

2. **Source Code Inspection (`git diff main`):**
   - **`useTargetLock.js`:** Verify `useTargetLock(ex, personKey, overrideDay)` accepts `overrideDay` and computes `day` / `activeRangeKey` from `overrideDay ?? workoutDay ?? 1`.
   - **`ExerciseCard.jsx`:** Verify `activeDay` prop is accepted, passed to both `SingleUserLogSection` and `MultiUserPersonLogSection`, forwarded to `useTargetLock(ex, key, activeDay)`, and used consistently (`const effectiveDay = activeDay ?? workoutDay`) anywhere `workoutDay` was previously referenced.
   - **`FullBodyView.jsx` & `AccessoryBlock.jsx`:** Verify `activeDay={fullBodyWorkoutDay}` is passed down to `ExerciseCard` (including full-list view and accessories).
   - **`PlanView.jsx`:** Verify `activeDay={workoutDay}` is passed down to `ExerciseCard` (and `AccessoryBlock` if applicable).
   - **`CircuitView.jsx` & `CircuitCard.jsx`:** Verify `activeDay={circuitWorkoutDay}` is passed from `CircuitView.jsx` to `CircuitCard` (and `AccessoryBlock` if applicable), and `CircuitCard.jsx` forwards `activeDay` to `useTargetLock(ex, key, activeDay)`.

3. **Production Build & Compilation Check (MANDATORY):**
   - Run `cd gymlog-react && cmd /c npm run build` and ensure clean compilation with exit code `0`.

---

## Submission Protocol for QA Engineer
**MANDATORY:** Output your response inside a fenced code block (`xml`) so the user can click the "Copy" button:

```xml
<QA_HANDOFF>
  <TASK_ID>TASK-R141</TASK_ID>
  <ROLE>QA_Engineer</ROLE>
  <STATUS>QA_PREMERGE_PASS</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</QA_HANDOFF>
```
