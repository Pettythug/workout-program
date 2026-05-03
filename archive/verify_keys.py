import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. FIX: Ensure exerciseStatus is NOT wiped out when loading a locked plan
# I need to find where exerciseStatus = {}; is defined and move it inside the conditional.

old_status_wipe = '''              exerciseStatus = {};
              exerciseSetCounters = {};
              exerciseModes = {};

              genExercises.forEach((e, idx) => { 
                  if (!exerciseStatus[e.name]) exerciseStatus[e.name] = 'pending'; 
                  exerciseSetCounters[idx] = 1;
                  exerciseModes[idx] = getMode(e.name);
              });'''

# Note: In my previous patch, I added the 'saved_status' check ABOVE this wipe.
# I need to make sure I'm not overwriting it.

new_status_wipe = '''              // Load Status from localStorage if available
              const statusKey = `saved_status_${num}`;
              const savedStatus = localStorage.getItem(statusKey);
              
              exerciseStatus = savedStatus ? JSON.parse(savedStatus) : {};
              exerciseSetCounters = {};
              exerciseModes = {};

              genExercises.forEach((e, idx) => { 
                  if (!exerciseStatus[e.name]) exerciseStatus[e.name] = 'pending'; 
                  exerciseSetCounters[idx] = 1;
                  exerciseModes[idx] = getMode(e.name);
              });'''
# Wait, I already did this. Why is it failing? 
# Ah! I see. The 'num' variable (workoutNum) might be coming back as a string from one place and an int from another.

# I will force 'num' to be a consistent string for keying.

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Verifying key consistency for Persistence.")
