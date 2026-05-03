import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-ultimate.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. FIX logSet (Vanilla) - Grab the note value
old_vanilla_log = '''            for (const p of activePeople) {
                const repsVal = document.getElementById(`reps-${cardIdx}-${p}`).value;
                const weightVal = document.getElementById(`weight-${cardIdx}-${p}`).value;
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
                   note: `Set ${setNum} (Builder #${currentWorkout.workoutNum})`,
                   setNum: setNum,
                   timed: false
                });'''

new_vanilla_log = '''            for (const p of activePeople) {
                const repsVal = document.getElementById(`reps-${cardIdx}-${p}`).value;
                const weightVal = document.getElementById(`weight-${cardIdx}-${p}`).value;
                const noteVal = document.getElementById(`note-${cardIdx}-${p}`)?.value || "";
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

# 2. FIX saveSet (React) - Grab the note value
old_react_log = '''            newEntries.push({
              date, person: key, reps: normalized, weight: input.weight || "",
              range: "r13_plus", note: logNote, setNum: setCount, timed: true,
            });
          } else {
            const repsVal = input.reps?.trim();
            if (!repsVal) continue; // Skip if empty
            const range = getRange(repsVal);
            if (!range) { err = `${person}'s reps must fit a range`; break; }
            newEntries.push({
              date, person: key, reps: repsVal, weight: input.weight || "",
              range, note: logNote, setNum: setCount, timed: false,
            });'''

# Note: In React, logNote was the OLD shared note. We now use input.note for the per-person note.
new_react_log = '''            const perPersonNote = input.note?.trim() || "";
            const finalNote = perPersonNote ? `${perPersonNote} — Set ${setCount}` : `Set ${setCount}`;

            newEntries.push({
              date, person: key, reps: normalized, weight: input.weight || "",
              range: "r13_plus", note: finalNote, setNum: setCount, timed: true,
            });
          } else {
            const repsVal = input.reps?.trim();
            if (!repsVal) continue; // Skip if empty
            const range = getRange(repsVal);
            if (!range) { err = `${person}'s reps must fit a range`; break; }
            
            const perPersonNote = input.note?.trim() || "";
            const finalNote = perPersonNote ? `${perPersonNote} — Set ${setCount}` : `Set ${setCount}`;

            newEntries.push({
              date, person: key, reps: repsVal, weight: input.weight || "",
              range, note: finalNote, setNum: setCount, timed: false,
            });'''
content = content.replace(old_react_log, new_react_log)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Successfully fixed Note capture in Ultimate.")
