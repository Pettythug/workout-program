# Audit Log: TASK-R53

## Implemented Stored User PIN Reset and Invalid PIN Auto-Clear

1. **`gymlog-react/src/context/AppContext.jsx`**:
   - Wrapped `logSet` in a try/catch block.
   - Clears `gymlog_pin_<name>` from `localStorage` for all active people if the server throws an error containing "invalid pin" during set logs.

2. **`gymlog-react/src/components/SettingsModal.jsx`**:
   - Replaced the single "RESET TODAY'S CHECKMARKS" button with a flex container containing a "RESET CHECKMARKS" button and a new "🔑 CLEAR CACHED PINS" button.
   - The "CLEAR CACHED PINS" button prompts for confirmation and then removes all `localStorage` keys starting with `gymlog_pin_`.
