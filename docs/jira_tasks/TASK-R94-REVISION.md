# TASK-R94-REVISION: Refactor Workout Progress Override Inputs for Unrestricted Typing and Stepper Controls

> **For Human & Developer Readers:** This task refactors the number inputs in `SettingsModal.jsx` to prevent eager `NaN` fallback resets, allowing direct number typing, clearing/backspacing, and adds `[-]` / `[+]` stepper buttons.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: Frontend_UI_Refactor
    - REQUIRED_MODEL_TIER: ["MEDIUM_TIER", "HIGH_TIER", "Claude Sonnet 4.6 (Thinking)", "Gemini 3.8 Flash (High)", "Gemini 3.1 Pro (Low)"]
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are strictly a Sandbox Developer. Implement the code edits specified below and run validation checks.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R94`
    - TARGET_APP_PATH: `gymlog-react`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Fix Controlled Input Keystroke Reset in `gymlog-react/src/components/SettingsModal.jsx`:
       - Previously, `onChange={e => updateWorkoutDay(parseInt(e.target.value) || 1)}` caused backspacing/clearing the input to evaluate to `NaN || 1`, instantly resetting the field back to `1` and preventing multi-digit typing (e.g. typing "24").
       - Maintain local buffered state (or string state) for the three progress inputs:
         - `planDayInput` (initialized to `workoutDay`)
         - `fullBodyDayInput` (initialized to `fullBodyWorkoutDay`)
         - `circuitDayInput` (initialized to `circuitWorkoutDay`)
       - Use a `useEffect` to sync local state whenever `workoutDay`, `fullBodyWorkoutDay`, or `circuitWorkoutDay` change from context (such as when switching Device Owner).
       - While typing (`onChange`):
         - Update local state immediately so user sees their typing (allowing empty string `""` while backspacing).
         - If the typed value is a valid integer >= 1, commit it to context (`updateWorkoutDay(parsedVal)`, etc.).
       - On `onBlur`:
         - If the input is left empty `""` or invalid `< 1`, reset local state to `1` (or current context value) and commit `1` to context.
    2. Add UI Stepper Controls:
       - For each of the three workout progress items (`Plan Workout #`, `Full Body Workout #`, `Circuit Workout #`), provide:
         - A `[-]` button that decrements by 1 (minimum 1) and commits.
         - The direct text/number input (with `textAlign: 'center'`, allowing direct typing/clearing).
         - A `[+]` button that increments by 1 and commits.
       - Ensure buttons and input fit nicely and look modern with GymLog's dark aesthetic.
    3. Verification:
       - Run `cmd /c npm run build` inside `gymlog-react` to ensure clean build.
       - Run `cmd /c npx eslint src/` inside `gymlog-react` to ensure 0 lint errors and 0 `no-undef`.
       - Signal `DEVELOPMENT_TASK_COMPLETE` when finished.
  </OBJECTIVE>
  <SEQUENCE>
    1. EDIT `gymlog-react/src/components/SettingsModal.jsx`.
    2. RUN `npm run build` in `gymlog-react`.
    3. RUN `npx eslint src/` in `gymlog-react`.
    4. SIGNAL `DEVELOPMENT_TASK_COMPLETE`.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
