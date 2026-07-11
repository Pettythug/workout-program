# TASK-R52: Globalize Stopwatch and Rest Timer State

> **For Human Readers:** The workout rest countdown/stopwatch resets to 0 when users transition between the Plan, Lift, and Circuit tabs. This task globalizes the timer state inside `AppContext.jsx` so that active timers and countdown intervals continue running in the background across navigation flows, and integrates the global states into `PlanView.jsx` and `CircuitView.jsx`.

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
    - TARGET_BRANCH: `TASK-R52`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Migrate timer/stopwatch state and interval triggers from PlanView and CircuitView into AppContext to keep timers active across tab changes.
  </OBJECTIVE>
  <RESOURCES>
    - App Context Provider: `gymlog-react/src/context/AppContext.jsx`
    - View Component 1: `gymlog-react/src/components/PlanView.jsx`
    - View Component 2: `gymlog-react/src/components/CircuitView.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ target files.

    2. MODIFY `gymlog-react/src/context/AppContext.jsx`:
       - Relocate the timer state hooks and side effects:
         - `timerMode`, `timerSeconds`, `timerIsRunning`, `timerIsCountdown`
         - LocalStorage sync effects for `gym-timer-mode` (standardize on a single key like `gym-global-timer-mode`).
         - The timer countdown interval logic `React.useEffect` with audio beep triggers.
         - The UI helpers: `toggleTimer`, `resetTimer`, `formatTimerTime`, and `startRestTimer(seconds)`.
       - Expose these states and controls via the `AppContext` value payload.

    3. MODIFY `gymlog-react/src/components/PlanView.jsx` and `gymlog-react/src/components/CircuitView.jsx`:
       - Remove local timer state hooks, helper functions, and `useEffect` blocks.
       - Destructure the global timer state and helper triggers from `useAppContext()`.
       - Swap the local call sites with the context variables.
       - Trigger `startRestTimer(parseInt(timerMode, 10))` inside `handleLogSetSaved` / `handleSaveSet` when a set is completed to start the countdown.

    4. AUDIT: Generate `audit_log_R52.md` detailing the timer globalization.
    5. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to confirm compilation succeeds cleanly.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
