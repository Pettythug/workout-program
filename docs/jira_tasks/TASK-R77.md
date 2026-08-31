# TASK-R77: Robust Case-Insensitive Multi-Location Matching and Fallback

> **For Human Readers:** This task implements robust, case-insensitive, comma-separated location matching across PlanView, LiftView, and AccessoryBlock, ensuring "Anywhere" exercises always appear alongside specific location exercises and graceful fallbacks are in place if a category has no exercises for a given gym.

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
    1. Create a centralized location helper (`gymlog-react/src/utils/locationHelper.js`) supporting:
       - Case-insensitive comparison and whitespace trimming.
       - Comma-separated multi-location strings (e.g., "24 Hour Fitness, Home").
       - Blank, undefined, or "Anywhere" entries matching any selected location.
       - "all" matching all exercises.
    2. Integrate `matchesLocation` into `PlanView.jsx`, `LiftView.jsx`, and `AccessoryBlock.jsx`.
    3. Add fallback in `PlanView.jsx` pick algorithm so if zero exercises exist for a selected location in a category, it falls back to "Anywhere" exercises in that category (ensuring a complete 5-exercise workout).
  </OBJECTIVE>
  <RESOURCES>
    - Plan View: `gymlog-react/src/components/PlanView.jsx`
    - Lift View: `gymlog-react/src/components/LiftView.jsx`
    - Accessory Block: `gymlog-react/src/components/AccessoryBlock.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. CREATE `gymlog-react/src/utils/locationHelper.js`:
       ```javascript
       export function matchesLocation(exerciseLocation, activeLocation) {
           if (!activeLocation || activeLocation.trim().toLowerCase() === "all") return true;
           if (!exerciseLocation || !exerciseLocation.trim()) return true;
           
           const activeNormalized = activeLocation.trim().toLowerCase();
           const locs = exerciseLocation.split(',').map(l => l.trim().toLowerCase()).filter(Boolean);
           
           if (locs.length === 0 || locs.includes("anywhere")) return true;
           return locs.includes(activeNormalized);
       }
       ```

    2. MODIFY `gymlog-react/src/components/PlanView.jsx`:
       - Import `matchesLocation` from `../utils/locationHelper`.
       - Update the `pick(categories)` function to use `matchesLocation(ex.location, activeLocation)`.
       - If `subset.length === 0`, fall back to `matchesLocation(ex.location, "Anywhere")`.
       - If still 0, fall back to any exercises in those categories.

    3. MODIFY `gymlog-react/src/components/LiftView.jsx`:
       - Import `matchesLocation` from `../utils/locationHelper`.
       - Replace `locMatch` logic with `matchesLocation(e.location, activeLocation)`.

    4. MODIFY `gymlog-react/src/components/AccessoryBlock.jsx`:
       - Import `matchesLocation` from `../utils/locationHelper`.
       - Replace `locMatch` logic in `handleAddAccessory` and `handleSwapAccessory` with `matchesLocation(ex.location, activeLocation)`.

    5. AUDIT: Generate `/audit_log_R77.md` documenting the location normalization and fallbacks.
    6. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
