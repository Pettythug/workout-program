# Task 003: Fix Circuit Generator Filtering

**Recommended Model:** Gemini 3.5 Flash (Low or Medium)

## Problem Description
When generating a circuit using the "Full Body Circuit" or "Generate Circuit" (Mimic) buttons, the app currently pulls from the global `exercises` array. This causes non-circuit-eligible machines to be included in the generated circuits.

## Instructions for Developer
1. Open `gymlog-react/src/components/CircuitView.jsx`.
2. Locate the `startFullBodyCircuit` and `startMimicCircuit` functions.
3. Both functions currently contain a block like this:
   ```javascript
   exercises.forEach(ex => {
       if (!grouped[ex.category]) grouped[ex.category] = [];
       grouped[ex.category].push(ex);
   });
   ```
4. Change `exercises.forEach` to use the helper function `getCircuitEligibleExercises().forEach` so that only circuit-eligible machines are categorized and picked.
5. Provide an Audit Submission detailing the exact diff and a clean build output.

## Audit Requirements
- Show the exact `diff` or replacement text for both functions.
- Run `npm run build` to prove no syntax errors were introduced.
