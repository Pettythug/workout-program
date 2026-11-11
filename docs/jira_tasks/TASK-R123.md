# TASK-R123: Fix Broken "Delete Exercise" & Remaining `action: "exec"` API Calls

- **Target Role:** `Sandbox_Developer`
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash`, `Claude Sonnet 4.6 (Thinking)`, `Gemini 3.5 Flash (High)`) or `HIGH_TIER`
- **Model Gatekeeper Check:** Verify your active model is in the Authorized Model Tier above before executing any file edits. If misaligned, halt and output the `Model Alignment Error` override.

## Overview
In `gymlog-react/src/hooks/useGymAPI.js` (lines 182–212), three API helper functions still send a legacy `{ action: "exec", args: [...] }` payload:
- `deleteExercise(name, pin)` sends `{ action: "exec", args: ["deleteExercise", name], pin }`
- `saveSettings(data)` sends `{ action: "exec", args: ["saveSettings", data] }`
- `saveExerciseNote(data)` sends `{ action: "exec", args: ["saveExerciseNote", data] }`

However, `Combined_AppScript_v2.gs` does **not** have an `"exec"` dispatcher (it throws `"Unknown action: exec"`). Instead, it routes direct top-level actions matching each exact payload schema:
- `deleteExercise`: expects `{ action: "deleteExercise", exercise: name, pin: pin }` (verified at `gymlog_handleDeleteExercise` line 1195: `const { exercise } = payload;`)
- `saveSettings`: expects `{ action: "saveSettings", settings: data }` (verified at `gymlog_handleSaveSettings` line 866: `const { settings } = payload;`)
- `saveExerciseNote`: expects `{ action: "saveExerciseNote", exercise: data.exercise, note: data.note }` (verified at `gymlog_handleSaveExerciseNote` line 677: `const { exercise, note } = payload;`)

Because of this mismatch, clicking **DELETE EXERCISE** in Settings (`SettingsModal.jsx`) or unchecking `(Alt)` / `(Single)` variations in `ExerciseCard.jsx` fails on the backend.

---

## Technical Specifications & Requirements

### 1. Replace `action: "exec"` Payloads in `gymlog-react/src/hooks/useGymAPI.js`
Update lines 177–212 in `gymlog-react/src/hooks/useGymAPI.js`:

1. **`deleteExercise(name, pin)`:**
   ```javascript
   const deleteExercise = useCallback(async (name, pin) => {
       return sheetsPost({
           action: "deleteExercise",
           exercise: name,
           pin: pin
       });
   }, [sheetsPost]);
   ```
   *(Important: use field key `exercise`—not `exerciseName`—so it matches `const { exercise } = payload` in `Combined_AppScript_v2.gs`.)*

2. **`saveSettings(data)`:**
   ```javascript
   const saveSettings = useCallback(async (data) => {
       return sheetsPost({
           action: "saveSettings",
           settings: data
       });
   }, [sheetsPost]);
   ```

3. **`saveExerciseNote(data)`:**
   ```javascript
   const saveExerciseNote = useCallback(async (data) => {
       return sheetsPost({
           action: "saveExerciseNote",
           ...(typeof data === 'object' && data !== null ? data : {})
       });
   }, [sheetsPost]);
   ```

4. Update the JSDoc comments above these three methods to remove stale `"using the generic exec macro"` descriptions while keeping comments clean and accurate.

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
