# TASK-QA-R100: Pre-Merge Verification & Exact-Second Sync Testing

## 1. Scope of Audit
This QA protocol verifies the implementation of [TASK-R100.md](file:///C:/Users/wance/Documents/Git/workout-program/docs/jira_tasks/TASK-R100.md):
- Exact-second timestamp preservation and matching.
- Set number (`setNum`) matching in deletion buffers.
- Server-first workout day synchronization in `AppContext.jsx`.
- Clean ISO session IDs (`YYYY-MM-DD`) without slashes.
- Build and ESLint clean pass.

---

## 2. Automated Test Checks
- [x] **Vite Build**: `npm run build` completed with code 0 (0 errors).
- [x] **ESLint**: `npx eslint src/` completed with 0 errors.

---

## 3. Manual Live Testing Checklist
1. **Timestamp Precision Display**:
   - In Recent History cards, confirm timestamps show seconds (e.g. `Yesterday, 3:33:05 PM`).
2. **Instant Local Deletion**:
   - Tapping the 🗑️ trash icon removes the target set immediately in 0ms with zero PIN prompts.
3. **Atomic Backend Deletion**:
   - Tapping **COMPLETE WORKOUT** sends `deletes` payload.
   - The exact targeted row in `GymLog_History` is deleted from Google Sheets matching on exact seconds and `Set #`.
4. **Session ID Formatting**:
   - `GymLog_Sessions` row is appended with clean ID: `Plan_Test_YYYY-MM-DD_dayN` (no slashes).
5. **Workout Day Priority**:
   - Switching `Device Owner` in Settings updates the active workout day from the server settings.

---

## 4. Verdict
- Pre-Merge Validation: **READY FOR LIVE USER TEST & APPROVAL**
