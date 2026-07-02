# TASK-R4b: PIN Caching (UX Fix)

> **For Human Readers:** This task caches the user's PIN in the browser's `localStorage`. This ensures that you only have to enter your PIN *once forever* on your personal device, rather than typing it at the start of every single workout session.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: MULTI_FILE_FEATURE
    - REQUIRED_MODEL_TIER: MEDIUM_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R4b`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Cache validated User PINs in `localStorage` so the `window.prompt` only ever fires once per person per device.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files: `gymlog-react/src/components/ExerciseCard.jsx`, `gymlog-react/src/components/CircuitView.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Target files.
    2. MODIFY: In both files, before calling `window.prompt`, check `localStorage.getItem('gymlog_pin_' + personKey)`.
    3. MODIFY: If the PIN exists in cache, use it silently. If it does not exist, trigger the `window.prompt`.
    4. MODIFY: If the user provides a PIN via the prompt, immediately save it to `localStorage.setItem('gymlog_pin_' + personKey, pin)` before completing the log action.
    5. AUDIT: Generate `audit_log_R4b.md` documenting the changes.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
