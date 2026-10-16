# TASK-R116: Interactive Rep Range Drill-Down in Workout Time & Averages Modal

## Overview
In `SessionStatsModal.jsx`, the user views average completion times partitioned across four rep ranges (`1–3 Reps`, `4–7 Reps`, `8–12 Reps`, and `13+ Reps`). Currently, if an erroneous session (e.g., an accidental 9-minute workout) skews an average, the user cannot easily isolate which session caused the skew because the session list below shows all past workouts together.

This task makes the 4 rep range cards interactive filter toggles. Clicking a card highlights it and filters the "Recent Completed Workouts" list to only display sessions from that specific rep range, enabling the user to immediately identify and delete outlier sessions.

---

## Technical Context & Requirements

1. **Active Rep Range Filter State:**
   - In `SessionStatsModal.jsx`, introduce a state variable `selectedRepRange` (e.g. `null` or `'ALL'` by default).
   - When a user taps one of the 4 rep range bracket cards:
     - If the tapped card is already selected, clicking it again can deselect it (resetting to show all sessions), OR set it active.
     - Add visual feedback: A distinct border (e.g. 2px solid with the bracket's accent color) or subtle glow when active.

2. **Session List Filtering:**
   - Filter `sessionHistory` so that if `selectedRepRange` is active, only sessions matching that rep range bracket are displayed in the list below.
   - Matching logic:
     - `'1-3'`: matches `s.repRange` containing `'1-3'`
     - `'4-7'`: matches `s.repRange` containing `'4-7'`
     - `'8-12'`: matches `s.repRange` containing `'8-12'`
     - `'13+'`: matches `s.repRange` containing `'13'` or `'13+'`
   - If no sessions exist for the selected bracket, display a clean empty message: `"No sessions found for this rep range."`
   - Include a small clear-filter button or chip above the list when filtered (e.g. `Showing 13+ Reps (X sessions) [✕ Clear Filter]`).

3. **Delete Functionality Integrity:**
   - Retain the existing trash can delete button (`deleteSession(session.id)`) on each session row so the user can delete any outlier session directly from the filtered view.

4. **Styling & Touch Standards:**
   - Ensure the cards have `cursor: 'pointer'`, `transition: 'all 0.2s ease'`, and accessible active state indicators that match the dark theme and existing design tokens.

---

## Detailed Acceptance Criteria

1. **Interactive Toggle:**
   - Clicking any of the 4 rep range cards (`1–3`, `4–7`, `8–12`, `13+`) toggles filtering for that specific rep range.
   - The selected card displays a clear active visual indicator.
2. **List Filtering:**
   - The session list below dynamically updates to show only the matching sessions for that bracket.
   - The existing delete action works seamlessly on the filtered rows.
   - A clear filter action resets the list back to showing all workouts.
3. **Build Verification:**
   - `npm run build` passes with zero errors or warnings.

---

## Target Files
- `gymlog-react/src/components/SessionStatsModal.jsx`
