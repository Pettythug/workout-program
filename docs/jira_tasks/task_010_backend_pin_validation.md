# task_010: Secure Backend PIN Validation
- **Required Model Tier**: Gemini 3.5 High

## Objective:
Completely remove client-side knowledge of the Admin PIN or its hash by migrating the validation check entirely to the server-side Google Apps Script backend.

## Details:
1. Remove the local `hashPin` helper function and hash validation comparison from:
   - `SettingsModal.jsx`
   - `CircuitView.jsx`
   - `PlanView.jsx`
2. Ensure the frontend React client simply forwards the user-entered `pin` directly inside the backend API request payloads (e.g. `deleteHistory(entry, pin)`).
3. Update the backend Google Apps Script web app code to:
   - Intercept the incoming `pin` parameter.
   - Validate it against the secure script configuration properties (`ScriptProperties.getProperty('ADMIN_PIN')`).
   - If incorrect, throw an `Unauthorized` error and return a `403` status response to block spreadsheet write operations.
