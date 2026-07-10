# TASK-R51: Remove Inline REMOVE Button from Circuit View

> **For Human Readers:** The "❌ REMOVE" button in the Circuit workout cards is a metadata-level action (removes the exercise from the circuit-eligible pool permanently) but is placed alongside workout-level actions (DONE/SKIP), creating confusion. All metadata management is already available in the Lift section. This task removes the REMOVE button and its handler from `CircuitCard.jsx`.

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
    - TARGET_BRANCH: `TASK-R51`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Remove the "❌ REMOVE" button and its associated handler from the circuit card component.
  </OBJECTIVE>
  <RESOURCES>
    - Circuit Card Component: `gymlog-react/src/components/CircuitCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/CircuitCard.jsx`.

    2. MODIFY `gymlog-react/src/components/CircuitCard.jsx`:
       a. Remove the `onRemove` prop from the component's function signature/destructured props.
       b. Remove the `handleRemoveClick` function (or equivalent handler that calls `onRemove`).
       c. Remove the `❌ REMOVE` button JSX element from the rendered output.
       d. Do NOT remove the `onRemove` prop passing from `CircuitView.jsx` — it will simply be unused and harmless. This keeps the change minimal and scoped to one file.

    3. AUDIT: Generate `audit_log_R51.md` detailing the removal.
    4. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to confirm compilation succeeds cleanly.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
