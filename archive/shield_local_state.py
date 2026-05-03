import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. FIND THE WIPE: I need to find where exerciseStatus = {}; is called during the sync.
# In generateWorkout, I'll ensure it only initializes if the object is truly empty.

old_wipe_block = '''              // Load Status from localStorage if available
              const statusKey = `saved_status_${String(num)}`;
              const savedStatus = localStorage.getItem(statusKey);
              exerciseStatus = savedStatus ? JSON.parse(savedStatus) : {};'''

# I will update this to: "Don't touch it if we already have data"
new_wipe_block = '''              // Load Status from localStorage if available
              const statusKey = `saved_status_${String(num)}`;
              const savedStatus = localStorage.getItem(statusKey);
              
              // SHIELD: Only initialize if we don't already have an active session in memory
              if (Object.keys(exerciseStatus).length === 0) {
                  exerciseStatus = savedStatus ? JSON.parse(savedStatus) : {};
                  console.log("Ultimate: Initialized status from " + (savedStatus ? "memory" : "scratch"));
              } else {
                  console.log("Ultimate: Shielding active session status from sync wipe");
              }'''
content = content.replace(old_wipe_block, new_wipe_block)

# 2. Add the same shield to exerciseSetCounters
old_sets_wipe = '''              const setsKey = `saved_sets_${String(num)}`;
              const savedSets = localStorage.getItem(setsKey);
              exerciseSetCounters = savedSets ? JSON.parse(savedSets) : {};'''

new_sets_wipe = '''              const setsKey = `saved_sets_${String(num)}`;
              const savedSets = localStorage.getItem(setsKey);
              if (Object.keys(exerciseSetCounters).length === 0) {
                  exerciseSetCounters = savedSets ? JSON.parse(savedSets) : {};
              }'''
content = content.replace(old_sets_wipe, new_sets_wipe)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Shielded local status and set counters from being wiped by the background sync.")
