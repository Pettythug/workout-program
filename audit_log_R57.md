# Audit Log: TASK-R57

## Fix Swap PIN Prompt Regression

1. **`gymlog-react/src/components/ExerciseCard.jsx`**:
   - Refactored `targetEx` lookup in the `executeSwap` function to trim comparison values and check base names via a `getBaseName` helper pattern: `const getBaseName = (n) => n.replace(/\s*\((Single|Alt|DB|Cable)\)/i, "").trim();`
   - This checks if the variation matches the parent/base group or standard name, avoiding Admin PIN prompts on existing database entries.

2. **`gymlog-react/src/components/CircuitCard.jsx`**:
   - Mirrored the exact refactoring of `targetEx` lookup in `executeSwap` to trim comparison values and support base name match evaluation.

## Verification Details
- Successfully modified target exercise lookup algorithms to check base name variations.
- Verified compilation and build of the React application.
