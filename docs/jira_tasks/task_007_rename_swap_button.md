# [COMPLETED] Task 007: Rename Swap Exercise Button to Swap

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
   git checkout -b task/007-rename-swap-button
   ```

## Problem Description
To resolve overflow issues and clean up redundant text on mobile screens, we are shortening the text of the Swap button from "🔄 SWAP EXERCISE" to "🔄 SWAP" in both exercise cards.

## Instructions for Developer
1. Open the following files:
   - `gymlog-react/src/components/ExerciseCard.jsx` (around line 454)
   - `gymlog-react/src/components/CircuitCard.jsx` (around line 301)
2. Locate the button displaying **🔄 SWAP EXERCISE**.
3. Rename the text inside the button to **🔄 SWAP** (retaining the circular arrows emoji).
4. Run `npm run build` using `cmd.exe /c npm run build` (or your standard build tool) to verify the build completes successfully and no syntax errors are introduced.

## Audit Requirements
- Show the exact `diff` or replacement text for both files.
- Run `npm run build` to prove no syntax errors were introduced.
