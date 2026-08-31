# TASK-R79: Wall-Clock Rest Timer Engine and Lift View Rest Timer Integration

> **For Human Readers:** This task upgrades the global timer in `AppContext.jsx` to use wall-clock timestamps (preventing timers from pausing when the mobile screen is locked or turned off), and integrates the rest timer and sticky rest banner into `LiftView.jsx`.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: MULTI_FILE_Refactoring
    - REQUIRED_MODEL_TIER: MEDIUM_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R79`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Upgrade timer engine in `AppContext.jsx` to real-world timestamps:
       - Maintain target end timestamps (`targetEndTimeRef` & localStorage) for countdowns.
       - Maintain start timestamps (`startTimeRef` & localStorage) for stopwatches.
       - Recalculate remaining/elapsed time on every interval tick and on `visibilitychange` / `focus` window events.
       - Ensure timer completes accurately even if the phone screen was asleep for the entire rest duration.
    2. Integrate Rest Timer into `LiftView.jsx`:
       - Render `<StickyRestBanner />` at the top of the component.
       - Pass `onLogSet={() => startRestTimer(parseInt(timerMode, 10))}` to all rendered `<ExerciseCard>` instances.
  </OBJECTIVE>
  <RESOURCES>
    - Context: `gymlog-react/src/context/AppContext.jsx`
    - Lift View: `gymlog-react/src/components/LiftView.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/context/AppContext.jsx` and `gymlog-react/src/components/LiftView.jsx`.

    2. MODIFY `gymlog-react/src/context/AppContext.jsx`:
       - Add `targetEndTimeRef` (for countdown) and `startTimeRef` (for stopwatch).
       - Create an `updateFromTimestamp()` helper:
         - If `timerIsCountdown` and `targetEndTimeRef.current`:
           - `const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));`
           - `setTimerSeconds(remaining);`
           - If `remaining <= 0`, set `timerIsRunning(false)` and trigger the Web Audio beep alert.
         - If stopwatch and `startTimeRef.current`:
           - `const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);`
           - `setTimerSeconds(elapsed);`
       - In `useEffect` with `interval`, invoke `updateFromTimestamp()` every 500ms–1000ms.
       - Add event listeners for `document.addEventListener('visibilitychange', updateFromTimestamp)` and `window.addEventListener('focus', updateFromTimestamp)` to instantly sync state upon screen unlock.
       - In `startRestTimer(seconds)`:
         - Set `targetEndTimeRef.current = Date.now() + seconds * 1000`.
         - Set `timerSeconds(seconds)`, `timerIsCountdown(true)`, and `timerIsRunning(true)`.
       - In `toggleTimer()`:
         - If starting countdown: set `targetEndTimeRef.current = Date.now() + timerSeconds * 1000`.
         - If starting stopwatch: set `startTimeRef.current = Date.now() - timerSeconds * 1000`.
       - In `resetTimer()`:
         - Clear `targetEndTimeRef.current` and `startTimeRef.current`.

    3. MODIFY `gymlog-react/src/components/LiftView.jsx`:
       - Import `StickyRestBanner` from `./StickyRestBanner`.
       - Destructure `startRestTimer` and `timerMode` from `useAppContext()`.
       - Render `<StickyRestBanner />` inside the top container.
       - Create `const handleLogSetSaved = () => { startRestTimer(parseInt(timerMode, 10)); };`.
       - Pass `onLogSet={handleLogSetSaved}` to rendered `<ExerciseCard>` instances.

    4. AUDIT: Generate `/audit_log_R79.md` detailing the timestamp timer engine and LiftView integration.
    5. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
