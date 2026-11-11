# TASK-R129: Fix "Got More in the Tank?" Silent Drops, Auto-Expand & Custom Swap Local Sync

- **Target Role:** `Sandbox_Developer`
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash`, `Claude Sonnet 4.6 (Thinking)`, `Gemini 3.5 Flash (High)`) or `HIGH_TIER`
- **Model Gatekeeper Check:** Verify your active model is in the Authorized Model Tier above before executing any file edits. If misaligned, halt and output the `Model Alignment Error` override.

## Overview
1. **"Got More in the Tank?" Silent Drop & Delayed Spawn Bug:**
   - In `PlanView.jsx` (`resolvedAccessories`, lines 170–178) and `FullBodyView.jsx` (lines 169–177), accessory items stored in `accessoriesList` are looked up using `groupedExercises[baseName.toLowerCase()]`.
   - However, when `AccessoryBlock.jsx` picks an exercise containing `(Single)`, `(Alt)`, `(DB)`, or `(Cable)` in its name (setting `baseName: selected.name`), `groupedExercises` had stripped those suffixes when building keys. As a result, `groupedExercises["exercise (alt)"]` evaluates to `undefined`, and `.filter(Boolean)` silently drops the card from the UI while leaving it stuck in `localStorage` (`gymlog_session_accessories`).
   - Users experience nothing happening on the first click(s)—even after refreshing—and later see queued/stacked cards appearing below when completing or rerolling a visible bonus card.
   - Additionally, newly added Bonus Accessory `<ExerciseCard>` instances render **collapsed** by default because no `defaultOpen` prop is passed.

2. **Custom Swap Exercises Not Entering Local State:**
   - In `ExerciseCard.jsx` (`executeSwap`, lines 571–591) and `CircuitView.jsx` (`handleSwap`, lines 281–291), creating a new custom exercise during Swap saves it to Google Sheets (`await saveExercise(targetEx, pin)`), **but fails to add it into local `exercises` React state** (and `ExerciseCard` omits `location`), so the new exercise does not enter local workout generation/autocomplete until the next full cloud reload.

---

## Technical Specifications & Requirements

### 1. Fix `resolvedAccessories` & Stale Cache Pruning (`PlanView.jsx`, `FullBodyView.jsx`)
In **both** `gymlog-react/src/components/PlanView.jsx` and `gymlog-react/src/components/FullBodyView.jsx`:
1. Update `resolvedAccessories` (`useMemo` dependencies `[exercises, groupedExercises, accessoriesList]`):
   - Extract `const rawName = (item && item.baseName ? item.baseName : item) || '';`
   - First check for an exact match in `exercises`:
     ```javascript
     const exactEx = (exercises || []).find(
         e => e.name.trim().toLowerCase() === rawName.trim().toLowerCase()
     );
     if (exactEx) {
         return {
             baseName: exactEx.name,
             category: exactEx.category || 'Accessory',
             variations: { Standard: exactEx },
             ex: exactEx
         };
     }
     ```
   - Otherwise fall back to `groupedExercises[rawName.trim().toLowerCase()] || null`.
2. Add a clean pruning guard (via `useEffect` once `exercises && exercises.length > 0`): if `accessoriesList.length > 0` contains any stale entries that fail to resolve against both `exercises` and `groupedExercises`, filter them out of `accessoriesList` so `accessoriesList.length` and `resolvedAccessories.length` never drift out of sync (preventing array-index mismatches during `handleSwapAccessory` / `handleDirectSwap`).

### 2. Deterministic Pick, Auto-Open & Location Fallback (`AccessoryBlock.jsx`, `ExerciseCard.jsx`)
1. In `gymlog-react/src/components/ExerciseCard.jsx`:
   - Add an optional `defaultOpen = false` prop to `ExerciseCard({ group, onLogSet, isOpen: propIsOpen, defaultOpen = false, onSwap })`:
     `const [isOpenState, setIsOpenState] = useState(Boolean(defaultOpen));`
2. In `gymlog-react/src/components/AccessoryBlock.jsx`:
   - Extract a shared helper `getCandidateAccessories()` that filters `exercises` for category matching `'accessory'` and `matchesLocation(ex.location, activeLocation)`, with a fallback to all `'accessory'` exercises if none match `activeLocation`.
   - In `handleAddAccessory` and `handleSwapAccessory`: instead of 10 random retries, filter `candidates` once to exclude `excludeNames` and `accessoriesList`, pick randomly from remaining unused candidates (or fall back to `candidates` if all have been used).
   - Track `lastAddedIdx` in component state (set to `accessoriesList.length` in `handleAddAccessory` and to `index` in `handleSwapAccessory`).
   - When rendering `<ExerciseCard>`, pass `key={`${acc.baseName}_${idx}`}` and `defaultOpen={idx === lastAddedIdx}` so every newly added or rerolled Bonus Accessory card immediately opens ready for logging!

### 3. Add Custom Swap Exercises to Local State Immediately (`AppContext.jsx`, `ExerciseCard.jsx`, `CircuitView.jsx`)
1. In `gymlog-react/src/context/AppContext.jsx`:
   - Add `addExerciseToLocalState(newExercise)` (mirroring `createExerciseMeta` local state update): appends `{ history: [], best: {}, ...newExercise }` if `newExercise?.name` is not already in `exercises` (case-insensitive), persists `localStorage.setItem('gymlog_exercises', JSON.stringify(next))`, and export `addExerciseToLocalState` on `contextValue`.
2. In `gymlog-react/src/components/ExerciseCard.jsx` (`executeSwap`):
   - Include `location: (activeLocation && activeLocation !== 'all') ? activeLocation : (ex.location || 'Anywhere')` on `targetEx`.
   - Right after `await saveExercise(targetEx, pin)` succeeds, call `addExerciseToLocalState(targetEx)`.
3. In `gymlog-react/src/components/CircuitView.jsx` (`handleSwap`):
   - Destructure `addExerciseToLocalState` and `activeLocation` from `useAppContext()`.
   - When `isNew` is true and `await saveExercise(targetEx, pin)` succeeds, ensure `location` is populated and call `addExerciseToLocalState(targetEx)`.

---

## Target Files
- `gymlog-react/src/context/AppContext.jsx`
- `gymlog-react/src/components/PlanView.jsx`
- `gymlog-react/src/components/FullBodyView.jsx`
- `gymlog-react/src/components/AccessoryBlock.jsx`
- `gymlog-react/src/components/ExerciseCard.jsx`
- `gymlog-react/src/components/CircuitView.jsx`

---

## Submission Protocol for Developer
1. Execute all edits strictly within `gymlog-react/src/*`.
2. Verify production build with `cmd /c npm run build`.
3. Respond in chat with strictly the 4-line XML snippet below:
```xml
<TASK_HANDOFF>
  <TASK_ID>TASK-R129</TASK_ID>
  <ROLE>Sandbox_Developer</ROLE>
  <STATUS>DEVELOPMENT_TASK_COMPLETE</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</TASK_HANDOFF>
```
