# TASK-R13 Audit Log: Consolidate Core Exercise Categories

## Objective
Unify the split "Rotational Core" and "Plank/Static Core" exercise categories into a single unified "Core" category across both the backend sync parser and the frontend workout generator.

## Execution Notes

### 1. Backend Modifications
- **`Combined_AppScript_v2.gs`**:
  - Located the `normalizeCategory` helper function.
  - Replaced the separate conditional blocks for `"rotational core"` and `"plank core"` with a single unified check:
    ```javascript
    if (c.includes("core")) return "Core";
    ```

### 2. Frontend Modifications
- **`gymlog-react/src/components/PlanView.jsx`**:
  - Located the random group pickers for Push and Pull workouts around lines 80-82.
  - Replaced the split pick groups `pick(['Rotational Core', 'Plank Core'])` and `pick(['Plank Core', 'Rotational Core'])` with a single unified call:
    ```javascript
    pick(['Core'])
    ```

### 3. Verification
- Ran `cmd /c npm run build` successfully in `gymlog-react` directory, ensuring no syntax errors or build issues.
