# TASK-R90: 16-Day Cycle Rotation & Dynamic Rep-Range Progression for Circuit Mode

> **For Human Readers:** This task eliminates hardcoded '13+' and Day 1 values in `CircuitView.jsx`, implementing the standard 16-day cycle rotation (8-12, 1-3, 13+, 4-7) and automated day progression on `startNextWorkout()`, bringing full parity with PlanView and FullBodyView.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: MULTI_FILE_Refactoring
    - REQUIRED_MODEL_TIER: ["MEDIUM_TIER", "Gemini 3.8 Flash (Medium)", "Gemini 3.8 Flash", "Gemini 3.8 Pro"]
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R90`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Update `gymlog-react/src/context/AppContext.jsx`:
       - Add `circuitWorkoutDay` state (initialized from `localStorage.getItem('gymlog_circuit_workout_day') || 1`, numeric 1-16).
       - Add `updateCircuitWorkoutDay(day)` helper.
       - Expose `circuitWorkoutDay` and `updateCircuitWorkoutDay` via context provider.

    2. Update `gymlog-react/src/components/CircuitView.jsx`:
       - Add `getRepRange(day)`:
         ```javascript
         const getRepRange = (day) => {
             const position = ((day - 1) % 16);
             if (position < 4) return '8-12';
             if (position < 8) return '1-3';
             if (position < 12) return '13+';
             return '4-7';
         };
         ```
       - In Tracker Header: Display the 3 stats cards:
         `WORKOUT: {circuitWorkoutDay}` | `REPS: {getRepRange(circuitWorkoutDay)}` | `ROUNDS: 1`
       - Rest Timer Sync:
         ```javascript
         useEffect(() => {
             if (!timerIsRunning) {
                 setTimerMode(getDefaultRestForRepRange(getRepRange(circuitWorkoutDay)));
             }
         }, [circuitWorkoutDay]);
         ```
       - In `completeWorkout()`:
         - Capture `workoutDay: circuitWorkoutDay` and `repRange: getRepRange(circuitWorkoutDay)` (replacing hardcoded `workoutDay: 1` and `repRange: '13+'`).
       - In `startNextWorkout()`:
         - Advance `circuitWorkoutDay = ((circuitWorkoutDay % 16) + 1)` and persist to `gymlog_circuit_workout_day`.
         - Clear completed summary and reset state.

    3. Verification & Audit:
       - Generate `/audit_log_R90.md`.
       - Run `npm run build` inside `gymlog-react` to verify clean build with 0 errors.
  </OBJECTIVE>
  <RESOURCES>
    - Context: `gymlog-react/src/context/AppContext.jsx`
    - Circuit View: `gymlog-react/src/components/CircuitView.jsx`
    - Reference: `gymlog-react/src/components/FullBodyView.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/context/AppContext.jsx` and `gymlog-react/src/components/CircuitView.jsx`.
    2. MODIFY `gymlog-react/src/context/AppContext.jsx` to manage `circuitWorkoutDay`.
    3. MODIFY `gymlog-react/src/components/CircuitView.jsx`:
       - Integrate `getRepRange(circuitWorkoutDay)`.
       - Update `completeWorkout()`, `startNextWorkout()`, and stats pills.
       - Synchronize timer default.
    4. CREATE `/audit_log_R90.md`.
    5. RUN `npm run build` inside `gymlog-react` and verify clean build.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
