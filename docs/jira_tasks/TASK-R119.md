# TASK-R119: Program & Device-Owner Data Scoping in Workout Time & Averages Modal

## Overview
In `SessionStatsModal.jsx`, `sessionHistory` is currently consumed as a global, unfiltered array. This leads to two major statistical issues:
1. **User / Participant Commingling:** Workouts completed by other users, guests, or historical roster members commingle with the primary device owner's records.
2. **Program Mode Commingling:** Fast-turnover workouts from `Circuit` mode (e.g., 20–30 minutes) are commingled with `Plan` and `Full Body` hypertrophy/strength sessions (e.g., 45–60 minutes), distorting average completion times and rep-range bracket statistics.

This task scopes `SessionStatsModal` calculations and the "Recent Completed Workouts" list strictly to the **active program** and **active participant(s)** (defaulting to `deviceOwner`).

---

## Technical Context & Requirements

1. **Active Program Detection:**
   - Detect the current program context in `SessionStatsModal.jsx`.
   - Use `useLocation()` from `react-router-dom` to inspect `location.pathname`:
     - `/circuit` -> `'Circuit'`
     - `/full-body` -> `'Full Body'`
     - `/plan` or `/lift` or default -> `'Plan'`
   - Also allow an optional prop `program` (e.g. `<SessionStatsModal program="Circuit" ... />`) if explicitly provided, falling back to path detection.
   - Match sessions where `(s.program || 'Plan').toLowerCase() === currentProgram.toLowerCase()`.

2. **Device Owner & Active Participant Scoping:**
   - From `useAppContext()`, obtain `deviceOwner` (defaulting to `'Brian'` or `'User'`) and `activePeople` (or `people` roster where `person.active === true`).
   - If only the device owner is active (or `activePeople` length <= 1 / no extra partners selected):
     - The target user is `deviceOwner`.
     - Filter sessions to those matching `deviceOwner` (or `'Solo'`, or undefined/empty people field which denotes solo device owner).
     - Exclude sessions specifically logged under other individuals or groups that do not belong to the device owner.
   - If workout partners are actively checked on the roster (e.g. `['Brian', 'Dad']`):
     - Automatically include sessions matching that active group (e.g. `session.people` containing the active participants).

3. **Scoped Statistics & Rep Range Calculation:**
   - Derive `scopedSessions` by applying both the program filter and participant filter to `sessionHistory`.
   - Update `stats` computation (`getRepRangeStats` or inline bracket reducer) to calculate total workouts, average minutes, and bracket counts strictly from `scopedSessions`.
   - Ensure the 4 interactive rep-range cards (`1-3`, `4-7`, `8-12`, `13+`) drill down within `scopedSessions` to produce `filteredSessions`.

4. **UI Scope Indicator:**
   - In the modal header or under the subtitle, provide a clean badge or text indicator reflecting the active scope:
     - e.g. `Plan • Brian (Solo)` or `Circuit • Brian & Dad`
   - This gives the user instant visual confirmation of why their averages and history match their current workout session.

5. **Empty State & Outlier Management:**
   - If no sessions exist for the current program/participant combination, display a clean empty state: `"No completed [Program] workouts recorded yet for [Participant]."`
   - Maintain the existing trash can delete button (`deleteSession(session.id)`) on filtered session rows so outliers can still be removed.

---

## Detailed Acceptance Criteria

1. **Program Scoping:**
   - Opening the stats modal from `Plan` mode displays only `Plan` sessions and averages.
   - Opening the stats modal from `Circuit` mode displays only `Circuit` sessions and averages.
   - Opening from `Full Body` mode displays only `Full Body` sessions and averages.
2. **Participant Scoping:**
   - Defaults cleanly to `deviceOwner` (e.g. Brian). Guest or other individual workouts do not pollute the averages.
   - If a partner is active on the roster, the modal seamlessly reflects the partner/group sessions.
3. **Rep Range Cards & List Drill-Down:**
   - Tapping `1-3`, `4-7`, `8-12`, `13+` filters only within the scoped program/user sessions.
   - Tapping again clears the rep range filter back to all sessions for the active program/user.
4. **Build Verification:**
   - `npm run build` passes with zero errors or warnings.

---

## Target Files
- `gymlog-react/src/components/SessionStatsModal.jsx`
