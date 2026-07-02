# TASK-R8: PlanView Button Reorganization

> **For Human Readers:** This task reorganizes the layout of `PlanView.jsx` so that the primary action buttons (Full List, Timer, etc) are moved to the bottom of the view, visually mirroring the layout of `CircuitView.jsx`.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: SINGLE_FILE_FEATURE
    - REQUIRED_MODEL_TIER: LOW_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R8`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Reorganize the UI layout of `PlanView.jsx` to match the bottom-heavy button layout of `CircuitView.jsx`.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files: `gymlog-react/src/components/PlanView.jsx`, `gymlog-react/src/components/CircuitView.jsx` (for reference)
  </RESOURCES>
  <CONSTRAINTS>
    - Do not remove any functionality, only reorganize the visual DOM structure.
  </CONSTRAINTS>
  <SEQUENCE>
    1. READ: Target files.
    2. MODIFY: In `PlanView.jsx`, locate the action buttons at the top of the render block (e.g., the "Full List" toggle, the Timer Widget).
    3. MODIFY: Move these components below the `ExerciseCard` rendering block, styling them similarly to the action button cluster found at the bottom of `CircuitView.jsx`.
    4. AUDIT: Generate `audit_log_R8.md` documenting the exact changes.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
