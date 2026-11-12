# TASK-QA-R131: Pre-Merge QA Verification — Equipment/Grip Variations, Un-Collapsed Rotation & Band Toggle (Phase 1 + Phase 2)

- **Target Role:** `QA_Engineer` (Read-Only Access; `DENY(Direct_Write_Code)`)
- **Authorized Model Tier:** `LOW_TIER` (`Gemini 3.8 Flash (Low)`, `Gemini 3.5 Flash (Medium)`, `Gemini 3.5 Flash (Low)`) or `MEDIUM_TIER` (`Gemini 3.8 Flash`, `Gemini 3.5 Flash (High)`, `Claude Sonnet 4.6 (Thinking)`)
- **Model Gatekeeper Check:** Verify your active model is in the Authorized Model Tier above before executing verification. If misaligned, halt and output the `Model Alignment Error` override.
- **Target Branch:** `feat/TASK-R131-equipment-grip-variations-and-band-toggle`

---

## Verification Checklist

1. **Production Build Verification:**
   - Run `cmd /c npm run build` inside `gymlog-react`.
   - Verify exit code `0` with zero bundler or syntax errors (`46` modules transformed).

2. **Shared Variation & Band PB Utility (`gymlog-react/src/utils/exerciseVariations.js`):**
   - Verify zero React or Context imports (pure utility module) and `INITIAL_VARIATION_OPTIONS` exports all 8 flags initialized to `false` (no `standard` flag in UI options).
   - Verify `extractBaseName(name)` strips trailing parentheticals containing known modifiers (`barbell`, `db`, `dumbbell`, `band`, `cable`, `single`, `alt`, `overhand`, `underhand`) while preserving non-variation tags (e.g., `(Plate-Loaded)`).
   - Verify `buildVariationNames(baseName, options)`:
     - When no equipment is checked (`!hasAnyEquipment || standard`) and neither grip is checked, emits `cleanBase` plus `(Single)` / `(Alt)` as checked.
     - When no equipment is checked and `overhand`/`underhand` are checked, emits **only** grip-tagged variants (`(Overhand)`, `(Single, Overhand)`, etc.) without emitting grip-less copies.
     - `Barbell` never auto-combines with `Single` or `Alt`; emits `(Barbell)` when no grip is checked, or **only** `(Barbell, Overhand)` / `(Barbell, Underhand)` when grips are checked.
     - `DB`, `Band`, `Cable` omit grip-less variants when `overhand`/`underhand` are checked; specifically verify `buildVariationNames('Bent Over Row', { barbell: true, dumbbell: true, single: true, alt: true, overhand: true, underhand: true })` emits **8 exact variations**.
   - Verify `isBandTaggedEntry`, `isDedicatedBandExercise`, and `calculateBestForExercise` (`reps <= 0` exclusion, rep-range normalization, and skipping `!dedicatedBand && isBandTaggedEntry(entry)`).

3. **Shared Generator Panel (`gymlog-react/src/components/VariationGeneratorPanel.jsx`):**
   - Verify shared component renders grouped checkboxes for Equipment (`Barbell`, `Dumbbell`, `Band`, `Cable` — **NO `Standard` checkbox**), Execution (`Singles`, `Alternating`), and Grip (`Overhand`, `Underhand`).
   - Verify Live Preview checklist displays matching names, handles strikethrough exclusion via `onTogglePreviewName`, displays `(exists)` for already-saved exercises, and respects `showPreview || hasSelectedOption`.

4. **Un-Collapsed Rotation & Alternatives (`PlanView.jsx`, `FullBodyView.jsx`, `LiftView.jsx`, `AccessoryBlock.jsx`):**
   - Verify `PlanView.jsx` and `FullBodyView.jsx` (`groupedExercises`) key every exercise individually by `ex.name.toLowerCase()` (`{ baseName: ex.name, category: ex.category, variations: { Standard: ex }, ex }`) without collapsing variations.
   - Verify `LiftView.jsx` (`filteredAndGrouped`) maps each filtered exercise individually and sorts alphabetically by `baseName`.
   - Verify `AccessoryBlock.jsx` (`getAccessoryAlternatives`) lists every variation distinctly by `ex.name`, while `pickAccessoryCandidate` and base fallbacks use `extractBaseName`.

5. **Settings Create Exercise (`SettingsModal.jsx`):**
   - Verify `exCreateStandard` and `Standard` checkbox are removed; uses `INITIAL_VARIATION_OPTIONS` and `<VariationGeneratorPanel showPreview={Boolean(exName.trim())} />`.
   - Verify `handleCreateExercise` filters out `existingExerciseNames` before calling `createExerciseMeta({ variationNames: newNames, ... }, pin)`, alerts cleanly if zero selected variations are new, and resets options to `INITIAL_VARIATION_OPTIONS`.

6. **ExerciseCard Zero Switcher Pills, Band Toggle & Batch Edit Panel (`ExerciseCard.jsx`):**
   - Verify **ZERO** `STD | SINGLES | ALT` switcher pills are rendered anywhere on `ExerciseCard.jsx`.
   - Verify all React hooks run cleanly before the early `if (!ex) return null;` guard.
   - Verify `BandAndNotesInput` renders `[ ] Band (Assist / Tension)` and dynamic note placeholder in both `SingleUserLogSection` and `MultiUserPersonLogSection`, and `logInputs` / `clearLogInputs` / `updateLogInput` handle boolean `usedBand`.
   - Verify `⚙️ EDIT` renders **Existing Family Variations** (`familyVariations` matching `extractBaseName(ex.name)`) with explicit `×` remove buttons (`window.confirm` + PIN + `deleteExercise` + `removeExerciseFromLocalState`), followed by `<VariationGeneratorPanel showPreview={false} />` and **`ADD VARIATIONS (N)`** button prompting once for Admin PIN and batch-creating `newNamesToCreate` with full metadata (`manufacturer`, `muscleGroups`, `modelSeries`, `baseExercise`, `note`, `fileReference`, etc.).

7. **CircuitCard Band Toggle (`CircuitCard.jsx`):**
   - Verify `PersonRow` renders `[ ] Band (Assist / Tension)` above Notes, `inputs` / `updateInput` / post-save clear handle `usedBand: false`, and `executeSwap` uses `extractBaseName`.

8. **State, Set Logging & Reload Merge Guard (`AppContext.jsx`, `dataMerge.js`):**
   - Verify `AppContext.jsx` re-exports `calculateBestForExercise`, `createExerciseMeta` supports `variationNames`, `addSetToLocalHistory` guards `updatedBest` with `if (!dedicatedBand && isBandTaggedEntry(entry)) return;`, and `logExerciseSet` scopes `nextSetNum` to `ex.name` and prepends `[Band]` to `note` when `input.usedBand` is checked.
   - Verify `dataMerge.js` (`resolveMergedBest`) recomputes `best` with `calculateBestForExercise` when non-dedicated Band exercises contain band-tagged entries in `mergedHistory`, preserving non-band fallback PBs per person.

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
