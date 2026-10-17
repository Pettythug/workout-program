# TASK-R118: Expandable Exercise History with 9-Set Default, Rep Range Filter Pills & View All Toggle

## Overview
Currently, in both `ExerciseCard.jsx` and `CircuitCard.jsx`, the **RECENT HISTORY** section hardcodes `.slice(0, 5)`, displaying only the last 5 sets ever logged for an exercise.
This arbitrary 5-set cutoff creates three user problems:
1. It cuts off full 3-workout progressions (a standard 3-set routine across 3 workouts requires 9 sets).
2. It prevents lifters from comparing their performance across rep ranges (e.g. comparing how a `360 lbs x 7` performance on a `4-7` strength day compares to an upcoming `8-12` hypertrophy attempt).
3. It hides older history without providing an easy in-app way to view past achievements.

This task expands the history drawer across `ExerciseCard.jsx` and `CircuitCard.jsx` with a default 9-set view, interactive rep range filter pills (`ALL | 1-3 | 4-7 | 8-12 | 13+`), and a smooth `VIEW ALL (X sets)` / `SHOW LESS` toggle.

---

## Technical Context & Requirements

### 1. Target Files
- `gymlog-react/src/components/ExerciseCard.jsx`
- `gymlog-react/src/components/CircuitCard.jsx`

### 2. State & Filtering Architecture
In both components:
- Add local state for the active rep range filter:
  `const [historyFilter, setHistoryFilter] = useState('ALL');`
- Add local state for the expansion toggle:
  `const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);`
- When `historyFilter` changes, reset `isHistoryExpanded(false)`.
- Implement a robust matcher function for history entries:
  - Rep range values in `h.range` can exist as `'r1_3'`, `'1-3'`, `'r4_7'`, `'4-7'`, `'r8_12'`, `'8-12'`, `'r13_plus'`, `'13+'`, `'13_plus'`, or `'r15_20'`.
  - Logic:
    - `'ALL'`: returns `true`.
    - `'1-3'`: matches `'r1_3'`, `'1-3'`, or rep counts `1..3`.
    - `'4-7'`: matches `'r4_7'`, `'4-7'`, or rep counts `4..7`.
    - `'8-12'`: matches `'r8_12'`, `'8-12'`, or rep counts `8..12`.
    - `'13+'`: matches `'r13_plus'`, `'13+'`, `'13_plus'`, `'r15_20'`, or rep counts `>= 13`.
- Retain set deletion safety by mapping original index before filtering:
  `ex.history.map((h, i) => ({ h, i })).filter(...)` so `handleDeleteHistory(h, i)` receives the exact original index in `ex.history`.

### 3. UI & Layout Requirements
- **Rep Range Filter Pills:**
  - Render a horizontal row of filter pills right below the `RECENT HISTORY` header.
  - Options: `ALL | 1-3 | 4-7 | 8-12 | 13+`.
  - Styled with CSS variables (`var(--border)`, `var(--accent)`, `var(--muted)`), consistent with GymLog design tokens.
  - Active pill is visually distinct (e.g., accent background with dark text or accent border).
- **Default 9-Set Display:**
  - When collapsed (`!isHistoryExpanded`), render up to **9** matching sets (`.slice(0, 9)`).
- **View All / Show Less Toggle:**
  - If the filtered history contains more than 9 sets:
    - When collapsed: Show button `▼ VIEW ALL (${filteredCount} sets)`.
    - When expanded: Show button `▲ SHOW LESS`.
  - When expanded, wrap the history list in a container with `maxHeight: 360px`, `overflowY: 'auto'`, and `WebkitOverflowScrolling: 'touch'`.
- **Empty State:**
  - If no sets match the active filter, display: `"No entries for this rep range"`.
- **Set Deletion:**
  - Retain the existing `🗑` trash button on each entry, passing the original `i` index to `handleDeleteHistory(h, i)`.

---

## Detailed Acceptance Criteria

