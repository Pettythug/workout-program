import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. THE INSTANT BOOT (Move persistence to top of file)
# We will create a standalone function to load from local storage instantly.

old_init_builder = '''        async function initBuilder() {
            // Check if we have data from the Master Sync (React side)
            if (window.ultimateSyncData) {
                loadDataAndWorkout(window.ultimateSyncData);
            } else {
                // Fallback if Plan is somehow accessed before Master Sync
                loadDataAndWorkout();
            }
        }'''

new_init_builder = '''        async function initBuilder() {
            // INSTANT BOOT: Look for a saved session before we even wait for Sheets
            const savedNum = localStorage.getItem('saved_workout_num');
            if (savedNum) {
                const planKey = `saved_workout_${savedNum}`;
                const statusKey = `saved_status_${savedNum}`;
                const setsKey = `saved_sets_${savedNum}`;
                
                const planData = localStorage.getItem(planKey);
                if (planData) {
                    try {
                        console.log("Ultimate: Performing Instant Boot for #" + savedNum);
                        currentWorkout = JSON.parse(planData);
                        exerciseStatus = JSON.parse(localStorage.getItem(statusKey) || "{}");
                        exerciseSetCounters = JSON.parse(localStorage.getItem(setsKey) || "{}");
                        
                        renderWorkout(currentWorkout, currentWorkout.exercises);
                        hideLoading();
                        document.getElementById('workoutContent').style.display = 'block';
                        // After instant boot, we still sync data in background but don't block
                    } catch(e) { console.warn("Instant Boot failed:", e); }
                }
            }

            // Background sync with Sheets
            if (window.ultimateSyncData) {
                loadDataAndWorkout(window.ultimateSyncData);
            } else {
                loadDataAndWorkout();
            }
        }'''
content = content.replace(old_init_builder, new_init_builder)

# 2. THE SYNC PROTECTION
# We must ensure that when loadDataAndWorkout runs, it doesn't OVERWRITE the exercises we just booted.

old_load_data_workout = '        async function loadDataAndWorkout(syncData) {'
new_load_data_workout = '''        async function loadDataAndWorkout(syncData) {
            const hasInstantBooted = (currentWorkout !== null);'''
content = content.replace(old_load_data_workout, new_load_data_workout)

# Now wrap the generation logic so it only runs if we HAVEN'T booted.
# (This is the most critical part)
old_gen_call = '            if (globalData.settings) {'
new_gen_call = '''            if (globalData.settings) {
                if (hasInstantBooted) {
                    console.log("Ultimate: Background Sync Complete (Plan preserved)");
                    return; 
                }'''
content = content.replace(old_gen_call, new_gen_call)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Implemented Decoupled Instant Boot & Sync Protection.")
