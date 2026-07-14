# TASK-QA-R63: QA Verification for Completion Lifecycle Fix

> **For Human Readers:** This task defines the QA verification procedure to test that bonus accessories are preserved if the user completes their workout session and clicks "Undo Completion".

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: QA_VERIFICATION
    - REQUIRED_MODEL_TIER: LOW_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: QA_Engineer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are authorized to run read-only commands and browser tests.
  </ROLE_DEFINITION>
  <OBJECTIVE>
    Verify that accessoriesList state is preserved during complete/undo actions and cleared only on next workout start.
  </OBJECTIVE>
  <RESOURCES>
    - Target URL: `http://localhost:5173/workout-program/react/#/plan`
  </RESOURCES>
  <SEQUENCE>
    1. AUTOMATED BUILD VERIFICATION:
       - Run `npm run build` inside `gymlog-react` to ensure compilation remains clean on branch `TASK-R63`.

    2. AUTOMATED RUNTIME SMOKE TEST:
       - Launch a headless browser instance in background mode.
       - Load `http://localhost:5173/workout-program/react/#/plan`.
       - Verify no console errors or blank screens are present.

    3. PERSISTENCE ON COMPLETION VERIFICATION:
       - Click `"Got More in the Tank? +"` to generate a bonus accessory.
       - Click `"Complete Workout"`.
       - Verify completion view displays `"Workout Day Complete!"`.
       - Click `"UNDO COMPLETION"`.
       - Verify the previously added bonus accessory is STILL visible and has not been cleared.

    4. CLEANUP ON NEXT WORKOUT VERIFICATION:
       - Click `"Complete Workout"`.
       - Click `"START NEXT WORKOUT"`.
       - Verify workout day increments and the bonus accessories are now cleanly wiped from both the view and `localStorage`.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
