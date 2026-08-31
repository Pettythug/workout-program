# TASK-QA-R78: Pre-Merge QA Validation for TASK-R78

> **For Human Readers:** This task validates specific dropdown swapping and random rerolling for bonus accessories in `AccessoryBlock.jsx` and `ExerciseCard.jsx`.

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
    - TARGET_BRANCH: `TASK-R78`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Verify the integration of onSwap prop, alternatives population, dropdown swap trigger, and "🎲 REROLL BONUS" button.
  </OBJECTIVE>
  <RESOURCES>
    - Diff: `git diff main..TASK-R78`
  </RESOURCES>
  <SEQUENCE>
    1. READ modified files:
       - `gymlog-react/src/components/ExerciseCard.jsx`: Confirm `onSwap` prop is accepted, `executeSwap` handles `onSwap`, and the `🔄 SWAP` button and dropdown render when `onSwap` or `alternatives` are provided.
       - `gymlog-react/src/components/AccessoryBlock.jsx`: Confirm `getAccessoryAlternatives` filters accessories by active location, `handleDirectSwap` updates `accessoriesList`, `alternatives` and `onSwap` are passed to `<ExerciseCard>`, and button is labeled "🎲 REROLL BONUS".
    2. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
    3. REPORT:
       - State whether the validation passes (`QA_PREMERGE_PASS`) or fails.
       - Provide the compile output block and details of the diff check.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
