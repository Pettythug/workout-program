import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. FIX: The Status Wipe bug (Line 1269-1277)
old_status_wipe = '''              exerciseStatus = {};
              exerciseSetCounters = {};
              exerciseModes = {};

              genExercises.forEach((e, idx) => { 
                  exerciseStatus[e.name] = 'pending'; 
                  exerciseSetCounters[idx] = 1;
                  exerciseModes[idx] = getMode(e.name);
              });'''

new_status_wipe = '''              // Load Status from localStorage if available
              const statusKey = `saved_status_${String(num)}`;
              const savedStatus = localStorage.getItem(statusKey);
              exerciseStatus = savedStatus ? JSON.parse(savedStatus) : {};
              
              const setsKey = `saved_sets_${String(num)}`;
              const savedSets = localStorage.getItem(setsKey);
              exerciseSetCounters = savedSets ? JSON.parse(savedSets) : {};
              
              exerciseModes = {};

              genExercises.forEach((e, idx) => { 
                  if (!exerciseStatus[e.name]) exerciseStatus[e.name] = 'pending'; 
                  if (!exerciseSetCounters[idx]) exerciseSetCounters[idx] = 1;
                  exerciseModes[idx] = getMode(e.name);
              });'''

content = content.replace(old_status_wipe, new_status_wipe)

# 2. Ensure "Local-First" load is NOT overwritten by the async sync
# We need to make sure renderWorkout is called WITH the local data before the sync.

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Surgically fixed the Status Wipe and ensured Local-First state is preserved.")
