# TASK-R123: Fix Broken "Delete Exercise" & Variation Cleanup API Action

- **Target Role:** `Sandbox_Developer`
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash`, `Claude Sonnet 4.6 (Thinking)`, `Gemini 3.5 Flash (High)`) or `HIGH_TIER`
- **Model Gatekeeper Check:** Verify your active model is in the Authorized Model Tier above before executing any file edits. If misaligned, halt and output the `Model Alignment Error` override.

## Overview
In `gymlog-react/src/hooks/useGymAPI.js`, `deleteExerciseFromSheet(exerciseName)` currently sends:
```javascript
{ action: "exec", func: "deleteExerciseFromSheet", args: [exerciseName] }
```
However, `Combined_AppScript_v2.gs` does not support a generic `action: "exec"` dispatcher—it explicitly routes `data.action === "deleteExercise"` (expecting `data.exerciseName`). Because `sheetsPost` resolves without throwing when the backend returns `{ status: "error", message: "Unknown action" }`, deleting an exercise in Settings (`SettingsModal.jsx`) or unchecking `(Alt)` / `(Single)` variations (`AppContext.jsx`) silently fails on the backend while pretending to succeed in the UI.

---

## Technical Specifications & Requirements

### 1. Update `deleteExerciseFromSheet` Payload (`useGymAPI.js`)
1. In `gymlog-react/src/hooks/useGymAPI.js`, update `deleteExerciseFromSheet(exerciseName)` to send the exact action supported by `Combined_AppScript_v2.gs`:
   ```javascript
   const res = await sheetsPost({
     action: "deleteExercise",
     exerciseName: exerciseName
   });
   if (res?.status === "error") {
     throw new Error(res.message || "Failed to delete exercise from Google Sheets");
   }
   return res;
   ```
2. Check `saveSettingsToSheet` and `saveExerciseToSheet` in `useGymAPI.js` to ensure any `{ status: "error" }` response from `sheetsPost` throws or surfaces properly rather than failing silently.

---

## Target Files
- `gymlog-react/src/hooks/useGymAPI.js`

---

## Submission Protocol for Developer
1. Execute all edits strictly within `gymlog-react/src/*`.
2. Verify production build with `cmd /c npm run build`.
3. Respond in chat with strictly the 4-line XML snippet below:
```xml
<TASK_HANDOFF>
  <TASK_ID>TASK-R123</TASK_ID>
  <ROLE>Sandbox_Developer</ROLE>
  <STATUS>DEVELOPMENT_TASK_COMPLETE</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</TASK_HANDOFF>
```
