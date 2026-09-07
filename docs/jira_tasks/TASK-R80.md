# TASK-R80: Implement Full Body Workout Program

> **For Human Readers:** This task creates the new "FULL BODY" workout program (incorporating all 8 core exercise categories in every workout with an independent 16-day progression cycle and dedicated navigation tab).

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
    - TARGET_BRANCH: `TASK-R80`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Create `gymlog-react/src/components/FullBodyView.jsx` with an 8-category comprehensive workout generator:
       - Categories in order: Explosive, Knee Dominant, Hip Dominant, Vertical Push, Horizontal Push, Vertical Pull, Horizontal Pull, Core (Rotational/Plank).
       - Location filtering using `matchesLocation` with 2-tier fallback.
       - Independent 16-day rep range cycle: Days 1-4: 8-12, Days 5-8: 1-3, Days 9-12: 13+, Days 13-16: 4-7.
       - Independent rotation tracking via `gymlog_fullBody_rotation_[Category]`.
       - Integrated Sticky Rest Banner, timer synchronization, Settings/Help drawers, Accordion/Card list, and Bonus Accessory Block.
       - Workout completion screen with "START NEXT WORKOUT" that increments the day and category rotation indexes.
    2. Update `gymlog-react/src/context/AppContext.jsx`:
       - Add `fullBodyWorkoutDay`, `updateFullBodyWorkoutDay`, `fullBodySwaps`, and `swapFullBodyExercise`.
    3. Update `gymlog-react/src/components/Header.jsx`:
       - Add `<NavLink to="/full-body">FULL BODY</NavLink>` in the navigation bar.
    4. Update `gymlog-react/src/App.jsx`:
       - Add route `<Route path="/full-body" element={<FullBodyView />} />`.
  </OBJECTIVE>
  <RESOURCES>
    - Plan View reference: `gymlog-react/src/components/PlanView.jsx`
    - App Context: `gymlog-react/src/context/AppContext.jsx`
    - Header: `gymlog-react/src/components/Header.jsx`
    - App: `gymlog-react/src/App.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/PlanView.jsx`, `gymlog-react/src/components/Header.jsx`, and `gymlog-react/src/App.jsx`.

    2. MODIFY `gymlog-react/src/context/AppContext.jsx`:
       - Add state `fullBodyWorkoutDay` (defaults to 1, cached in `gymlog_fullBody_workoutDay`).
       - Add `updateFullBodyWorkoutDay(day)` helper.
       - Add state `fullBodySwaps` (cached in `gymlog_fullBody_swaps`) and `swapFullBodyExercise(day, originalKey, targetName)`.
       - Expose `fullBodyWorkoutDay`, `updateFullBodyWorkoutDay`, `fullBodySwaps`, and `swapFullBodyExercise` in `contextValue`.

    3. CREATE `gymlog-react/src/components/FullBodyView.jsx`:
       - Mirror the robust patterns from `PlanView.jsx` (accordion/card view, location dropdown, timer trigger, completion flow).
       - Implement `plannedExercises` picking the 8 categories:
         `pick(['Explosive'])`
         `pick(['Knee Dominant'])`
         `pick(['Hip Dominant'])`
         `pick(['Vertical Push'])`
         `pick(['Horizontal Push'])`
         `pick(['Vertical Pull'])`
         `pick(['Horizontal Pull'])`
         `pick(['Rotational Core', 'Plank Core'])`
       - Use rotation prefix `gymlog_fullBody_rotation_` to keep rotation indices isolated from the 5-exercise Plan.
       - Include `<StickyRestBanner />` and pass `onLogSet` to cards.
       - Include `<AccessoryBlock />` for optional bonus exercises.

    4. MODIFY `gymlog-react/src/components/Header.jsx`:
       - Add `<NavLink to="/full-body" className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}>FULL BODY</NavLink>` between PLAN and LIFT.

    5. MODIFY `gymlog-react/src/App.jsx`:
       - Import `FullBodyView` from `./components/FullBodyView`.
       - Add `<Route path="/full-body" element={<FullBodyView />} />`.

    6. AUDIT: Generate `/audit_log_R80.md` detailing the Full Body program architecture and components.
    7. VERIFY: Run `npm run build` (via `cmd /c` inside `gymlog-react`) to ensure clean compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
