# TASK-R40: Fix React Hooks Violation in ImageModal

> **For Human Readers:** This task resolves a fatal React runtime crash ("Rendered more hooks than during the previous render") when opening the exercise image modal. The crash is caused by a conditional early return statement placed before state hook declarations.

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
    - TARGET_BRANCH: `TASK-R40`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Relocate the `if (!isOpen) return null;` statement in `ImageModal.jsx` to be placed after all React Hook declarations to satisfy the Rules of Hooks.
  </OBJECTIVE>
  <RESOURCES>
    - Frontend: `gymlog-react/src/components/ImageModal.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/ImageModal.jsx`.

    2. MODIFY `gymlog-react/src/components/ImageModal.jsx`:
       - Remove `if (!isOpen) return null;` from line 9.
       - Insert `if (!isOpen) return null;` immediately before the main JSX return statement (after the `imgSrc` constant declaration, before `return (`).

    3. AUDIT: Generate `audit_log_R40.md` detailing the hook order fix.
    4. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to confirm compilation succeeds cleanly.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
