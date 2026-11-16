# TASK-QA-R138: Pre-Merge QA Verification — Standalone AI Equipment & Cardio Scanner Lab (`/#/scanner-lab`)

- **Target Role:** `QA_Engineer` (Read-Only Access; `DENY(Direct_Write_Code)`)
- **Authorized Model:** `LOW_TIER` (`Gemini 4 Argon (Low)`, `Gemini 3.8 Flash (Low)`) or `MEDIUM_TIER` (`Gemini 3.8 Flash (High)`)
- **STRICT MODEL GATEKEEPER CHECK (MANDATORY ON TURN 1):**
  - If your active model is in `HIGH_TIER` (e.g. `Gemini 4 Argon (High)`, `Gemini 3.8 Pro`, `Claude Opus`):
    - **HALT IMMEDIATELY.** Do NOT run commands.
    - Output: `Model Alignment Error: Request Switch -> Model is too high for QA. Please switch to Gemini 4 Argon (Low) or Gemini 3.8 Flash (Low) before proceeding.`
- **Target Branch:** `feat/TASK-R138-ai-scanner-lab-sandbox`

---

## Verification Scope

Verify the implementation and strict isolation of `TASK-R138`:

1. **Strict Isolation Check (`git diff main --name-only`):**
   - Verify that **ZERO** existing workout views, cards, timers, or context files (`PlanView.jsx`, `FullBodyView.jsx`, `CircuitView.jsx`, `LiftView.jsx`, `ExerciseCard.jsx`, `CircuitCard.jsx`, `WarmUpCard.jsx`, `SettingsModal.jsx`, `AppContext.jsx`) were modified.
   - Verify that `gymlog-react/src/App.jsx` is the ONLY modified existing source file (mounting `<Route path="/scanner-lab" element={<ScannerLabView />} />`).

2. **Source Inspection (`aiEquipmentScanner.js` & `ScannerLabView.jsx`):**
   - Verify `matchAgainstExerciseLibrary`, `normalizeAIScanResult`, `computeLocationCategoryCoverage`, `SAMPLE_SCAN_PRESETS`, `compressImageFileToDataUrl`, and `analyzeEquipmentPhotosWithAI` are implemented and exported in `gymlog-react/src/utils/aiEquipmentScanner.js`.
   - Verify `ScannerLabView.jsx` includes:
     - Sandbox Dry-Run Mode (default) vs. Live Save Mode switch.
     - Per-user AI key setup (`gymlog_ai_scanner_config_${deviceOwner || 'Guest'}`) with Gemini Free Tier (`aistudio.google.com/apikey` helper link), OpenAI, and Anthropic support.
     - Target Gym Location selector + `+ New Gym Location...` input + live 9-category Gym Movement Coverage Checklist.
     - Camera / File uploader (`accept="image/*" capture="environment" multiple`) + 4 instant 1-click sample buttons for localhost testing.
     - Interactive scan review cards with `VariationGeneratorPanel` pre-filled for strength machines and Warm-Up preset saving for cardio equipment.

3. **Automated Test Suite Execution (MANDATORY):**
   - Run the dedicated automated test suite:
     ```bash
     cd gymlog-react && node test_task_r138.cjs
     ```
   - Verify all tests pass with `EXIT_CODE: 0`.

4. **Production Build & Compilation Check (MANDATORY):**
   - Run `cd gymlog-react && cmd /c npm run build` and ensure clean compilation with exit code `0`.

---

## Submission Protocol for QA Engineer
**MANDATORY:** Output your response inside a fenced code block (`xml`) so the user can click the "Copy" button:

```xml
<QA_HANDOFF>
  <TASK_ID>TASK-R138</TASK_ID>
  <ROLE>QA_Engineer</ROLE>
  <STATUS>QA_PREMERGE_PASS</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</QA_HANDOFF>
```
