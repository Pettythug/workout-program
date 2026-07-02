# TASK-R11: Harmonize Plan and Circuit History Views

> **For Human Readers:** This task ensures that the `HISTORY` tab in the standard `ExerciseCard` (used in PlanView) visually matches the `HISTORY` tab in `CircuitCard` by bringing over the `LOGGED SETS` UI block.

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
    - TARGET_BRANCH: `TASK-R11`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Harmonize the visual layout of the `HISTORY` tab in `ExerciseCard.jsx` to match `CircuitCard.jsx` by implementing the `LOGGED SETS` summary block.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files: `gymlog-react/src/components/ExerciseCard.jsx`, `gymlog-react/src/components/CircuitCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Target files.
    2. MODIFY: In `ExerciseCard.jsx`, locate the render block for `activeTab === "HISTORY"`. 
    3. MODIFY: Above the `RECENT HISTORY` block, inject a `LOGGED SETS` UI block identical to the one found in `CircuitCard.jsx`. 
    4. MODIFY: Since `ExerciseCard` does not maintain a temporary `sets` array like `CircuitCard`, populate this `LOGGED SETS` block by filtering `ex.history` for today's date (identical to the logic used for the `todaysSets` block on the main tab).
    5. AUDIT: Generate `audit_log_R11.md` documenting the exact changes.
    6. EXECUTE: Run `git push origin TASK-R11` to push the branch to the remote repository.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
