# TASK-QA-R68: QA Verification for Cohesive Logging Layout

> **For Human Readers:** This task defines the QA verification steps to test that data inputs, checkboxes, and notes for each person remain logically grouped and unified in both single-user and multi-user configurations.

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
    Verify that user inputs, settings, and notes are never split by the submit button in both single and multi-user views.
  </OBJECTIVE>
  <RESOURCES>
    - Plan View: `http://localhost:5173/workout-program/react/#/plan`
  </RESOURCES>
  <SEQUENCE>
    1. AUTOMATED BUILD VERIFICATION:
       - Run `npm run build` inside `gymlog-react` to ensure compilation is clean on branch `TASK-R68`.

    2. SINGLE-USER LAYOUT INSPECTION:
       - Verify reps/lbs inputs are rendered on the same line as the green log button.
       - Verify checkboxes and notes inputs are positioned directly below this row.

    3. MULTI-USER LAYOUT INSPECTION:
       - Configure the app for multiple active users (e.g. Brian + Test).
       - Expand an exercise card.
       - Verify each person has a single cohesive container block that groups:
         - Target ranges.
         - reps/lbs inputs.
         - checkboxes (Singles, Alternating).
         - Notes text area.
       - Verify that the green `"LOG SET X"` button is positioned at the very bottom of the user card list, rather than separating the inputs from the notes.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
