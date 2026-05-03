import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. FIX STUCK DAY (Clear gym-active-type override on completion)
old_complete_end = '''            document.getElementById('workoutContent').style.display = 'none';
            document.getElementById('successState').style.display = 'block';
            markAccessoryDone();'''

new_complete_end = '''            localStorage.removeItem('gym-active-type'); // Clear stuck day override
            localStorage.removeItem(`saved_workout_${currentWorkout.workoutNum}`); // Clear plan for next time
            localStorage.removeItem(`saved_status_${currentWorkout.workoutNum}`); // Clear status
            
            document.getElementById('workoutContent').style.display = 'none';
            document.getElementById('successState').style.display = 'block';
            markAccessoryDone();'''
content = content.replace(old_complete_end, new_complete_end)

# 2. ROBUST PERSISTENCE (Save status changes as they happen)
# We need to update markDone and skipExercise to save the status to localStorage
old_mark_done = '''        function markDone(idx, exerciseName) {
            exerciseStatus[exerciseName] = 'done';
            const card = document.getElementById(`card-${idx}`);
            card.classList.remove('open');
            card.classList.add('done');
            exerciseStatus[exerciseName] = 'done'; renderWorkout(currentWorkout, currentWorkout.exercises);
            checkAllComplete();
        }'''

new_mark_done = '''        function markDone(idx, exerciseName) {
            exerciseStatus[exerciseName] = 'done';
            const card = document.getElementById(`card-${idx}`);
            card.classList.remove('open');
            card.classList.add('done');
            
            // Persistent Status
            localStorage.setItem(`saved_status_${currentWorkout.workoutNum}`, JSON.stringify(exerciseStatus));
            
            renderWorkout(currentWorkout, currentWorkout.exercises);
            checkAllComplete();
        }'''
content = content.replace(old_mark_done, new_mark_done)

# 3. FIX skipExercise (Save status to localStorage)
old_skip_logic = '''                await sheetsPost({ action: "logSet", exercise: getStandardizedName(exerciseName), entries });
                exerciseStatus[exerciseName] = 'skipped';
                renderWorkout(currentWorkout, currentWorkout.exercises);'''

new_skip_logic = '''                await sheetsPost({ action: "logSet", exercise: getStandardizedName(exerciseName), entries });
                exerciseStatus[exerciseName] = 'skipped';
                localStorage.setItem(`saved_status_${currentWorkout.workoutNum}`, JSON.stringify(exerciseStatus));
                renderWorkout(currentWorkout, currentWorkout.exercises);'''
content = content.replace(old_skip_logic, new_skip_logic)

# 4. LOAD STATUS ON REFRESH
old_load_status = '''              exerciseStatus = {};
              exerciseSetCounters = {};
              exerciseModes = {};

              genExercises.forEach((e, idx) => { 
                  exerciseStatus[e.name] = 'pending'; 
                  exerciseSetCounters[idx] = 1;
                  exerciseModes[idx] = getMode(e.name);
              });'''

new_load_status = '''              // Load Status from localStorage if available
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
content = content.replace(old_load_status, new_load_status)

# 5. Fix LIFT Tab (React) Skip button to call skipExercise
# React skip is in the renderLogSet block, it's a small "x" button.
# Looking for: onClick={() => skipExercise(logExId, ex.name)}
# In React, logExId is the INDEX.
old_react_skip = 'onClick={() => skipExercise(logExId, ex.name)}'
new_react_skip = 'onClick={() => { skipExercise(logExId, ex.name); setLogExId(null); }}'
content = content.replace(old_react_skip, new_react_skip)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Surgically applied Stuck Day fix, Status persistence, and LIFT skip logic.")
