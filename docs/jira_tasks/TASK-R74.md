# TASK-R74: Add Restart Option to Rest Completed Timer Banner

> **For Human Readers:** This task adds a "RESTART" button to the rest-complete banner, allowing the user to quickly launch another rest period of the same duration.

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
    - TARGET_BRANCH: `TASK-R74`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Add a RESTART button alongside DISMISS in the StickyRestBanner component when the rest timer reaches 0:00.
  </OBJECTIVE>
  <RESOURCES>
    - Sticky Rest Banner: `gymlog-react/src/components/StickyRestBanner.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/StickyRestBanner.jsx`.

    2. MODIFY `gymlog-react/src/components/StickyRestBanner.jsx`:
       - Destructure `timerMode` from `useAppContext()`.
       - Parse `restDuration = parseInt(timerMode, 10)`.
       - Check if `canRestart = !isNaN(restDuration) && restDuration > 0`.
       - If `canRestart` is true, render a "RESTART" button next to "DISMISS" in the `isCompleted` JSX section.
       - Group both buttons in a container with `display: 'flex', gap: '8px', alignItems: 'center'`.
       - Clicking "RESTART" should call `startRestTimer(restDuration)`.
       - Give the "DISMISS" button a subtle red background highlight (`background: 'rgba(239, 68, 68, 0.15)'`) to distinguish it visually.

    3. AUDIT: Generate `/audit_log_R74.md` documenting the additions.
    4. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
