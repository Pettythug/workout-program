# TASK-R132: Add Neutral Grip to Variations

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
Currently, exercise variations support Equipment (`Barbell`, `Dumbbell`, `Band`, `Cable`), Execution (`Singles`, `Alternating`), and Grips (`Overhand`, `Underhand`). Many lifts and dumbbell/cable movements (e.g., Neutral Grip Dumbbell Bench Press, Neutral Grip Pull-ups, Hammer Curls) require a `Neutral` grip option. 

We need to add `Neutral` grip to the variation engine and UI so that it can be selected seamlessly in both `Settings -> CREATE EXERCISE` and `ExerciseCard -> ⚙️ EDIT`.

---

## Technical Specifications & Requirements

### 1. `gymlog-react/src/utils/exerciseVariations.js`
1. **`KNOWN_MODIFIER_TOKENS`:**
   - Add `'neutral'` to the `KNOWN_MODIFIER_TOKENS` Set.
2. **`INITIAL_VARIATION_OPTIONS`:**
   - Add `neutral: false` to `INITIAL_VARIATION_OPTIONS`.
3. **`buildVariationNames(baseName, options = {})`:**
   - Destructure `neutral = false` from `options`.
   - In the grips collection:
     ```javascript
     const grips = [];
     if (overhand) grips.push('Overhand');
     if (underhand) grips.push('Underhand');
     if (neutral) grips.push('Neutral');
     ```
   - Ensure `Neutral` correctly combines with standalone grips, execution (`Single`, `Alt`), and equipment (`DB`, `Cable`, `Barbell`, `Band`) following existing combination logic.

### 2. `gymlog-react/src/components/VariationGeneratorPanel.jsx`
1. **`VARIATION_OPTION_GROUPS`:**
   - Under the `Grip` group (`label: 'Grip'`), add:
     ```javascript
     { key: 'neutral', label: 'Neutral' }
     ```
   - Resulting list of grips:
     - `Overhand` (`key: 'overhand'`)
     - `Underhand` (`key: 'underhand'`)
     - `Neutral` (`key: 'neutral'`)

---

## Target Files
- `gymlog-react/src/utils/exerciseVariations.js`
- `gymlog-react/src/components/VariationGeneratorPanel.jsx`

---

## Validation & Verification Protocol
1. Verify production build passes with zero errors:
   ```cmd
   cmd /c npm run build
   ```
2. Respond strictly with the 4-line XML handoff snippet:
   ```xml
   <TASK_HANDOFF>
     <TASK_ID>TASK-R132</TASK_ID>
     <ROLE>Sandbox_Developer</ROLE>
     <STATUS>DEVELOPMENT_TASK_COMPLETE</STATUS>
     <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
   </TASK_HANDOFF>
   ```
