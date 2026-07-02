# Audit Log R4: Per-User PIN Protection

## Objectives
Implement Per-User PIN Protection so that logging sets requires the user's personal PIN to validate identity on the backend.

## Files Modified
1. `Combined_AppScript_v2.gs`
2. `gymlog-react/src/hooks/useGymAPI.js`
3. `gymlog-react/src/components/ExerciseCard.jsx`
4. `gymlog-react/src/components/CircuitView.jsx`

## Detailed Changes

### 1. `Combined_AppScript_v2.gs`
- Updated `gymlog_handleLogSet()` to extract `userPins` from the incoming payload.
- Added logic to fetch `USER_PINS` from `PropertiesService.getScriptProperties().getProperty('USER_PINS')`.
- Added a validation loop to ensure that for each person being logged, if a PIN exists for them on the server, the PIN provided in `userPins` matches the expected PIN. Throws an unauthorized error if validation fails.

### 2. `gymlog-react/src/hooks/useGymAPI.js`
- Modified the `logSet` hook to accept a `userPins` object parameter.
- Included `userPins` in the POST payload sent to the App Script backend.

### 3. `gymlog-react/src/components/ExerciseCard.jsx`
- Updated the `handleSaveSet` function to loop through all active people with inputted entries.
- Added a `window.prompt` to require the user to input their PIN for each person being logged.
- Accumulated the collected PINs into a `userPins` dictionary and passed it to the `logSet` API call.
- Handled prompt cancellation cleanly: if a user cancels the prompt, the save process is aborted without clearing the active inputs (preventing data loss).

### 4. `gymlog-react/src/components/CircuitView.jsx`
- Updated the `handleLogSet` function to loop through all active people with inputs before calling the API.
- Added the same `window.prompt` PIN collection logic.
- Included the generated `userPins` dictionary in the `logSet` API call.
- Handled prompt cancellation by returning `false` early, preventing incomplete data submission.
