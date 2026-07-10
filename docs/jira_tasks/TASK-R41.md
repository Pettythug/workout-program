# TASK-R41: Auto-Reset Skipped/Done Statuses and Daily Swaps on New Day

> **For Human Readers:** Completed or skipped lift statuses and daily exercise swaps persist in localStorage indefinitely. This task implements a date-check on startup to clear this cached day-specific state automatically when a new calendar day begins.

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
    Clear `gymlog_exerciseStatus` and `gymlog_dailySwaps` from localStorage automatically when a new day is detected on app load.
  </OBJECTIVE>
  <RESOURCES>
    - Frontend: `gymlog-react/src/context/AppContext.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/context/AppContext.jsx`.

    2. MODIFY `gymlog-react/src/context/AppContext.jsx`:
       - Inside the `useEffect` initial load block (around line 53), add a check:
         ```javascript
         const lastActiveDate = localStorage.getItem('gymlog_lastActiveDate');
         const today = new Date().toDateString();
         if (lastActiveDate && lastActiveDate !== today) {
             // New day detected: reset daily statuses and swaps
             localStorage.setItem('gymlog_exerciseStatus', JSON.stringify({}));
             localStorage.setItem('gymlog_dailySwaps', JSON.stringify({}));
             setExerciseStatus({});
             setDailySwaps({});
         }
         localStorage.setItem('gymlog_lastActiveDate', today);
         ```

    3. AUDIT: Generate `audit_log_R41.md` detailing the auto-reset implementation.
    4. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to confirm compilation succeeds cleanly.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
