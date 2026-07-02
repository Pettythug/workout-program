# TASK-R22: Unify Exercise Logging Logic

> **For Human Readers:** This task unifies the duplicate exercise logging logic currently shared between `ExerciseCard.jsx` and `CircuitView.jsx` by centralizing it into a single `logExerciseSet` action in `AppContext.jsx`.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: MULTI_FILE_ARCHITECTURE
    - REQUIRED_MODEL_TIER: MEDIUM_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R22`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Centralize log entry construction, user PIN prompting, API invocation, and local history updates into AppContext to eliminate massive code duplication between ExerciseCard and CircuitView. Ensure console outputs are unified and identical.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files:
      - `gymlog-react/src/context/AppContext.jsx`
      - `gymlog-react/src/components/ExerciseCard.jsx`
      - `gymlog-react/src/components/CircuitView.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ: All target files.

    2. MODIFY `gymlog-react/src/context/AppContext.jsx`:
       - Add `logExerciseSet` inside the `AppProvider` component.
       - Implement the function as follows:
         ```javascript
         const logExerciseSet = async (ex, logs) => {
             console.log("logExerciseSet CALLED", { ex, logs });
             
             let nextSetNum = 1;
             if (ex.history && ex.history.length > 0) {
                 const todaysEntries = ex.history.filter(h => h.date && new Date(h.date).toDateString() === new Date().toDateString());
                 if (todaysEntries.length > 0) {
                     const maxSetNum = todaysEntries.reduce((max, h) => {
                         const num = parseInt(h.setNum) || 0;
                         return num > max ? num : max;
                     }, 0);
                     nextSetNum = maxSetNum + 1;
                 }
             }

             const entries = [];
             for (const person of activePeople) {
                 const key = person.toLowerCase();
                 const input = logs[key];
                 if (!input) continue;

                 if (ex.timed) {
                     if (input.duration) {
                         entries.push({
                             date: new Date().toLocaleString('en-US'),
                             person: key,
                             reps: input.duration,
                             weight: input.weight || "",
                             range: "r13_plus",
                             timed: true,
                             note: input.note || "",
                             setNum: nextSetNum
                         });
                     }
                 } else {
                     if (input.reps) {
                         const r = parseInt(input.reps);
                         let range = "r13_plus";
                         if (r <= 3) range = "r1_3";
                         else if (r <= 7) range = "r4_7";
                         else if (r <= 12) range = "r8_12";

                         entries.push({
                             date: new Date().toLocaleString('en-US'),
                             person: key,
                             reps: r,
                             weight: input.weight || "",
                             range: range,
                             timed: false,
                             note: input.note || "",
                             setNum: nextSetNum
                         });
                     }
                 }
             }

             console.log("ENTRIES:", entries);

             if (entries.length > 0) {
                 const userPins = {};
                 let cancelled = false;
                 for (const person of activePeople) {
                     const key = person.toLowerCase();
                     const input = logs[key];
                     if (!input) continue;

                     if ((ex.timed && input.duration) || (!ex.timed && input.reps)) {
                         let pin = localStorage.getItem('gymlog_pin_' + key);
                         if (!pin) {
                             pin = window.prompt(`Enter PIN for ${person}:`);
                             if (pin === null) {
                                 cancelled = true;
                                 break;
                             }
                             localStorage.setItem('gymlog_pin_' + key, pin);
                         }
                         userPins[key] = pin;
                     }
                 }

                 if (cancelled) return null;

                 // API sync & local history update
                 await logSet(ex.name, entries, userPins);
                 addSetToLocalHistory(ex.name, entries);
                 return entries;
             }
             return null;
         };
         ```
       - Make sure to export `logExerciseSet` in the `contextValue` object.

    3. MODIFY `gymlog-react/src/components/ExerciseCard.jsx`:
       - Extract `logExerciseSet` from `useAppContext()`.
       - Clean up `handleSaveSet` to leverage this function:
         ```javascript
         const handleSaveSet = async () => {
             if (isSaving) return;
             setIsSaving(true);
             try {
                 const entries = await logExerciseSet(ex, logInputs);
                 if (entries) {
                     clearLogInputs();
                     setToast("Set Saved!");
                     if (onLogSet) {
                         onLogSet();
                     }
                 }
             } catch (e) {
                 console.error("Error in handleSaveSet:", e);
                 alert("Failed to log set: " + e.message);
             } finally {
                 setIsSaving(false);
             }
         };
         ```

    4. MODIFY `gymlog-react/src/components/CircuitView.jsx`:
       - Extract `logExerciseSet` from `useAppContext()`.
       - Simplify `handleLogSet` to call `logExerciseSet`:
         ```javascript
         const handleLogSet = async (ex, logs) => {
             try {
                 const entries = await logExerciseSet(ex, logs);
                 if (entries) {
                     const newMap = { ...completedMap };
                     const currentData = newMap[ex.name] || { status: 'active', sets: [] };
                     const currentSets = typeof currentData === 'string' ? [] : (currentData.sets || []);
                     
                     newMap[ex.name] = {
                         status: typeof currentData === 'string' ? currentData : (currentData.status || 'active'),
                         sets: [...currentSets, entries]
                     };
                     updateCircuitState(circuit, newMap);

                     // Auto-start rest timer if a countdown is configured
                     const duration = parseInt(timerMode, 10);
                     if (!isNaN(duration) && duration > 0) {
                         setTimerSeconds(duration);
                         setTimerIsCountdown(true);
                         setTimerIsRunning(true);
                     }
                     return true;
                 }
             } catch (e) {
                 console.error("Error logging set:", e);
                 alert("Failed to log set: " + e.message);
             }
             return false;
         };
         ```

    5. AUDIT: Generate `audit_log_R22.md` documenting the unified architecture changes.
    6. VERIFY: Run `npm run build` to confirm compilation is successful.
    7. EXECUTE: Run `git push origin TASK-R22` to push the branch to the remote repository.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
