# Audit Log: TASK-R17

## Changes Made
- Updated the fallback API URL in the React application's API hook.
- Replaced the `DEFAULT_URL` constant string value in `gymlog-react/src/hooks/useGymAPI.js` with the new uncorrupted Google Apps Script deployment URL.
- Ran validation using `cmd /c npm run build` which successfully completed without errors.

## Files Modified
- `gymlog-react/src/hooks/useGymAPI.js`
