# TASK-QA-R119: Pre-Merge Validation for Program & Device-Owner Data Scoping

## Task Overview
- **Task ID:** TASK-QA-R119
- **Feature Branch:** `feature/TASK-R119-session-stats-isolation`
- **Target File:** `gymlog-react/src/components/SessionStatsModal.jsx`
- **Auditor Role:** QA_Engineer

---

## Verification Checklist

### 1. Program Isolation (TC-1)
- Verify `useLocation()` from `react-router-dom` (or explicit `program` prop) correctly identifies the active program:
  - Route `/circuit` -> Program `'Circuit'`
  - Route `/full-body` -> Program `'Full Body'`
  - Route `/plan`, `/lift`, or default -> Program `'Plan'`
- Verify session matching strictly checks `(session.program || 'Plan').toLowerCase() === activeProgram.toLowerCase()`.

### 2. Solo Device Owner Scoping (TC-2)
- When no external partners are active on the roster (`isSolo` is true):
  - Verify that sessions are included if `session.people` is empty, `'Solo'`, matches `deviceOwner`, or matches `${deviceOwner} (solo)`.
  - Verify sessions belonging specifically to other individuals or guest workouts are strictly excluded.

### 3. Partner Group Scoping (TC-3)
- When partner(s) are active on the workout roster (e.g., `['Brian', 'Dad']`):
  - Verify `activeList.every(person => pLower.includes(person.toLowerCase()))` correctly filters sessions containing all active participants.

### 4. Scoped Statistics & Averages Isolation (TC-4)
- Verify `stats` (bracket counts, bracket avgMinutes, totalSessions, overallAvgMinutes) is computed strictly from `scopedSessions`.
- Confirm that fast Circuit sessions do NOT leak into Plan averages, and other user sessions do NOT skew the device owner's statistics.

### 5. Rep-Range Drill-Down Integration (TC-5)
- Verify `filteredSessions` applies `selectedRepRange` (`'1-3'`, `'4-7'`, `'8-12'`, `'13+'`) on top of `scopedSessions`.
- Verify toggling rep-range cards filters within the active program/user subset, and toggling off restores the full scoped session history.

### 6. UI Scope Badge & Empty States (TC-6)
- Verify the header displays the scope badge: `🎯 {activeProgram} • {scopeParticipant}`.
- Verify empty states when `scopedSessions.length === 0`:
  - Displays `"No completed [Program] workouts recorded yet for [Participant]."`
- Verify empty state when `filteredSessions.length === 0`:
  - Displays `"No [Program] sessions found for this rep range."`

### 7. Session Deletion Integrity (TC-7)
- Verify the trash can delete button (`deleteSession(session.id)`) remains fully functional and intact on filtered session rows.

### 8. Production Compilation & Build Integrity (TC-8)
- Verify `cmd /c npm run build` inside `gymlog-react` executes cleanly with exit code 0.

---

## Submission Protocol
The QA Engineer MUST execute build verification and output their report strictly within `<AUDIT_SUBMISSION>` XML tags with status `QA_PREMERGE_PASS`.
