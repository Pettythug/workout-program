# TASK-R141: Fix Full Body Rep Range Highlight Mismatch in ExerciseCard (`useTargetLock`)

- **Target Role:** `Sandbox_Developer` (`DENY(git checkout, git merge, git push)`)
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash (High)` / `Claude Sonnet 4.6 (Thinking)` / `Gemini 4 Argon (Medium)`) or `HIGH_TIER` (`Gemini 4 Argon (High)` / `Gemini 3.8 Pro` / `Claude Opus 4.6 (Thinking)`)
- **STRICT MODEL GATEKEEPER CHECK (MANDATORY ON TURN 1):**
  - If your active model is in `LOW_TIER` (`Gemini 4 Argon (Low)`, `Gemini 3.8 Flash (Low)`, `Gemini 3.5 Flash (Low)`):
    - **HALT IMMEDIATELY.** Do NOT edit files or run commands.
    - Output: `Model Alignment Error: Request Switch -> Expected MEDIUM_TIER or HIGH_TIER for feature development. Please switch to Gemini 3.8 Flash (High), Claude Sonnet 4.6 (Thinking), or Gemini 4 Argon (High).`
- **Target Branch:** `TASK-R141`

---

## 1. Root Cause Summary

In `gymlog-react/src/hooks/useTargetLock.js`, `useTargetLock(ex, personKey)` reads `workoutDay` (the **Plan** tab's day counter) directly from `useAppContext()`, ignoring `fullBodyWorkoutDay` when `ExerciseCard` is rendered inside `FullBodyView`.

As a result, when the user is on the **Full Body** tab on a `1-3` rep day (days 5–8 of the 16-day cycle) while the **Plan** tab is on an `8-12` rep day (days 1–4), `ExerciseCard` highlights `8-12` in orange instead of `1-3`.

---

## 2. Objective & Scope

1. **Update `gymlog-react/src/hooks/useTargetLock.js`:**
   - Accept an optional third parameter `overrideDay` (e.g., `export function useTargetLock(ex, personKey, overrideDay)`).
   - Resolve the effective day as `const effectiveDay = overrideDay ?? workoutDay ?? 1;` and compute `day` and `activeRangeKey` from `effectiveDay`.
2. **Update `gymlog-react/src/components/ExerciseCard.jsx`:**
   - Accept an optional `activeDay` prop on `ExerciseCard` (e.g., `export default function ExerciseCard({ group, onLogSet, isOpen: propIsOpen, defaultOpen = false, onSwap, activeDay })`).
   - Pass `activeDay` down to both `SingleUserLogSection` and `MultiUserPersonLogSection`, and forward it to `useTargetLock(ex, key, activeDay)`.
   - Also check if `ExerciseCard` uses `workoutDay` anywhere else (e.g., when logging a set or swapping) and ensure `const effectiveDay = activeDay ?? workoutDay;` is used consistently so Full Body exercises never accidentally read Plan's `workoutDay`.
3. **Update `gymlog-react/src/components/FullBodyView.jsx` (and `AccessoryBlock.jsx` if it renders `ExerciseCard`):**
   - Pass `activeDay={fullBodyWorkoutDay}` to every `<ExerciseCard ... />` rendered in `FullBodyView.jsx` (including full-list view and any accessory `ExerciseCard`s if applicable).
4. **Update `gymlog-react/src/components/PlanView.jsx`:**
   - Pass `activeDay={workoutDay}` to `<ExerciseCard ... />` for explicit clarity (optional fallback remains `workoutDay`).
5. **Update `gymlog-react/src/components/CircuitView.jsx` & `gymlog-react/src/components/CircuitCard.jsx`:**
   - Pass `activeDay={circuitWorkoutDay}` from `CircuitView.jsx` to every `<CircuitCard ... />` (and any `<AccessoryBlock ... />` if rendered).
   - Accept `activeDay` in `CircuitCard.jsx` (and its inner log section component) and forward it to `useTargetLock(ex, key, activeDay)` so Circuit, Full Body, and Plan all share the exact same unified `useTargetLock(ex, key, activeDay)` pattern.
6. **Verification:**
   - Run `cd gymlog-react && cmd /c npm run build` and confirm clean compilation (`exit code 0`).
   - Commit all changes to `TASK-R141` with a clear commit message (e.g. `fix(circuit): pass circuitWorkoutDay to CircuitCard and useTargetLock (TASK-R141)`).

---

## 3. Submission Protocol for Sandbox Developer

Output your completion signal inside a fenced XML block:
```xml
<TASK_HANDOFF>
  <SIGNAL>DEVELOPMENT_TASK_COMPLETE</SIGNAL>
  <TASK_ID>TASK-R141</TASK_ID>
  <BRANCH>TASK-R141</BRANCH>
  <BUILD_VERIFICATION>PASS</BUILD_VERIFICATION>
</TASK_HANDOFF>
```
