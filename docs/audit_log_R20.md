# Audit Log: TASK-R20

## Task
Separate IMAGE Button from SWAP Guard in ExerciseCard

## Date
2026-07-02

## File Modified
- `gymlog-react/src/components/ExerciseCard.jsx`

## Changes Made

### ExerciseCard.jsx (lines ~722-737)
**Before:** The 📸 IMAGE button was nested inside a `{group.originalBaseKey && (...)}` conditional block alongside the 🔄 SWAP button. Since `originalBaseKey` is only set in Plan view, the IMAGE button was completely missing in Lift view.

**After:** Restructured into two separate blocks:
1. **Block A (SWAP — Plan-only):** The 🔄 SWAP button and its `swapMode` logic remain inside the `originalBaseKey` guard since swapping is Plan-only functionality.
2. **Block B (IMAGE — always visible):** The 📸 IMAGE button is now rendered unconditionally after the SWAP guard block. Uses conditional `marginTop` (`0` when SWAP block is present, `16` otherwise) to maintain proper spacing in both views.

## Verification
- `npm run build` — pending
