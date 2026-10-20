# TASK-R121-HOTFIX: Program Name Title Casing in Completion Summary

- **Target Role:** `Sandbox_Developer`
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash`, `Claude Sonnet 4.6 (Thinking)`, `Gemini 3.5 Flash (High)`) or `HIGH_TIER`
- **Model Gatekeeper Check:** Verify your active model is in the Authorized Model Tier above before executing any file edits. If misaligned, halt and output the `Model Alignment Error` override.

## Overview
When `completeWorkoutSession` in `gymlog-react/src/context/AppContext.jsx` builds `summaryData` to save completed workout sessions, line 1154 assigns:
```javascript
program: programKey
```
Because `programKey` is the lowercase internal key (e.g. `'plan'`), `session.program` is saved as `'plan'` instead of Title Case `'Plan'`. This causes `SessionStatsModal.jsx` to render session badges as `"plan #1"` instead of `"Plan #1"` and writes lowercase `"plan"` into Column C of Google Sheets, creating data inconsistency with historical logs.

---

## Technical Specifications & Requirements

### 1. Fix Program Casing in `summaryData` (`AppContext.jsx`)
In `gymlog-react/src/context/AppContext.jsx` inside `completeWorkoutSession`:
1. Update `summaryData`:
   ```javascript
   // Change from:
   program: programKey
   // Change to:
   program: displayProgram
   ```
2. Verify that `displayProgram` correctly resolves to `'Plan'`, `'Circuit'`, or `'Full Body'`.

---

## Target Files
- `gymlog-react/src/context/AppContext.jsx`

---

## Submission Protocol for Developer
1. Execute the 1-line edit strictly within `gymlog-react/src/context/AppContext.jsx`.
2. Verify production build with `cmd /c npm run build`.
3. Respond in chat with strictly the 4-line XML snippet below:
```xml
<TASK_HANDOFF>
  <TASK_ID>TASK-R121-HOTFIX</TASK_ID>
  <ROLE>Sandbox_Developer</ROLE>
  <STATUS>DEVELOPMENT_TASK_COMPLETE</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</TASK_HANDOFF>
```
