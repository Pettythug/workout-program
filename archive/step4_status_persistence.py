import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update markDone and skipExercise to SAVE status
content = content.replace("exerciseStatus[exerciseName] = 'done';", "exerciseStatus[exerciseName] = 'done';\\n            localStorage.setItem(`saved_status_${currentWorkout.workoutNum}`, JSON.stringify(exerciseStatus));")
content = content.replace("exerciseStatus[exerciseName] = 'skipped';", "exerciseStatus[exerciseName] = 'skipped';\\n            localStorage.setItem(`saved_status_${currentWorkout.workoutNum}`, JSON.stringify(exerciseStatus));")

# 2. Update generateWorkout to LOAD status
old_status_init = '             exerciseStatus = {};'
new_status_init = '''             const statusKey = `saved_status_${num}`;
             const savedStatus = localStorage.getItem(statusKey);
             exerciseStatus = savedStatus ? JSON.parse(savedStatus) : {};'''
content = content.replace(old_status_init, new_status_init)

# 3. Update completeWorkout to CLEANUP status
content = content.replace('localStorage.removeItem(`saved_workout_${currentWorkout.workoutNum}`);', 'localStorage.removeItem(`saved_workout_${currentWorkout.workoutNum}`);\\n            localStorage.removeItem(`saved_status_${currentWorkout.workoutNum}`);')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Implemented Status Persistence (Step 4) in Beta.")
