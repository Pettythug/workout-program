# TASK-R84: Permanent Mobile-Native Sticky Header Timer for Android

> **For Human Readers:** This task replaces the fragile floating scroll overlay with a hardware-accelerated, mobile-native sticky timer bar docked directly into the top header container. This ensures the live clock (Stopwatch / Rest Countdown / Rest Complete) is 100% permanently visible on Android mobile devices at all scroll positions without lagging or disappearing.

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
    - TARGET_BRANCH: `TASK-R84`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Rebuild `gymlog-react/src/components/StickyRestBanner.jsx` into a mobile-native docked header timer (`StickyHeaderTimer`):
       - Eliminate all `window.scrollY` scroll listeners, resize observers, and floating `position: fixed` / `transform` overlays.
       - Always render as a compact, hardware-accelerated sticky sub-bar attached directly to the top header container.
       - Displays:
         - Active Countdown: `⏳ REST 0:45` with optional quick `+30S` / `SKIP`.
         - Active Stopwatch: `⏱️ 01:23` with tap-to-pause/start or compact reset.
         - Rest Completed: `🚨 REST COMPLETE (0:00)` with `RESTART` and `DISMISS`.
         - Idle: Compact indicator or elegant subtle timer bar when active.
    2. Update `gymlog-react/src/App.jsx`:
       - Wrap `<Header />` and `<StickyRestBanner />` inside a unified top sticky container (`position: sticky; top: 0; zIndex: 999; background: var(--surface); borderBottom: 1px solid var(--border)`).
    3. Update `index.css`:
       - Ensure `.header` and the sticky top container have clean mobile padding and seamless layout on Android devices.
  </OBJECTIVE>
  <RESOURCES>
    - Banner / Timer Bar: `gymlog-react/src/components/StickyRestBanner.jsx`
    - Header: `gymlog-react/src/components/Header.jsx`
    - App: `gymlog-react/src/App.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/StickyRestBanner.jsx`, `gymlog-react/src/components/Header.jsx`, and `gymlog-react/src/App.jsx`.

    2. REFACTOR `gymlog-react/src/components/StickyRestBanner.jsx`:
       - Remove `useEffect` scroll listener (`window.scrollY`) and `ResizeObserver`.
       - Render a sleek, compact status bar whenever `timerIsRunning || timerSeconds > 0 || isCompleted`:
         - If `isCompleted`: Red alert background (`#ef4444`) with `🚨 REST COMPLETE` and `RESTART` / `DISMISS` buttons.
         - If `timerIsCountdown`: Clean dark bar with `⏳ REST {formatTimerTime(timerSeconds)}`, `⏸️ / ▶️`, and `+30S` / `SKIP`.
         - If `!timerIsCountdown`: Clean dark bar with `⏱️ STOPWATCH {formatTimerTime(timerSeconds)}`, `⏸️ / ▶️`, and `RESET`.
       - Style as `width: 100%`, `padding: 6px 16px`, `display: flex`, `justifyContent: space-between`, `alignItems: center`, `borderTop: 1px solid var(--border)`.

    3. MODIFY `gymlog-react/src/App.jsx`:
       - Wrap `<Header />` and `<StickyRestBanner />` inside `<div style={{ position: 'sticky', top: 0, zIndex: 999, background: 'var(--surface)' }}>`.

    4. AUDIT: Generate `/audit_log_R84.md` detailing the mobile-native docked sticky timer architecture.
    5. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
