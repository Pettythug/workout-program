# README Entry Log — workout_tracker

This is a quick reference for what's in the folder and what's active vs archived.

---

## Files

| File | Status | Notes |
|---|---|---|
| `index.html` | ✅ Active | The main landing page. Unified hub for all Pro apps. |
| `gym-log-pro.html` | ✅ Active | GYM LOG PRO (Renamed from v3). Powered by gym-core.js. |
| `workout-builder-pro.html` | ✅ Active | WORKOUT BUILDER PRO. Powered by gym-core.js. Detailed History. |
| `gymlog-ultimate.html` | ✅ Active | ULTIMATE EDITION. The gold standard. Fully synchronized with core. |
| `gym-core.js` | ✅ Active | THE BRAIN. Centralized logic for all apps. |
| `archive/` | 📦 Archive | Legacy versions and one-time import files (moved from root). |

---

- **Smart Card Pro Layout**: Migrated all apps to the vertical info stack (Category -> Name -> Maxes) for a cleaner, high-info design.
- **Cross-Tab Parity**: Standardized Smart Card toggles across both the LIFT and PLAN tabs in GymLog Ultimate.
- **Workout Builder Pro**: Fully integrated variation switching and batch creation while maintaining its original routine-building speed.
- **History Integrity**: Unified `getBaseName` logic ensures variations contribute correctly to standardized personal bests.

---

## Notes

- Apps Script backend is now versioned (v2) — handles the new "one row per person" Best Record schema.
- All "Pro" apps use the same orange neon aesthetic.
- The spreadsheet remains the Source of Truth for all data.
- pretty straight forward.
