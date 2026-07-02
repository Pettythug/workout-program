# TASK-R13: Consolidate Core Exercise Categories

> **For Human Readers:** This task merges the split "Rotational Core" and "Plank/Static Core" categories into a single unified "Core" category across both the backend sync parser and the frontend workout generator.

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
    - TARGET_BRANCH: `TASK-R13`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Unify all core exercise categories into a single "Core" category to allow static and rotational core exercises to mix organically.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files: `Combined_AppScript_v2.gs`, `gymlog-react/src/components/PlanView.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Target files.
    2. MODIFY: In `Combined_AppScript_v2.gs`, locate the `normalizeCategory` function (around line 1030).
    3. MODIFY: Remove the distinct `if (c.includes("rotational core"))` and `if (c.includes("plank core"))` checks. Replace them with a single check: `if (c.includes("core")) return "Core";`.
    4. MODIFY: In `gymlog-react/src/components/PlanView.jsx` (around lines 80-82), locate the random group pickers. Replace `pick(['Rotational Core', 'Plank Core'])` and `pick(['Plank Core', 'Rotational Core'])` with simply `pick(['Core'])`.
    5. AUDIT: Generate `audit_log_R13.md` documenting the exact changes.
    6. EXECUTE: Run `git push origin TASK-R13` to push the branch to the remote repository.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
