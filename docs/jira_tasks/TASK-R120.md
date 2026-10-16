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
