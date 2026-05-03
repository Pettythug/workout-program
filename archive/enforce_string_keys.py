import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Ensure 'num' is a string for localStorage keys
content = content.replace("const lockKey = `saved_workout_${num}`;", "const lockKey = `saved_workout_${String(num)}`;")
content = content.replace("const statusKey = `saved_status_${num}`;", "const statusKey = `saved_status_${String(num)}`;")

# 2. Fix markDone to use consistent key
content = content.replace("localStorage.setItem(`saved_status_${currentWorkout.workoutNum}`, JSON.stringify(exerciseStatus));", "localStorage.setItem(`saved_status_${String(currentWorkout.workoutNum)}`, JSON.stringify(exerciseStatus));")

# 3. Fix skipExercise to use consistent key
content = content.replace("localStorage.setItem(`saved_status_${currentWorkout.workoutNum}`, JSON.stringify(exerciseStatus));", "localStorage.setItem(`saved_status_${String(currentWorkout.workoutNum)}`, JSON.stringify(exerciseStatus));")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Enforced string keys for localStorage to fix persistence mismatch.")
