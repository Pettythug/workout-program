# TASK-QA-R82: Pre-Merge QA Validation for TASK-R82

> **For Human Readers:** This task validates the fixes for history/best matching (`dataMerge.js` & `ExerciseCard.jsx`), the sticky stopwatch banner (`StickyRestBanner.jsx`), and unified set counting across variations (`ExerciseCard.jsx` & `AppContext.jsx`).

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
    - TARGET_BRANCH: `TASK-R82`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Verify dataMerge.js cleanName matching, StickyRestBanner.jsx stopwatch display on scroll, ExerciseCard.jsx allTodaysSets / getBest fallback, and AppContext.jsx baseName nextSetNum calculation.
  </OBJECTIVE>
  <RESOURCES>
    - Diff: `git diff main..TASK-R82`
  </RESOURCES>
  <SEQUENCE>
    1. READ modified files:
       - `gymlog-react/src/context/dataMerge.js`: Confirm `cleanName` helper is used for `sheetHistory`, `sheetBest`, and `sheetExInfo`.
       - `gymlog-react/src/components/StickyRestBanner.jsx`: Confirm `isStopwatchActive` enables banner rendering and displays `⏱️ STOPWATCH` with Pause and Reset buttons.
       - `gymlog-react/src/components/ExerciseCard.jsx`: Confirm `todaysSets` maps across `Object.values(variations)`, and `getBest` falls back to `variations['Standard']`.
       - `gymlog-react/src/context/AppContext.jsx`: Confirm `logExerciseSet` uses `getBaseName` to find maximum set number across all variations for today.
    2. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
    3. REPORT:
       - State whether the validation passes (`QA_PREMERGE_PASS`) or fails.
       - Provide the compile output block and details of the diff check.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
