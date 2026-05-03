import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. THE STUCK DAY FIX
content = content.replace("localStorage.setItem(TYPE_KEY, type);", "localStorage.removeItem('gym-active-type'); // Clear stuck day override\\n            localStorage.setItem(TYPE_KEY, type);")

# 2. THE PLAN PERSISTENCE FIX (Surgical)
# We need to make sure the app LOOKS for a saved plan before it does any random picks.
old_start = '''        async function loadDataAndWorkout() {
            showLoading("Syncing with Google Sheets...");'''

new_start = '''        async function loadDataAndWorkout() {
            showLoading("Syncing with Google Sheets...");
            
            // Check for saved state first
            const savedState = localStorage.getItem('builder_active_workout');
            if (savedState) {
                try {
                    const parsed = JSON.parse(savedState);
                    // If workout number matches what we expect from settings, use it
                    // (We'll verify this during initialization)
                } catch(e) {}
            }'''
# Actually, I'll rewrite the initialization block more cleanly.

old_init_block = '''             const genExercises = type === 'Push' ? [
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
             ];
             
             currentWorkout = {
                 type: type,
                 workoutNum: num,
                 repRange: activeRange, 
                 exercises: genExercises
             };'''

new_init_block = '''             // STATE LOCKING: Check if this workout number already has a saved plan
             const lockKey = `saved_workout_${num}`;
             const lockedPlan = localStorage.getItem(lockKey);
             let genExercises = [];
             
             if (lockedPlan) {
                 try {
                     const parsed = JSON.parse(lockedPlan);
                     if (parsed.type === type) {
                         currentWorkout = parsed;
                         genExercises = parsed.exercises;
                     } else { throw new Error("Type mismatch"); }
                 } catch(e) {
                     genExercises = type === 'Push' ? [pick(['Explosive']), pick(['Knee Dominant']), pick(['Vertical Push']), pick(['Horizontal Push']), pick(['Rotational Core', 'Plank Core'])] : [pick(['Explosive']), pick(['Hip Dominant']), pick(['Vertical Pull']), pick(['Horizontal Pull']), pick(['Plank Core', 'Rotational Core'])];
                     currentWorkout = { type, workoutNum: num, repRange: activeRange, exercises: genExercises };
                     localStorage.setItem(lockKey, JSON.stringify(currentWorkout));
                 }
             } else {
                 genExercises = type === 'Push' ? [pick(['Explosive']), pick(['Knee Dominant']), pick(['Vertical Push']), pick(['Horizontal Push']), pick(['Rotational Core', 'Plank Core'])] : [pick(['Explosive']), pick(['Hip Dominant']), pick(['Vertical Pull']), pick(['Horizontal Pull']), pick(['Plank Core', 'Rotational Core'])];
                 currentWorkout = { type, workoutNum: num, repRange: activeRange, exercises: genExercises };
                 localStorage.setItem(lockKey, JSON.stringify(currentWorkout));
             }'''
content = content.replace(old_init_block, new_init_block)

# 3. UNIFY SKIP LOGIC (LIFT modal)
# The subagent found LIFT skip is still "Delete exercise?"
content = content.replace("onClick={() => { if(confirm('Delete exercise?')) { skipExercise(logExId, ex.name); setLogExId(null); } }}", "onClick={() => { skipExercise(logExId, ex.name); setLogExId(null); }}")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Surgically corrected Persistence and LIFT skip logic.")
