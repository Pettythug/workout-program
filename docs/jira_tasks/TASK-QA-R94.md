# TASK-QA-R94: QA Pre-Merge Validation for Device Owner Progress Sync & Settings Override

> **For Human & QA Readers:** This QA specification validates all deliverables in `TASK-R94` and `TASK-R94-REVISION` on branch `TASK-R94`.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: QA_PreMerge_Verification
    - REQUIRED_MODEL_TIER: ["LOW_TIER", "MEDIUM_TIER", "Gemini 3.8 Flash (Low)", "Gemini 3.5 Flash (Medium)"]
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: QA_Engineer
    - SYSTEM_OVERRIDE: You are strictly a Read-Only Quality Assurance Engineer. You do not modify code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R94`
    - TARGET_APP_PATH: `gymlog-react`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Compile and Scope Verification:
       - Run `npm run build` inside `gymlog-react/` to verify clean compilation (0 errors).
       - Run AST scope check (`npx eslint src/`) to verify 0 `no-undef` errors.
    2. Deliverables Audit:
       - Verify `gymlog-react/src/context/AppContext.jsx`:
         - LocalStorage state keys for `workoutDay`, `circuitWorkoutDay`, and `fullBodyWorkoutDay` are anchored to `deviceOwner` (e.g. `gymlog_workout_day_${owner}`).
         - In `updateWorkoutDay`, `updateCircuitWorkoutDay`, and `updateFullBodyWorkoutDay`, progress updates are persisted to LocalStorage for `deviceOwner` and pushed to Google Sheets via `updateSetting` action.
         - Initial data fetch initializes owner workout days from `data.settings` if present.
         - `updateDeviceOwner` updates the active workout days to the new owner's cached progress.
       - Verify `gymlog-react/src/components/SettingsModal.jsx`:
         - "WORKOUT PROGRESS OVERRIDE" section includes direct text inputs with buffered local state allowing backspacing/clearing and multi-digit typing (e.g. "24").
         - Stepper buttons `[-]` and `[+]` added alongside each progress input.
         - `useEffect` synchronizes local input state with context values upon external changes.
         - `onBlur` handles fallback clamping gracefully.
       - Verify `Combined_AppScript_v2.gs`:
         - `updateSetting` action handler added to `doGet` and `doPost`.
         - `gymlog_handleUpdateSetting` correctly updates or appends key-value pairs in `GymLog_Settings`.
    3. Verification Output:
       - Report findings and output `QA_PREMERGE_PASS` when verified.
  </OBJECTIVE>
  <SEQUENCE>
    1. RUN `npm run build` in `gymlog-react`.
    2. RUN `npx eslint src/` in `gymlog-react`.
    3. REVIEW git diff on `TASK-R94`.
    4. SIGNAL `QA_PREMERGE_PASS`.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
