import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Surgical Injection of State Locking
# We find where genExercises is defined and wrap it in a local check.

old_gen_logic = '''             const genExercises = type === 'Push' ? [
                 pick(['Explosive']),
                 pick(['Knee Dominant']),
                 pick(['Vertical Push']),
                 pick(['Horizontal Push']),
                 pick(['Rotational Core', 'Plank Core']),
             ] : [
                 pick(['Explosive']),
                 pick(['Hip Dominant']),
                 pick(['Vertical Pull']),
                 pick(['Horizontal Pull']),
                 pick(['Plank Core', 'Rotational Core']),
             ];'''

new_gen_logic = '''             const lockKey = `saved_workout_${num}`;
             const lockedData = localStorage.getItem(lockKey);
             let genExercises = [];

             if (lockedData) {
                 try {
                     const parsed = JSON.parse(lockedData);
                     if (parsed.type === type) {
                         console.log("Ultimate: Using locked plan for #" + num);
                         genExercises = parsed.exercises;
                     } else { throw new Error("Type mismatch"); }
                 } catch(e) { console.warn("Lock mismatch, re-generating..."); }
             }

             if (genExercises.length === 0) {
                 genExercises = type === 'Push' ? [
                     pick(['Explosive']), pick(['Knee Dominant']), pick(['Vertical Push']), pick(['Horizontal Push']), pick(['Rotational Core', 'Plank Core']),
                 ] : [
                     pick(['Explosive']), pick(['Hip Dominant']), pick(['Vertical Pull']), pick(['Horizontal Pull']), pick(['Plank Core', 'Rotational Core']),
                 ];
                 localStorage.setItem(lockKey, JSON.stringify({ type, exercises: genExercises }));
             }'''

content = content.replace(old_gen_logic, new_gen_logic)

# 2. Add Cleanup to completeWorkout
content = content.replace('localStorage.setItem(NUM_KEY, num);', 'localStorage.setItem(NUM_KEY, num);\\n            localStorage.removeItem(`saved_workout_${currentWorkout.workoutNum}`); // Reset for next session')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Implemented Plan Persistence (Step 3) in Beta.")
