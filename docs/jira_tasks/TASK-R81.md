# TASK-R81: Implement Strict Odd/Even Core Alternation for Full Body Program

> **For Human Readers:** This task updates `FullBodyView.jsx` so that the 8th exercise slot strictly alternates between Plank Core on odd workout days and Rotational Core on even workout days, with isolated category rotation counters and category-specific swap lists.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: SINGLE_FILE_FEATURE
    - REQUIRED_MODEL_TIER: MEDIUM_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R81`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. In `gymlog-react/src/components/FullBodyView.jsx`:
       - Determine the active core category based on `fullBodyWorkoutDay`:
         - Odd days (`fullBodyWorkoutDay % 2 !== 0`): `pick(['Plank Core'])`.
         - Even days (`fullBodyWorkoutDay % 2 === 0`): `pick(['Rotational Core'])`.
       - Ensure `pick` sets `rotationKey` as `'PlankCore'` on odd days and `'RotationalCore'` on even days.
       - Ensure alternatives for swapping in slot #8 only contain exercises from that day's active core category.
       - Ensure `startNextWorkout()` increments the respective rotation counter (`gymlog_fullBody_rotation_PlankCore` or `gymlog_fullBody_rotation_RotationalCore`).
  </OBJECTIVE>
  <RESOURCES>
    - Full Body View: `gymlog-react/src/components/FullBodyView.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/FullBodyView.jsx`.

    2. MODIFY `gymlog-react/src/components/FullBodyView.jsx`:
       - In `plannedExercises` useMemo block:
         - Calculate `const activeCoreCategory = fullBodyWorkoutDay % 2 !== 0 ? 'Plank Core' : 'Rotational Core';`
         - In the 8-exercise picked array, replace `pick(['Rotational Core', 'Plank Core'])` with `pick([activeCoreCategory])`.
       - In `startNextWorkout()`:
         - Ensure the rotation increment iterates over `plannedExercises` so that on odd days `gymlog_fullBody_rotation_PlankCore` increments and on even days `gymlog_fullBody_rotation_RotationalCore` increments.

    3. AUDIT: Generate `/audit_log_R81.md` documenting the Odd/Even core alternation logic.
    4. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
