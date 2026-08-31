# TASK-R77 Audit Log: Location Filtering, Roster Cleanup, and Settings Management

## Changes Implemented

1. **`src/utils/locationHelper.js` Created**
   - Implemented `normalizeLocation(loc)` to trim, lowercase, and transparently map legacy `"Gym"` entries to `"24 hour fitness"`.
   - Implemented `matchesLocation(exerciseLocation, activeLocation)` with the following rules:
     - Always true if `activeLocation` is `"all"` or missing.
     - Always true if `exerciseLocation` is missing, blank, or contains `"anywhere"`.
     - Supports comma-separated `exerciseLocation` strings.
     - Performs comparison via `normalizeLocation()`.

2. **`src/context/AppContext.jsx` Updated**
   - Modified default locations array to `["Anywhere", "Home", "24 Hour Fitness"]`.
   - Added startup filter logic to strip out `"Gym"` and ensure `"24 Hour Fitness"` exists if a legacy cached roster was loaded.
   - Updated `activeLocation` default to `"24 Hour Fitness"` and added upgrade logic for `"Gym"`.
   - Implemented and exported `removeLocationFromRoster(locName)`, which restricts removing `"Anywhere"` and automatically updates `activeLocation` if the deleted location is currently active.

3. **`src/components/SettingsModal.jsx` Updated**
   - Destructured `removeLocationFromRoster`.
   - Enhanced the location list UI to render a "✕" delete button next to all locations except `"Anywhere"`. Deletions prompt for confirmation.

4. **`src/components/PlanView.jsx` Updated**
   - Imported `matchesLocation` utility.
   - Refactored `pick(categories)` to use three-tier fallback logic:
     - **Tier 1**: `matchesLocation(ex.location, activeLocation)`
     - **Tier 2**: Fallback to `matchesLocation(ex.location, "Anywhere")`
     - **Tier 3**: Absolute fallback matching all exercises within the selected category, ignoring location.

5. **`src/components/LiftView.jsx` and `src/components/AccessoryBlock.jsx` Updated**
   - Replaced inline location logic with the imported `matchesLocation` utility for consistency.

## Verification
- Code successfully compiled with `npm run build`. No warnings or errors thrown.
