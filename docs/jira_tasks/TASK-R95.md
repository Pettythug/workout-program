# TASK-R95: Mobile Modal Responsive Layout & Button Overflow Hardening

> **For Human & Developer Readers:** This task fixes mobile viewport centering and container clipping in `SettingsModal.jsx` and `SessionStatsModal.jsx` to prevent buttons, inputs, and cards from overflowing narrow screens.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: Frontend_UI_Refactor
    - REQUIRED_MODEL_TIER: ["MEDIUM_TIER", "HIGH_TIER", "Claude Sonnet 4.6 (Thinking)", "Gemini 3.8 Flash (High)", "Gemini 3.1 Pro (Low)"]
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are strictly a Sandbox Developer. Implement the code edits specified below and run validation checks.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_APP_PATH: `gymlog-react`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Modal Overlay & Card Viewport Centering:
       - In `SettingsModal.jsx`, `SessionStatsModal.jsx`, and `ImageModal.jsx`:
         - Set overlay container style to: `position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 12, boxSizing: 'border-box'`.
         - Set inner card style to: `width: '100%', maxWidth: 420, boxSizing: 'border-box', overflowX: 'hidden'`.
    2. Fix Button & Input Clipping in `SettingsModal.jsx`:
       - In the "New person name..." and "New location..." sections:
         - The container should have `display: 'flex', gap: 8, width: '100%', boxSizing: 'border-box'`.
         - The `<input>` must have `minWidth: 0, flex: 1, boxSizing: 'border-box'`.
         - The `ADD` button must have `flexShrink: 0`.
    3. Fix Active Session Button Overflow in `SessionStatsModal.jsx`:
       - In the Active Session card, the two buttons (`Reset to 0m` and `Clear Clock`):
         - Set container `display: 'flex', gap: 8, width: '100%', boxSizing: 'border-box'`.
         - Buttons must have `flex: 1, minWidth: 0, whiteSpace: 'nowrap', padding: '8px 6px', fontSize: 11, boxSizing: 'border-box', letterSpacing: 0`.
    4. Verification:
       - Run `cmd /c npm run build` inside `gymlog-react` to ensure clean build.
       - Run `cmd /c npx eslint src/` inside `gymlog-react` to ensure 0 lint errors and 0 `no-undef`.
  </OBJECTIVE>
</TASK_EXECUTION_PROTOCOL>
```
