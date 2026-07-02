# Audit Log R23: Simplify Circuit State

- **Files Modified:** `CircuitCard.jsx`, `CircuitView.jsx`
- **Objective:** Removed local `sets` caching from `completedMap` inside `localStorage`.
- **Changes:**
  1. `CircuitCard.jsx` now derives `sets` dynamically using a `useMemo` block that filters and groups `ex.history` for today's entries.
  2. `CircuitView.jsx` removed all array manipulation for `sets` when handling statuses (`handleLogSet`, `handleExplicitDone`, `handleSkip`, `handleUndo`). The status map now only tracks string statuses (e.g. `active`, `done`, `skipped`).
  3. Deletion logic in both files was refactored to pass around the actual `history` entry objects instead of indexes, removing the need to reconcile local state arrays after a deletion.
- **Verification:** Ran `npm run build` to ensure no syntax errors.
