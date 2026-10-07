# [COMPLETED] Task 002: Fix Exercise Card Button Alignment

**Recommended Model:** Gemini 3.5 Flash (Low or Medium)

## Problem Description
The "Swap Exercise" and "Image" buttons on the `ExerciseCard` are currently misaligned on narrow mobile viewports (specifically noted on Android devices with smaller screens). The image button sits slightly outside the exercise card border. The buttons line up perfectly on larger screens (like iPhone and desktop web), so this is strictly an overflow/wrapping issue on small viewports.

## Instructions for Developer
1. Open the `gymlog-react/src/components/ExerciseCard.jsx` file and/or `gymlog-react/src/index.css`.
2. Locate the container holding the "Swap Exercise" and "Image" action buttons.
3. Apply the necessary CSS/Flexbox fixes (e.g., `flex-wrap: wrap`, `flex-shrink`, or `@media (max-width: 400px)` rules) so that these buttons shrink or wrap gracefully on very narrow screens without overflowing the card's boundaries.
4. Provide an Audit Submission detailing exactly what CSS classes or inline styles were changed and a clean build output.

## Audit Requirements
- Show the exact `diff` or replacement text.
- Run `npm run build` to prove no syntax errors were introduced.
