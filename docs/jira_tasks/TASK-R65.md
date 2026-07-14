# TASK-R65: Extract StickyRestBanner into a Shared Component (+ Mobile Positioning Hotfix)

> **For Human Readers:** This task extracts the duplicated sticky rest timer banner JSX into a single reusable `StickyRestBanner.jsx` component AND fixes a discovered bug where `top: 60px` is hardcoded but the actual sticky header is taller on mobile, causing the banner to render behind the header.

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
    - TARGET_BRANCH: `TASK-R65`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Extract the duplicated sticky rest timer banner block from PlanView.jsx and CircuitView.jsx into a new shared component `StickyRestBanner.jsx`. Update both views to import and use it instead.
  </OBJECTIVE>
  <RESOURCES>
    - Plan View: `gymlog-react/src/components/PlanView.jsx`
    - Circuit View: `gymlog-react/src/components/CircuitView.jsx`
    - New Component: `gymlog-react/src/components/StickyRestBanner.jsx` [NEW FILE]
  </RESOURCES>
  <SEQUENCE>
    1. READ `PlanView.jsx` and `CircuitView.jsx` to confirm the exact existing banner block.

    2. CREATE `gymlog-react/src/components/StickyRestBanner.jsx`:
       - The component must consume all required values from `useAppContext()` directly. It must NOT accept props.
       - The component must contain the scroll listener logic internally:
         - `const [showStickyTimer, setShowStickyTimer] = useState(false);`
         - A `useEffect` that binds to `window.scroll` with threshold `window.scrollY > 220` and properly cleans up the listener on unmount.
       - The component must render `null` when `!showStickyTimer || !timerIsRunning || !timerIsCountdown || timerSeconds <= 0`.
       - The component renders the glassmorphism fixed banner div containing the rest time label and the three control buttons (PAUSE/START, +30S, SKIP).
       - The full component template:
         ```jsx
         import { useState, useEffect } from 'react';
         import { useAppContext } from '../context/AppContext';

         export default function StickyRestBanner() {
             const {
                 timerIsRunning, timerIsCountdown, timerSeconds,
                 formatTimerTime, toggleTimer, resetTimer, startRestTimer
             } = useAppContext();

             const [showStickyTimer, setShowStickyTimer] = useState(false);

             useEffect(() => {
                 const handleScroll = () => setShowStickyTimer(window.scrollY > 220);
                 window.addEventListener('scroll', handleScroll);
                 return () => window.removeEventListener('scroll', handleScroll);
             }, []);

             if (!showStickyTimer || !timerIsRunning || !timerIsCountdown || timerSeconds <= 0) return null;

             return (
                 <div style={{
                     position: 'fixed',
                     top: '60px',
                     left: '16px',
                     right: '16px',
                     background: 'rgba(17, 17, 17, 0.9)',
                     backdropFilter: 'blur(8px)',
                     WebkitBackdropFilter: 'blur(8px)',
                     border: '1px solid var(--border)',
                     borderRadius: 'var(--radius)',
                     display: 'flex',
                     justifyContent: 'space-between',
                     alignItems: 'center',
                     padding: '10px 16px',
                     zIndex: 99
                 }}>
                     <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>
                         ⏳ Rest: {formatTimerTime(timerSeconds)}
                     </div>
                     <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                         <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid var(--border)' }} onClick={toggleTimer}>
                             {timerIsRunning ? '⏸️ PAUSE' : '▶️ START'}
                         </button>
                         <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid var(--border)' }} onClick={() => startRestTimer(timerSeconds + 30)}>
                             +30S
                         </button>
                         <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid var(--border)' }} onClick={resetTimer}>
                             SKIP
                         </button>
                     </div>
                 </div>
             );
         }
         ```

    3. MODIFY `gymlog-react/src/components/PlanView.jsx`:
       a. Add the import at the top: `import StickyRestBanner from './StickyRestBanner';`
       b. Remove the `showStickyTimer` state declaration and its associated `useEffect` scroll listener.
       c. Replace the inline banner JSX block (`{showStickyTimer && timerIsRunning && ...}`) with the single self-closing tag: `<StickyRestBanner />`

    4. MODIFY `gymlog-react/src/components/CircuitView.jsx`:
       a. Add the import at the top: `import StickyRestBanner from './StickyRestBanner';`
       b. Remove the `showStickyTimer` state declaration and its associated `useEffect` scroll listener.
       c. Replace the inline banner JSX block with: `<StickyRestBanner />`

    5. HOTFIX `gymlog-react/src/components/StickyRestBanner.jsx` — Mobile Banner Positioning Bug:
       - **Root Cause:** `top: '60px'` is hardcoded. On mobile the sticky header is taller (~100–110px), causing the banner to render behind or clipped under the header.
       - **Fix:** Replace the hardcoded `top: '60px'` with a dynamically measured header height using a `ResizeObserver`.
       - In `StickyRestBanner.jsx`, add the following state and effect:
         ```javascript
         const [headerHeight, setHeaderHeight] = useState(60);

         useEffect(() => {
             const header = document.querySelector('.header');
             if (!header) return;
             const update = () => setHeaderHeight(header.getBoundingClientRect().height);
             update();
             const ro = new ResizeObserver(update);
             ro.observe(header);
             return () => ro.disconnect();
         }, []);
         ```
       - Replace `top: '60px'` in the banner div style with: `top: \`${headerHeight}px\``

    6. AUDIT: Update `/audit_log_R65.md` in the workspace root to include the mobile positioning hotfix.
    7. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to verify compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
