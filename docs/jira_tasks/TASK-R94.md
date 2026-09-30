# TASK-R94: Device Owner Workout Number Cloud Sync & Settings Override

> **For Human Readers:** This task anchors workout number progression (Plan, Circuit, Full Body) to the active Device Owner, syncs cycle progress per-user to Google Sheets (`GymLog_Settings`), and adds an intuitive Progress Override section in Settings (??) so users can jump or rewind their workout number at any time without test profiles polluting real data.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: MULTI_FILE_Refactoring
    - REQUIRED_MODEL_TIER: ["MEDIUM_TIER", "Gemini 3.8 Flash (Medium)", "Gemini 3.8 Flash", "Gemini 3.8 Pro"]
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R94`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Device Owner Keyed Workout Progress (`AppContext.jsx`):
       - Anchor active workout days (`workoutDay`, `circuitWorkoutDay`, `fullBodyWorkoutDay`) to the active `deviceOwner` (defaulting to 'Brian').
       - When `deviceOwner` changes, reload that user's specific progress from local cache (`gymlog_workout_day_${owner}`, `gymlog_circuit_workout_day_${owner}`, `gymlog_fullBody_workout_day_${owner}`) or settings.
       - When `updateWorkoutDay`, `updateCircuitWorkoutDay`, or `updateFullBodyWorkoutDay` is called (e.g. on `completeWorkout()`):
         - Update local state and `localStorage`.
         - Background sync the new day to Google Sheets via `sheetsPost({ action: 'updateSetting', key: `${owner}_Plan_Day`, value: newDay })`.

    2. Google Sheets Progress Sync (`Combined_AppScript_v2.gs` & `AppContext.jsx`):
       - On initial load / data sync, read `${owner}_Plan_Day`, `${owner}_Circuit_Day`, and `${owner}_FullBody_Day` from `GymLog_Settings`.
       - Ensure `Combined_AppScript_v2.gs` supports `updateSetting` action to save/upsert setting key-values to `GymLog_Settings`.

    3. Progress Override Controls (`SettingsModal.jsx`):
       - In `SettingsModal.jsx`, add a clean **Workout Progress Override** section displaying:
         - Active Device Owner: `${deviceOwner}`
         - Number inputs for:
           - `Plan Workout #` (current: `workoutDay`)
           - `Full Body Workout #` (current: `fullBodyWorkoutDay`)
           - `Circuit Workout #` (current: `circuitWorkoutDay`)
         - `[ UPDATE PROGRESS ]` button that updates the respective workout numbers and triggers background sync.

    4. Verification & Audit:
       - Run `npm run build` inside `gymlog-react/` to verify clean compilation with 0 errors.
       - Run `npx eslint src/` to verify 0 `no-undef` errors.
  </OBJECTIVE>
  <RESOURCES>
    - Context: `gymlog-react/src/context/AppContext.jsx`
    - Settings: `gymlog-react/src/components/SettingsModal.jsx`
    - Backend: `Combined_AppScript_v2.gs`
  </RESOURCES>
  <SEQUENCE>
    1. READ `docs/jira_tasks/TASK-R94.md`.
    2. MODIFY `AppContext.jsx` to key workout progress by `deviceOwner` and sync with Google Sheets settings.
    3. MODIFY `Combined_AppScript_v2.gs` to ensure `updateSetting` handles setting upserts.
    4. MODIFY `SettingsModal.jsx` to add the Workout Progress Override section.
    5. RUN `npm run build` and `npx eslint src/` inside `gymlog-react` and verify clean build with 0 errors.
    6. SIGNAL `DEVELOPMENT_TASK_COMPLETE`.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
