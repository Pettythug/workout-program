# TASK-R64: Sticky Floating Countdown Rest Banner

> **For Human Readers:** This task implements a floating sticky rest countdown banner in `PlanView.jsx` (and optionally `CircuitView.jsx`) that pins to the top of the viewport when the timer is active and the user scrolls down past the main static timer widget.

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
    - TARGET_BRANCH: `TASK-R64`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Implement a sticky floating rest timer banner in PlanView.jsx and CircuitView.jsx that appears when the user scrolls past the inline widget.
  </OBJECTIVE>
  <RESOURCES>
    - Plan View: `gymlog-react/src/components/PlanView.jsx`
    - Circuit View: `gymlog-react/src/components/CircuitView.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ target files.

    2. MODIFY `gymlog-react/src/components/PlanView.jsx`:
       a. Add local scroll position tracking state to determine if the user has scrolled past the static timer widget (threshold: 220px):
          ```javascript
          const [showStickyTimer, setShowStickyTimer] = useState(false);

          useEffect(() => {
              const handleScroll = () => {
                  setShowStickyTimer(window.scrollY > 220);
              };
              window.addEventListener('scroll', handleScroll);
              return () => window.removeEventListener('scroll', handleScroll);
          }, []);
          ```
       b. Render a floating, sticky rest timer banner at the top of the viewport when `showStickyTimer && timerIsRunning && timerIsCountdown && timerSeconds > 0` is true.
       c. The sticky banner must be styled using React inline styles matching the theme:
          - Position: `fixed`, `top: 60px` (directly below the sticky main header), `left: 16px`, `right: 16px` (inset card style).
          - Background: `#111` with semi-transparency and backdrop blur (glassmorphism look: `rgba(17, 17, 17, 0.9)`, `backdropFilter: 'blur(8px)'`).
          - Border: `1px solid var(--border)`, `borderRadius: 'var(--radius)'`.
          - Layout: flex row, `justifyContent: 'space-between'`, `alignItems: 'center'`, padding `10px 16px`, `zIndex: 99`.
       d. Inside the sticky banner, render:
          - Left: A text element showing the active countdown value (e.g., `⏳ Rest: 1:15` or similar formatted string via `formatTimerTime(timerSeconds)`).
          - Right: A small control button row:
            - A **PAUSE/START** button to toggle: `onClick={toggleTimer}`.
            - A **+30s** button to add 30 seconds to the timer: `onClick={() => startRestTimer(timerSeconds + 30)}` (verify parameter and function from context).
            - A **SKIP** button to skip the remaining rest: `onClick={resetTimer}`.
          - Buttons must be styled as small ghost/border buttons (`btn-ghost`) with padding `4px 8px` and font size `11px` to remain compact.

    3. MODIFY `gymlog-react/src/components/CircuitView.jsx`:
       - Implement the same scroll tracking and conditional sticky rest banner rendering below the circuit view header (directly under the circuit sticky header, matching PlanView).

    4. AUDIT: Generate `/audit_log_R64.md` in the workspace root detailing sticky timer updates.
    5. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to verify compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
