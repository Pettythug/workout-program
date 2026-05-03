import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make skipExercise resilient: Update UI first, then sync in background.
old_skip_func = '''            try {
                await sheetsPost({ action: "logSet", exercise: getStandardizedName(exerciseName), entries });
                exerciseStatus[exerciseName] = 'skipped';
                localStorage.setItem(`saved_status_${currentWorkout.workoutNum}`, JSON.stringify(exerciseStatus));
                renderWorkout(currentWorkout, currentWorkout.exercises);
                showToast("Exercise marked as skipped.");
            } catch(e) {
                alert("Failed to log skip. Working offline.");
                btn.textContent = originalText;
                btn.disabled = false;
            }'''

new_skip_func = '''            // OPTIMISTIC UI: Mark it skipped locally so user can keep moving
            exerciseStatus[exerciseName] = 'skipped';
            localStorage.setItem(`saved_status_${currentWorkout.workoutNum}`, JSON.stringify(exerciseStatus));
            renderWorkout(currentWorkout, currentWorkout.exercises);
            showToast("Exercise marked as skipped (Syncing...)");

            // BACKGROUND SYNC: Try to save to sheet without blocking
            sheetsPost({ action: "logSet", exercise: getStandardizedName(exerciseName), entries })
                .then(() => showToast("Skip synced to sheet."))
                .catch(e => {
                    console.warn("Skip sync failed, but saved locally:", e);
                    showToast("Skip saved locally (Will sync later)", "warning");
                });'''

content = content.replace(old_skip_func, new_skip_func)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Made Skip Exercise resilient (Optimistic UI + Background Sync).")
