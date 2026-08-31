# TASK-R78: Enable Specific & Random Swapping for Bonus Accessories

> **For Human Readers:** This task enables the full "🔄 SWAP" feature on bonus accessory cards so users can pick a specific replacement from all available accessory exercises (matching the active location) or enter a custom swap, while keeping a quick "🎲 REROLL BONUS" button.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: MULTI_FILE_Refactoring
    - REQUIRED_MODEL_TIER: MEDIUM_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R78`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Update `ExerciseCard.jsx` to render the "🔄 SWAP" button whenever `group.originalBaseKey || onSwap` is present (and support `onSwap` prop).
    2. In `AccessoryBlock.jsx`:
       - Construct each accessory group with `alternatives` listing all available accessory exercises matching the active location.
       - Pass `onSwap` prop to `<ExerciseCard>` so selecting an exercise from the dropdown replaces that accessory in `accessoriesList`.
       - Update the bottom button to "🎲 REROLL BONUS" for quick random re-selection.
  </OBJECTIVE>
  <RESOURCES>
    - Accessory Block: `gymlog-react/src/components/AccessoryBlock.jsx`
    - Exercise Card: `gymlog-react/src/components/ExerciseCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/ExerciseCard.jsx` and `gymlog-react/src/components/AccessoryBlock.jsx`.

    2. MODIFY `gymlog-react/src/components/ExerciseCard.jsx`:
       - Accept `onSwap` as a destructured prop in `ExerciseCard({ group, onLogSet, isOpen: propIsOpen, onSwap })`.
       - In `executeSwap(targetValue)`:
         - If `onSwap` prop is provided: call `onSwap(ex.name, targetValue)` and `setSwapMode(null)`.
         - Else if `group.originalBaseKey`: call `swapExercise(workoutDay, group.originalBaseKey, targetName)` and `setSwapMode(null)`.
       - In footer buttons (approx L857):
         - Show the "🔄 SWAP" button if `group.originalBaseKey || onSwap || (group.alternatives && group.alternatives.length > 0)`:
           `{(group.originalBaseKey || onSwap || (group.alternatives && group.alternatives.length > 0)) && (`
       - In swap dropdown modal (approx L803):
         - Render if `(group.originalBaseKey || onSwap || group.alternatives) && swapMode === ex.name`.

    3. MODIFY `gymlog-react/src/components/AccessoryBlock.jsx`:
       - Helper function `getAccessoryAlternatives()`:
         - Filters `exercises` for `category.toLowerCase().includes('accessory')` and `matchesLocation(ex.location, activeLocation)`.
         - Groups by baseName and returns array of available accessory groups.
       - Implement `handleDirectSwap(index, targetNameOrCustom)`:
         - If target is string name: looks up exercise in `exercises` and updates `accessoriesList[index]`.
         - If target is custom object: builds custom exercise group and updates `accessoriesList[index]`.
       - In accessory mapping:
         - Populate `acc.alternatives = getAccessoryAlternatives().filter(a => a.baseName.toLowerCase() !== acc.baseName.toLowerCase())`.
         - Render: `<ExerciseCard group={acc} onLogSet={onLogSet} onSwap={(oldName, target) => handleDirectSwap(idx, target)} />`.
         - Rename bottom button to "🎲 REROLL BONUS" (with style polish).

    4. AUDIT: Generate `/audit_log_R78.md` detailing the accessory swapping additions.
    5. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
