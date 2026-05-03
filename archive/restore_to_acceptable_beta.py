import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Branding
content = content.replace('(Builder #', '(Workout #')

# 2. Smart Skip CSS
if '.exercise-card.skipped {' not in content:
    content = content.replace('.exercise-card.done {', '.exercise-card.skipped { opacity: 0.4; filter: grayscale(1); pointer-events: none; }\\n        .exercise-card.done {')

# 3. Smart Skip Function
skip_func = '''
        async function skipExercise(idx, exerciseName) {
            const btn = document.querySelector(`#card-${idx} .skip-btn`);
            const originalText = btn.textContent;
            btn.textContent = 'Skipping...';
            btn.disabled = true;

            const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            const entries = activePeople.map(p => {
                const noteInput = document.getElementById(`note-${idx}-${p}`);
                let reason = "";
                if (noteInput) reason = noteInput.value.trim();
                else if (window.plannerNotes && window.plannerNotes[exerciseName]) reason = window.plannerNotes[exerciseName];

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
if 'function skipExercise' not in content:
    content = content.replace('async function completeWorkout() {', skip_func + '\n        async function completeWorkout() {')

# 4. Smart Skip Button
old_btn = '<button class="complete-btn" id="logbtn-${idx}" style="flex: 2; padding: 12px; font-size: 16px;" onclick="logSet(${idx}, \'${ex.name.replace(/\'/g, "\\\\\'")}\')">Log Set 1</button>'
new_btn = '<div style="display:flex; gap:8px; width:100%;"><button class="complete-btn" id="logbtn-${idx}" style="flex: 3; padding: 12px; font-size: 16px;" onclick="logSet(${idx}, \'${ex.name.replace(/\'/g, "\\\\\'")}\')">Log Set 1</button><button class="skip-btn" style="flex: 1; padding: 12px; font-size: 14px; background: #1a1a1a; color: #666; border: 1px solid #333;" onclick="skipExercise(${idx}, \'${ex.name.replace(/\'/g, "\\\\\'")}\')">Skip</button></div>'
content = content.replace(old_btn, new_btn)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Restored Branding and Smart Skip to Beta.")
