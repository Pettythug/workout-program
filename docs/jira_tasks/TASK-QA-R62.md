# TASK-QA-R62: QA Verification for Completion Actions and Multi-Accessory Session State

> **For Human Readers:** This task defines the QA verification procedure to test completion actions, list navigation, lightweight duplicate checks, and session state persistence in the Plan view.

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
    Verify runtime stability, duplicate prevention, and state persistence of the completion card and accessory block in the React application.
  </OBJECTIVE>
  <RESOURCES>
    - Target URL: `http://localhost:5173/workout-program/react/#/plan`
  </RESOURCES>
  <SEQUENCE>
    1. AUTOMATED BUILD VERIFICATION:
       - Run `npm run build` inside `gymlog-react` to ensure compilation remains clean.

    2. AUTOMATED RUNTIME SMOKE TEST:
       - Launch a headless browser instance using a temporary isolated user profile.
       - Load `http://localhost:5173/workout-program/react/#/plan`.
       - Check for the absence of blank pages and confirm the console output contains no `Uncaught TypeError` or React render crashes.

    3. STATE PERSISTENCE VERIFICATION:
       - Click `"Got More in the Tank? +"` to generate a bonus accessory.
       - Click `"📋 VIEW LIST"` to navigate to the full-list view.
       - Click `"BACK TO ACTIVE CARD"` to return.
       - Verify that the generated bonus accessory is STILL visible and has not disappeared from the page.
       - Reload the page. Verify that the bonus accessory remains visible (restored from `localStorage`).

    4. DUPLICATE PREVENTION VERIFICATION:
       - Click `"➕ Add Another Accessory"` to add a second bonus accessory.
       - Verify that the second accessory is NOT identical to the first accessory or any exercise in today's main plan.
       - Verify that clicking `"Swap Bonus"` on any accessory replaces it with a different exercise from the catalog.

    5. CLEANUP VERIFICATION:
       - Click `"Complete Workout"`.
       - Verify that the workout resets and `'gymlog_session_accessories'` is cleanly deleted from `localStorage`.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
