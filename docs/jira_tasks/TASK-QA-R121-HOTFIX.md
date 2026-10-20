# TASK-QA-R121-HOTFIX: Pre-Merge Verification for Program Name Title Casing

- **Target Role:** `QA_Engineer`
- **Authorized Model Tier:** `LOW_TIER` (`Gemini 3.8 Flash (Low)`, `Gemini 3.5 Flash (Medium)`, `Gemini 3.5 Flash (Low)`) or `MEDIUM_TIER` (`Gemini 3.8 Flash`, `Claude Sonnet 4.6 (Thinking)`)
- **Access Level:** `READ_ONLY_ACCESS` (No file modifications)

---

## 1. Scope & Verification Mandate
Verify that `program: displayProgram` is assigned inside `summaryData` in `gymlog-react/src/context/AppContext.jsx`.

---

## 2. Automated Build Verification
Execute the production build command inside the `gymlog-react` directory:
```powershell
cmd /c npm run build
```
- **Pass Criteria:** Process exits cleanly with exit code 0 without syntax, JSX, or bundling errors.

---

## 3. Code Inspection Checklist
In `gymlog-react/src/context/AppContext.jsx` inside `completeWorkoutSession`:
1. Verify that `summaryData` assigns `program: displayProgram` instead of `program: programKey`.
2. Verify that `displayProgram` evaluates to `'Plan'`, `'Circuit'`, or `'Full Body'`.

---

## 4. Submission Protocol
Upon successful build and verification, output strictly the 4-line XML snippet below:
```xml
<AUDIT_SUBMISSION>
  <TASK_ID>TASK-QA-R121-HOTFIX</TASK_ID>
  <ROLE>QA_Engineer</ROLE>
  <STATUS>QA_PREMERGE_PASS</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</AUDIT_SUBMISSION>
```
