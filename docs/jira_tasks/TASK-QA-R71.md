# TASK-QA-R71: Pre-Merge QA Validation for TASK-R71

> **For Human Readers:** This task validates the refactored single-user log button layout in `ExerciseCard.jsx`.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: QA_VERIFICATION
    - REQUIRED_MODEL_TIER: LOW_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: QA_Engineer
    - SYSTEM_OVERRIDE: You are explicitly a read-only QA Agent. Write no source code files.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R71`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Verify the SingleUserLogSection button relocation and input box expansion changes in ExerciseCard.jsx, ensuring clean compilation and correct CSS layout.
  </OBJECTIVE>
  <RESOURCES>
    - Diff: `git diff main..TASK-R71`
  </RESOURCES>
  <SEQUENCE>
    1. READ modified `gymlog-react/src/components/ExerciseCard.jsx` file to ensure:
       - The reps/duration and weight `<input>` elements use `flex: 1` instead of `width: 70`.
       - The green set log `<button>` is removed from the horizontal input row and appended below the notes text input.
       - The button styles have `width: '100%'`, `padding: 12`, `fontWeight: 'bold'`, `fontSize: '14px'`, and `marginTop: 12`.
       - The button label when not saving is `` `LOG SET ${getNextSetNumber()}` ``.
    2. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
    3. REPORT:
       - State whether the validation passes (`QA_PREMERGE_PASS`) or fails.
       - Provide the compile output block and details of the diff check.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
