# TASK-QA-R64: QA Verification for Sticky Floating Countdown Rest Banner

> **For Human Readers:** This task defines the QA verification procedure to test that the sticky rest countdown banner appears, scales, controls the timer, and fades appropriately on scroll.

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
    Verify that the sticky rest banner renders correctly below the header on scroll, functions correctly, and compiles cleanly.
  </OBJECTIVE>
  <RESOURCES>
    - Plan View: `http://localhost:5173/workout-program/react/#/plan`
    - Circuit View: `http://localhost:5173/workout-program/react/#/circuit`
  </RESOURCES>
  <SEQUENCE>
    1. AUTOMATED BUILD VERIFICATION:
       - Run `npm run build` inside `gymlog-react` to ensure compilation is clean on branch `TASK-R64`.

    2. AUTOMATED RUNTIME SMOKE TEST:
       - Launch a headless browser instance in background mode.
       - Load the Plan page. Verify there are no console errors.
       - Scroll down past 220px. Start the rest timer.
       - Verify that the sticky timer element appears in the DOM and contains the correct formatted rest time text.

    3. INTERACTION & CONTROLS VERIFICATION:
       - Click `"⏸️ PAUSE"` on the sticky banner. Verify the countdown stops.
       - Click `"+30S"` on the sticky banner. Verify the countdown time increases by 30 seconds.
       - Click `"SKIP"` on the sticky banner. Verify the countdown ends and the banner disappears.

    4. SCROLL THRESHOLD VERIFICATION:
       - Start the rest timer.
       - Scroll to the top of the page (`scrollY < 220`). Verify that the sticky banner is NOT rendered (since the inline widget is fully visible).
       - Scroll down (`scrollY > 220`). Verify that the sticky banner appears.

    5. CIRCUIT VIEW VERIFICATION:
       - Switch to the Circuit page.
       - Scroll down past 220px, start the timer, and repeat the scroll/visibility check. Confirm the banner pins cleanly.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
