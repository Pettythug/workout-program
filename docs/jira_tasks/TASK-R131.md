# TASK-R131: Equipment/Grip Variation Generator, Un-Collapsed Rotation & Logger Band Toggle

- **Target Role:** `Sandbox_Developer`
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash`, `Claude Sonnet 4.6 (Thinking)`, `Gemini 3.5 Flash (High)`) or `HIGH_TIER`
- **Model Gatekeeper Check:** Verify your active model is in the Authorized Model Tier above before executing any file edits. If misaligned, halt and output the `Model Alignment Error` override.

## Overview
1. **Un-Collapse Variations in Workout Rotation (`PlanView.jsx`, `FullBodyView.jsx`, `LiftView.jsx`, `AccessoryBlock.jsx`):**
   - Currently, `PlanView.jsx`, `FullBodyView.jsx`, and `LiftView.jsx` strip `(Single|Alt|DB|Cable)` from exercise names and collapse all variations under a single `grouped[baseKey]` bucket—while `ExerciseCard.jsx` only renders `"Standard"`. As a result, generated `(Single)`, `(Alt)`, `(DB)`, etc. exercises are hidden from `Plan` / `Full Body` rotation and `Lift` views.
   - Each exercise row in `exercises` must rotate and render as its own independent card with its own Personal Best (`Best:`), with **NO switcher pills** added to `ExerciseCard.jsx`.

2. **Expanded Equipment, Modality & Grip Variation Generator (`exerciseVariations.js`, `SettingsModal.jsx`, `ExerciseCard.jsx`, `AppContext.jsx`):**
   - Upgrade **Create Exercise** (`SettingsModal.jsx`) and **Edit Exercise → Generate Variations** (`ExerciseCard.jsx`) to support:
     - **Equipment:** `Standard`, `Barbell`, `Dumbbell` (`DB`), `Band`, `Cable`
     - **Execution:** `Singles` (`Single`), `Alternating` (`Alt`)
     - **Grip:** `Overhand`, `Underhand`
   - Provide an interactive **Live Preview** list of exact generated exercise names in `SettingsModal.jsx` before creating so the user can see and toggle individual combinations (e.g., `Bench Press (Barbell)`, `Bench Press (DB)`, `Bench Press (DB, Single)`, `Bench Press (DB, Alt)`, `Bent Over Row (Overhand)`). Note: `Barbell` must not auto-generate `Single` or `Alt` variants.

3. **Lightweight `[ ] Band` Logger Checkbox & PB Protection (`exerciseVariations.js`, `ExerciseCard.jsx`, `CircuitCard.jsx`, `AppContext.jsx`, `dataMerge.js`):**
   - Add a compact **`[ ] Band (Assist / Tension)`** checkbox inside set logging inputs (`SingleUserLogSection`, `MultiUserPersonLogSection`, and `CircuitCard`'s `PersonRow`) so users can flag band-assisted or band-tension sets without creating duplicate exercises, using the Notes field to record band color/strength.
   - Automatically prepend `[Band]` to the set note on save when checked and protect raw unassisted/unbanded Personal Bests from being overwritten by `[Band]` sets (on non-Band exercises).

---

## Technical Specifications & Requirements

### 1. Shared Variation & Band PB Utility (`gymlog-react/src/utils/exerciseVariations.js`) *(New)*
Create `gymlog-react/src/utils/exerciseVariations.js` (zero React/Context imports to prevent circular dependencies):
1. **`extractBaseName(name)`:**
   - Strips trailing known modifier parentheticals (containing comma-separated tokens from `Barbell`, `DB`, `Dumbbell`, `Band`, `Cable`, `Single`, `Alt`, `Overhand`, `Underhand`), while preserving non-variation tags such as `(Plate-Loaded)`.
2. **`buildVariationNames(baseName, options)`:**
   - Inputs: trimmed `baseName` and `{ standard, barbell, dumbbell, band, cable, single, alt, overhand, underhand }`.
   - Clean smart rules:
     - Notice **`Barbell` never auto-combines with `Single` or `Alt`**. It emits `Bench Press (Barbell)` (or with Grip if `overhand`/`underhand` selected, e.g., `Bent Over Row (Barbell, Overhand)`).
     - `Dumbbell` (`DB`), `Band`, `Cable`: emit `${baseName} (EQ)` (plus `Single` / `Alt` if checked, e.g., `${baseName} (DB, Single)`, `${baseName} (DB, Alt)`, and Grip combinations if checked).
     - `Standard`: emits `${baseName}` (and applies standalone `Single` / `Alt` only if `dumbbell` is NOT also checked, so checking `Standard` + `Dumbbell` + `Single` does not create redundant `(Single)` AND `(DB, Single)` duplicates; applies standalone `Overhand` / `Underhand` if grip options are checked).
     - Returns deduplicated array of clean trimmed strings preserving readable order.
3. **`isBandTaggedEntry(entry)` & `isDedicatedBandExercise(exerciseName)`:**
   - `isBandTaggedEntry(entry)`: returns `true` if `entry?.usedBand === true || /\[band\]/i.test(String(entry?.note || ''))`.
   - `isDedicatedBandExercise(name)`: returns `true` if `/\bband(s)?\b/i.test(String(name || ''))`.
4. **`calculateBestForExercise(exercise)`:**
   - Move `calculateBestForExercise` cleanly into `exerciseVariations.js` (and re-export it from `AppContext.jsx` so existing imports continue working).
   - Keep existing `reps <= 0` exclusion and rep-range key normalization (`1-3` -> `r1_3`, etc.).
   - Add Band PB guard: skip any entry where `!isDedicatedBandExercise(exercise.name) && isBandTaggedEntry(entry)`.

### 2. Un-Collapse Rotation & Clean Accessory Alternatives (`PlanView.jsx`, `FullBodyView.jsx`, `LiftView.jsx`, `AccessoryBlock.jsx`)
1. In **`PlanView.jsx`** (`groupedExercises`) and **`FullBodyView.jsx`** (`groupedExercises`):
   - Map every exercise directly by exact `ex.name.toLowerCase()`:
     `{ baseName: ex.name, category: ex.category, variations: { Standard: ex }, ex }`
   - Do **not** collapse `(Single)`, `(Alt)`, `(DB)`, or `(Cable)` into a shared bucket.
2. In **`LiftView.jsx`** (`filteredAndGrouped`):
   - Map each filtered exercise individually (`{ baseName: ex.name, variations: { Standard: ex }, ex }`) and sort alphabetically by `baseName` so all variations appear cleanly in Lift search.
3. In **`AccessoryBlock.jsx`**:
   - Import `extractBaseName` from `../utils/exerciseVariations`.
   - In `getAccessoryAlternatives()`: key by exact `ex.name` so Bonus swaps list every variation distinctly instead of overwriting siblings.
   - Keep `pickAccessoryCandidate` using `extractBaseName` so random Bonus picks still prefer distinct base movements before repeating a sibling variation.

### 3. Generator, Set Logging & Band PB Protection (`AppContext.jsx`, `dataMerge.js`)
1. In **`AppContext.jsx`**:
   - Re-export `calculateBestForExercise` from `../utils/exerciseVariations`.
   - In `createExerciseMeta(exerciseData, pin)`: accept optional `variationNames` array (creating each unique name in `variationNames` if provided, falling back cleanly to `createStandard`/`createSingle`/`createAlt` if `variationNames` is omitted). Also include any optional `manufacturer`, `muscleGroups`, etc.
   - In `addSetToLocalHistory(exName, entries)`: skip updating `updatedBest` for entries where `!isDedicatedBandExercise(exName) && isBandTaggedEntry(entry)` so in-memory PBs stay clean immediately on log.
   - In `logExerciseSet(ex, logs)`:
     - Calculate `nextSetNum` across today's sets for **`ex.name` specifically** (`(ex.history || []).filter(...)`), rather than sharing set numbers across variations.
     - Read `input.usedBand`: when truthy, normalize `note`: trim existing `input.note` and prepend `[Band]` if `!/\[band\]/i.test(note)` (so empty note becomes `"[Band]"` and `"Blue"` becomes `"[Band] Blue"`).
2. In **`dataMerge.js`**:
   - Import `calculateBestForExercise`, `isBandTaggedEntry`, `isDedicatedBandExercise` from `../utils/exerciseVariations`.
   - When merging an exercise in `mergeFromSheets`: if `!isDedicatedBandExercise(ex.name)` and `mergedHistory.some(h => isBandTaggedEntry(h))`, recompute `best` cleanly with `calculateBestForExercise({ name: ex.name, history: mergedHistory })` (preserving any fallback keys from `sheetBest` only if `computedBest` has no entries for that person) so reloads from Google Sheets never flash band-assisted PRs as raw PBs.

### 4. Expanded Generator UI & Logger Toggle (`SettingsModal.jsx`, `ExerciseCard.jsx`, `CircuitCard.jsx`)
1. **`SettingsModal.jsx` (`CREATE EXERCISE`):**
   - Replace the 3-checkbox `Generate Modalities` row with grouped compact variation checkboxes (`Standard`, `Barbell`, `Dumbbell`, `Band`, `Cable` | `Singles`, `Alternating` | `Overhand`, `Underhand`).
   - Compute `generatedNames = buildVariationNames(exName, ...)` reactively and maintain an `excludedPreviewNames` Set (reset when inputs change) to render compact **Live Preview Checkboxes** showing every exact exercise name to be created (allowing one-tap exclusion before clicking `CREATE & SYNC`).
   - Pass the checked `variationNames` array to `createExerciseMeta(..., pin)`.
2. **`ExerciseCard.jsx`:**
   - Ensure **ZERO** switcher pills (`STD | SINGLES | ALT`) are rendered on `ExerciseCard`.
   - In `SingleUserLogSection` and `MultiUserPersonLogSection` (and `clearLogInputs` / `initLogInputs`):
     - Add a compact **`[ ] Band (Assist / Tension)`** checkbox above/next to the Notes input (`checked={Boolean(input.usedBand)}`, `onChange={e => updateLogInput(key, 'usedBand', e.target.checked)}`).
     - Update `updateLogInput` to preserve boolean values cleanly when `field === 'usedBand'`.
   - In `⚙️ EDIT` → `Generate Variations`:
     - Use `extractBaseName(ex.name)` (preserving `(DB)` prefix when editing a DB card for `Single`/`Alt` toggles if appropriate, or clearly generating variations anchored on `baseName`!).
     - Render toggles for **`Barbell`**, **`Dumbbell (DB)`**, **`Band`**, **`Singles`**, **`Alternating`**, **`Overhand`**, **`Underhand`** reflecting existing matching exercises, letting the user generate/remove them with Admin PIN via `createExerciseMeta({ variationNames: [targetName], ... }, pin)` / `deleteExercise(targetName, pin)`.
3. **`CircuitCard.jsx`:**
   - Add matching **`[ ] Band (Assist / Tension)`** checkbox inside `PersonRow` (resetting `usedBand: false` on save / init alongside `note`).

## Phase 2 Refinement (Clean Combinator Without `Standard` + Unified Edit Panel)

Apply these refinements directly on top of the current `feat/TASK-R131-equipment-grip-variations-and-band-toggle` branch without disturbing the already-verified Phase 1 features (`PlanView`, `FullBodyView`, `LiftView`, `AccessoryBlock`, `CircuitCard`, `[ ] Band` toggle, or `dataMerge` / `calculateBestForExercise` PB guard):

### 1. Refined `buildVariationNames` Rules (`gymlog-react/src/utils/exerciseVariations.js`)
- Keep `standard = false` default in `options` destructuring for safe fallback, and remove the assumption that `Standard` stays active alongside equipment boxes.
- Compute `hasAnyEquipment = Boolean(barbell || dumbbell || band || cable)` and `hasGrips = grips.length > 0`:
  1. **When NO equipment is checked (`!hasAnyEquipment || standard`):**
     - If `!hasGrips`: emit `cleanBase` plus `${cleanBase} (${exec})` for each checked execution (`Single`, `Alt`).
     - If `hasGrips`: emit **only** grip-tagged combinations `${cleanBase} (${grip})` (bilateral) and `${cleanBase} (${exec}, ${grip})` — do **NOT** emit plain `cleanBase` or `${cleanBase} (${exec})` without grip.
  2. **When `barbell` is checked:**
     - Never auto-combine `Barbell` with `Single` or `Alt`.
     - If `hasGrips`: emit **only** `${cleanBase} (Barbell, ${grip})` (do **NOT** emit plain `${cleanBase} (Barbell)` alongside them).
     - If `!hasGrips`: emit `${cleanBase} (Barbell)`.
  3. **When `dumbbell` (`DB`), `band`, and/or `cable` are checked (`eq`):**
     - If `hasGrips`: emit **only** `${cleanBase} (${eq}, ${grip})` (bilateral) and `${cleanBase} (${eq}, ${exec}, ${grip})` — do **NOT** emit grip-less `${cleanBase} (${eq})` or `${cleanBase} (${eq}, ${exec})` alongside them.
     - If `!hasGrips`: emit `${cleanBase} (${eq})` plus `${cleanBase} (${eq}, ${exec})`.
- Verification check: `buildVariationNames('Bent Over Row', { barbell: true, dumbbell: true, single: true, alt: true, overhand: true, underhand: true })` must return **8 exact cards**:
  `Bent Over Row (Barbell, Overhand)`, `Bent Over Row (Barbell, Underhand)`, `Bent Over Row (DB, Overhand)`, `Bent Over Row (DB, Underhand)`, `Bent Over Row (DB, Single, Overhand)`, `Bent Over Row (DB, Single, Underhand)`, `Bent Over Row (DB, Alt, Overhand)`, `Bent Over Row (DB, Alt, Underhand)`.

### 2. Extract Shared Generator UI (`gymlog-react/src/components/VariationGeneratorPanel.jsx`) *(New)*
- Extract the grouped checkboxes + Live Preview checklist into a reusable `VariationGeneratorPanel` component shared by both `SettingsModal.jsx` and `ExerciseCard.jsx` (avoiding duplicated JSX/checkbox logic):
  - **Equipment:** `Barbell`, `Dumbbell`, `Band`, `Cable` (**NO `Standard` checkbox**)
  - **Execution:** `Singles`, `Alternating`
  - **Grip:** `Overhand`, `Underhand`
- Show Live Preview checkboxes when `generatedNames.length > 0 && (showPreview || hasSelectedOption)`, labeling already-existing variations `(exists)` cleanly.

### 3. `SettingsModal.jsx` (`CREATE EXERCISE`)
- Remove `exCreateStandard` state and the `Standard` checkbox; all 8 variation options initialize to `false` (and reset to `false` after creating).
- Render `<VariationGeneratorPanel />` (`showPreview` true whenever `exName.trim()` is non-empty so typing e.g. `Plank` with 0 boxes checked still previews `Plank`).
- Filter out already-existing names (`existingExerciseNames.has(name.toLowerCase())`) before sending `newNames` to `createExerciseMeta(..., pin)`; if `selectedPreviewNames.length > 0` but zero are new, alert cleanly without redundant API writes.

### 4. `ExerciseCard.jsx` (`⚙️ EDIT` → `Generate Variations`)
- Replace the old immediate-fire `variationToggles` checkboxes (and remove unused `variationToggles`, `equipmentTag`, `nonBarbellEquipment`) with two clean sections inside `⚙️ EDIT`:
  1. **Existing Family Variations:** list all cards sharing `extractBaseName(ex.name)` cleanly with an explicit `×` remove action per item (using `window.confirm` + Admin PIN + `deleteExercise` + `removeExerciseFromLocalState`).
  2. **Add Combined Variations (`VariationGeneratorPanel`):** anchored on `baseName = extractBaseName(ex.name)`, starting with all 8 checkboxes `false` (`showPreview` only when at least 1 checkbox is checked). Clicking **`ADD VARIATIONS (N)`** prompts **once** for Admin PIN, calls `createExerciseMeta({ baseName, variationNames: newNamesToCreate, category: ex.category || 'General', manufacturer: ex.manufacturer || '', muscleGroups: ex.muscleGroups || ex.muscle || '', modelSeries: ex.modelSeries, baseExercise: ex.baseExercise, note: ex.note, fileReference: ex.fileReference, timed: ex.timed, location: ex.location || 'Anywhere', isCircuit: ex.isCircuit }, pin)`, shows confirmation toast, and resets the generator checkboxes.

### 5. Phase 2 QA Defect Fix — React Hooks Order in `ExerciseCard.jsx`
- `QA_PREMERGE_FAIL` caught React hooks (`todaysSets`, `groupedSets`, `filteredHistory`, `totalPersonHistoryCount` `useMemo` calls and `React.useEffect` at lines ~378–470) running **after** `if (!ex) return null;` (line 298) in `gymlog-react/src/components/ExerciseCard.jsx`.
- Move `todaysSets`, `groupedSets`, `filteredHistory`, `totalPersonHistoryCount`, `initLogInputs`, and `React.useEffect` **above** the `if (!ex) return null;` guard (and safely optional-chain `group?.ex` / `group?.variations` / `group?.name` / `group?.baseName` when resolving `ex`), ensuring **zero** React hooks appear after any conditional early return.

---

## Target Files
- `gymlog-react/src/utils/exerciseVariations.js`
- `gymlog-react/src/components/VariationGeneratorPanel.jsx` *(New)*
- `gymlog-react/src/context/AppContext.jsx`
- `gymlog-react/src/context/dataMerge.js`
- `gymlog-react/src/components/PlanView.jsx`
- `gymlog-react/src/components/FullBodyView.jsx`
- `gymlog-react/src/components/LiftView.jsx`
- `gymlog-react/src/components/AccessoryBlock.jsx`
- `gymlog-react/src/components/SettingsModal.jsx`
- `gymlog-react/src/components/ExerciseCard.jsx`
- `gymlog-react/src/components/CircuitCard.jsx`

---

## Submission Protocol for Developer
1. Execute all edits strictly within `gymlog-react/src/*`.
2. Verify production build with `cmd /c npm run build`.
3. Respond in chat with strictly the 4-line XML snippet below:
```xml
<TASK_HANDOFF>
  <TASK_ID>TASK-R131</TASK_ID>
  <ROLE>Sandbox_Developer</ROLE>
  <STATUS>DEVELOPMENT_TASK_COMPLETE</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</TASK_HANDOFF>
```
