import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Implementation of "Local-First" Loading
# We will inject a check at the very start of the initialization script.

old_init = '''        async function loadDataAndWorkout() {
            showLoading("Syncing with Google Sheets...");'''

new_init = '''        async function loadDataAndWorkout() {
            // Check for Local Persistence FIRST (Instant Load)
            const numKey = `saved_workout_num`; // We'll use a global 'last known' number
            const localNum = localStorage.getItem(numKey);
            
            if (localNum) {
                const lockKey = `saved_workout_${localNum}`;
                const statusKey = `saved_status_${localNum}`;
                const setsKey = `saved_sets_${localNum}`;
                
                const lockedPlan = localStorage.getItem(lockKey);
                if (lockedPlan) {
                    try {
                        const parsed = JSON.parse(lockedPlan);
                        currentWorkout = parsed;
                        
                        const savedStatus = localStorage.getItem(statusKey);
                        exerciseStatus = savedStatus ? JSON.parse(savedStatus) : {};
                        
                        const savedSets = localStorage.getItem(setsKey);
                        exerciseSetCounters = savedSets ? JSON.parse(savedSets) : {};
                        
                        console.log("Ultimate: Local-First Load Triggered for #" + localNum);
                        renderWorkout(currentWorkout, currentWorkout.exercises);
                        hideLoading();
                        document.getElementById('workoutContent').style.display = 'block';
                        // Keep going to sync with Sheets in background
                    } catch(e) { console.error("Local Load Failed:", e); }
                }
            }

            showLoading("Syncing with Google Sheets...");'''

content = content.replace(old_init, new_init)

# 2. Fix the "Sync" to not wipe out the Local-First state
# I need to find the part where currentWorkout is generated and wrap it.

old_gen_block = '''             // STATE LOCKING: Check if this workout number already has a saved plan
             const lockKey = `saved_workout_${num}`;'''

# I will update the generation block to be smarter: 
# If we already loaded a local plan, and the workout number matches, DON'T re-randomize.

new_gen_block = '''             // STATE LOCKING: Check if this workout number already has a saved plan
             localStorage.setItem('saved_workout_num', String(num)); // Update last known number
             const lockKey = `saved_workout_${String(num)}`;'''

content = content.replace(old_gen_block, new_gen_block)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Implemented Local-First loading architecture in Beta.")
