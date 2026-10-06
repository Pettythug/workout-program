# GymLog React Migration Backlog & Completed Epics

This document is the official tracking backlog for the GymLog React Migration project. It records completed architectural milestones and active backlog items across the application.

---

## 📊 Summary Status
* **Core SPA Architecture**: Complete (Vite + React 18 + Context API)
* **Active Version**: v4.2 (Backend) / React SPA v1.0
* **Deployment**: GitHub Pages (`/react/` route + legacy root) via automated GitHub Actions CI/CD
* **Last Updated**: October 6, 2026

---

## ✅ Completed Epics (Historical Log)

### Epic 1: Plan View Parity & Features
- [x] **Story 1.1: Unified Card Architecture**: Ported and decoupled card layouts into standalone `ExerciseCard.jsx` and `CircuitCard.jsx` matching the polished design system. (`TASK-R86-REDUX`)
- [x] **Story 1.2: Location-Based Exercise Filtering**: Planner exercise selection and accessory generators respect active location (`24 Hour Fitness`, `Home`, `Anywhere`). (`TASK-R85`, `TASK-R91`)
- [x] **Story 1.3: Custom Exercise Swapping**: Ported swap mechanisms allowing seamless switching between variations and custom exercises. (`TASK-R91`)
- [x] **Story 1.5: Global Location State**: Lifted location roster and active location state into `AppContext.jsx`.
- [x] **Story 1.6: Location Header Select**: Dynamic location dropdown in the header filtering movements across all views.
- [x] **Story 1.7: Cross-View Settings & Help Modals**: Universal access to Settings (⚙️) and Help (❓) drawers across Plan, Lift, Full Body, and Circuit.

### Epic 2: Circuit Trainer Alignment & Polish
- [x] **Story 2.1: Circuit History Drawer & Deletion**: Inline history viewing with set deletion support and PIN authorization. (`TASK-R99`, `TASK-R100`)
- [x] **Story 2.2: Set Saving Feedback & Resolute State**: Visual saving indicators and resolute card state preventing optimistic UI desyncs.
- [x] **Story 2.3: Single/Alternate Quick Toggles**: Quick note injection and category accent tags.
- [x] **Story 2.4: Double-Logging & Sync Risk Mitigation**: Elimination of double-tap duplicate entries and false failure alerts.

### Epic 3: Multi-User Identity, PIN Authentication & Device Onboarding
- [x] **Story 3.1: First-Time Device Onboarding Modal (`WelcomeModal.jsx`)**: Displays *"Who is using this device?"* on unconfigured browsers with avatar chips, `+ Add New Person`, and `Continue as Guest`. (`TASK-R101`)
- [x] **Story 3.2: Dynamic 4-Digit PIN Security**: Profiles are PIN-protected against backend Google Apps Script `USER_PINS` Script Properties, with 0ms local caching in `gymlog_user_pins`. (`TASK-R101`)
- [x] **Story 3.3: URL Parameter Routing (`?user=Name` / `?u=Name`)**: Auto-selects the roster member and opens their PIN claim prompt in 1 tap. (`TASK-R101`)
- [x] **Story 3.4: Local-Only Guest Sandbox Mode**: Guests can perform complete workouts with 0 writes to Google Sheets, protecting live data. (`TASK-R101`, `TASK-R101-GUEST-FIX`)
- [x] **Story 3.5: Guest Cloud Upgrade Modal (`GuestUpgradeModal.jsx`)**: Upon tapping Complete Workout, guests are presented with cloud benefits to create a profile or stay local. (`TASK-R101`)
- [x] **Story 3.6: Partner 1-Time PIN Check-In & Auto-Reset**: Checking a partner into a session verifies their PIN once, then auto-resets the active roster to solo owner on workout completion. (`TASK-R101`)
- [x] **Story 3.7: Admin PIN Reset Panel in Settings**: Master Admin PIN can update or create any user's 4-digit PIN in the backend. (`TASK-R101`)

