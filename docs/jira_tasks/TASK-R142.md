# TASK-R142: Add Wide & Narrow Grip Width Options to Shared Exercise Variation Generator

- **Target Role:** `Sandbox_Developer` (`DENY(git checkout, git merge, git push)`)
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash (High)` / `Claude Sonnet 4.6 (Thinking)` / `Gemini 4 Argon (Medium)`) or `HIGH_TIER` (`Gemini 4 Argon (High)` / `Gemini 3.8 Pro` / `Claude Opus 4.6 (Thinking)`)
- **STRICT MODEL GATEKEEPER CHECK (MANDATORY ON TURN 1):**
  - If your active model is in `LOW_TIER` (`Gemini 4 Argon (Low)`, `Gemini 3.8 Flash (Low)`, `Gemini 3.5 Flash (Low)`):
    - **HALT IMMEDIATELY.** Do NOT edit files or run commands.
    - Output: `Model Alignment Error: Request Switch -> Expected MEDIUM_TIER or HIGH_TIER for feature development. Please switch to Gemini 3.8 Flash (High), Claude Sonnet 4.6 (Thinking), or Gemini 4 Argon (High).`
- **Target Branch:** `TASK-R142`

---

## 1. Objective & Scope

Add optional **`Wide`** and **`Narrow`** grip width choices to the shared exercise variation generator so that **ExerciseCard** (Edit & Custom Swap), **CircuitCard** (Edit & Custom Swap), and **SettingsModal** all automatically support grip width combinations in one cohesive place.

> **Design Note:** Do **NOT** add a `Regular` option — regular/shoulder-width grip is implicit when neither `Wide` nor `Narrow` is selected (e.g. `Low Row (Overhand)` means regular width, while `Low Row (Wide, Overhand)` or `Low Row (Narrow, Neutral)` specifies the width).

1. **Update `gymlog-react/src/utils/exerciseVariations.js`:**
   - Add `'wide'` and `'narrow'` to `KNOWN_MODIFIER_TOKENS` so `extractBaseName` strips them cleanly (e.g., `extractBaseName("Low Row (Wide, Neutral)") === "Low Row"`).
   - Add `wide: false, narrow: false` to `INITIAL_VARIATION_OPTIONS`.
   - Update `buildVariationNames(baseName, options = {})` to support `wide` and `narrow`:
     - Build `widths = []` (`'Wide'` if `wide`, `'Narrow'` if `narrow`).
     - Build combined grip/width modifier arrays (`gripCombos`):
       - Neither `widths` nor `grips` selected → `[]` (no grip/width modifiers)
       - Only `widths` selected → `[['Wide'], ['Narrow']]` (e.g., `Low Row (Wide)`)
       - Only `grips` selected → `[['Overhand'], ['Underhand'], ['Neutral']]` (e.g., `Low Row (Neutral)`)
       - Both `widths` and `grips` selected → cartesian product `width` then `grip` (e.g., `['Wide', 'Overhand']`, `['Narrow', 'Neutral']` → `Low Row (Wide, Overhand)`, `Low Row (Narrow, Neutral)`).
     - Apply `gripCombos` cleanly across all existing branches:
       - No equipment / `standard` (with and without `executions`)
       - `barbell` (never auto-combines with `Single` or `Alt`)
       - `DB`, `Band`, `Cable` (with and without `executions`)
     - Deduplicate case-insensitively via existing `addName`.

2. **Update `gymlog-react/src/components/VariationGeneratorPanel.jsx`:**
   - Add a `Grip Width` section to `VARIATION_OPTION_GROUPS`:
     ```javascript
     {
         label: 'Grip Width',
         items: [
             { key: 'wide', label: 'Wide' },
             { key: 'narrow', label: 'Narrow' }
         ]
     }
     ```

3. **Verification:**
   - Run `cd gymlog-react && cmd /c npm run build` and confirm clean compilation (`exit code 0`).
   - Verify `extractBaseName` and `buildVariationNames` behavior with a quick node one-liner or check (do not leave untracked temp files behind).
   - Commit all changes to `TASK-R142` with a clear commit message (e.g. `feat(variations): add Wide and Narrow grip width options (TASK-R142)`).

---

## 2. Submission Protocol for Sandbox Developer

Output your completion signal inside a fenced XML block:
```xml
<TASK_HANDOFF>
  <SIGNAL>DEVELOPMENT_TASK_COMPLETE</SIGNAL>
  <TASK_ID>TASK-R142</TASK_ID>
  <BRANCH>TASK-R142</BRANCH>
  <BUILD_VERIFICATION>PASS</BUILD_VERIFICATION>
</TASK_HANDOFF>
```
