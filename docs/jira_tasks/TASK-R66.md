# TASK-R66: Persistent Rest-Completion State in Sticky Rest Banner

> **For Human Readers:** This task updates the `StickyRestBanner` component to remain visible at `0:00` with a distinct completed visual state when the countdown timer expires, rather than immediately disappearing.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: SINGLE_FILE_FEATURE
    - REQUIRED_MODEL_TIER: MEDIUM_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R66`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Modify StickyRestBanner.jsx to render a distinct red "Rest Complete" warning state when timerIsCountdown is true and timerSeconds is 0, keeping the banner visible until explicitly dismissed or a new timer starts.
  </OBJECTIVE>
  <RESOURCES>
    - Sticky Rest Banner: `gymlog-react/src/components/StickyRestBanner.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/StickyRestBanner.jsx`.

    2. MODIFY `gymlog-react/src/components/StickyRestBanner.jsx`:
       a. Define two distinct states:
          - Active Countdown: `timerIsRunning && timerIsCountdown && timerSeconds > 0`
          - Completed Rest: `!timerIsRunning && timerIsCountdown && timerSeconds === 0`
       b. Update the visibility guard to render the banner if EITHER state is active (and `showStickyTimer` is true):
          ```javascript
          const isActive = timerIsRunning && timerIsCountdown && timerSeconds > 0;
          const isCompleted = !timerIsRunning && timerIsCountdown && timerSeconds === 0;

          if (!showStickyTimer || (!isActive && !isCompleted)) return null;
          ```
       c. Update the styling and content dynamically based on whether it is completed:
          - If `isCompleted` is true:
            - Text displays: `🚨 REST COMPLETE (0:00)` or similar high-visibility warning message.
            - Font color for the text/time: `#ef4444` (bright red) or background has a subtle red glow.
            - Action buttons: Replace standard buttons with a single `"DISMISS"` or `"OK"` button that calls `resetTimer()` to return the timer to its initial state (e.g. 60s) and hide the completed banner.
          - If `isActive` is true:
            - Keep the existing text and control buttons (`⏸️ PAUSE` / `▶️ START`, `+30S`, `SKIP`).

    3. AUDIT: Generate `/audit_log_R66.md` in the workspace root detailing completion indicator updates.
    4. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to verify compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
