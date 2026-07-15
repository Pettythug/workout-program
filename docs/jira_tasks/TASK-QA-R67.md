# TASK-QA-R67: QA Verification for Timer Fit and Log Card Layout

> **For Human Readers:** This task defines the QA verification steps to test the sticky rest timer's offset, font sizes, single-user inline layout, and multi-user logging controls.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: QA_VERIFICATION
    - REQUIRED_MODEL_TIER: LOW_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: QA_Engineer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are authorized to run read-only commands and browser tests.
  </ROLE_DEFINITION>
  <OBJECTIVE>
    Verify the fix for top banner clipping, font scaling, tab renaming, and the single/multi-user scroll-free logging layout.
  </OBJECTIVE>
  <RESOURCES>
    - Plan View: `http://localhost:5173/workout-program/react/#/plan`
  </RESOURCES>
  <SEQUENCE>
    1. AUTOMATED BUILD VERIFICATION:
       - Run `npm run build` inside `gymlog-react` to ensure compilation is clean on branch `TASK-R67`.

    2. HEADER HEIGHT OFFSET VERIFICATION:
       - Start the rest timer. Scroll down past 220px.
       - Verify that the banner renders cleanly below the header. The top edge of the banner card must be offset from the header's bottom boundary by exactly 12px (`top: ${headerHeight + 12}px`), clearing any shadow overlays.

    3. TIMER LEGIBILITY VERIFICATION:
       - Start the rest timer. Verify the countdown digits are rendered at font size 24px and labeled simple as "⏳ MM:SS" (without the word "Rest" to prevent overflow).
       - Let the timer expire. Verify the completed rest warning renders at font size 20px.

    4. EXERCISE CARD UX VERIFICATION:
       - Load the Plan page. Expand an exercise card.
       - Verify the tab button next to `"HISTORY"` is labeled `"CURRENT"` instead of `"LOG SET"`.
       - Verify Single-User Layout:
         - Ensure reps input, weight input, and `"LOG SET X"` button are rendered side-by-side in a single flex row.
         - Ensure checkboxes and notes inputs are positioned directly below this row.
       - Verify Multi-User Layout (if configuring multiple active partners):
         - Ensure inputs render first, and the `"LOG SET X"` button appears immediately below the last input block (above checkboxes).
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
