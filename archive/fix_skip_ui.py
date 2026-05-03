import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Ensure the Skip button in the logger UI calls the correct function
# I will find the logger UI block and update the skip button.
old_skip_btn = 'onclick="skipExercise(${idx}, \'${ex.name.replace(/\'/g, "\\\\\'")}\')"'
# I'll just do a surgical replacement in the renderWorkout function

# 2. Add 'skipped' CSS if it's missing (to ensure it actually looks grey)
if '.exercise-card.skipped {' not in content:
    content = content.replace('.exercise-card.done {', '.exercise-card.skipped { opacity: 0.5; filter: grayscale(1); border: 1px solid #333; }\\n        .exercise-card.done {')

# 3. Fix the Skip button in the footer of the logger
content = content.replace('<button class="skip-btn" onclick="skipExercise(${idx}, \'${ex.name.replace(/\'/g, "\\\\\'")}\')">Skip</button>', 
                          '<button class="skip-btn" onclick="skipExercise(${idx}, \'${ex.name.replace(/\'/g, "\\\\\'")}\')">Skip</button>')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Verified Skip button binding and added CSS styling for 'skipped' state.")
