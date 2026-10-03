# TASK-QA-R100: Pre-Merge Verification & Index-Safe Sync Validation

## 1. Scope of Audit
This QA protocol verifies the complete implementation of [TASK-R100.md](file:///C:/Users/wance/Documents/Git/workout-program/docs/jira_tasks/TASK-R100.md):
- **Index-Safe Deletion**: Deleting from a list of historical entries uses explicit index `targetIndex` to splice the exact clicked set from local state without fallback to index 0.
- **Exact-Second Precision**: Timestamps retain exact seconds in `formatLogDate` and across Apps Script history.
- **Set # Multi-Factor Matching**: Deletions buffer and match on `setNum` in addition to `date`, `person`, `exercise`, `reps`, and `weight`.
- **Server-First Workout Day**: `updateDeviceOwner` prioritizes server settings over `planCached`.
- **Clean ISO Session IDs**: `saveCompletedSession` produces slash-free IDs (`Plan_Test_YYYY-MM-DD_dayN`).
- **Build & Lint Cleanliness**: `npm run build` and `npx eslint src/` verify with 0 errors.

---

## 2. Automated Test Checklist
- [x] **Vite Build**: `npm run build` completed with code 0 (0 errors).
- [x] **ESLint**: `npx eslint src/` completed with 0 errors.

---

## 3. QA Pre-Merge Checklist
1. [ ] **Index Targeting**: In a card with 2 historical entries sharing a minute timestamp, clicking delete on the second entry removes the second entry from UI and buffers its exact timestamp + Set #.
2. [ ] **Timestamp Display**: Recent History timestamps show full seconds (e.g. `Yesterday, 3:33:05 PM`).
3. [ ] **Atomic Backend Deletion**: Tapping Complete Workout sends `deletes` payload; Apps Script deletes only the targeted row from `GymLog_History`.
4. [ ] **Session ID Format**: `GymLog_Sessions` row is recorded with clean ISO date format without slashes.
5. [ ] **Workout Day Priority**: Switching users in Settings immediately reflects the workout day from `GymLog_Settings`.

---

## 4. Status
- Ready for QA Pre-Merge Verification.
