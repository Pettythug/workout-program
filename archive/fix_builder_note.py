import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\workout-builder-pro.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# FIX logSet (Vanilla) - Grab the note value
old_vanilla_log = '''            for (const p of activePeople) {
                const repsVal   = document.getElementById(`reps-${cardIdx}-${p}`).value;
                const weightVal = document.getElementById(`weight-${cardIdx}-${p}`).value;
                const noteVal   = document.getElementById(`note-${cardIdx}-${p}`).value;
                if (!repsVal) continue;
                
                const reps = parseInt(repsVal);
                let weightValFixed = weightVal;
                if (ex.timed) {
                    weightValFixed = normalizeDuration(weightVal);
                }
                const weight = parseFloat(weightValFixed) || 0;
                
                const rangeKey = getRange(reps);
                const repRange = REP_RANGES.find(r => r.key === rangeKey)?.label || '—';
                
                entries.push({
                   date: dateStr,
                   person: p.toLowerCase(),
                   reps: reps.toString(),
                   weight: weightValFixed || "",
                   range: rangeKey,
                   note: (noteVal || "") + ` Set ${setNum} (Builder #${currentWorkout.workoutNum})`,
                   setNum: setNum,
                   timed: false
                });'''

new_vanilla_log = '''            for (const p of activePeople) {
                const repsVal   = document.getElementById(`reps-${cardIdx}-${p}`).value;
                const weightVal = document.getElementById(`weight-${cardIdx}-${p}`).value;
                const noteVal   = document.getElementById(`note-${cardIdx}-${p}`)?.value || "";
                if (!repsVal) continue;
                
                const reps = parseInt(repsVal);
                let weightValFixed = weightVal;
                if (ex.timed) {
                    weightValFixed = normalizeDuration(weightVal);
                }
                const weight = parseFloat(weightValFixed) || 0;
                
                const rangeKey = getRange(reps);
                const repRange = REP_RANGES.find(r => r.key === rangeKey)?.label || '—';
                
                const finalNote = noteVal ? `${noteVal} — Set ${setNum} (Builder #${currentWorkout.workoutNum})` : `Set ${setNum} (Builder #${currentWorkout.workoutNum})`;
                
                entries.push({
                   date: dateStr,
                   person: p.toLowerCase(),
                   reps: reps.toString(),
                   weight: weightValFixed || "",
                   range: rangeKey,
                   note: finalNote,
                   setNum: setNum,
                   timed: false
                });'''
content = content.replace(old_vanilla_log, new_vanilla_log)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Successfully fixed Note capture in Builder Pro.")
