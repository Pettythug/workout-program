# Audit Log: TASK-R76 — Fix Circuit Completion Flow and Add Diagnostics

**Branch:** `TASK-R76`
**File Modified:** `gymlog-react/src/components/CircuitView.jsx`
**Build Status:** ✅ Clean (`vite build` — 40 modules, 0 errors, 0 warnings)

---

## Changes Made

### 1. `endCircuit` — Added `force` Parameter

**Before:**
```js
const endCircuit = () => {
    if (window.confirm("Are you sure you want to end the current circuit?")) {
        updateCircuitState([], {});
        setView('planner');
    }
};
```

**After:**
```js
const endCircuit = (force = false) => {
    if (force || window.confirm("Are you sure you want to end the current circuit?")) {
        updateCircuitState([], {});
        setView('planner');
    }
};
```

**Rationale:** When the circuit is fully completed, clicking "Finish" on the completion screen was unnecessarily prompting a confirm dialog. Passing `force = true` short-circuits the dialog. The mid-workout "End Circuit" button retains `endCircuit()` (defaults `force = false`), preserving the accidental-exit guard.

---

### 2. Completion Screen "Finish" Button — Updated Call Site

**Before:**
```jsx
<button className="btn-success" onClick={endCircuit} ...>Finish</button>
```

**After:**
```jsx
<button className="btn-success" onClick={() => endCircuit(true)} ...>Finish</button>
```

**Rationale:** The completion screen is only shown when all exercises are done/skipped. No confirmation needed — the user explicitly chose to finish.

---

### 3. `startFullBodyCircuit` — Added Console Diagnostics

```js
console.log("[Circuit Diagnostics] Grouped machines:", grouped);
```

Added immediately after the `grouped` object is built, before circuit generation. Logs the full category→exercise mapping to the browser console (F12) so the user can audit available machines per category.

---

### 4. `startMimicCircuit` — Added Console Diagnostics

```js
console.log("[Circuit Diagnostics] Grouped machines:", grouped);
```

Same as above but in the Mimic Circuit flow. Full catalog is logged before any category filtering, giving a complete view of what's available.

---

## Call Site Summary

| Button | Call | Dialog Shown? |
|---|---|---|
| Completion screen "Finish" | `endCircuit(true)` | ❌ No — immediate return to planner |
| Mid-workout "End Circuit" | `endCircuit()` → `endCircuit(false)` | ✅ Yes — confirm prompt shown |
