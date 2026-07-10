# TASK-R50: Fix Exercise Metadata Overwrite/Corruption Bug

> **For Human Readers:** When updating an exercise's metadata (like adding it to a circuit or changing its category), the backend writes an entire row to the sheet. Because the frontend payloads omitted key properties (like `timed`, `manufacturer`, `fileReference`, etc.), the backend was overwriting those columns with empty strings, leading to data corruption and missing images/timed flags. This task implements a robust backend fallback to preserve existing columns when fields are omitted, and updates the frontend payloads to be fully populated.

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
    - TARGET_BRANCH: `TASK-R50`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Update the Apps Script backend to read the existing row first and preserve omitted fields on updates.
    2. Update the frontend payloads in `ExerciseCard.jsx` and `CircuitView.jsx` to construct complete objects.
  </OBJECTIVE>
  <RESOURCES>
    - Backend Apps Script: `Combined_AppScript_v2.gs`
    - Frontend Component 1: `gymlog-react/src/components/ExerciseCard.jsx`
    - Frontend Component 2: `gymlog-react/src/components/CircuitView.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ target files.

    2. MODIFY `Combined_AppScript_v2.gs`:
       - Locate the `gymlog_handleSaveExercise(payload)` function (around line 514).
       - Refactor it so that if `rowIndex > -1`, it reads the existing row and falls back to its values if payload properties are `undefined`:
         ```javascript
         function gymlog_handleSaveExercise(payload) {
           const exercise = payload.exercise || payload.name;
           if (!exercise) return err("No exercise name provided");
          
           const exSheet = getOrCreateSheet(EXERCISES_TAB, EXERCISES_HEADERS);
          
           // Find existing row
           const lastRow = exSheet.getLastRow();
           let rowIndex  = -1;
           let existingRow = [];
           if (lastRow > 1) {
             const names = exSheet.getRange(2, 1, lastRow - 1, 1).getValues();
             for (let i = 0; i < names.length; i++) {
               if (String(names[i][0]).trim() === exercise.trim()) {
                 rowIndex = i + 2;
                 existingRow = exSheet.getRange(rowIndex, 1, 1, EXERCISES_HEADERS.length).getValues()[0];
                 break;
               }
             }
           }
          
           // Map properties falling back to existing row cells if undefined in payload
           const getVal = (payloadVal, existingIdx, defaultVal = "") => {
             if (payloadVal !== undefined && payloadVal !== null) return payloadVal;
             if (rowIndex > -1 && existingRow[existingIdx] !== undefined && existingRow[existingIdx] !== null) {
               return existingRow[existingIdx];
             }
             return defaultVal;
           };
          
           const finalTimed = getVal(payload.timed, 1, false);
           const finalIsCircuit = getVal(payload.isCircuit, 10, false);
          
           const newRow = [
             exercise,
             finalTimed === true || String(finalTimed).toLowerCase() === "true",
             getVal(payload.category, 2, ""),
             getVal(payload.location, 3, "Anywhere"),
             getVal(payload.note, 4, ""),
             getVal(payload.manufacturer, 5, ""),
             getVal(payload.modelSeries, 6, ""),
             getVal(payload.baseExercise, 7, ""),
             getVal(payload.muscleGroups, 8, ""),
             getVal(payload.fileReference, 9, ""),
             finalIsCircuit === true || String(finalIsCircuit).toLowerCase() === "true"
           ];
          
           if (rowIndex > -1) {
             exSheet.getRange(rowIndex, 1, 1, newRow.length).setValues([newRow]);
           } else {
             exSheet.appendRow(newRow);
           }
          
           gymlog_recalculateBestForExercise(exercise);
           return ok({ saved: exercise });
         }
         ```

    3. MODIFY `gymlog-react/src/components/ExerciseCard.jsx`:
       - Inside `handleSaveInlineEdit` (around line 294), update the default `payload` object initialization to include ALL current metadata of `ex` so that we construct complete objects frontend-side:
         ```javascript
         let payload = {
             name: ex.name,
             exercise: ex.name,
             timed: ex.timed,
             category: ex.category || "",
             location: ex.location || "Anywhere",
             isCircuit: ex.isCircuit,
             note: ex.note || "",
             manufacturer: ex.manufacturer || "",
             modelSeries: ex.modelSeries || "",
             baseExercise: ex.baseExercise || "",
             muscleGroups: ex.muscleGroups || "",
             fileReference: ex.fileReference || ""
         };
         ```

    4. MODIFY `gymlog-react/src/components/CircuitView.jsx`:
       - Inside `handleRemoveExerciseFromCircuit` (around line 266), expand the `sheetsPost` payload to send all properties of the target exercise:
         ```javascript
         await sheetsPost({
             action: "saveExercise",
             exercise: exObj.name,
             timed: exObj.timed,
             category: exObj.category || "",
             location: exObj.location || "Anywhere",
             isCircuit: false,
             note: exObj.note || "",
             manufacturer: exObj.manufacturer || "",
             modelSeries: exObj.modelSeries || "",
             baseExercise: exObj.baseExercise || "",
             muscleGroups: exObj.muscleGroups || "",
             fileReference: exObj.fileReference || "",
             pin: pin
         });
         ```

    5. AUDIT: Generate `audit_log_R50.md` detailing the data integrity fallback implementation.
    6. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to confirm compilation succeeds cleanly.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
