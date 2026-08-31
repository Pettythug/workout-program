# TASK-QA-R77: Pre-Merge QA Validation for TASK-R77

> **For Human Readers:** This task validates the unified location filtering, roster cleanup, Settings location deletion action, and fallbacks in `PlanView.jsx`, `LiftView.jsx`, `AccessoryBlock.jsx`, `AppContext.jsx`, and `locationHelper.js`.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: QA_VERIFICATION
    - REQUIRED_MODEL_TIER: LOW_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: QA_Engineer
    - SYSTEM_OVERRIDE: You are explicitly a read-only QA Agent. Write no source code files.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R77`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Verify location normalization, roster defaults, Settings deletion action, and PlanView fallback integration.
  </OBJECTIVE>
  <RESOURCES>
    - Diff: `git diff main..TASK-R77`
  </RESOURCES>
  <SEQUENCE>
    1. READ modified files:
       - `gymlog-react/src/utils/locationHelper.js`: Confirm `normalizeLocation` maps "gym" -> "24 hour fitness" and `matchesLocation` supports comma-separated locations, "Anywhere", and "all".
       - `gymlog-react/src/context/AppContext.jsx`: Confirm default locations list is `["Anywhere", "Home", "24 Hour Fitness"]`, legacy "Gym" is filtered, default activeLocation is "24 Hour Fitness", and `removeLocationFromRoster` is exposed.
       - `gymlog-react/src/components/SettingsModal.jsx`: Confirm delete button `✕` is rendered next to non-"Anywhere" locations.
       - `gymlog-react/src/components/PlanView.jsx`: Confirm `matchesLocation` is used and fallback to "Anywhere" is executed when subset length is 0.
       - `gymlog-react/src/components/LiftView.jsx` and `AccessoryBlock.jsx`: Confirm `matchesLocation` is integrated.
    2. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
    3. REPORT:
       - State whether the validation passes (`QA_PREMERGE_PASS`) or fails.
       - Provide the compile output block and details of the diff check.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
