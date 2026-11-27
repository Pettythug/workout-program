# TASK-R143: Fix Mobile Button Overflow & Alignment in WarmUpCard and ExerciseCard / CircuitCard

- **Target Role:** `Sandbox_Developer` (`DENY(git checkout, git merge, git push)`)
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash (High)` / `Claude Sonnet 4.6 (Thinking)` / `Gemini 4 Argon (Medium)`) or `HIGH_TIER` (`Gemini 4 Argon (High)` / `Gemini 3.8 Pro` / `Claude Opus 4.6 (Thinking)`)
- **STRICT MODEL GATEKEEPER CHECK (MANDATORY ON TURN 1):**
  - If your active model is in `LOW_TIER` (`Gemini 4 Argon (Low)`, `Gemini 3.8 Flash (Low)`, `Gemini 3.5 Flash (Low)`):
    - **HALT IMMEDIATELY.** Do NOT edit files or run commands.
    - Output: `Model Alignment Error: Request Switch -> Expected MEDIUM_TIER or HIGH_TIER for feature development. Please switch to Gemini 3.8 Flash (High), Claude Sonnet 4.6 (Thinking), or Gemini 4 Argon (High).`
- **Target Branch:** `TASK-R143`

---

## 1. Root Cause Summary

1. **`WarmUpCard.jsx` (`▶ START WORKOUT` / `SKIP` button row):**
   - Uses `display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12`. Because CSS Grid's `1fr` defaults to `minmax(auto, 1fr)`, the wide `▶ START WORKOUT` button expands the left column and pushes the red `SKIP` button past the right border of the card on narrow mobile viewports.
2. **`ExerciseCard.jsx` (and `CircuitCard.jsx` if applicable) inline Edit / Rename row:**
   - The `editMode` flex row (`display: 'flex', gap: 8, width: '100%'`) renders `<input>` and `<select>` with `flex: 1` but **without `minWidth: 0`**, causing the browser's default minimum input width to push the green `SAVE` (and `CANCEL`) buttons off the right edge of the card on mobile.

---

## 2. Objective & Scope

1. **Fix `gymlog-react/src/components/WarmUpCard.jsx`:**
   - Update the `START WORKOUT` / `DONE` + `SKIP` action button container (around line 389) so both buttons are cleanly centered and never overflow the card on narrow mobile screens (e.g., 320px–390px):
     - Use `gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)'` (or `flex: 1, minWidth: 0` inside a `width: '100%', boxSizing: 'border-box'` container).
     - Ensure both buttons have `minWidth: 0`, `width: '100%'`, `boxSizing: 'border-box'`, and responsive padding/text-alignment (`textAlign: 'center'`, `justifyContent: 'center'`, `whiteSpace: 'normal'` or slightly tighter horizontal padding so `▶ START WORKOUT` and `SKIP` fit comfortably inside equal-width columns).
2. **Fix `gymlog-react/src/components/ExerciseCard.jsx`:**
   - In the inline `editMode` row (around line 1198, covering `'rename'`, `'category'`, and `'location'`):
     - Ensure the container has `boxSizing: 'border-box'`, `width: '100%'`, and `flexWrap: 'wrap'` (or `minWidth: 0` on the input/select).
     - Add `minWidth: 0, width: '100%', boxSizing: 'border-box'` to the `<input>` and `<select>` elements so they shrink cleanly to leave room for the action buttons.
     - Add `flexShrink: 0` to the `SAVE` / `CANCEL` buttons so they never get squished or clipped past the right border.
3. **Cohesive Check in `gymlog-react/src/components/CircuitCard.jsx`:**
   - Inspect any inline edit / rename / category / location flex rows in `CircuitCard.jsx` and apply the same `minWidth: 0` + `flexShrink: 0` protection if the same pattern exists.
4. **Verification:**
   - Run `cd gymlog-react && cmd /c npm run build` and confirm clean compilation (`exit code 0`).
   - Commit all changes to `TASK-R143` with a clear commit message (e.g. `fix(ui): prevent mobile button overflow in WarmUpCard and ExerciseCard edit row (TASK-R143)`).

---

## 3. Submission Protocol for Sandbox Developer

Output your completion signal inside a fenced XML block:
```xml
<TASK_HANDOFF>
  <SIGNAL>DEVELOPMENT_TASK_COMPLETE</SIGNAL>
  <TASK_ID>TASK-R143</TASK_ID>
  <BRANCH>TASK-R143</BRANCH>
  <BUILD_VERIFICATION>PASS</BUILD_VERIFICATION>
</TASK_HANDOFF>
```
