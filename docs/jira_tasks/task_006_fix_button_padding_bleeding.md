# [COMPLETED] Task 006: Fix Button Padding Bleeding on Narrow Viewports

**Recommended Model:** Gemini 3.5 Flash (Low or Medium)

## Git Setup (Mandatory)
Before writing any code, pull the latest state and isolate your changes on a new branch:
1. Ensure your local `main` is fresh:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Create and switch to a new task branch:
   ```bash
   git checkout -b task/006-button-padding-fix
   ```

## Problem Description
On narrow mobile viewports, the **Swap Exercise** and **Image** buttons in both `ExerciseCard.jsx` and `CircuitCard.jsx` have text/icon content that bleeds outside their borders. This is caused by `padding: 12` which applies too much horizontal padding (12px on left and right), squeezing the available space for text.

## Instructions for Developer
1. Open the following files:
   - `gymlog-react/src/components/ExerciseCard.jsx` (around line 454)
   - `gymlog-react/src/components/CircuitCard.jsx` (around line 301)
2. Locate the **SWAP EXERCISE** and **IMAGE** buttons inside the wrapping container.
3. Change their inline style `padding: 12` to **`padding: '12px 4px'`** (or `padding: '10px 4px'` if you want a slightly shorter height).
4. Run `npm run build` using `cmd.exe /c npm run build` (or your standard build tool) to verify the build completes successfully and no syntax errors are introduced.

## Audit Requirements
- Show the exact `diff` or replacement text for both files.
- Run `npm run build` to prove no syntax errors were introduced.
