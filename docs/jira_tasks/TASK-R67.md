# TASK-R67: Timer Banner Fit and Log Card UX Optimization

> **For Human Readers:** This task fixes the header overlap clipping bug for the sticky rest banner and optimizes the exercise card logging flow for single and multi-user configurations.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: MULTI_FILE_Refactoring
    - REQUIRED_MODEL_TIER: MEDIUM_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R67`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Fix the top clipping of the StickyRestBanner by adding a visual margin offset.
    2. Rename the redundant card tab next to "HISTORY" from "LOG SET" to "CURRENT".
    3. Redesign the active logging inputs layout to place the "LOG SET X" button directly on the same row as the reps/weight inputs (or immediately below them for multi-user setups) to eliminate vertical scrolling.
  </OBJECTIVE>
  <RESOURCES>
    - Sticky Rest Banner: `gymlog-react/src/components/StickyRestBanner.jsx`
    - Exercise Card: `gymlog-react/src/components/ExerciseCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ target files.

    2. MODIFY `gymlog-react/src/components/StickyRestBanner.jsx` — Header Clearance:
       - Update the `top` positioning style to add a `12px` buffer offset below the header to guarantee full clearance:
         `top: \`\${headerHeight + 12}px\``
       - Also increase the timer font size in the active display from `14px` to `24px` for improved visibility from a distance, adjusting text string from `⏳ Rest: 1:30` to `⏳ 1:30` to preserve horizontal spacing.
       - Adjust completed display font size to `20px` to keep it single-line.

    3. MODIFY `gymlog-react/src/components/ExerciseCard.jsx` — Tab Rename:
       - Locate L553 (the tab selector buttons).
       - Change the label of the active tab switcher button from `"LOG SET"` to `"CURRENT"`.

    4. MODIFY `gymlog-react/src/components/ExerciseCard.jsx` — Input & Button Relocation:
       - Refactor the layout within the `"LOG"` tab render block (L557–612) to optimize single-user vs. multi-user flows:
         - **Single-User Mode (`activePeople.length === 1`):**
           - Extract the reps/weight inputs from `PersonLogSection` and render them in a single row side-by-side with a compact `"LOG SET X"` button.
           - Layout: Flex row, inputs occupy left side (padding/margins minimized), `"LOG SET X"` button occupies the right side (flex: 1).
           - Place optional settings (Singles/Alternating checkboxes, Notes text area) below this input row.
           - Place the Today's Sets summary and the Done/Skip control buttons below that.
         - **Multi-User Mode (`activePeople.length > 1`):**
           - Render each person's reps/weight inputs.
           - Place the `"LOG SET X"` button immediately below the last input block (before checkboxes and notes) to prevent scrolling.
       - Clean up any unused legacy log button placements.

    5. AUDIT: Generate `/audit_log_R67.md` detailing layout optimizations.
    6. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to verify compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
