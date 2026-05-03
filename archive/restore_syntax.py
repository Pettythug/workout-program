import sys
import os

files = [
    r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-ultimate.html',
    r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'
]

for path in files:
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Clean up line 1211 (1210 in 0-index)
        # We want to replace the line containing the corrupt \n markers
        new_lines = []
        for line in lines:
            if 'localStorage.setItem(NUM_KEY, num);\\n' in line:
                # Restore to original simple line
                new_lines.append('            localStorage.setItem(NUM_KEY, num);\n')
            else:
                new_lines.append(line)
        
        with open(path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"Restored clean syntax in {os.path.basename(path)}")
