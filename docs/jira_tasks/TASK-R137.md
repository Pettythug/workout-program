# TASK-R137: Comprehensive End-to-End System, Memory & Edge-Case Audit

- **Target Role:** `Manager_Auditor` & `Sandbox_Developer`
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash (High)`) or `HIGH_TIER` (`Gemini 3.8 Pro`)
- **Status:** `IN_PROGRESS`
- **Target Branch:** `feat/TASK-R137-system-health-and-edge-case-audit`

---

## 🎯 Executive Objective
Execute an exhaustive, zero-stone-unturned system audit across the entire GymLog application. The goal is to uncover, document, and triage any latent race conditions, uncleaned browser resources, unhandled edge cases, storage corruptions, or mobile viewport quirks before they impact live gym sessions.

---

## 🔍 Audit Domains & Inspection Matrix

### Domain 1: Lifecycle, Memory & Hardware Resource Leaks
- [ ] **Event Listener Cleanups:** Audit all `useEffect` hooks across components and context providers (`AppContext.jsx`, `FullScreenTimerModal.jsx`, `StickyRestBanner.jsx`, `WarmUpCard.jsx`, `ExerciseCard.jsx`, `CircuitCard.jsx`) to verify every `addEventListener` (`online`, `offline`, `visibilitychange`, `focus`, `resize`, `keydown`) has an exact matching `removeEventListener` in its cleanup return.
- [ ] **Timers & Intervals:** Check all `setInterval` and `setTimeout` calls for dangling instances during component unmounts.
- [ ] **Web Audio & Hardware APIs:** Verify `AudioContext` lifecycle (singleton state, suspension, user-gesture unlock, closed states) and `navigator.vibrate` / Wake Lock API guards on mobile browsers.

### Domain 2: State Hydration, Storage & Concurrency
- [ ] **`localStorage` Parsing Safety:** Audit every single `localStorage.getItem` call in the application to ensure every `JSON.parse` is wrapped in safe `try/catch` fallbacks to prevent white-screen crashes if corrupted data exists.
- [ ] **Key Namespace Audit:** Ensure consistent naming and isolation across all `gymlog_*` storage keys.
- [ ] **Race Conditions & Re-entrancy:** Inspect state transitions during fast-paced workouts (swapping exercises, logging rapid sets, completing workouts, and offline queue flush concurrency).

### Domain 3: Data Integrity, Math & Input Validation
- [ ] **Number Sanitization & Extreme Values:** Verify handling of non-numeric characters, decimal weights (e.g. `82.5`), negative numbers, zero reps/seconds, and empty inputs.
- [ ] **Personal Best Recalculation:** Audit in-memory recalculation in `AppContext.jsx` and `dataMerge.js` to ensure 0-rep attempts, bodyweight sets, and assisted band sets never corrupt pure rep-range PRs.
- [ ] **Variation Name Collisions:** Verify `buildVariationNames` and modifier stripping to ensure custom names never collide or cause infinite loops in rotation lookups.
- [ ] **Guest Mode Data Isolation:** Verify that guest sessions never leak into cloud payloads or Google Sheets.

### Domain 4: Mobile UI/UX, Viewport & Touch Traps
- [ ] **Modal Layering & z-index Stacking:** Audit z-index across `WelcomeModal`, `ImageModal`, `SettingsModal`, `SessionStatsModal`, `GuestUpgradeModal`, `FullScreenTimerModal`, and Toast notifications to prevent invisible backdrops or click traps.
- [ ] **iOS Safari Viewport Resilience:** Check scroll trapping, touch targets (minimum 44x44px for thumb tap), and `100vh` vs `100dvh` layout shifts on mobile browsers.
- [ ] **Form Inputs & Keyboards:** Ensure numeric inputs trigger mobile numeric keyboards (`inputMode="decimal"` / `type="number"`) without unwanted auto-correct or zoom on focus.

### Domain 5: Network, API & Backend Resilience
- [ ] **Error Catching & User Feedback:** Ensure network dropouts, CORS issues, or Google Sheets rate limits provide meaningful, non-crashing user toasts.
- [ ] **Payload Size Safeguards:** Audit URL query length threshold in `useGymAPI.js` to ensure payloads never exceed browser URL limits.

---

## 📋 Deliverable Output
A complete, structured **System Audit Report Artifact** detailing:
1. Executive Health Score
2. Critical / High / Medium / Low findings
3. Remediation roadmap for any identified defects
