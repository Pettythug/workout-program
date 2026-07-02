# TASK-R7: UI Quality-of-Life Tweaks

> **For Human Readers:** This task restores several minor UI polish items, fixes button padding, and unifies the rep/weight formatting strings across the app.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: SINGLE_FILE_FEATURE
    - REQUIRED_MODEL_TIER: LOW_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R7`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Restore minor UI quality-of-life tweaks (Singles rename, padding fixes, history timestamps) and unify the `LOGGED SETS` string interpolation formatting.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files: `gymlog-react/src/components/CircuitCard.jsx`, `gymlog-react/src/components/ExerciseCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Target files.
    2. MODIFY: In `CircuitCard.jsx`, locate the `switchVariation` button for "Single Leg". Rename the label text from `SINGLE` to `SINGLES`. Do the same in `ExerciseCard.jsx`.
    3. MODIFY: In `CircuitCard.jsx` line ~354 (`LOGGED SETS`), the string interpolation is currently hardcoded to use `@` (e.g. `e.reps + '@' + (e.weight || 0)`). Update this to use the exact same ternary logic used in the RECENT HISTORY block (i.e. `ex.timed ? \`${e.reps} ${e.weight ? \`@ ${e.weight}lbs\` : ''}\` : \`${e.reps}x${e.weight || 0}\``).
    4. MODIFY: Ensure button padding on action buttons (like DONE/SKIP) does not bleed outside of their containers on mobile views.
    5. AUDIT: Generate `audit_log_R7.md` documenting the exact changes.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
