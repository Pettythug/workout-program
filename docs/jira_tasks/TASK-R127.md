# TASK-R127: PIN Security Upgrade (Move PINs Out of URLs & Enforce Backend PIN Check)

- **Target Role:** `Sandbox_Developer`
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash`, `Claude Sonnet 4.6 (Thinking)`, `Gemini 3.5 Flash (High)`) or `HIGH_TIER`
- **Model Gatekeeper Check:** Verify your active model is in the Authorized Model Tier above before executing any file edits. If misaligned, halt and output the `Model Alignment Error` override.

## Overview
1. **Plaintext PINs in HTTP `GET` URLs (`useGymAPI.js`):**
   - Currently, `verifyUserPinOnServer`, `claimUserPinOnServer`, and `adminResetUserPinOnServer` in `useGymAPI.js` call `sheetsGet({ action: "...", pin, adminPin, newPin })`, which serializes the 4-digit User PIN and Master Admin PIN directly into the URL query string (`?payload=%7B%22adminPin%22...`).
   - Query parameters are recorded in browser history, proxy logs, and network telemetry. Moving these calls to `sheetsPost` places the credentials inside the HTTPS-encrypted request body.
2. **Backend PIN Verification on `batchDeleteHistory` (`Combined_AppScript_v2.gs`):**
   - While single `deleteHistory` checks `verifyPinFromRequest_`, `batchDeleteHistory` in `Combined_AppScript_v2.gs` currently deletes rows without verifying the requester's PIN.

---

## Technical Specifications & Requirements

### 1. Route PIN Operations via `sheetsPost` (`useGymAPI.js`)
1. In `gymlog-react/src/hooks/useGymAPI.js`, change `verifyUserPinOnServer`, `claimUserPinOnServer`, and `adminResetUserPinOnServer` from `sheetsGet(...)` to `sheetsPost(...)` (since `Combined_AppScript_v2.gs` already routes `verifyPin`, `claimProfilePin`, and `adminResetPin` in `doPost` via `handleRequest`).

### 2. Pass User PIN in `batchDeleteHistory` (`AppContext.jsx` & `Combined_AppScript_v2.gs`)
1. Ensure `flushDeletions` in `AppContext.jsx` includes `pin: getPinForUser(deviceOwner)` on the `batchDeleteHistory` payload, and verify the PIN in `Combined_AppScript_v2.gs`.

---

## Target Files
- `gymlog-react/src/hooks/useGymAPI.js`
- `gymlog-react/src/context/AppContext.jsx`

---

## Submission Protocol for Developer
1. Execute all edits strictly within `gymlog-react/src/*`.
2. Verify production build with `cmd /c npm run build`.
3. Respond in chat with strictly the 4-line XML snippet below:
```xml
<TASK_HANDOFF>
  <TASK_ID>TASK-R127</TASK_ID>
  <ROLE>Sandbox_Developer</ROLE>
  <STATUS>DEVELOPMENT_TASK_COMPLETE</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</TASK_HANDOFF>
```
