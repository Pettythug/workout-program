# [COMPLETED] Task 005: Fix Circuit Card Button Alignment

**Recommended Model:** Gemini 3.5 Flash (Low or Medium)

## Problem Description
The "Swap Exercise" and "Image" buttons on the `CircuitCard` are currently misaligned on narrow mobile viewports, overflowing the orange card border. This is identical to the issue recently resolved for `ExerciseCard`.

## Instructions for Developer
1. Open the `gymlog-react/src/components/CircuitCard.jsx` file.
2. Locate the container holding the "Swap Exercise" and "Image" action buttons (around line 301).
3. Apply the necessary CSS/Flexbox fixes to match the styling of `ExerciseCard.jsx`:
   - Add `flexWrap: 'wrap'` to the outer `div` container holding the buttons.
   - Update the inline styles of both the "Swap Exercise" and "Image" buttons:
     - Set `minWidth` to `'75px'`.
     - Set `fontSize` to `11`.
     - Set `padding` to `12` (as inline style, not padding shorthand unless matching).
4. Run `npm run build` to prove no syntax errors were introduced.

## Audit Requirements
- Show the exact `diff` or replacement text.
- Run `npm run build` to prove no syntax errors were introduced.
