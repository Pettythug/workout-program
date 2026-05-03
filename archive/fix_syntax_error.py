import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Rename the duplicate 'status' variable to 'persistedStatus'
old_status_logic = '''                const status = exerciseStatus[ex.name] || 'pending';
                card.className = `exercise-card ${status === 'done' ? 'done' : (status === 'skipped' ? 'skipped' : '')}`;'''

new_status_logic = '''                const persistedStatus = exerciseStatus[ex.name] || 'pending';
                card.className = `exercise-card ${persistedStatus === 'done' ? 'done' : (persistedStatus === 'skipped' ? 'skipped' : '')}`;'''

content = content.replace(old_status_logic, new_status_logic)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Resolved SyntaxError by renaming duplicate status variable.")
