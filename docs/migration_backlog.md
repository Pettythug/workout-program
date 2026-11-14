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

### Epic 7: Session History, Duration Analytics & Zero-Rep Logging
- [x] **Story 7.1: Rep-Range History Drilldown (`SessionStatsModal.jsx`)**: Added interactive drilldown view showing past completed sessions per rep range (`1-3`, `4-7`, `8-12`, `13+`) with duration pills and direct workout-launching. (`TASK-R116`)
- [x] **Story 7.2: Program & Device Owner Data Isolation (`SessionStatsModal.jsx`)**: Scoped session statistics and historical session lists to the active program and active device owner. (`TASK-R119`)
- [x] **Story 7.3: 0-Rep / 0-Sec Attempt Logging & PB Exclusion**: Full support for logging failed attempts (0 reps / 0 secs) with active day target range tagging, rest timer triggers, and strict exclusion from Personal Bests across frontend and backend. (`TASK-R117`)
- [x] **Story 7.4: Pure Plain-Text Rep Range Storage**: Formatted Column E in Google Sheets to Plain Text, eliminated temporary date-cleaning translation helpers, and enforced leading apostrophe on writes. (`TASK-R117`)
- [x] **Story 7.5: Mobile Scrolling & Compact 4-Session Default with View All Toggle (SessionStatsModal.jsx)**: Enabled -webkit-overflow-scrolling: touch, eliminated nested scroll traps/squishing, and implemented compact 4-session default view with VIEW ALL / SHOW LESS toggle. (TASK-R120)
- [x] **Story 7.6: Expandable Exercise History, 9-Set Default & Rep Range Filter Pills (`ExerciseCard.jsx`, `CircuitCard.jsx`)**: Added interactive rep range filter pills (`ALL | 1-3 | 4-7 | 8-12 | 13+`), 9-set default display, and progressive disclosure toggle (`VIEW ALL / SHOW LESS`) inside a 360px scrollable container with safe set deletion. (`TASK-R118`)

### Epic 8: Architectural Audit Remediation & Stability Roadmap
- [x] **Story 8.1 (TASK-R121): Centralized Workout Completion, Undo Timer Restoration, Warm-Up State & Instant PB Recalculation**:
  - Centralized `completeWorkoutSession` and `undoWorkoutSession` in `AppContext.jsx` across `PlanView`, `FullBodyView`, and `CircuitView`.
  - Locked in `completedSummary` synchronously (0ms) and restored `sessionStartTime` and `warmUpStatus` on Undo so the user's workout clock resumes ticking and bypasses the warm-up stepper.
  - Enforced deterministic session IDs (`${displayProgram}_${cleanPerson}_${isoDate}_day${activeDay}`) to prevent duplicate rows in Google Sheets and added in-flight deletion protection.
  - Recalculated `ex.best` immediately in memory on set deletion with normalized rep range keys (`r1_3`, `r4_7`, `r8_12`, `r13_plus`).
- [x] **Story 8.2 (TASK-R122): Offline 'Dead-Zone' Workout Sync Queue Flush & Auto-Retry Lifecycle**:
  - Implemented `flushPendingSyncQueue()` in `AppContext.jsx` to sequentially replay queued workouts and deletions.
  - Added 3-second reconnect buffer, screen unlock / focus trigger, and 45-second retry interval with zero-network idle safety.
  - Integrated offline undo queue purging and deletion queue buffering to eliminate phantom or duplicate rows.
- [x] **Story 8.3 (`TASK-R123`): Fix Broken "Delete Exercise" & Remaining `action: "exec"` API Calls**:
  - Updated `deleteExercise`, `saveSettings`, and `saveExerciseNote` in `useGymAPI.js` from unsupported `{ action: "exec" }` payloads to direct backend actions matching `Combined_AppScript_v2.gs`.
  - Verified `exercise: name` parameter alignment for `gymlog_handleDeleteExercise` and updated JSDoc comments.

