# task_010: Secure Backend PIN Validation (Corrected Scope)
- **Required Model Tier**: Gemini 3.5 High / Claude Sonnet

## Objective:
Eliminate all hardcoded plaintext `"5050"` PIN references from source code across all three layers of the application stack: React components, the API hook, and the Google Apps Script backend.

## Pre-Flight Research Findings:
- `verifyAdminPin(payload)` already exists in `Combined_AppScript_v2.gs` (line 563) and already blocks unauthorized requests server-side. The backend gate is functional.
- `useGymAPI.js` contains 5 hardcoded `pin: "5050"` static references (lines 112, 140, 169, 183, 196).
- `Combined_AppScript_v2.gs` line 29 declares `const ADMIN_PIN = "5050"` as a hardcoded constant in source code.
- `SettingsModal.jsx`, `CircuitView.jsx`, `PlanView.jsx` contain the `hashPin` SHA-256 helper function and local hash comparison added in TASK-012, which is now redundant given the backend gate.

## Changes Required:

### 1. `gymlog-react/src/hooks/useGymAPI.js`
- Remove `pin: "5050"` from `logSet()` — logSet is not an admin-protected action and should not carry a PIN.
- Remove `pin: "5050"` from `saveExercise()` — this is an admin action; the caller (SettingsModal) must pass the user-entered PIN as a parameter instead.
- Remove `pin: "5050"` from `deleteExercise()` — the caller must pass the user-entered PIN as a parameter.
- Remove `pin: "5050"` from `saveSettings()` and `saveExerciseNote()` — evaluate whether these need PIN protection. If yes, caller must pass PIN. If no, remove from backend handler too.
- The `deleteHistory(entry, pin)` signature already correctly accepts a dynamic PIN — no change needed.

### 2. `gymlog-react/src/components/SettingsModal.jsx`
- Remove the `hashPin` async helper function (lines ~3-10).
- Remove the local hash comparison: `const hashed = await hashPin(pin); if (hashed !== "f71bcbe5...")`.
- Update `handleDeleteExercise` to pass the raw user-entered `pin` string directly to `deleteExercise(name, pin)` via `useGymAPI`.

### 3. `gymlog-react/src/components/CircuitView.jsx`
- Remove the `hashPin` async helper function.
- Remove the local hash comparisons in `handleDeleteSet` and `handleDeleteHistoryEntry`.
- Pass the raw user-entered `pin` directly to `deleteHistory(entry, pin)`.

### 4. `gymlog-react/src/components/PlanView.jsx`
- Remove the `hashPin` async helper function.
- Remove the local hash comparison in `handleDeleteHistoryEntry`.
- Pass the raw user-entered `pin` directly to `deleteHistory(entry, pin)`.

### 5. `Combined_AppScript_v2.gs`
- Replace `const ADMIN_PIN = "5050";` (line 29) with:
  `const ADMIN_PIN = PropertiesService.getScriptProperties().getProperty('ADMIN_PIN') || '5050';`
- This reads the PIN from Google Apps Script Script Properties (server-side environment variable) at runtime. The `|| '5050'` fallback ensures the app does not break if the Script Property has not been set yet.
- Add a comment above explaining that the ADMIN_PIN Script Property must be set in the Apps Script project settings to complete the security hardening.

## Verification:
1. Run `npm run build` in `gymlog-react/` and verify zero compilation errors.
2. Commit all changed files on the active branch with message: `feat(security): remove hardcoded PIN from all layers, read from Script Properties`
3. Output a detailed Audit Log.

## IMPORTANT — Out of Scope:
- Do NOT modify any Google Sheets schema or spreadsheet data.
- Do NOT modify `Combined_AppScript_v2.gs` except for line 29 only.
- Do NOT modify any file outside of `/gymlog-react/src/` and `Combined_AppScript_v2.gs`.
