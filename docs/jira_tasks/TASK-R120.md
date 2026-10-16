# TASK-R120: Fix SessionStatsModal Mobile Scrolling, Layout Cutoff & Compact 4-Session Default with View All Toggle

## Overview
On mobile devices (such as Samsung Galaxy Note 10 Lite, 412x915 / 360x740 viewports), opening the **WORKOUT TIME & AVERAGES** modal (`SessionStatsModal.jsx`) causes a severe layout and ergonomics collision:
1. The modal header, summary bar, and 4 rep range average cards take up ~420px of vertical space.
2. Rendering the entire unconstrained history (20+ workouts) stretches the modal excessively, forcing users to scroll all the way to the bottom just to click the `CLOSE` button.
3. The inner session list container had `overflowY: 'auto'` with `overscrollBehavior: 'contain'`, trapping touch events and squishing content behind the `CLOSE` button.

This task resolves the layout collision, establishes smooth mobile momentum scrolling, and implements a **compact default view of 4 workouts** with a **`VIEW ALL (X workouts)` / `SHOW LESS`** toggle. This guarantees that on mobile screens, the entire modal fits cleanly on one screen with the `CLOSE` button immediately visible.

---

## Technical Context & Requirements

### Target File
- `gymlog-react/src/components/SessionStatsModal.jsx`

### Required Changes

1. **Modal Container Smooth Scrolling:**
   - Retain `maxHeight: '90vh'`, `overflowY: 'auto'`, `overflowX: 'hidden'`, and `WebkitOverflowScrolling: 'touch'` on the `#111` dialog wrapper.

2. **Compact 4-Session Default with Progressive Expansion:**
   - Add state: `const [isSessionsExpanded, setIsSessionsExpanded] = useState(false);`
   - When rendering `filteredSessions`:
     - If collapsed (`!isSessionsExpanded`): Render only the first **4** sessions (`filteredSessions.slice(0, 4)`).
     - If expanded (`isSessionsExpanded`): Render all `filteredSessions`.
   - If `filteredSessions.length > 4`:
     - Render an expansion toggle button below the list:
       - Collapsed label: `▼ VIEW ALL (${filteredSessions.length} WORKOUTS)`
       - Expanded label: `▲ SHOW LESS`
     - Styled cleanly with `fontFamily: 'var(--mono)'`, `color: 'var(--accent)'`, `border: '1px dashed var(--border)'`.
   - When changing the active rep range filter (`selectedRepRange`), reset `setIsSessionsExpanded(false)` so filtered views default to compact.

3. **Eliminate Nested Scroll Trap & Content Squishing:**
   - In the Recent Completed Workouts section:
     - Remove `flex: 1` and `minHeight: 0` from outer container.
     - Remove `maxHeight: 380`, `overflowY: 'auto'`, and `overscrollBehavior: 'contain'` from the session list.

4. **Footer Action Clean Placement:**
   - Ensure the footer container has `flexShrink: 0`, `marginTop: 12`, `paddingTop: 12`, and `borderTop: '1px solid var(--border)'`.
   - The `CLOSE` button sits cleanly below the toggle/list and is immediately reachable without scrolling when collapsed.

---

## Detailed Acceptance Criteria

1. **One-Screen Mobile Fit:** On initial open, the modal header, summary, 4 rep range cards, first 4 completed workouts, and the `CLOSE` button fit within a standard mobile screen height (~650px) without requiring scrolling.
2. **View All Toggle:** If more than 4 workouts exist, clicking `VIEW ALL` smoothly expands all workouts. Clicking `SHOW LESS` collapses back to 4.
3. **Rep Range Filter Integration:** When clicking any rep range card (e.g. `13+ Reps`), the filtered list displays up to 4 sessions by default, with `VIEW ALL` if more than 4 match.
4. **Touch Scrolling:** When expanded, the entire modal scrolls smoothly with native mobile momentum.
5. **Build Integrity:** `cmd /c npm run build` inside `gymlog-react` passes with exit code 0.

---

## Instructions for Developer
1. Write all notes, modified files, and build evidence directly into this ticket (`docs/jira_tasks/TASK-R120.md`).
2. Respond in chat strictly using the 5-line `<AUDIT_SUBMISSION>` XML format.

---

## Developer Execution Notes

### Implementation Summary
- **Target File**: `gymlog-react/src/components/SessionStatsModal.jsx`
- **Compact 4-Session Default & View All Toggle**:
  - Added `isSessionsExpanded` boolean state defaulted to `false`.
  - Added `displayedSessions` memoized slice: returns first 4 workouts when collapsed (`filteredSessions.slice(0, 4)`) or all workouts when expanded.
  - Automatically resets `isSessionsExpanded` to `false` whenever `selectedRepRange` changes or when the modal closes, ensuring compact view on new filter selections.
  - Added toggle button below the workout list when `filteredSessions.length > 4`:
    - Collapsed: `▼ VIEW ALL (${filteredSessions.length} WORKOUTS)`
    - Expanded: `▲ SHOW LESS`
    - Styled with `fontFamily: 'var(--mono)'`, `color: 'var(--accent)'`, `border: '1px dashed var(--border)'`, and subtle hover background transition.
- **Unified Mobile Momentum Scrolling & Clean Layout**:
  - Retained `WebkitOverflowScrolling: 'touch'`, `maxHeight: '90vh'`, `overflowY: 'auto'`, and `overflowX: 'hidden'` on the `#111` card dialog.
  - Removed nested scroll traps and artificial container constraints (`flex: 1`, `minHeight: 0`, `maxHeight: 380`, `overflowY: 'auto'`, `overscrollBehavior: 'contain'`).
  - Retained clean footer action container with `flexShrink: 0`, `marginTop: 12`, `paddingTop: 12`, and `borderTop: '1px solid var(--border)'`.
  - In collapsed state, the header, summary, rep range cards, first 4 workouts, and `CLOSE` button fit within standard mobile viewports (~650px) without scrolling.

### Modified Files
- `gymlog-react/src/components/SessionStatsModal.jsx`

### Build Verification Evidence
- Command: `cmd /c npm run build` (cwd: `gymlog-react`)
- Result: Exit code 0
```
> gymlog-react@0.0.0 build
> vite build

vite v8.0.14 building client environment for production...
transforming...✓ 46 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.82 kB │ gzip:   0.41 kB
dist/assets/index-TD8YCF3i.css    4.60 kB │ gzip:   1.59 kB
dist/assets/index-Dmq7vyd2.js   450.54 kB │ gzip: 119.10 kB

✓ built in 2.21s
```