### Epic 9: User-Requested Upgrades (Batch 2)
- [x] **Story 9.1 (`TASK-R129`): Fix "Got More in the Tank?" Silent Drops, Auto-Expand & Custom Swap Local Sync**:
  - Added shared `resolveAccessoryItem()` in `AppContext.jsx` and stale cache pruning in `PlanView.jsx` & `FullBodyView.jsx` so `(Single)`/`(Alt)`/`(DB)`/`(Cable)` accessories render immediately instead of disappearing.
  - Updated `AccessoryBlock.jsx` & `ExerciseCard.jsx` (`defaultOpen`) to deterministically filter unused candidates and auto-open newly added/rerolled Bonus cards on first click.
  - Added `addExerciseToLocalState()` in `AppContext.jsx` so custom Swap exercises saved via `ExerciseCard.jsx` or `CircuitView.jsx` enter local `exercises` state immediately.
- [x] **Story 9.2 (`TASK-R130`): Expandable Full-Screen Rest/Stopwatch Timer & Gym Alert Audio**:
  - Created `FullScreenTimerModal.jsx` (Wake Lock, huge digits, `PAUSE/START`, `+30S` for Countdown, `RESET` for Stopwatch, `✕`/backdrop close, 2s `"REST COMPLETE!"` flash + auto-return) and shared `TimerWidget.jsx` across `Plan`, `Full Body`, and `Circuit`.
  - Added singleton `audioCtxRef`, user-gesture `unlockAudio()`, whole-second interval guard, selectable Web Audio presets (`gym-chime`, `boxing-bell`, `urgent-alarm`, `soft-beep`, `silent`), `TEST` button, and vibration toggle in `SettingsModal.jsx`.
- [x] **Story 9.3 (`TASK-R131`): Equipment/Grip Variation Generator, Un-Collapsed Rotation & Logger Band Toggle**:
  - Un-collapsed variations in `PlanView.jsx`, `FullBodyView.jsx`, `LiftView.jsx`, and `AccessoryBlock.jsx` (keeping zero switcher pills on `ExerciseCard.jsx`) so every variation rotates independently with its own Personal Best.
  - Added `exerciseVariations.js` and shared `VariationGeneratorPanel.jsx` powering `SettingsModal.jsx` and `ExerciseCard.jsx` (`⚙️ EDIT`) with Equipment (`Barbell`, `Dumbbell`, `Band`, `Cable`), Execution (`Singles`, `Alternating`), and Grip (`Overhand`, `Underhand`) combinations + interactive Live Preview, explicit `×` family removal, and hook ordering fixes.
  - Added `[ ] Band (Assist / Tension)` logging toggle (`ExerciseCard.jsx`, `CircuitCard.jsx`), `[Band]` note tagging (`AppContext.jsx`), and unassisted PB protection across live logs and sheet reloads (`dataMerge.js`).
- [x] **Story 9.4 (`TASK-R132`): Add Neutral Grip to Variation Generator & Name Parser**:
  - Added `'neutral'` token, initial option, and combinator registration in `exerciseVariations.js`.
  - Added `{ key: 'neutral', label: 'Neutral' }` to `VariationGeneratorPanel.jsx` under the Grip option group, enabling Neutral grip in both `Settings -> CREATE EXERCISE` and `ExerciseCard -> ⚙️ EDIT`.
- [x] **Story 9.5 (`TASK-R133`): Pre-Workout Warm-Up "▶ START WORKOUT" Button & Active Timer Alignment**:
  - Added `▶ START WORKOUT` button to `WarmUpCard.jsx` when session has not yet started, initializing `startSession()` immediately upon entering gym.
  - Added live `⏱ Workout Started • Active Warm-Up` banner with accidental `Reset` option while warming up, transitioning primary button to `✓ WARM-UP DONE` and preserving warm-up minutes in final workout duration.
  - Aligned `handleSkip()` to ensure `startSession()` is initialized if warm-up is skipped.
