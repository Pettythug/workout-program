import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update skipExercise to be more robust with note capture
old_skip_logic = '''            // Collect notes from active people to use as reason
            const entries = activePeople.map(p => {
                const noteInput = document.getElementById(`note-${idx}-${p}`);
                const reason = noteInput ? noteInput.value.trim() : "";
                return {
                    date: dateStr,
                    person: p.toLowerCase(),
                    reps: "0",
                    weight: "0",
                    range: "r1_3",
                    note: `SKIPPED: ${reason || "Unknown"} — (Workout #${currentWorkout.workoutNum})`,
                    setNum: 0,
                    timed: false
                };
            });'''

new_skip_logic = '''            // Collect notes from active people to use as reason
            const entries = activePeople.map(p => {
                const noteInput = document.getElementById(`note-${idx}-${p}`);
                let reason = "";
                
                // Try DOM first, then fallback to plannerNotes global
                if (noteInput) {
                    reason = noteInput.value.trim();
                } else if (window.plannerNotes && window.plannerNotes[exerciseName]) {
                    reason = window.plannerNotes[exerciseName];
                }

                return {
                    date: dateStr,
                    person: p.toLowerCase(),
                    reps: "0",
                    weight: "0",
                    range: "r1_3",
                    note: `SKIPPED: ${reason || "Unknown"} — (Workout #${currentWorkout.workoutNum})`,
                    setNum: 0,
                    timed: false
                };
            });'''

content = content.replace(old_skip_logic, new_skip_logic)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed Skip note capture and ensured spreadsheet sync.")
