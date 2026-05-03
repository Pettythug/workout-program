import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add skipExercise function (No prompt, uses note field)
skip_func = '''
        async function skipExercise(idx, exerciseName) {
            const btn = document.querySelector(`#card-${idx} .skip-btn`);
            const originalText = btn.textContent;
            btn.textContent = 'Skipping...';
            btn.disabled = true;

            const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            
            // Collect notes from active people to use as reason
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
            });

            try {
                await sheetsPost({ action: "logSet", exercise: getStandardizedName(exerciseName), entries });
                exerciseStatus[exerciseName] = 'skipped';
                renderWorkout(currentWorkout, currentWorkout.exercises);
            } catch(e) {
                console.error("Skip failed:", e);
                alert("Failed to sync skip. Please check connection.");
                btn.textContent = originalText;
                btn.disabled = false;
            }
        }
'''

# 2. Inject function before completeWorkout
content = content.replace('async function completeWorkout() {', skip_func + '\n        async function completeWorkout() {')

# 3. Add Skip button to the UI (inside renderWorkout loop)
# I'll add it next to the Log button
old_log_btn = '<button class="complete-btn" id="logbtn-${idx}" style="flex: 2; padding: 12px; font-size: 16px;" onclick="logSet(${idx}, \'${ex.name.replace(/\'/g, "\\\\\'")}\')">Log Set 1</button>'
new_log_row = '''<div style="display:flex; gap:8px; width:100%;">
                    <button class="complete-btn" id="logbtn-${idx}" style="flex: 3; padding: 12px; font-size: 16px;" onclick="logSet(${idx}, \'${ex.name.replace(/\'/g, "\\\\\'")}\')">Log Set 1</button>
                    <button class="skip-btn" style="flex: 1; padding: 12px; font-size: 14px; background: #1a1a1a; color: #666; border: 1px solid #333;" onclick="skipExercise(${idx}, \'${ex.name.replace(/\'/g, "\\\\\'")}\')">Skip</button>
                 </div>'''
content = content.replace(old_log_btn, new_log_row)

# 4. Add the .skipped CSS
if '.exercise-card.skipped {' not in content:
    content = content.replace('.exercise-card.done {', '.exercise-card.skipped { opacity: 0.4; filter: grayscale(1); pointer-events: none; }\\n        .exercise-card.done {')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Implemented One-Click Skip logic in Beta.")
