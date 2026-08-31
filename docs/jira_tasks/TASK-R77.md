# TASK-R77: Unified Location Filtering, Roster Cleanup, and Settings Management

> **For Human Readers:** This task cleans up the default locations roster (removing "Gym", defaulting to "24 Hour Fitness"), adds a location deletion action in Settings, treats legacy "Gym" exercises as "24 Hour Fitness", and ensures "Anywhere" exercises are always included in any active location filter with fallback guards in PlanView.

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
    - TARGET_BRANCH: `TASK-R77`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Create centralized location helper `gymlog-react/src/utils/locationHelper.js` supporting:
       - Normalization (case-insensitivity, whitespace trimming).
       - Transparent legacy mapping: treats "Gym" as "24 Hour Fitness".
       - Universal matching: blank/empty or "Anywhere" exercises match all locations.
       - Comma-separated multi-location strings (e.g., "24 Hour Fitness, Home").
       - "all" matching all exercises.
    2. Clean up location defaults and add location removal in `AppContext.jsx`:
       - Default locations: `["Anywhere", "Home", "24 Hour Fitness"]` (purge "Gym").
       - Default activeLocation: `"24 Hour Fitness"`.
       - Add `removeLocationFromRoster(locName)` function and expose it in context.
    3. Update `SettingsModal.jsx` to render a delete/remove button next to locations (except "Anywhere").
    4. Integrate `matchesLocation` across `PlanView.jsx`, `LiftView.jsx`, and `AccessoryBlock.jsx`.
    5. Ensure `PlanView.jsx` pick algorithm falls back to "Anywhere" exercises if a category has no machines for the selected location.
  </OBJECTIVE>
  <RESOURCES>
    - Context: `gymlog-react/src/context/AppContext.jsx`
    - Settings: `gymlog-react/src/components/SettingsModal.jsx`
    - Plan View: `gymlog-react/src/components/PlanView.jsx`
    - Lift View: `gymlog-react/src/components/LiftView.jsx`
    - Accessory Block: `gymlog-react/src/components/AccessoryBlock.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. CREATE `gymlog-react/src/utils/locationHelper.js`:
       ```javascript
       export function normalizeLocation(loc) {
           if (!loc) return "";
           const trimmed = loc.trim().toLowerCase();
           if (trimmed === "gym") return "24 hour fitness";
           return trimmed;
       }

       export function matchesLocation(exerciseLocation, activeLocation) {
           if (!activeLocation || activeLocation.trim().toLowerCase() === "all") return true;
           if (!exerciseLocation || !exerciseLocation.trim()) return true; // Blank is Anywhere
           
           const activeNorm = normalizeLocation(activeLocation);
           const locs = exerciseLocation
               .split(',')
               .map(l => normalizeLocation(l))
               .filter(Boolean);
           
           if (locs.length === 0 || locs.includes("anywhere")) return true;
           return locs.includes(activeNorm);
       }
       ```

    2. MODIFY `gymlog-react/src/context/AppContext.jsx`:
       - Update default locations from `["Anywhere", "Home", "Gym"]` to `["Anywhere", "Home", "24 Hour Fitness"]`.
       - Filter out any legacy `"Gym"` entries from cached `locations` state on startup.
       - Update default `activeLocation` to `"24 Hour Fitness"`.
       - Add `removeLocationFromRoster(locName)`:
         ```javascript
         const removeLocationFromRoster = (locName) => {
             if (locName === "Anywhere") return;
             setLocations(prev => {
                 const next = prev.filter(l => l !== locName);
                 localStorage.setItem('gymlog_locations', JSON.stringify(next));
                 syncMeta(people, next, []);
                 return next;
             });
             if (activeLocation === locName) {
                 updateActiveLocation("24 Hour Fitness");
             }
         };
         ```
       - Expose `removeLocationFromRoster` in `contextValue`.

    3. MODIFY `gymlog-react/src/components/SettingsModal.jsx`:
       - Destructure `removeLocationFromRoster` from `useAppContext()`.
       - In the Locations list, render a delete button (e.g. `✕`) next to each location except `"Anywhere"`, calling `removeLocationFromRoster(l)`.

    4. MODIFY `gymlog-react/src/components/PlanView.jsx`:
       - Import `matchesLocation` from `../utils/locationHelper`.
       - In `pick(categories)`:
         - First try matching `matchesLocation(ex.location, activeLocation)`.
         - If 0 matches, fallback to `matchesLocation(ex.location, "Anywhere")`.
         - If still 0 matches, fallback to all exercises in the category.

    5. MODIFY `gymlog-react/src/components/LiftView.jsx` and `gymlog-react/src/components/AccessoryBlock.jsx`:
       - Import and use `matchesLocation(exercise.location, activeLocation)`.

    6. AUDIT: Generate `/audit_log_R77.md` detailing all location changes and fallbacks.
    7. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
