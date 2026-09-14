# TASK-QA-R83: Pre-Merge QA Validation for TASK-R83

> **For Human Readers:** This task validates the global sticky timer banner elevation (`zIndex: 500`), immediate scroll engagement (`scrollY > 60`), paused persistence, and clean global rendering in `App.jsx`.

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
    - TARGET_BRANCH: `TASK-R83`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Verify StickyRestBanner.jsx elevation (zIndex: 500), global mount in App.jsx, removal of duplicate view instances, and build compilation.
  </OBJECTIVE>
  <RESOURCES>
    - Diff: `git diff main..TASK-R83`
  </RESOURCES>
  <SEQUENCE>
    1. READ modified files:
       - `gymlog-react/src/components/StickyRestBanner.jsx`: Confirm `window.scrollY > 60`, `zIndex: 500`, centered `maxWidth: 480px`, and persistence when paused (`timerSeconds > 0 || timerIsRunning`).
       - `gymlog-react/src/App.jsx`: Confirm `<StickyRestBanner />` is mounted directly below `<Header />`.
       - `PlanView.jsx`, `FullBodyView.jsx`, `LiftView.jsx`: Confirm local `<StickyRestBanner />` imports/elements are removed.
    2. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
    3. REPORT:
       - State whether the validation passes (`QA_PREMERGE_PASS`) or fails.
       - Provide the compile output block and details of the diff check.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
