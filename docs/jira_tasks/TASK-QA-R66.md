# TASK-QA-R66: QA Verification for Persistent Rest-Completion State

> **For Human Readers:** This task defines the QA verification steps to test that the Sticky Rest Banner behaves correctly when the rest timer expires, displaying the red warning state and dismissing cleanly.

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
    Verify that the sticky banner remains visible at 0:00 with red warning elements, and dismisses on user action.
  </OBJECTIVE>
  <RESOURCES>
    - Plan View: `http://localhost:5173/workout-program/react/#/plan`
  </RESOURCES>
  <SEQUENCE>
    1. AUTOMATED BUILD VERIFICATION:
       - Run `npm run build` inside `gymlog-react` to ensure compilation is clean on branch `TASK-R66`.

    2. AUTOMATED RUNTIME SMOKE TEST:
       - Launch a headless browser instance in background mode.
       - Load the Plan page. Verify there are no console errors.
       - Start a short rest timer (e.g. 30S). Scroll down past 220px to show the sticky banner.
       - Let the timer countdown reach 0.
       - Verify that the banner does NOT disappear.

    3. COMPLETED VIEW STATE VERIFICATION:
       - Verify the banner content changes to "🚨 REST COMPLETE (0:00)".
       - Verify the banner styling features the red border (#ef4444) and box-shadow red glow.
       - Verify the active controls (PAUSE, +30S, SKIP) are replaced with a single "DISMISS" button.

    4. DISMISSAL VERIFICATION:
       - Click `"DISMISS"` on the sticky banner.
       - Verify that the banner immediately hides (returns `null`).
       - Verify the global timer state is reset to its default rest duration.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
