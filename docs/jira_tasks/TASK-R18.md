# TASK-R18: Standardize ExerciseCard Action Buttons Layout

> **For Human Readers:** This task relocates the SWAP and IMAGE buttons in `ExerciseCard.jsx` (used in Plan/Lift views) to the bottom of the active panel so they match the standardized button layout of `CircuitCard.jsx`.

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
    - TARGET_BRANCH: `TASK-R18`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Move the `SWAP` and `IMAGE` button block (and its associated `swapMode` conditional rendering logic) from the top of the `ExerciseCard.jsx` active panel to the absolute bottom of the active panel, below the LOG / HISTORY tabs.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files: `gymlog-react/src/components/ExerciseCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Target file.
    2. LOCATE: Find the block rendering the `SWAP` and `IMAGE` buttons (and `swapMode` logic) around lines 500-558 inside `ExerciseCard.jsx`.
    3. CUT the entire block starting from `{swapMode ? ( ... ) : ( <div display: flex... SWAP / IMAGE /> )}`.
    4. PASTE the block at the bottom of the card's open state, specifically immediately after the end of the `{activeTab === "HISTORY" && (...)}` block (around line 734) and just before the toast block.
    5. ADD a `marginTop: 16` to the pasted block wrapper so it spaces evenly from the tabs above it.
    6. AUDIT: Generate `audit_log_R18.md` documenting the move.
    7. VERIFY: Run `npm run build` to ensure no syntax errors were introduced.
    8. EXECUTE: Run `git push origin TASK-R18` to push the branch to the remote repository.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
