# TASK-QA-R123: Pre-Merge Quality Assurance for `useGymAPI.js` Action Payloads

- **Target Role:** `QA_Engineer`
- **Authorized Model Tier:** `LOW_TIER` (`Gemini 3.8 Flash (Low)`, `Gemini 3.5 Flash (Medium)`, `Gemini 3.5 Flash (Low)`) or `MEDIUM_TIER` (`Gemini 3.8 Flash`, `Claude Sonnet 4.6 (Thinking)`)
- **Access Level:** `READ_ONLY_ACCESS` (No file modifications)

---

## 1. Scope & Verification Mandate
Verify that all legacy `{ action: "exec", args: [...] }` payloads in `gymlog-react/src/hooks/useGymAPI.js` have been replaced with direct top-level actions compatible with `Combined_AppScript_v2.gs`.

---

## 2. Automated Build Verification
Execute the production build command inside the `gymlog-react` directory:
```powershell
cmd /c npm run build
```
- **Pass Criteria:** Process exits cleanly with exit code 0 without syntax, JSX, or bundling errors.

---

## 3. Code Inspection Checklist
In `gymlog-react/src/hooks/useGymAPI.js` and `Combined_AppScript_v2.gs`:
1. **`deleteExercise(name, pin)`:**
   - Verify it calls `sheetsPost({ action: "deleteExercise", exercise: name, pin: pin })`.
   - Confirm exact parameter match with `gymlog_handleDeleteExercise` (`const { exercise } = payload; verifyAdminPin(payload);`).
2. **`saveSettings(data)`:**
   - Verify it calls `sheetsPost({ action: "saveSettings", settings: data })`.
   - Confirm exact parameter match with `gymlog_handleSaveSettings` (`const { settings } = payload;`).
3. **`saveExerciseNote(data)`:**
   - Verify it calls `sheetsPost({ action: "saveExerciseNote", ...(typeof data === 'object' && data !== null ? data : {}) })`.
   - Confirm match with `gymlog_handleSaveExerciseNote` (`const { exercise, note } = payload;`).
4. **Zero `exec` Leftovers:**
   - Verify zero remaining occurrences of `action: "exec"` anywhere in `gymlog-react/src/*`.
5. **Comments / JSDoc:**
   - Verify JSDoc comments accurately match the updated methods without stale references to an `"exec"` macro.

---

## 4. Submission Protocol
Upon successful build and verification, output strictly the 4-line XML snippet below:
```xml
<AUDIT_SUBMISSION>
  <TASK_ID>TASK-QA-R123</TASK_ID>
  <ROLE>QA_Engineer</ROLE>
  <STATUS>QA_PREMERGE_PASS</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</AUDIT_SUBMISSION>
```
