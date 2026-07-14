# Audit Log — TASK-R65: Extract StickyRestBanner into a Shared Component

**Branch:** TASK-R65  
**Date:** 2026-07-14  
**Role:** Sandbox_Developer  

---

## Objective

Extract the duplicated sticky rest timer banner JSX from `PlanView.jsx` and `CircuitView.jsx` into a single reusable `StickyRestBanner.jsx` component, eliminating code duplication and centralising the scroll-listener logic.

---

## Files Changed

### [NEW] `gymlog-react/src/components/StickyRestBanner.jsx`
- Created new shared component that:
  - Consumes `timerIsRunning`, `timerIsCountdown`, `timerSeconds`, `formatTimerTime`, `toggleTimer`, `resetTimer`, and `startRestTimer` directly from `useAppContext()` — **no props required**.
  - Owns the `showStickyTimer` state and the `window.scroll` event listener (threshold: `scrollY > 220`) with proper cleanup on unmount.
  - Returns `null` when `!showStickyTimer || !timerIsRunning || !timerIsCountdown || timerSeconds <= 0`.
  - Renders the glassmorphism fixed banner with the PAUSE/START, +30S, and SKIP buttons.

### [MODIFY] `gymlog-react/src/components/PlanView.jsx`
- Added `import StickyRestBanner from './StickyRestBanner';`
- Removed `const [showStickyTimer, setShowStickyTimer] = useState(false);`
- Removed the 9-line `useEffect` scroll listener block.
- Replaced the 44-line inline banner JSX conditional block with `<StickyRestBanner />`.

### [MODIFY] `gymlog-react/src/components/CircuitView.jsx`
- Added `import StickyRestBanner from './StickyRestBanner';`
- Removed `const [showStickyTimer, setShowStickyTimer] = useState(false);`
- Removed the 9-line `useEffect` scroll listener block.
- Replaced the 44-line inline banner JSX conditional block with `<StickyRestBanner />`.

---

## Lines Removed (Duplication Eliminated)

| File | Lines Removed |
|---|---|
| `PlanView.jsx` | ~53 (state + effect + 44-line JSX block) |
| `CircuitView.jsx` | ~53 (state + effect + 44-line JSX block) |
| **Total** | **~106 lines deleted** |

---

## Verification

- `npm run build` executed inside `gymlog-react`.
- **Result: ✓ built in 2.10s** — 40 modules transformed, zero errors or warnings.

---

## Git Commit

```
git add gymlog-react/src/components/StickyRestBanner.jsx \
        gymlog-react/src/components/PlanView.jsx \
        gymlog-react/src/components/CircuitView.jsx
git commit -m "refactor(R65): extract StickyRestBanner into shared component"
```
