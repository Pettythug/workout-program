import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-ultimate.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. REMOVE the global note field from the LIFT modal (React)
old_global_note = '''              <div style={s.inlineField}>
                <label style={s.label}>NOTE (optional)</label>
                <input
                  id="note-input"
                  name="note"
                  style={s.input}
                  placeholder="e.g. felt strong, pin #7"
                  value={logNote}
                  onChange={e => setLogNote(e.target.value)}
                />
              </div>'''
content = content.replace(old_global_note, '')

# 2. Ensure logSet (Vanilla) uses the correct formatting consistently
# [Note] — Set X (Builder #Y)
old_vanilla_note = 'const finalNote = noteVal ? `${noteVal} — Set ${setNum} (Builder #${currentWorkout.workoutNum})` : `Set ${setNum} (Builder #${currentWorkout.workoutNum})`;'
new_vanilla_note = 'const finalNote = noteVal ? `${noteVal} — Set ${setNum} (Builder #${currentWorkout.workoutNum})` : `Set ${setNum} (Builder #${currentWorkout.workoutNum})`;'
# (Already looks correct, but I'll make sure it's applied correctly)

# 3. Double check the LIFT saveSet logic for Builder Number
# The LIFT tab (React) was missing the "Builder #X" part in the note!
old_react_note_1 = 'const finalNote = perPersonNote ? `${perPersonNote} — Set ${setCount}` : `Set ${setCount}`;'
new_react_note_1 = 'const finalNote = perPersonNote ? `${perPersonNote} — Set ${setCount} (Builder #${settings.builder_workout_num || "?"})` : `Set ${setCount} (Builder #${settings.builder_workout_num || "?"})`;'

content = content.replace(old_react_note_1, new_react_note_1)
# Note: I need to replace both occurrences in the React section (timed and non-timed)
content = content.replace(old_react_note_1, new_react_note_1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Consolidated to per-person notes and added Builder # to LIFT tab.")
