# TASK-R93: Mobile Viewport Centering & Responsive Header Navigation

> **For Human Readers:** This task fixes the mobile layout shifting/squishing bug where wide header elements forced the mobile document width to blow out beyond 100vw, pushing workout cards to the left with an empty black gap on the right.

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
    - TARGET_BRANCH: `TASK-R93`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Update `gymlog-react/src/components/Header.jsx`:
       - Separate the brand / timer section from the navigation links into distinct flex containers:
         ```jsx
         <div className="header">
             <div className="header-brand">
                 <h1 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                     GymLog
                     <span className={`sync-indicator ${isSyncing ? 'syncing' : 'synced'}`} />
                     {sessionStartTime && (
                         <button ...>?? {elapsedMinutes}m</button>
                     )}
                 </h1>
             </div>
             <nav className="header-nav">
                 <NavLink to="/plan" className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}>PLAN</NavLink>
                 <NavLink to="/full-body" className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}>FULL BODY</NavLink>
                 <NavLink to="/lift" className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}>LIFT</NavLink>
                 <NavLink to="/circuit" className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}>CIRCUIT</NavLink>
             </nav>
         </div>
         ```

    2. Update `gymlog-react/src/index.css`:
       - Enforce viewport boundary constraints:
         ```css
         html, body {
             min-height: 100%;
             background: #0c0c0c;
             overflow-x: hidden;
             width: 100%;
             max-width: 100vw;
         }
         #root {
             width: 100%;
             max-width: 100vw;
             overflow-x: hidden;
         }
         ```
       - Update `.header` and add `.header-brand` and `.header-nav`:
         ```css
         .header {
             background: var(--surface);
             padding: 10px 16px;
             display: flex;
             align-items: center;
             justify-content: space-between;
             gap: 12px;
             max-width: 100%;
             box-sizing: border-box;
         }
         .header-brand {
             flex-shrink: 0;
             display: flex;
             align-items: center;
         }
         .header-nav {
             display: flex;
             align-items: center;
             gap: 4px;
             overflow-x: auto;
             -webkit-overflow-scrolling: touch;
             scrollbar-width: none;
             -ms-overflow-style: none;
             white-space: nowrap;
             flex-shrink: 1;
             min-width: 0;
         }
         .header-nav::-webkit-scrollbar {
             display: none;
         }
         @media (max-width: 480px) {
             .header {
                 padding: 8px 12px;
                 gap: 8px;
             }
             .nav-tab {
                 padding: 6px 8px;
                 font-size: 11px;
             }
         }
         ```
       - Ensure `.main` is centered with `box-sizing: border-box; width: 100%; max-width: 480px; margin: 0 auto;`.

    3. Verification & Audit:
       - Run `npm run build` inside `gymlog-react/` to verify clean compilation with 0 errors.
       - Run `npx eslint src/` to verify 0 `no-undef` errors.
  </OBJECTIVE>
  <RESOURCES>
    - Header: `gymlog-react/src/components/Header.jsx`
    - CSS: `gymlog-react/src/index.css`
  </RESOURCES>
  <SEQUENCE>
    1. READ `docs/jira_tasks/TASK-R93.md`.
    2. MODIFY `Header.jsx` and `index.css`.
    3. RUN `npm run build` and `npx eslint src/` inside `gymlog-react` and verify clean build with 0 errors.
    4. SIGNAL `DEVELOPMENT_TASK_COMPLETE`.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