- [x] **Story 9.6 (`TASK-R134`): Add Variation Generator to Custom Swap Drawer (`ExerciseCard` & `CircuitCard`)**:
  - Integrated `VariationGeneratorPanel` directly into the `-- New Custom Exercise --` swap drawer on `ExerciseCard.jsx` and `CircuitCard.jsx`.
  - Added full Equipment, Execution, and Grip combination support with live preview when creating a custom exercise mid-workout.
  - Wired `executeSwap()` to batch-create and register all selected variations via `createExerciseMeta()` on the backend/local state and immediately swap the primary variation into the active card slot.

---

## 🎯 Active & Upcoming Backlog

### Priority 1: Architectural Audit Remediation & Stability Roadmap (Epic 8)
- [x] **Story 8.4 (`TASK-R124`): Preserve Multiple Identical Sets During Cloud Sync (`setNum` Deduplication)**:
  - Enhanced duplicate detection in `gymlog-react/src/context/dataMerge.js` to compare `setNum` and exact timestamp match alongside person, reps, and weight, ensuring multiple identical straight sets are preserved in local history without collapsing.
- [ ] **Story 8.5 (`TASK-R125`): Rest Timer Context Isolation (Typing Lag Reduction)**:
  - *(Audio leak + whole-second interval guard completed in `TASK-R130`.)* Remaining scope: isolate live `timerSeconds` state into a separate TimerContext so active timer ticks do not re-render heavy `ExerciseCard` trees during input.
- [x] **Story 8.6 (`TASK-R126`): Accidental Set Deletion Confirmation Guard**:
  - Added `window.confirm` dialog before deleting history entries in `ExerciseCard.jsx` and `CircuitCard.jsx` displaying reps/seconds, weight, and date to prevent accidental permanent deletion.
- [ ] **Story 8.7 (`TASK-R127`): PIN Security Upgrade (Move PINs Out of URLs & Enforce Backend PIN Check)**:
  - Send `verifyPin`, `claimProfilePin`, and `adminResetPin` via `sheetsPost` body instead of `GET` URL query strings, and include PIN verification on batch history deletions.
- [ ] **Story 8.8 (`TASK-R128`): Compress 470 MB Exercise Images (`public/images/`)**:
  - Optimize the 131 uncompressed camera photos in `gymlog-react/public/images/` (reducing size from 470 MB to <25 MB) and add `loading="lazy"` to eliminate ~1 GB Vercel deployment bloat.

### Priority 2: User-Requested Upgrades (Batch 2 — Deferred / Follow-Ups)
- *(Deferred / Discussion Only: Deterministic Cycle Shuffle for `Plan` & `Full Body` rotation — held on user request until requested later.)*

### Priority 3: Category Management Parity
- [ ] **Story 1.4: Dynamic "+ Add New Category" Form Standardize**:
  - Standardize category creation across all custom exercise and swap forms.
  - In `CircuitCard.jsx` custom swap, replace raw text input with `<select>` dropdown populated with `uniqueCategories` and `+ Add new...` prompt trigger.
  - Verify new categories persist to Google Sheets metadata via `saveExercise`.

### Priority 4: Offline-First PWA (Gym Dead-Zone Resilience)
- [ ] **Story 2.1: Service Worker & PWA Manifest**:
  - Implement service worker caching for static HTML/JS/CSS assets.
  - Add `manifest.json` for full-screen home screen installation on iOS and Android.
  - Allow app to launch, render cached exercises, and log sets offline in dead zones without network latency.

### Priority 5: Target Lock & 1RM Progression Calculator Polish
- [ ] **Story 3.1: 1RM Brzycki/Epley Calculator Polish**:
  - Standardize estimated 1-Rep Max calculations across `useTargetLock.js`.
  - Ensure rep bracket target suggestions reflect personal records consistently across standalone variations (`(Single)`, `(Alt)`).

### Priority 6: Advanced Analytics Drawer
- [ ] **Story 4.1: Lifetime Volume & Progress Visualizations**:
  - Expand `SessionStatsModal.jsx` into an interactive analytics dashboard.
  - Add weekly workout frequency charts, muscle group volume distribution, and personal best tracking badges.
