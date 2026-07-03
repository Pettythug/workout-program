# Audit Log: TASK-R30

## Objective
Remove custom API URL configuration inputs from the Settings modal and inject an auto-cleanup command on boot inside the AppContext loader.

## Changes Made
1. **`gymlog-react/src/components/SettingsModal.jsx`**:
   - Removed `apiUrl` state initialization (`const [apiUrl, setApiUrl] = useState(...)`).
   - Removed `handleSaveApiUrl` function.
   - Removed the "API SYNC URL" section from the JSX rendering, which included the label, input field, and "SAVE URL" button.
   - Kept the "RESET TODAY'S CHECKMARKS" button intact in the Settings UI block.

2. **`gymlog-react/src/context/AppContext.jsx`**:
   - Added auto-cleanup logic inside the main `useEffect` for initial loading. 
   - The logic checks for the existence of `gym_api_url` in `localStorage` and removes it if present, ensuring a fallback to the corrected built-in default.

## Verification
- Code successfully compiled (`npm run build`).
- `gym_api_url` auto-cleanup ensures deprecated URLs are no longer loaded into the application state.
