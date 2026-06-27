# task_014: Per-User PIN Protection for History Deletion
- **Required Model Tier**: High (Claude Opus 4.6 or Gemini 2.5 Pro)

## Objective:
Replace the single global Admin PIN with a per-user PIN system. Each person on the roster
has their own PIN. Deleting that person's history or sets requires their specific PIN.
A global ADMIN_PIN override remains available for emergency admin actions only.

## Architecture:

### PIN Storage (Backend — Combined_AppScript_v2.gs)
- Per-user PINs are stored as Google Apps Script Script Properties:
  - Key format: `PIN_<NAME_UPPERCASE>` (e.g. `PIN_BRIAN`, `PIN_DAD`, `PIN_SEAN`)
  - The global `ADMIN_PIN` Script Property remains as an override for all users.
- `verifyUserPin(payload)` replaces `verifyAdminPin(payload)`:
  ```javascript
  function verifyUserPin(payload) {
    const name = (payload.person || '').toUpperCase();
    const userPin = PropertiesService.getScriptProperties().getProperty('PIN_' + name);
    const adminPin = PropertiesService.getScriptProperties().getProperty('ADMIN_PIN') || '5050';
    if (payload.pin !== userPin && payload.pin !== adminPin) {
      throw new Error('Unauthorized: Invalid PIN for ' + name);
    }
  }
  ```
- Update `gymlog_handleDeleteHistory()` to call `verifyUserPin(payload)` instead of `verifyAdminPin(payload)`.
- Add a new action handler `setPeoplePin` that:
  - Accepts `{ action: "setPeoplePin", person, pin, adminPin }` 
  - Verifies the `adminPin` against the global `ADMIN_PIN` Script Property first.
  - Stores the new `PIN_<NAME>` Script Property.
  - Returns `ok({ saved: person })`.

### PIN Setup Flow (Frontend — SettingsModal.jsx)
- When adding a new person via "Add Person", prompt for a PIN immediately after name entry:
  - "Enter a PIN for [Name] (numbers only, min 4 digits):"
  - Validate: must be numeric, minimum 4 digits.
  - Call the new `setPeoplePin(name, pin)` API endpoint (requires global admin PIN to authorize the write).
- Display a "Change PIN" button next to each person in the roster list.
  - Clicking it prompts for the global Admin PIN to authorize, then a new PIN for that person.

### Delete Flow (Frontend — CircuitView.jsx, PlanView.jsx, WorkoutCard.jsx)
- When prompting for PIN on delete, personalize the message:
  - Current: "Enter Admin PIN to confirm deletion:"
  - New: "Enter [Person's Name]'s PIN to confirm deletion:"
- Pass the person's name along with the PIN in the delete payload so the backend can
  look up the correct Script Property to validate against.

## Files to Modify:
1. `Combined_AppScript_v2.gs` — Add `verifyUserPin()`, add `setPeoplePin` action handler, update `gymlog_handleDeleteHistory()`.
2. `gymlog-react/src/hooks/useGymAPI.js` — Add `setPeoplePin(name, pin, adminPin)` API call.
3. `gymlog-react/src/components/SettingsModal.jsx` — Add PIN entry to "Add Person" flow and "Change PIN" button.
4. `gymlog-react/src/components/CircuitView.jsx` — Update delete prompt to show person's name and pass person to payload.
5. `gymlog-react/src/components/PlanView.jsx` — Same as CircuitView.

## Verification:
1. `npm run build` in `gymlog-react/` — zero errors.
2. Commit with message: `feat(security): implement per-user PIN protection for history deletion`
3. Output detailed Audit Log.

## Notes:
- Do NOT delete or modify the global `ADMIN_PIN` Script Property logic.
- PINs for existing users must be manually set in Script Properties by the admin
  (e.g. `PIN_BRIAN`, `PIN_DAD`) until the UI flow in SettingsModal is implemented.
- If a user has no PIN set in Script Properties, the backend should fall back to
  requiring the global ADMIN_PIN to prevent accidental open-access deletion.
