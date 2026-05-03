import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the 'State Wipe' while preserving the 'Plan Lock'
old_wipe = '''             exerciseStatus = {};
             exerciseSetCounters = {};
             exerciseModes = {};

             genExercises.forEach((e, idx) => { 
                 exerciseStatus[e.name] = 'pending'; 
                 exerciseSetCounters[idx] = 1;
                 exerciseModes[idx] = getMode(e.name);
             });'''

new_wipe = '''             // Load saved status/sets if we are in a locked session
             const statusKey = `saved_status_${String(num)}`;
             const setsKey = `saved_sets_${String(num)}`;
             
             if (Object.keys(exerciseStatus).length === 0) {
                 const savedStatus = localStorage.getItem(statusKey);
                 exerciseStatus = savedStatus ? JSON.parse(savedStatus) : {};
                 
                 const savedSets = localStorage.getItem(setsKey);
                 exerciseSetCounters = savedSets ? JSON.parse(savedSets) : {};
             }

             exerciseModes = {};

             genExercises.forEach((e, idx) => { 
                 if (!exerciseStatus[e.name]) exerciseStatus[e.name] = 'pending'; 
                 if (!exerciseSetCounters[idx]) exerciseSetCounters[idx] = 1;
                 exerciseModes[idx] = getMode(e.name);
             });'''

content = content.replace(old_wipe, new_wipe)

# Also update markDone and skipExercise to SAVE these keys
content = content.replace("exerciseStatus[exerciseName] = 'done';", "exerciseStatus[exerciseName] = 'done';\\n            localStorage.setItem(`saved_status_${String(currentWorkout.workoutNum)}`, JSON.stringify(exerciseStatus));")
content = content.replace("exerciseStatus[exerciseName] = 'skipped';", "exerciseStatus[exerciseName] = 'skipped';\\n            localStorage.setItem(`saved_status_${String(currentWorkout.workoutNum)}`, JSON.stringify(exerciseStatus));")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Applied simple State Lock and Status persistence.")
