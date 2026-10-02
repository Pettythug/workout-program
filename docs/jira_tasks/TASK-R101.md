# TASK-R101: First-Time Device Onboarding, PIN-Protected Profile Claiming, URL Parameters & Local Guest Sandbox

## 1. Overview & Objectives
Currently, when a new device or unconfigured browser opens GymLog, the app falls back to hardcoding the primary device owner to `"Brian"`. If a family member, friend, or partner opens the link on their device, their workout actions and day counter changes can accidentally sync to and overwrite Brian's progression in Google Sheets.

The objective of this task is to implement an enterprise-grade **First-Time Device Onboarding, Multi-User PIN Authentication, and Local-Only Guest Sandbox** architecture:
1. **First-Time Welcome Modal (`WelcomeModal.jsx`)**: When opening on a fresh device/browser without a stored device owner, display a clean modal: *"Who is using this device?"* listing roster members (`Brian`, `Dad`, `Randy`, etc.), `+ Add New Person`, and `Continue as Guest`.
2. **PIN-Protected Profile Claiming**: Tapping an existing roster member prompts for their 4-digit personal PIN. Upon validation, the PIN is cached locally in `localStorage` under `gymlog_user_pins` for 0ms frictionless set logging and deletions during workouts.
3. **URL Parameter Routing (`?user=Name` / `?u=Name`)**: Supports personalized links (e.g., `?user=Dad` or `?user=Randy`) that immediately select the user and prompt for their PIN to claim that device in one tap.
4. **Local-Only Guest Sandbox**: Selecting `Continue as Guest` isolates all workout logging, sets, timers, and day progressions strictly in `localStorage` with **0 writes to Google Sheets**.
5. **Guest Completion Upgrade Modal**: Upon tapping **COMPLETE WORKOUT** in Guest Mode, display a celebration modal highlighting the full benefits of cloud backup (Cross-Device Sync, Permanent Protection, Lifetime Personal Bests, Secure PIN Access) with options to `[ CREATE PROFILE & SYNC TO CLOUD ]` or `[ STAY IN GUEST MODE ]`.
6. **Partner Workout 1-Time PIN Check-In**: When the device owner checks a partner's checkbox in an active session (e.g., `[✓ Dad]`), prompt for their 4-digit PIN once if not cached on this device, enabling frictionless partner logging.
7. **Backend PIN Verification & Registration**: Add `verifyPin` and `saveUserPin` action endpoints to `Combined_AppScript_v2.gs` to dynamically manage the `USER_PINS` script properties.
8. **Admin PIN Reset in Settings**: Allow the Master Admin PIN to reset any user's 4-digit PIN directly from the Settings modal.

---

## 2. Technical Scope of Changes

### A. Frontend Components & Context
1. **`gymlog-react/src/components/WelcomeModal.jsx` (New Component)**:
   - Renders if `!localStorage.getItem('builder_primary_user')` and not dismissed.
   - Shows roster chips for all members in `people` array.
   - Numeric PIN keypad / input prompt upon selecting a user.
   - `+ Add New Person` input (Name + 4-digit PIN).
   - `Continue as Guest` button (sets owner to `"Guest"`).
2. **`gymlog-react/src/context/AppContext.jsx`**:
   - Update `deviceOwner` initialization: If `!localStorage.getItem('builder_primary_user')`, check URL query params (`?user=...` or `?u=...`). If not present, hold in unconfigured / guest state until selected.
   - In `batchSyncSession` / `completeWorkoutBatch`: If `deviceOwner === 'Guest'`, save session history and stats locally in `localStorage` only; bypass remote network sync.
   - Add `registerNewUser(name, pin)`: Syncs to `saveUserPin` and `savePeople`, sets device owner.
   - Add `verifyUserPin(name, pin)`: Validates PIN against backend or cached script properties.
   - Add `resetUserPinWithAdmin(targetUser, newPin, adminPin)`: Validates Admin PIN and updates target user's PIN in backend.
3. **`gymlog-react/src/components/SessionStatsModal.jsx` / `PlanView.jsx`**:
   - In Guest Mode, render the cloud benefits upgrade card on workout completion.
4. **`gymlog-react/src/components/SettingsModal.jsx`**:
   - When switching `DEVICE OWNER / PRIMARY USER`, prompt for the selected user's PIN.
   - Add PIN Management section in Admin Area to allow resetting any member's PIN using the Master Admin PIN.

### B. Backend: `Combined_AppScript_v2.gs`
1. **`gymlog_handleVerifyPin(payload)`**:
   - Validates `{ person, pin }` against `USER_PINS` property (or `{ pin }` against `ADMIN_PIN`).
   - Returns `{ status: 'ok', valid: true }` or error.
2. **`gymlog_handleSaveUserPin(payload)`**:
   - Accepts `{ person, pin, adminPin }`.
   - If `adminPin` matches `ADMIN_PIN` OR user is self-registering / existing valid PIN, updates `USER_PINS` JSON map in `ScriptProperties`.
   - Automatically bumps `library_version`.

---

## 3. Acceptance Criteria
1. [ ] **First-Time Welcome Modal**: A fresh browser / cleared localStorage displays the onboarding modal without defaulting to "Brian".
2. [ ] **PIN Protection**: Claiming an existing user requires entering their correct 4-digit PIN.
3. [ ] **URL Param Support**: Navigating to `?user=Dad` automatically pre-selects Dad and opens the PIN claim prompt.
4. [ ] **Guest Sandbox Isolation**: Completing workouts in Guest Mode updates local storage without creating rows or changing day counters in Google Sheets.
5. [ ] **Guest Upgrade Flow**: Tapping "Create Profile & Sync to Cloud" registers the user, pushes their guest history to Sheets, and claims the device.
6. [ ] **Partner PIN Check-In**: Checking an active partner into a session verifies their PIN once and permits dual logging.
7. [ ] **Admin Reset**: Admin PIN can update any user's PIN in Settings.
8. [ ] **Build & Lint**: `npm.cmd run build` and `npx.cmd eslint src/` compile with 0 errors.
