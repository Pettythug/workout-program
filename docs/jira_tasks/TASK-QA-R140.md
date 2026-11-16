# TASK-QA-R140: Pre-Merge QA Verification — Core AI Vision Engine & Single Machine Scanner (SettingsModal.jsx)

- **Target Role:** `QA_Engineer` (Read-Only Access; `DENY(Direct_Write_Code)`)
- **Authorized Model:** `Gemini 3.8 Flash (Low)` (Recommended) or `Gemini 3.8 Flash (High)`
- **STRICT MODEL GATEKEEPER CHECK (MANDATORY ON TURN 1):**
  - If your active model is in `HIGH_TIER` or any `Gemini 4 Argon` / `Gemini 3.8 Pro` / `Claude Opus` model:
    - **HALT IMMEDIATELY.** Do NOT run commands.
    - Output: `Model Alignment Error: Request Switch -> Model is too high for QA. Please switch to Gemini 3.8 Flash (Low) or (High) before proceeding.`
- **Target Branch:** `feat/epic-10-ai-equipment-scanner`

---

## Verification Scope

Verify the implementation of Phase 1 of Epic 10 (`TASK-R140`):

1. **Strict Isolation & Scope Check (`git diff main --name-only`):**
   - Verify that **ZERO** core workout views, cards, timers, or context files (`PlanView.jsx`, `FullBodyView.jsx`, `CircuitView.jsx`, `LiftView.jsx`, `ExerciseCard.jsx`, `WarmUpCard.jsx`, `AppContext.jsx`) were modified.
   - Verify that changes are strictly isolated to `SettingsModal.jsx`, `aiEquipmentScanner.js`, and `test_task_r140.cjs`.

2. **Source Inspection:**
   - `gymlog-react/src/utils/aiEquipmentScanner.js`: Verify `CANONICAL_APP_CATEGORIES` defines the exact 9 real app categories (`Horizontal Push`, `Vertical Push`, `Horizontal Pull`, `Vertical Pull`, `Knee Dominant`, `Hip Dominant`, `Plank Core`, `Rotational Core`, `Explosive`), and implements image compression and Gemini vision analysis.
   - `gymlog-react/src/components/SettingsModal.jsx`: Verify Gemini API key configuration and `📷 SCAN MACHINE WITH AI` button in `CREATE EXERCISE` tab pre-filling `exName`, `exCategory`, `exLocation`, and `variationOptions` in `VariationGeneratorPanel`.

3. **Automated Test Suite Execution (MANDATORY):**
   - Run the dedicated automated test script:
     ```bash
     cd gymlog-react && node test_task_r140.cjs
     ```
   - Verify all tests pass with `EXIT_CODE: 0`.

4. **Production Build & Compilation Check (MANDATORY):**
   - Run `cd gymlog-react && cmd /c npm run build` and ensure clean compilation with exit code `0`.

---

## Submission Protocol for QA Engineer
**MANDATORY:** Output your response inside a fenced code block (`xml`) so the user can click the "Copy" button:

```xml
<QA_HANDOFF>
  <TASK_ID>TASK-R140</TASK_ID>
  <ROLE>QA_Engineer</ROLE>
  <STATUS>QA_PREMERGE_PASS</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</QA_HANDOFF>
```
