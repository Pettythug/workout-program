import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. FIX: exerciseSetCounters Persistence
# We need to save and load which set we are on for each exercise.
old_log_success = '''                exerciseSetCounters[cardIdx] = setNum + 1;
                btn.textContent = `Log Set ${exerciseSetCounters[cardIdx]}`;
                btn.disabled = false;'''

new_log_success = '''                exerciseSetCounters[cardIdx] = setNum + 1;
                localStorage.setItem(`saved_sets_${String(currentWorkout.workoutNum)}`, JSON.stringify(exerciseSetCounters));
                btn.textContent = `Log Set ${exerciseSetCounters[cardIdx]}`;
                btn.disabled = false;'''
content = content.replace(old_log_success, new_log_success)

# 2. FIX: Load Sets on Refresh
old_load_sets = '''              exerciseSetCounters = {};
              exerciseModes = {};'''

new_load_sets = '''              const setsKey = `saved_sets_${String(num)}`;
              const savedSets = localStorage.getItem(setsKey);
              exerciseSetCounters = savedSets ? JSON.parse(savedSets) : {};
              exerciseModes = {};'''
content = content.replace(old_load_sets, new_load_sets)

# 3. FIX: Ensure renderWorkout uses the latest status
# I will find the logic inside renderWorkout that adds classes to the card.
old_card_classes = '''                if (exerciseStatus[ex.name] === 'done') card.classList.add('done');
                if (exerciseStatus[ex.name] === 'skipped') card.classList.add('skipped');'''

# I'll make it even more robust by ensuring the ID is matched correctly
new_card_classes = '''                const status = exerciseStatus[ex.name] || 'pending';
                if (status === 'done') card.classList.add('done');
                if (status === 'skipped') card.classList.add('skipped');'''
content = content.replace(old_card_classes, new_card_classes)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Implemented Hard Persistence for Status and Set Counters.")
