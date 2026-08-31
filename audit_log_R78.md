# Audit Log - TASK-R78

## Objective
Enable the "🔄 SWAP" feature on bonus accessory cards so users can pick a specific replacement from all available accessory exercises (matching the active location) or enter a custom swap, while keeping a quick "🎲 REROLL BONUS" button.

## Changes Made
- **ExerciseCard.jsx**: Updated to accept `onSwap` prop. Modified `executeSwap` to call `onSwap` if it exists. Updated the SWAP button and swap modal rendering logic to appear when `onSwap` or `group.alternatives` are present.
- **AccessoryBlock.jsx**: Implemented `getAccessoryAlternatives()` to filter accessory exercises for the current location. Implemented `handleDirectSwap()` to handle swaps initiated from the dropdown (either replacing with a known exercise or a new custom one). Updated the accessory map rendering to pass down `onSwap` and renaming the random reroll button to "🎲 REROLL BONUS".

## Verification
- Code has been updated successfully. Next, we will run `npm run build` to verify clean compilation.
