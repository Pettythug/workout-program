# TASK-R37: Location Picker for Exercise Creation & Machine Entry

> **For Human Readers:** When creating a new exercise or entering a new machine via the Settings modal, the user should be able to select or input a location (e.g., "24 Hour Fitness", "Home", "Gym") instead of defaulting to "Anywhere". This task adds a location selection field to the exercise creation flow.

> **STATUS: BACKLOG — Not yet scheduled for execution.**

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: SINGLE_FILE_FEATURE
    - REQUIRED_MODEL_TIER: MEDIUM_TIER
  </GATEKEEPER>
  <OBJECTIVE>
    Add a location picker (dropdown or input) to the exercise creation form in SettingsModal.jsx.
    The selected location should be persisted to the GymLog_Exercises sheet via the existing saveExercise action.
  </OBJECTIVE>
  <SCOPE>
    - Frontend: `gymlog-react/src/components/SettingsModal.jsx` (add location dropdown to the create exercise form)
    - Backend: `Combined_AppScript_v2.gs` (verify `gymlog_handleSaveExercise` already writes the Location column — if not, add it)
    - The location list should be populated from the existing `locations` state in AppContext (which already includes user-added locations)
  </SCOPE>
  <ACCEPTANCE_CRITERIA>
    1. The exercise creation form displays a location selector populated with all known locations.
    2. The default selection is "Anywhere".
    3. The selected location is saved to the GymLog_Exercises sheet when the exercise is created.
    4. Existing exercises retain their current location values.
  </ACCEPTANCE_CRITERIA>
</TASK_EXECUTION_PROTOCOL>
```
