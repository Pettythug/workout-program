# README Entry Log — workout_tracker

dont worry about formatting this too much, its just a quick reference for whats in teh folder and whats active vs whats 📦 archived.

---

## Files

| File | Status | Notes |
|---|---|---|
| `index.html` | ✅ Active | Teh main landing page for everything. |
| `personal-gym-log.html` | ✅ Active (v2) | GYM LOG PRO. Dynamic people, timed stuff, dark mode. |
| `workout-builder-pro.html` | ✅ Active (PRO) | THE NEON PRO. Latest approved version with orange outlines and cards. |
| `workout-builder-v2.html` | ✅ Active (BETA) | Based on V3 logic. Experimental stuff goes here first. |
| `workout-builder.html` | ✅ Active (Legacy) | BUILDER CLASSIC. Light themed original. |
| `Combined_AppScript_v2.gs` | ✅ Active | Unified backend. Handles Best Rec recalculations on teh fly. |
| `gym-log.html` | ✅ Active (legacy) | Keep as fallback setup. |
| `files/` | 📦 Archive | Old versions kept for safekeeping |

---

## Latest Tweaks to teh Builder (V2/V3)

- **Dark Mode**: unified teh builder with teh "Pro" look from teh main tracker. Much easier on teh eyes at teh gym.
- **Persistent Machines**: if u type a new machine in teh swap menu, it actually saves to GymLog_Exercises sheet now. V2/V3 both do this.
- **Neon UI (V3)**: added orange outlines and "Person Blocks" for u and ur dad so teh data doesnt get mixed up when ur tired mid-set.
- **Sync Logic**: confirmed teh Best tab on sheets updates instantly when u log or delete stuff. No more waiting for teh sheet to "catch up".

---

## Teh Roadmap (Upcoming stuff)

- **History View**: want to add teh clock icon to teh builder so u can see past lifts for a machine without switching apps.
- **Edit/Delete**: need to add teh ability to fix a typo or delete a set directly from teh builder history list.
- **Merge**: decide if V3 is teh new standard or if we stick with teh simpler V2 look.

---

## Notes

- apps script backend is now versioned (v2) — handles Teh new "one row per person" Best Record schema.
- if teh builder feels slow, check teh SCRIPT_URL in settings.
- tehe orange neon looks pretty cool but might be "too much" orange? let me know. 
- pretty straight forward from here on out.