### Epic 4: Session Duration Tracking & Analytics
- [x] **Story 4.1: Automated Session Start/End Timestamps**: Zero-click timer initialization on first logged set and completion calculation. (`TASK-R85`)
- [x] **Story 4.2: Live Header Session Timer**: Subtle elapsed time pill (`⏱️ 42m`) in the top navigation bar. (`TASK-R85`)
- [x] **Story 4.3: Rep-Range Duration Partitioning & Averages (`SessionStatsModal.jsx`)**: Average completion times calculated across rep brackets (`1–3 Heavy`, `4–7 Strength`, `8–12 Hypertrophy`, `13+ Endurance`). (`TASK-R85`)
- [x] **Story 4.4: Active Session Controls**: Reset session to 0m and clear active session clock controls. (`TASK-R92`)
- [x] **Story 4.5: User-Partitioned Session Tagging**: Filter session duration averages by participant (`Solo` vs `Partner`). (`TASK-R92`)

### Epic 5: Pre-Workout Warm-Up Stepper Integration
- [x] **Story 5.1: Native Single-Card Stepper Warm-Up (`WarmUpCard.jsx`)**: Warm-up card embedded as Step 0 in Plan and Full Body views with modality presets (`500m Row`, `25 Cal Assault Bike`, `Treadmill Incline Walk`, `500m SkiErg`, `5 min Jump Rope`, `Dynamic Stretches`). (`TASK-R86-REDUX`)
- [x] **Story 5.2: Auto-Start Session Timer on Warm-Up Completion**: Completing warm-up automatically initializes the session clock. (`TASK-R86-REDUX`)
- [x] **Story 5.3: Warm-Up Full List Modal Integration & Reset Lifecycle**: Warm-up status reflected in full exercise drawer and reset on daily rollover. (`TASK-R86-REDUX`, `TASK-R92`)

### Epic 6: Data Integrity, Deletion Buffering & Sync Precision
- [x] **Story 6.1: Exact-Second Timestamp Precision**: Logged history sets and deletions record exact seconds (`M/d/yyyy, h:mm:ss a`) preventing collisions between rapid sets. (`TASK-R100`)
- [x] **Story 6.2: Deterministic Clean ISO Session IDs**: Session IDs format cleanly as `${prog}_${cleanPerson}_${YYYY-MM-DD}_day${workoutDay}` with zero slashes. (`TASK-R100`)
- [x] **Story 6.3: Index-Safe Deletion Buffering**: Set deletions use exact array index and multi-factor matching (`date` + `setNum` + `reps` + `weight` + `person`). (`TASK-R100`)
- [x] **Story 6.4: Atomic Backend Deletion in Apps Script**: Single-lock synchronization for session and history deletions. (`TASK-R100`)

---

## 🎯 Active & Upcoming Backlog

### Priority 1: Category Management Parity
- [ ] **Story 1.4: Dynamic "+ Add New Category" Form Standardize**:
  - Standardize category creation across all custom exercise and swap forms.
  - In `CircuitCard.jsx` custom swap, replace raw text input with `<select>` dropdown populated with `uniqueCategories` and `+ Add new...` prompt trigger.
  - Verify new categories persist to Google Sheets metadata via `saveExercise`.

### Priority 2: Offline-First PWA (Gym Dead-Zone Resilience)
- [ ] **Story 2.1: Service Worker & PWA Manifest**:
  - Implement service worker caching for static HTML/JS/CSS assets.
  - Add `manifest.json` for full-screen home screen installation on iOS and Android.
  - Allow app to launch, render cached exercises, and log sets offline in dead zones without network latency.

### Priority 3: Target Lock & 1RM Progression Calculator Polish
- [ ] **Story 3.1: 1RM Brzycki/Epley Calculator Polish**:
  - Standardize estimated 1-Rep Max calculations across `useTargetLock.js`.
  - Ensure rep bracket target suggestions reflect personal records consistently across standalone variations (`(Single)`, `(Alt)`).

### Priority 4: Advanced Analytics Drawer
- [ ] **Story 4.1: Lifetime Volume & Progress Visualizations**:
  - Expand `SessionStatsModal.jsx` into an interactive analytics dashboard.
  - Add weekly workout frequency charts, muscle group volume distribution, and personal best tracking badges.
