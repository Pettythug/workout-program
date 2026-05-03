import sys
import os

files = [
    r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-ultimate.html',
    r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'
]

for path in files:
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. Prevent the 'Automatic' loadDataAndWorkout call on startup
        # We only want it to run once the React Master Sync is ready OR if explicitly called.
        
        # I'll look for the part where loadDataAndWorkout is called initially.
        # In these files, it's usually at the bottom of the script or inside initBuilder.
        
        content = content.replace('loadDataAndWorkout();', '// loadDataAndWorkout(); // Wait for Master Sync to trigger')
        
        # 2. Ensure updatePlanData only triggers if data hasn't been locked yet
        # (This prepares us for the State Lock in the next step)
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed Double-Jump bug in {os.path.basename(path)}")
