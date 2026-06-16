# Task 003: Fix Circuit Generator Filtering

**Recommended Model:** Gemini 3.5 Flash (Low or Medium)

## Problem Description
When swapping an exercise while actively doing a Circuit, the dropdown list of available swap exercises includes all exercises for the category. It should only display exercises that are flagged as `isCircuit === true`.

## Instructions for Developer
1. Open `gymlog-react/src/components/CircuitCard.jsx`.
2. Locate the "Swap Exercise" dropdown `<select>` element (around line 220).
3. Update the array `.filter()` logic that populates the options to enforce `alt.isCircuit === true`.
4. Provide an Audit Submission detailing the exact diff and a clean build output.

## Audit Requirements
- Show the exact `diff` or replacement text.
- Run `npm run build` to prove no syntax errors were introduced.
