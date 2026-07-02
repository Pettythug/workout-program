# TASK-R2: Fix PlanView Skip Loop Logic

> **For Human Readers:** This task fixes a bug in `PlanView` where skipped exercises wait until the very end of the workout to recycle back into the active rotation. We are aligning the logic with `CircuitView` so that completing any exercise immediately recycles all previously skipped exercises back to active.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: SINGLE_FILE_FEATURE
    - REQUIRED_MODEL_TIER: MEDIUM_TIER ("Claude Sonnet 4.6 (Thinking)" OR "Gemini 3.5 Flash (High)")
    - ACTION_REQUIRED: If you are not running on a MEDIUM_TIER or HIGH_TIER model, immediately halt and prompt the user.
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. The `SOURCE_WRITE_LOCK` strictly applies to the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R2`
    - ACTION_REQUIRED: Validate your working directory state before proceeding. (You are running in an Open IDE, so you natively inherit the user's active branch).
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Align `PlanView.jsx` skip recycling logic with `CircuitView.jsx` so that skipped exercises recycle immediately upon completion of another exercise, rather than waiting for the entire plan to finish.
  </OBJECTIVE>
  <RESOURCES>
    - Target File: `gymlog-react/src/components/PlanView.jsx`
    - Reference Logic: `gymlog-react/src/components/CircuitView.jsx` (Observe how `handleExplicitDone` flips skipped status back to active immediately).
    - State Context: `exerciseStatus` is managed via `useAppContext()` (which provides `updateExerciseStatus` and `resetExerciseStatus`).
  </RESOURCES>
  <CONSTRAINTS>
    - DO NOT modify `CircuitView.jsx` or `AppContext.jsx`. Confine your logic changes strictly to `PlanView.jsx`.
    - DO NOT use `window.confirm` or alert dialogues unless already present in the existing code blocks you are modifying.
  </CONSTRAINTS>
  <SEQUENCE>
    1. READ: `gymlog-react/src/components/PlanView.jsx`.
    2. ANALYZE: Locate the `useEffect` on lines ~178-208 that recycles skipped exercises ONLY when `allDoneOrSkipped` is true.
    3. MODIFY: Change the logic so that whenever ANY exercise is marked as `done` (or when `exerciseStatus` changes to `done` for any exercise), any other exercise currently marked as `skipped` is immediately reset to active (via `resetExerciseStatus`).
    4. VERIFY: Run `npm run build` -> EXPECT(0 syntax errors).
    5. AUDIT: Generate `audit_log_R2.md` documenting the exact changes made to `PlanView.jsx`.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```

