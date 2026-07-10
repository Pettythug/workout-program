# TASK-R42: Track Timed Exercises in Seconds Instead of minutes:seconds

> **For Human Readers:** Exercises using time currently prompt the user for input in `mm:ss` format. This task changes the time inputs in `ExerciseCard.jsx` and `CircuitCard.jsx` to take an integer number of seconds (e.g. `60` instead of `01:00`), which is cleaner for gym logging.

> **STATUS: BACKLOG — Not yet scheduled for execution.**

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
  <OBJECTIVE>
    Update timed exercise inputs to prompt for seconds (e.g. "secs" or "seconds") and append 's' in the logged sets history layout.
  </OBJECTIVE>
  <RESOURCES>
    - Frontend:
      - `gymlog-react/src/components/ExerciseCard.jsx`
      - `gymlog-react/src/components/CircuitCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ target files.

    2. MODIFY `gymlog-react/src/components/ExerciseCard.jsx`:
       - Change the placeholder of the timed duration input (around line 58) from `"mm:ss"` to `"secs"`.
       - Change the `type` of the duration input to `"text"`, add `inputMode="numeric"`, and `pattern="[0-9]*"`.
       - Update history formatting (around lines 476, 513, 583, 621, 658) so if `ex.timed` is true, the logged reps value is appended with `s` (e.g., `60s` instead of just `60`).

    3. MODIFY `gymlog-react/src/components/CircuitCard.jsx`:
       - Perform matching modifications as above (timed input placeholder to `"secs"`, validation attributes, and history display formats).

    4. AUDIT: Generate `audit_log_R42.md` detailing the time-to-seconds conversion.
    5. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to confirm compilation succeeds cleanly.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
