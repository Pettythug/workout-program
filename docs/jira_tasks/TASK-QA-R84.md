# TASK-QA-R84: Pre-Merge QA Validation for TASK-R84

> **For Human Readers:** This task validates the mobile-native docked sticky header timer in `.sticky-header-container`, eliminating scroll listeners and ensuring hardware-accelerated stickiness on Android.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: QA_VERIFICATION
    - REQUIRED_MODEL_TIER: ["LOW_TIER", "Gemini 3.8 Flash (Low)", "Gemini 3.8 Flash (Medium)", "Gemini 3.8 Flash"]
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: QA_Engineer
    - SYSTEM_OVERRIDE: You are explicitly a read-only QA Agent. Write no source code files.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R84`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Verify StickyRestBanner.jsx docked layout, .sticky-header-container in App.jsx and index.css, and clean build compilation.
  </OBJECTIVE>
  <RESOURCES>
    - Diff: `git diff main..TASK-R84`
  </RESOURCES>
  <SEQUENCE>
    1. READ modified files:
       - `gymlog-react/src/components/StickyRestBanner.jsx`: Confirm scroll event listeners (`window.scrollY`) and `ResizeObserver` are removed. Confirm docked layout with `translateZ(0)`, countdown and stopwatch status rows, and rest complete alert.
       - `gymlog-react/src/App.jsx`: Confirm `<Header />` and `<StickyRestBanner />` are wrapped in `<div className="sticky-header-container">`.
       - `gymlog-react/src/index.css`: Confirm `.sticky-header-container` has `position: sticky; top: 0; z-index: 999;`.
    2. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
    3. REPORT:
       - State whether the validation passes (`QA_PREMERGE_PASS`) or fails.
       - Provide the compile output block and details of the diff check.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
