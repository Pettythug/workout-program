# README Entry Log — workout_tracker

dont worry about formatting this too much, its just a quick reference for whats in the folder

---

## Files

| File | Status | Notes |
|---|---|---|
| `gym-log.html` | ✅ Active (legacy) | Original gym log. Brian & Dad hardcoded. Keep as fallback. |
| `personal-gym-log.html` | ✅ Active (v2) | New version. Dynamic people, timed exercises, 13+ rep range. |
| `workout-builder.html` | ✅ Active | Workout plan builder — separate tool |
| `index.html` | ✅ Active | Landing page / nav |
| `Combined_AppScript.gs` | ✅ Active | Unified Google Apps Script backend |
| `Workout_Builder.gs` | ✅ Active | Apps Script for workout builder |
| `GymLog_Best_import.tsv` | 📦 Archive | Imported best results data |
| `GymLog_History_import.tsv` | 📦 Archive | Imported history data |
| `files/` | 📦 Archive | Old versions kept for reference |

---

## Whats Changed in personal-gym-log.html (v2)

- rep range 15-20 replaced with 13+ (old entries auto-migrate on load)
- timed exercises: flag any exercise as REPS or TIME when adding it
  - duration entered as mm:ss or plain seconds (90 becomes 1:30 automatically)
  - timed entries slot into the 13+ bucket
  - best = longest hold, not heaviest weight
- people roster is now dynamic — add or remove from the settings screen (gear icon)
- defaults to Brian and Dad but can be changed on either device
- settings screen: tap gear icon in header to manage people
- cross device: both phones point to same sheets URL, sheets is the source of truth
- people roster also syncs to sheets so both devices see the same list after refresh

---

## Notes

- apps script backend (Combined_AppScript.gs) needs minor update to support:
  - savePeople / getPeople actions (people roster)
  - timed flag on exercises
  - duration field in logSet entries
  - these are backwards compatible — old data still works

