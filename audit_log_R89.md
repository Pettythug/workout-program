# Audit Log R89: Dynamic Rep-Range-Based Default Rest Timer Duration

## Objective
Implement dynamic rep-range-based default rest timer duration logic across `PlanView`, `FullBodyView`, and `CircuitView`, along with an exposed mapping function in `AppContext.jsx`. Additionally, provide a 45-second timer option within the timer dropdown selections.

## Files Modified
1. `gymlog-react/src/context/AppContext.jsx`
   - Added `getDefaultRestForRepRange(repRange)` which returns strings representing the correct timer seconds based on the active rep range (`'180'`, `'120'`, `'90'`, or `'45'`).
   - Exported the function to context consumers via `contextValue`.
2. `gymlog-react/src/components/PlanView.jsx`
   - Integrated a `useEffect` hook to synchronize `timerMode` on load or whenever the active `workoutDay` updates using `getDefaultRestForRepRange`.
   - Included `<option value="45">⏳ 45S REST</option>` inside the timer selection dropdown.
3. `gymlog-react/src/components/FullBodyView.jsx`
   - Integrated a `useEffect` hook to synchronize `timerMode` on load or whenever `fullBodyWorkoutDay` updates.
   - Included the `<option value="45">⏳ 45S REST</option>` option.
4. `gymlog-react/src/components/CircuitView.jsx`
   - Set the default timer on mount to the default rest duration for `'13+'` (which resolves to `'45'`).
   - Included the `<option value="45">⏳ 45S REST</option>` option.

## Result
Dynamic rest duration defaults are securely integrated based on active rep ranges. The application supports 45-second rests natively.
