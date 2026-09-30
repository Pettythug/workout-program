# TASK-R89: Dynamic Rep-Range-Based Default Rest Timer Duration

> **For Human Readers:** This task adds automatic rep-range-based default rest durations across PlanView, FullBodyView, and CircuitView. 1–3 rep workouts default to 3:00 (180s), 4–7 reps default to 2:00 (120s), 8–12 reps default to 1:30 (90s), and 13+ reps default to 0:45 (45s). Manual dropdown selection remains fully accessible.

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
    - TARGET_BRANCH: `TASK-R89`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Define Rep Range Default Rest Mapping:
       - 1–3 Reps (Heavy): 180 seconds (`"180"` / 3M REST)
       - 4–7 Reps (Strength): 120 seconds (`"120"` / 2M REST)
       - 8–12 Reps (Hypertrophy): 90 seconds (`"90"` / 90S REST)
       - 13+ Reps (Endurance): 45 seconds (`"45"` / 45S REST)
       - Fallback default: 90 seconds (`"90"`)

    2. Update Rest Timer Dropdowns:
       - In `gymlog-react/src/components/PlanView.jsx`, `gymlog-react/src/components/FullBodyView.jsx`, and `gymlog-react/src/components/CircuitView.jsx`:
         - Add `<option value="45">⏳ 45S REST</option>` into the timer dropdown list (between 30S and 60S).

    3. Update `gymlog-react/src/context/AppContext.jsx`:
       - Add helper `getDefaultRestForRepRange(repRange)`:
         ```javascript
         export function getDefaultRestForRepRange(repRange) {
             const r = (repRange || '').toString().toLowerCase().trim();
             if (r.includes('1-3') || r.includes('1_3') || r === '1-3') return '180';
             if (r.includes('4-7') || r.includes('4_7') || r === '4-7') return '120';
             if (r.includes('8-12') || r.includes('8_12') || r === '8-12') return '90';
             if (r.includes('13') || r.includes('13_plus') || r.includes('13+')) return '45';
             return '90';
         }
         ```
       - Expose `getDefaultRestForRepRange` via context.

    4. Auto-Set Rest Timer on Rep Range Selection:
       - In `PlanView.jsx`, `FullBodyView.jsx`, and `CircuitView.jsx`:
         - On mount / workout day change: If timer is not actively running, synchronize `timerMode` to `getDefaultRestForRepRange(currentRepRange)` and update `timerSeconds` accordingly.
         - When `onLogSet` triggers a rest timer, ensure it starts with the appropriate rep-range duration.

    5. Verification & Audit:
       - Generate `/audit_log_R89.md` detailing the rep-range rest timer defaults.
       - Run `npm run build` inside `gymlog-react` and ensure clean compilation with 0 errors.
  </OBJECTIVE>
  <RESOURCES>
    - Context: `gymlog-react/src/context/AppContext.jsx`
    - Plan View: `gymlog-react/src/components/PlanView.jsx`
    - Full Body View: `gymlog-react/src/components/FullBodyView.jsx`
    - Circuit View: `gymlog-react/src/components/CircuitView.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/context/AppContext.jsx`, `gymlog-react/src/components/PlanView.jsx`, `gymlog-react/src/components/FullBodyView.jsx`, and `gymlog-react/src/components/CircuitView.jsx`.
    2. MODIFY `gymlog-react/src/context/AppContext.jsx` to export `getDefaultRestForRepRange`.
    3. MODIFY `gymlog-react/src/components/PlanView.jsx`, `gymlog-react/src/components/FullBodyView.jsx`, and `gymlog-react/src/components/CircuitView.jsx`:
       - Add 45s rest option to dropdown.
       - Synchronize default rest timer to the active rep range.
    4. CREATE `/audit_log_R89.md`.
    5. RUN `npm run build` inside `gymlog-react` and verify clean compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
