# TASK-R83: Implement Global High-Priority Sticky Timer Banner

> **For Human Readers:** This task fixes the timer disappearing when scrolling down. It promotes `StickyRestBanner` to a global app-level component in `App.jsx`, raises its z-index above all sticky subheaders and cards, lowers the scroll threshold, and keeps it visible when paused so the clock never disappears on long pages.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: MULTI_FILE_Refactoring
    - REQUIRED_MODEL_TIER: ["MEDIUM_TIER", "Gemini 3.8 Flash (Medium)", "Gemini 3.8 Flash", "Gemini 3.8 Pro"]
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R83`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Upgrade `gymlog-react/src/components/StickyRestBanner.jsx`:
       - Increase `zIndex` to `500` (above all `.header` subheaders and cards with `zIndex: 100`, below full modals with `zIndex: 1000`).
       - Set scroll threshold to `window.scrollY > 60` so it engages as soon as the top bar scrolls off screen.
       - Allow banner to stay visible when paused if time remains (`timerSeconds > 0` or `isCompleted`).
       - Add responsive centering styling (`maxWidth: 480px`, `left: '50%'`, `transform: 'translateX(-50%)'`, `width: 'calc(100% - 32px)'`).
    2. Update `gymlog-react/src/App.jsx`:
       - Import and render `<StickyRestBanner />` globally directly beneath `<Header />`.
    3. Clean up individual views:
       - Remove local `<StickyRestBanner />` imports and tags from `PlanView.jsx`, `FullBodyView.jsx`, and `LiftView.jsx` to avoid duplicate rendering.
  </OBJECTIVE>
  <RESOURCES>
    - Sticky Banner: `gymlog-react/src/components/StickyRestBanner.jsx`
    - App: `gymlog-react/src/App.jsx`
    - Views: `PlanView.jsx`, `FullBodyView.jsx`, `LiftView.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/StickyRestBanner.jsx`, `gymlog-react/src/App.jsx`, `gymlog-react/src/components/PlanView.jsx`, `gymlog-react/src/components/FullBodyView.jsx`, and `gymlog-react/src/components/LiftView.jsx`.

    2. MODIFY `gymlog-react/src/components/StickyRestBanner.jsx`:
       - Change scroll trigger: `const handleScroll = () => setShowStickyTimer(window.scrollY > 60);`.
       - Update active condition to support both running and paused timers with time:
         `const isCountdownActive = timerIsCountdown && (timerSeconds > 0 || timerIsRunning);`
         `const isStopwatchActive = !timerIsCountdown && (timerSeconds > 0 || timerIsRunning);`
         `const isActive = isCountdownActive || isStopwatchActive;`
         `const isCompleted = !timerIsRunning && timerIsCountdown && timerSeconds === 0;`
       - Update container styling to:
         `position: 'fixed'`, `top: '${headerHeight + 8}px'`, `left: '50%'`, `transform: 'translateX(-50%)'`, `width: 'calc(100% - 32px)'`, `maxWidth: '480px'`, `zIndex: 500`.

    3. MODIFY `gymlog-react/src/App.jsx`:
       - Import `StickyRestBanner` from `./components/StickyRestBanner`.
       - Render `<StickyRestBanner />` inside `<HashRouter>` right above `<main className="main">`.

    4. MODIFY `gymlog-react/src/components/PlanView.jsx`, `gymlog-react/src/components/FullBodyView.jsx`, and `gymlog-react/src/components/LiftView.jsx`:
       - Remove local `<StickyRestBanner />` JSX element and unused imports.

    5. AUDIT: Generate `/audit_log_R83.md` detailing the global sticky banner refactor.
    6. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
