# README Entry Log — workout_tracker

This is a quick reference for what's in the folder and what's active vs archived.

---

## Files

| File | Status | Notes |
|---|---|---|
| `index.html` | ✅ Active | The main landing page for everything. |
| `personal-gym-log.html` | ✅ Active (v3) | GYM LOG PRO. Powered by gym-core.js. Synced roster. |
| `workout-builder-pro.html` | ✅ Active (PRO) | THE NEON PRO. Powered by gym-core.js. Includes Detailed History. |
| `workout-builder-v2.html` | ✅ Active (BETA) | Based on V3 logic. Experimental stuff goes here first. |
| `workout-builder.html` | ✅ Active (Legacy) | BUILDER CLASSIC. Light themed original. |
| `Combined_AppScript_v2.gs` | ✅ Active | Unified backend. Handles Best Rec recalculations on the fly. |
| `gymlog-ultimate.html` | ✅ Active | ULTIMATE EDITION. Powered by gym-core.js. Unified Roster/History. |
| `gymlog-ultimate-beta.html` | 🧪 Beta | Testing architectural split and core logic separation. |
| `files/` | 📦 Archive | Old versions kept for safekeeping. |

---

## Latest Tweaks to the Builder (Pro/Beta)

- **Dark Mode**: Unified the builder with the "Pro" look from the main tracker. Much easier on the eyes at the gym.
- **Persistent Machines**: If you type a new machine in the swap menu, it actually saves to GymLog_Exercises sheet now. 
- **Neon UI**: Added orange outlines and "Person Blocks" for you and your Dad so the data doesn't get mixed up when you're tired mid-set.
- **Sync Logic**: Confirmed the Best tab on sheets updates instantly when you log or delete stuff. No more waiting for the sheet to "catch up".
- **Workout Number Sync**: Added Phase 1 & 2 sync. Your workout number (#117, etc.) now saves to a new "GymLog_Settings" tab on the sheet. The **Spreadsheet is the Source of Truth**; the app follows the cloud value on load, allowing for manual resets in the sheet.

---

## The Roadmap (Upcoming Features)

- **History View**: ✅ COMPLETED. Detailed history drawer with notes and rep ranges integrated into the builder.
- **Edit/Delete History**: Adding the ability to fix a typo or delete a set directly from the builder.
- **Push/Pull Swap**: A manual toggle in the header so you can switch your routine on the fly if you aren't doing the suggested workout.

---

## Notes

- Apps Script backend is now versioned (v2) — handles the new "one row per person" Best Record schema.
- If the builder feels slow, check the SCRIPT_URL in settings.
- The orange neon design is the new "Pro" standard.
- Pretty straightforward from here on out.
