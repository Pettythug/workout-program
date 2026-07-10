# TASK-R46: Fix Duplicate Logging via Active People Deduplication

> **For Human Readers:** During testing, some sets are logged twice with identical timestamps. This is caused by duplicate entries (or case-variant entries, e.g. "test" and "Test") residing in the `activePeople` cache. This task deduplicates the active roster on load/change and adds a case-insensitive deduplication guard inside the centralized logging function.

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
    - TARGET_BRANCH: `TASK-R46`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Prevent duplicate logging by enforcing case-insensitive roster uniqueness in `AppContext.jsx`.
  </OBJECTIVE>
  <RESOURCES>
    - Frontend: `gymlog-react/src/context/AppContext.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/context/AppContext.jsx`.

    2. MODIFY `gymlog-react/src/context/AppContext.jsx`:
       
       a. Update the `activePeople` state initialization (around line 19) to filter out duplicates:
          ```javascript
          const [activePeople, setActivePeople] = useState(() => {
              const cached = localStorage.getItem('gymlog_activePeople');
              const parsed = cached ? JSON.parse(cached) : [];
              return [...new Set(parsed)];
          });
          ```

       b. Update `togglePersonActive` (around line 124) to sanitize and deduplicate:
          ```javascript
          const togglePersonActive = (person) => {
              if (person === deviceOwner && activePeople.includes(person)) {
                  return;
              }
              setActivePeople(prev => {
                  const next = prev.includes(person)
                      ? prev.filter(p => p !== person)
                      : [...prev, person];
                  const uniqueNext = [...new Set(next)];
                  localStorage.setItem('gymlog_activePeople', JSON.stringify(uniqueNext));
                  return uniqueNext;
              });
          };
          ```

       c. Update `updateDeviceOwner` (around line 138) to deduplicate when forcing the owner active:
          ```javascript
          const updateDeviceOwner = (newOwner) => {
              setDeviceOwner(newOwner);
              localStorage.setItem('builder_primary_user', newOwner);
              setActivePeople(prev => {
                  if (!prev.includes(newOwner)) {
                      const next = [...prev, newOwner];
                      const uniqueNext = [...new Set(next)];
                      localStorage.setItem('gymlog_activePeople', JSON.stringify(uniqueNext));
                      return uniqueNext;
                  }
                  return prev;
              });
          };
          ```

       d. Inside the `logExerciseSet` function (around line 289), add a `seenKeys` deduplication check in the mapping loops:
          - Locate the loop starting with `for (const person of activePeople) {` (around line 305):
            ```javascript
            const entries = [];
            const seenKeys = new Set();
            for (const person of activePeople) {
                const key = person.toLowerCase();
                if (seenKeys.has(key)) continue;
                seenKeys.add(key);

                const input = logs[key];
                if (!input) continue;
            ```
          - Do the same check for the user PIN validation loop (around line 361):
            ```javascript
                const userPins = {};
                let cancelled = false;
                const seenPinKeys = new Set();
                for (const person of activePeople) {
                    const key = person.toLowerCase();
                    if (seenPinKeys.has(key)) continue;
                    seenPinKeys.add(key);

                    const input = logs[key];
                    if (!input) continue;
            ```

       e. Ensure the context value `activePeople` (around line 393) filters out duplicates:
          ```javascript
          activePeople: [...new Set(activePeople)].filter(p => people.includes(p)),
          ```

    3. AUDIT: Generate `audit_log_R46.md` detailing the active roster deduplication implementation.
    4. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to confirm compilation succeeds cleanly.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