1. **Default 9 Sets:** Opening any exercise's History tab displays up to 9 recent sets (instead of 5).
2. **Filter Pills:** Clicking `1-3`, `4-7`, `8-12`, `13+`, or `ALL` immediately filters the history in-memory with zero network calls.
3. **View All Toggle:** If more than 9 sets exist for the active filter, clicking `VIEW ALL` displays the full list in a scrollable container (`maxHeight: 360px`). Clicking `SHOW LESS` collapses back to 9 sets.
4. **Delete Safety:** Deleting a history entry works correctly whether filtered or unfiltered, targeting the exact historical entry index.
5. **Component Parity:** Both `ExerciseCard.jsx` (Plan & Full Body views) and `CircuitCard.jsx` (Circuit view) implement identical behavior.
6. **Build Integrity:** `cmd /c npm run build` inside `gymlog-react` passes with exit code 0 and zero lint/compiler errors.

---

## Instructions for Developer
1. Write all notes, modified files, and build evidence directly into this ticket (`docs/jira_tasks/TASK-R118.md`).
2. Respond in chat strictly using the 5-line `<AUDIT_SUBMISSION>` XML format.

---

## Developer Execution Notes

### Implementation Summary
- **Target Files**:
  - `gymlog-react/src/components/ExerciseCard.jsx`
  - `gymlog-react/src/components/CircuitCard.jsx`
- **State & Filtering Architecture**:
  - Added `matchesRepRange(h, filter)` matcher function supporting `ALL`, `1-3` (matching `r1_3`, `1-3`, reps 1..3), `4-7` (matching `r4_7`, `4-7`, reps 4..7), `8-12` (matching `r8_12`, `8-12`, reps 8..12), and `13+` (matching `r13_plus`, `13+`, `13_plus`, `r15_20`, reps >= 13).
  - Added local state in both components: `const [historyFilter, setHistoryFilter] = useState('ALL')` and `const [isHistoryExpanded, setIsHistoryExpanded] = useState(false)`.
  - Automatically reset `isHistoryExpanded(false)` upon selecting any filter pill.
  - Retained set deletion safety by mapping original index before filtering: `ex.history.map((h, i) => ({ h, i })).filter(...)` so `handleDeleteHistory(h, i)` receives the exact original index in `ex.history`.
- **UI & Layout**:
  - Rendered horizontal filter pills (`ALL | 1-3 | 4-7 | 8-12 | 13+`) styled with CSS variables (`var(--accent)`, `var(--border)`, `var(--muted)`), with active pill highlighting.
  - Implemented default 9-set display via `.slice(0, 9)` when collapsed.
  - Implemented `▼ VIEW ALL (${filteredHistory.length} sets)` / `▲ SHOW LESS` toggle when filtered sets > 9, wrapping expanded view in `maxHeight: '360px'`, `overflowY: 'auto'`, and `WebkitOverflowScrolling: 'touch'`.
  - Added empty state messaging: `"No entries for this rep range"` when filter matches no sets, or `"No entries yet"` if no sets exist overall on `'ALL'`.
- **Component Parity**:
  - Identical logic, styling, and behavior implemented across `ExerciseCard.jsx` (Plan & Full Body views) and `CircuitCard.jsx` (Circuit view).

### Modified Files
- `gymlog-react/src/components/ExerciseCard.jsx`
- `gymlog-react/src/components/CircuitCard.jsx`

### Build Verification Evidence
- Command: `cmd /c npm run build` (cwd: `gymlog-react`)
- Result: Exit code 0
```
> gymlog-react@0.0.0 build
> vite build

vite v8.1.0 building client environment for production...
transforming...✓ 42 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.82 kB │ gzip:   0.41 kB
dist/assets/index-TD8YCF3i.css    4.60 kB │ gzip:   1.59 kB
dist/assets/index-DhEmxLgl.js   454.54 kB │ gzip: 120.41 kB
✓ built in 3.80s
```
