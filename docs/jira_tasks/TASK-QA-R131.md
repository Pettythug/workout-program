# TASK-QA-R131: Pre-Merge QA Verification — Equipment/Grip Variations, Un-Collapsed Rotation & Band Toggle

- **Target Role:** `QA_Engineer` (Read-Only Access; `DENY(Direct_Write_Code)`)
- **Authorized Model Tier:** `LOW_TIER` (`Gemini 3.8 Flash (Low)`, `Gemini 3.5 Flash (Medium)`, `Gemini 3.5 Flash (Low)`) or `MEDIUM_TIER` (`Gemini 3.8 Flash`, `Gemini 3.5 Flash (High)`, `Claude Sonnet 4.6 (Thinking)`)
- **Model Gatekeeper Check:** Verify your active model is in the Authorized Model Tier above before executing verification. If misaligned, halt and output the `Model Alignment Error` override.
- **Target Branch:** `feat/TASK-R131-equipment-grip-variations-and-band-toggle`

---

## Verification Checklist

1. **Production Build Verification:**
   - Run `cmd /c npm run build` inside `gymlog-react`.
   - Verify exit code `0` with zero bundler or syntax errors.

2. **Shared Variation & Band PB Utility (`gymlog-react/src/utils/exerciseVariations.js`):**
   - Verify zero React or Context imports (pure utility module).
   - Verify `extractBaseName(name)` strips trailing parentheticals containing known modifiers (`barbell`, `db`, `dumbbell`, `band`, `cable`, `single`, `alt`, `overhand`, `underhand`) while preserving non-variation tags (e.g., `(Plate-Loaded)`).
   - Verify `extractEquipmentTag(name)` resolves `'Barbell' | 'DB' | 'Band' | 'Cable' | null`.
   - Verify `buildVariationNames(baseName, options)` enforces that `barbell` never auto-combines with `single` or `alt`, skips redundant standalone `(Single)`/`(Alt)` when both `standard` and `dumbbell` are selected, generates `DB`/`Band`/`Cable` + execution + grip combinations cleanly, and returns deduplicated strings.
   - Verify `isBandTaggedEntry(entry)` detects `entry.usedBand === true` or `/\[band\]/i` in `entry.note`, and `isDedicatedBandExercise(exerciseName)` matches `/\bband(s)?\b/i`.
   - Verify `calculateBestForExercise(exercise)` retains `reps <= 0` filtering and rep-range normalization (`r1_3`, `r4_7`, `r8_12`, `r13_plus`), and skips entries where `!dedicatedBand && isBandTaggedEntry(entry)`.

3. **Un-Collapsed Rotation & Alternatives (`PlanView.jsx`, `FullBodyView.jsx`, `LiftView.jsx`, `AccessoryBlock.jsx`):**
   - Verify `PlanView.jsx` and `FullBodyView.jsx` (`groupedExercises`) key every exercise individually by `ex.name.toLowerCase()` (`{ baseName: ex.name, category: ex.category, variations: { Standard: ex }, ex }`) without collapsing variations.
   - Verify `LiftView.jsx` (`filteredAndGrouped`) maps each filtered exercise individually and sorts alphabetically by `baseName`.
   - Verify `AccessoryBlock.jsx` (`getAccessoryAlternatives`) lists every variation distinctly by `ex.name`, while `pickAccessoryCandidate` and base fallbacks use `extractBaseName`.

4. **Expanded Generator & Live Preview (`SettingsModal.jsx`):**
   - Verify grouped checkboxes for Equipment (`Standard`, `Barbell`, `Dumbbell`, `Band`, `Cable`), Execution (`Singles`, `Alternating`), and Grip (`Overhand`, `Underhand`).
   - Verify `generatedNames` via `buildVariationNames`, `excludedPreviewNames` Set toggling, interactive `Live Preview` checklist with `(exists)` indicator, and passing `variationNames: selectedPreviewNames` to `createExerciseMeta`.

5. **ExerciseCard Zero Switcher Pills, Band Toggle & Edit Variations (`ExerciseCard.jsx`):**
   - Verify **ZERO** `STD | SINGLES | ALT` switcher pills are rendered anywhere on `ExerciseCard.jsx`.
   - Verify `BandAndNotesInput` renders the `[ ] Band (Assist / Tension)` checkbox and dynamic note placeholder in both `SingleUserLogSection` and `MultiUserPersonLogSection`, and `logInputs` / `clearLogInputs` / `updateLogInput` handle boolean `usedBand`.
   - Verify `⚙️ EDIT` → `Generate Variations` renders toggles (`Barbell`, `Dumbbell (DB)`, `Band`, `Singles`, `Alternating`, `Overhand`, `Underhand`) anchored on `extractBaseName(ex.name)` (using `nonBarbellEquipment` so `Barbell` never pairs with `Single`/`Alt`) and creates/deletes via `createExerciseMeta` / `deleteExercise`.

6. **CircuitCard Band Toggle (`CircuitCard.jsx`):**
   - Verify `PersonRow` renders `[ ] Band (Assist / Tension)` above Notes, `inputs` / `updateInput` / post-save clear handle `usedBand: false`, and `executeSwap` uses `extractBaseName`.

7. **State, Set Logging & Reload Merge Guard (`AppContext.jsx`, `dataMerge.js`):**
   - Verify `AppContext.jsx` re-exports `calculateBestForExercise` from `../utils/exerciseVariations`.
   - Verify `createExerciseMeta` supports `variationNames` (deduplicated) alongside legacy fallbacks and preserves optional metadata (`manufacturer`, `muscleGroups`, etc.).
   - Verify `addSetToLocalHistory` guards `updatedBest` with `if (!dedicatedBand && isBandTaggedEntry(entry)) return;`.
   - Verify `logExerciseSet` scopes `nextSetNum` calculation to `ex.name` specifically and normalizes `note` to prepend `[Band]` when `input.usedBand` is checked.
   - Verify `dataMerge.js` (`resolveMergedBest` inside `mergeFromSheets`) recomputes `best` with `calculateBestForExercise` when non-dedicated Band exercises contain band-tagged entries in `mergedHistory`, preserving non-band fallback PBs per person.

---

## Submission Protocol for QA Engineer
1. Execute read-only code inspection across the target files and run `cmd /c npm run build` inside `gymlog-react`.
2. Do **NOT** modify any files (`DENY(Direct_Write_Code)`).
3. Respond in chat strictly with the XML status block below upon passing all checks (or report specific defects if any check fails):

```xml
<AUDIT_SUBMISSION>
  <TASK_ID>TASK-QA-R131</TASK_ID>
  <ROLE>QA_Engineer</ROLE>
  <STATUS>QA_PREMERGE_PASS</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</AUDIT_SUBMISSION>
```
