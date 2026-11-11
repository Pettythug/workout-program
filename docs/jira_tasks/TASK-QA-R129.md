# TASK-QA-R129: Pre-Merge Quality Assurance for "Got More in the Tank?" & Custom Swap Local Sync

- **Target Role:** `QA_Engineer`
- **Authorized Model Tier:** `LOW_TIER` (`Gemini 3.8 Flash (Low)`, `Gemini 3.5 Flash (Medium)`, `Gemini 3.5 Flash (Low)`) or `MEDIUM_TIER` (`Gemini 3.8 Flash`, `Claude Sonnet 4.6 (Thinking)`)
- **Access Level:** `READ_ONLY_ACCESS` (No file modifications)

---

## 1. Scope & Verification Mandate
Verify the bug fixes for:
1. "Got More in the Tank? +" silent drops & auto-open UX across `AppContext.jsx`, `PlanView.jsx`, `FullBodyView.jsx`, `AccessoryBlock.jsx`, and `ExerciseCard.jsx`.
2. Custom Swap exercise immediate local state synchronization across `AppContext.jsx`, `ExerciseCard.jsx`, and `CircuitView.jsx`.

---

## 2. Automated Build Verification
Execute the production build command inside the `gymlog-react` directory:
```powershell
cmd /c npm run build
```
- **Pass Criteria:** Process exits cleanly with exit code 0 without syntax, JSX, or bundling errors.

---

## 3. Code Inspection Checklist
1. **Shared `resolveAccessoryItem` & Stale Cache Pruning (`AppContext.jsx`, `PlanView.jsx`, `FullBodyView.jsx`):**
   - Verify `resolveAccessoryItem(item, exercises, groupedExercises)` resolves exact `ex.name` matches first (preventing `(Single)`, `(Alt)`, `(DB)`, `(Cable)` accessories from dropping to `null`), falling back to `groupedExercises`.
   - Verify `PlanView.jsx` and `FullBodyView.jsx` both consume `resolveAccessoryItem` and prune unresolvable legacy entries from `accessoriesList` once `exercises` is populated.
2. **Deterministic Pick, Auto-Open & Fallback (`AccessoryBlock.jsx`, `ExerciseCard.jsx`):**
   - Verify `ExerciseCard` accepts `defaultOpen = false` and initializes `isOpenState` with `Boolean(defaultOpen)`.
   - Verify `AccessoryBlock` uses `getCandidateAccessories()` (with fallback to all accessory-category exercises if active location has none) and `pickAccessoryCandidate()` (single-pass unused filtering instead of 10 random retries).
   - Verify `lastAddedIdx` updates on add/swap/reroll and passes `defaultOpen={idx === lastAddedIdx}` and `key={`${acc.baseName}_${idx}`}` so new/rerolled cards mount open immediately.
3. **Custom Swap Local State Sync (`AppContext.jsx`, `ExerciseCard.jsx`, `CircuitView.jsx`):**
   - Verify `addExerciseToLocalState(newExercise)` is implemented and exported in `AppContext.jsx`, persisting `gymlog_exercises` cleanly without duplicates.
   - Verify `ExerciseCard.jsx` (`executeSwap`) populates `location` and invokes `addExerciseToLocalState(targetEx)` + passes `targetEx` to `onSwap` after `saveExercise` succeeds.
   - Verify `CircuitView.jsx` (`handleSwap`) populates `location` and invokes `addExerciseToLocalState(finalTargetEx)` when `isNew` succeeds.

---

## 4. Submission Protocol
Upon successful build and verification, output strictly the 4-line XML snippet below:
```xml
<AUDIT_SUBMISSION>
  <TASK_ID>TASK-QA-R129</TASK_ID>
  <ROLE>QA_Engineer</ROLE>
  <STATUS>QA_PREMERGE_PASS</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</AUDIT_SUBMISSION>
```
