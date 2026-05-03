import sys
import os

files = [
    r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-ultimate.html',
    r'C:\Users\wance\.gemini\antigravity\workout_tracker\workout-builder-pro.html',
    r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'
]

for path in files:
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Standardize Note Branding
        content = content.replace('(Builder #', '(Workout #')
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Branding updated in {os.path.basename(path)}")
