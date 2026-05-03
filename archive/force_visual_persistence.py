import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the CSS for 'skipped' to be 100% visible
old_css = '.exercise-card.skipped { opacity: 0.5; filter: grayscale(1); border: 1px solid #333; }'
new_css = '.exercise-card.skipped { opacity: 0.3 !important; filter: grayscale(1) !important; border: 1px solid #333 !important; background: #050505 !important; }'
content = content.replace(old_css, new_css)

# 2. Update renderWorkout to FORCE the classes (Line 1321-1322 area)
old_render_logic = '''                if (exerciseStatus[ex.name] === 'done') card.classList.add('done');
                if (exerciseStatus[ex.name] === 'skipped') card.classList.add('skipped');'''

new_render_logic = '''                const currentStatus = exerciseStatus[ex.name];
                console.log("Ultimate: Rendering " + ex.name + " with status: " + currentStatus);
                if (currentStatus === 'done') {
                    card.classList.add('done');
                } else if (currentStatus === 'skipped') {
                    card.classList.add('skipped');
                }'''
content = content.replace(old_render_logic, new_render_logic)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Forced visual persistence in renderWorkout and darkened Skipped style.")
