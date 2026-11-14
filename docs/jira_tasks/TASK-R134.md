# TASK-R134: Add Variation Generator to "Swap -> New Custom Exercise" Flow

- **Target Role:** `Sandbox_Developer`
- **Required Model:** `Gemini 3.8 Flash (High)` (`MEDIUM_TIER`)
- **STRICT MODEL GATEKEEPER CHECK (MANDATORY ON TURN 1):**
  1. Check your active model against `MEDIUM_TIER`: `["Gemini 3.8 Flash (High)", "Gemini 3.8 Flash", "Claude Sonnet 4.6 (Thinking)"]`.
  2. If running on a **HIGHER model** (e.g. `Gemini 4 Argon`, `Gemini 3.8 Pro`, `Claude Opus`):
     - **HALT IMMEDIATELY.** Do NOT read files or run tools.
     - Output: `Model Alignment Error: Request Switch -> Model is too high. Please switch to Gemini 3.8 Flash (High) before proceeding.`
  3. If running on a **LOWER model** (e.g. `Gemini 3.8 Flash (Low)`, `Gemini 3.5 Flash (Medium/Low)`):
     - **HALT IMMEDIATELY.** Do NOT read files or run tools.
     - Output: `Model Alignment Error: Request Switch -> Model is too low. Please switch to Gemini 3.8 Flash (High) before proceeding.`

---

## Overview
When a user is performing a workout and uses the `🔄 SWAP` feature on an exercise card, choosing `-- New Custom Exercise --` allows them to create and immediately swap to a new exercise. However, the custom creation form previously only offered simple text inputs (`Name`, `Category`, `Manufacturer`, `Muscles`) without the ability to select equipment (`Barbell`, `Dumbbell`, `Band`, `Cable`), execution (`Single`, `Alt`), or grip (`Overhand`, `Underhand`, `Neutral`).

This forced users to create the raw exercise first, then reopen it via `⚙️ EDIT` to add variations. We need to integrate `VariationGeneratorPanel` directly into the `-- New Custom Exercise --` swap form in both `ExerciseCard.jsx` and `CircuitCard.jsx`.

---

## Technical Specifications & Requirements

### 1. `gymlog-react/src/components/ExerciseCard.jsx`
1. **Import:**
   - Ensure `VariationGeneratorPanel` and `buildVariationNames`, `INITIAL_VARIATION_OPTIONS` are imported.
2. **State Management:**
   - In `customSwapState`, add variation options state (or maintain a parallel `swapVariationOptions` initialized to `INITIAL_VARIATION_OPTIONS`).
   - Compute `generatedSwapNames = useMemo(() => buildVariationNames(customSwapState?.name, swapVariationOptions), [customSwapState?.name, swapVariationOptions])`.
3. **UI Integration:**
   - Inside the `{customSwapState && (...)}` block under the Swap dropdown:
     - Render `<VariationGeneratorPanel>` passing `title="Variations"`, `options={swapVariationOptions}`, `onToggleOption={...}`, `generatedNames={generatedSwapNames}`, and `showPreview={Boolean(customSwapState.name.trim())}`.
4. **Creation & Swap Execution (`executeSwap`):**
   - If variations are selected (`generatedSwapNames.length > 0`):
     - When user clicks **`SAVE & SWAP`**, prompt for Admin PIN once.
     - Save all selected variations to the backend and local state via `createExerciseMeta` (or batch registration).
     - Swap the active card to the primary/first generated variation (or standard name if no equipment/grip checked).
   - If no variations are selected:
     - Fall back to standard single exercise creation as before.

### 2. `gymlog-react/src/components/CircuitCard.jsx`
1. **Import & State:**
   - Import `VariationGeneratorPanel`, `buildVariationNames`, `INITIAL_VARIATION_OPTIONS`.
   - Maintain `swapVariationOptions` for the `-- New Custom Exercise --` form.
2. **UI Integration:**
   - Render `<VariationGeneratorPanel>` inside the custom swap details section.
3. **Execution:**
   - When saving custom exercise, register all selected variations and swap the current circuit slot to the primary selected variation.

---

## Target Files
- `gymlog-react/src/components/ExerciseCard.jsx`
- `gymlog-react/src/components/CircuitCard.jsx`

---

## Validation & Verification Protocol
1. Verify production build passes with zero errors:
   ```cmd
   cmd /c npm run build
   ```
2. Respond strictly inside a markdown code block with the 4-line XML handoff snippet:
   ```xml
   <TASK_HANDOFF>
     <TASK_ID>TASK-R134</TASK_ID>
     <ROLE>Sandbox_Developer</ROLE>
     <STATUS>DEVELOPMENT_TASK_COMPLETE</STATUS>
     <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
   </TASK_HANDOFF>
   ```
