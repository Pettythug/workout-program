# TASK-QA-R101: Pre-Merge QA Test Specification

## 1. Overview & Verification Scope
This QA document details the pre-merge test matrix for **`TASK-R101`** (First-Time Device Onboarding, Multi-User PIN Authentication, URL Parameter Routing & Local Guest Sandbox).

---

## 2. Test Matrix & Verification Steps

### Test Case 1: First-Time Device Onboarding Modal (`WelcomeModal.jsx`)
1. In browser DevTools, clear primary user:
   ```javascript
   localStorage.removeItem('builder_primary_user');
   localStorage.removeItem('gymlog_active_guest_session');
   ```
2. Reload page on `http://localhost:5173/workout-program/react/`.
3. **Result**: PASS
   - `WelcomeModal` renders immediately asking *"Who is using this device?"*.
   - Roster members (Brian, Dad, etc.) display with initials avatars.
   - `+ Add New Person` and `Continue as Guest` buttons are visible.
   - Background app is non-interactive until a profile or guest mode is chosen.

### Test Case 2: PIN-Protected Profile Claiming
1. In `WelcomeModal`, tap a roster member (e.g. **Brian** or **Dad**).
2. Enter correct 4-digit PIN.
3. **Result**: PASS
   - Validates successfully.
   - Caches PIN in `localStorage` under `gymlog_user_pins`.
   - Sets `builder_primary_user` to the claimed user.
   - Closes modal and opens the main workout tracker for that user.

### Test Case 3: URL Parameter Routing (`?user=Name` / `?u=Name`)
1. In browser URL bar, navigate to `http://localhost:5173/workout-program/react/?user=Dad`.
2. **Result**: PASS
   - App automatically detects `user=Dad`.
   - Opens `WelcomeModal` with **Dad** pre-selected and prompts for Dad's 4-digit PIN.
   - Entering PIN sets Dad as device owner in 1 tap.

### Test Case 4: Local-Only Guest Sandbox Mode & Cloud Upgrade Modal
1. In `WelcomeModal`, tap **Continue as Guest**.
2. **Result**: PASS
   - App header displays `Guest` as the active user.
   - Logging workout sets functions smoothly with 0 PIN prompts.
   - Day counter changes save strictly to `gymlog_workout_day_Guest` in `localStorage`.
   - **0 network requests** are sent to Google Sheets for sessions, day progress, or set history.
3. Tap **COMPLETE WORKOUT** in PlanView / CircuitView / FullBodyView.
4. **Result**: PASS
   - `GuestUpgradeModal` pops up displaying the 4 core cloud benefits (Cross-Device Sync, Permanent Cloud Backup, Lifetime Personal Bests, Secure PIN Access).
   - Tapping `[ STAY IN GUEST MODE ]` finalizes the workout locally in `localStorage` without touching Google Sheets.
   - Tapping `[ CREATE PROFILE & SYNC TO CLOUD ]` prompts for a new Name + 4-digit PIN, registers user on backend, and pushes guest history.

### Test Case 5: Partner Workout 1-Time PIN Check-In
1. As device owner (e.g. Brian), check a partner's checkbox (e.g. `[✓ Dad]`).
2. **Result**: PASS
   - If Dad's PIN is not cached on this device, prompts for Dad's 4-digit PIN.
   - Once verified, caches Dad's PIN and activates Dad for dual set logging during the session.

### Test Case 6: Admin PIN Reset in SettingsModal
1. Open **Settings** (⚙).
2. Scroll to Admin Area and enter Master Admin PIN.
3. **Result**: PASS
   - Collapsible `🔐 ADMIN PIN RESET` section appears.
   - Selecting a target user and entering a new 4-digit PIN updates the user's PIN in backend Script Properties via `saveUserPin`.

---

## 3. Automated Code & Build Verification
1. `npm.cmd run build` inside `gymlog-react/`: **PASS (0 errors)**.
2. `npx.cmd eslint src/` inside `gymlog-react/`: **PASS (0 errors, 4 pre-existing warnings in unrelated views)**.

---

## 4. Sign-Off
- [x] Pre-Merge QA Sign-Off: `QA_PREMERGE_PASS: TASK-R101`
- [x] Product Owner Sign-Off: Complete & Verified
