# TASK-R30: Prompt for Admin PIN on Exercise Creation and Custom Swaps

> **For Human Readers:** This task adds Admin PIN prompts when creating exercises manually or swapping to new custom exercises. This ensures the backend Google Apps Script compiles rows inside the `Exercises` sheet, enabling successful image uploads and linking set history.

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
    - TARGET_BRANCH: `TASK-R30`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Inject Admin PIN prompting into manual exercise creation and custom swaps, and propagate the PIN parameter to saveExercise.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files:
      - `gymlog-react/src/context/AppContext.jsx`
      - `gymlog-react/src/components/SettingsModal.jsx`
      - `gymlog-react/src/components/ExerciseCard.jsx`
      - `gymlog-react/src/components/CircuitView.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Target files.

    2. MODIFY `gymlog-react/src/context/AppContext.jsx`:
       - Update the `createExerciseMeta` signature to accept `pin` as the second parameter:
         `const createExerciseMeta = async (exerciseData, pin) => { ... }`
       - Propagate `pin` into the `saveExercise` call inside the creation loop:
         `await saveExercise(meta, pin);`

    3. MODIFY `gymlog-react/src/components/SettingsModal.jsx`:
       - In `handleCreateExercise`, prompt for the Admin PIN:
         `const pin = prompt("Enter Admin PIN to create this exercise:");`
         `if (pin === null) return;`
       - Wrap the `await createExerciseMeta` block in a `try/catch` statement to alert the user if the server rejects the PIN. Pass `pin` as the second parameter.

    4. MODIFY `gymlog-react/src/components/ExerciseCard.jsx`:
       - In `executeSwap`, if the exercise is not found in the local list (`if (!targetEx)`), prompt for the Admin PIN:
         `const pin = prompt("Enter Admin PIN to register this custom exercise on the database:");`
         `if (pin === null) return;`
       - Pass `pin` to `saveExercise(targetEx, pin)`.
       - Wrap `saveExercise` in the try/catch block, print any error message via `alert()`, and `return` (aborting the swap) if the save fails.

    5. MODIFY `gymlog-react/src/components/CircuitView.jsx`:
       - In `handleSwap`, if `isNew` is true, prompt for the Admin PIN:
         `const pin = prompt("Enter Admin PIN to register this custom exercise on the database:");`
         `if (pin === null) return;`
       - Pass `pin` to `saveExercise(targetEx, pin)`.
       - Wrap `saveExercise` in a try/catch block, display any error message via `alert()`, and `return` (aborting the swap) if the save fails.

    6. AUDIT: Generate `audit_log_R30.md` detailing the implemented prompts.
    7. VERIFY: Run `npm run build` to confirm compilation is successful.
    8. EXECUTE: Run `git push origin TASK-R30` to push the branch to the remote repository.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
