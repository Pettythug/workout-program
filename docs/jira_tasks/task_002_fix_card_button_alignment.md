# Task 002: Fix Exercise Card Button Alignment

**Recommended Model:** Gemini 3.5 Flash (Low or Medium)

## Problem Description
The "Swap Exercise" and "Image" buttons on the `ExerciseCard` are currently misaligned on mobile viewports. The image button sits slightly outside the exercise card border. 

## Instructions for Developer
1. Open the `gymlog-react/src/components/ExerciseCard.jsx` file and/or `gymlog-react/src/index.css`.
2. Locate the container holding the "Swap Exercise" and "Image" action buttons.
3. Apply the necessary CSS/Flexbox fixes (e.g., margins, padding, gap, overflow containment) so that these buttons are neatly contained and properly aligned within the card's boundaries.
4. Provide an Audit Submission detailing exactly what CSS classes or inline styles were changed and a clean build output.

## Audit Requirements
- Show the exact `diff` or replacement text.
- Run `npm run build` to prove no syntax errors were introduced.
