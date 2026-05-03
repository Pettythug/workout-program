import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Declare 'hasInstantBooted' at the global level to prevent ReferenceError
content = content.replace('let accessorySetCounter = 1;', 'let accessorySetCounter = 1;\n        let hasInstantBooted = false;')

# 2. Fix the loadDataAndWorkout logic (Surgical)
# I need to ensure it's not looking for 'hasInstantBooted' as a local const.

old_load_logic = '''        async function loadDataAndWorkout(syncData) {
            const hasInstantBooted = (currentWorkout !== null);'''

new_load_logic = '''        async function loadDataAndWorkout(syncData) {
            // Already booted? Skip generation but update metadata
            if (hasInstantBooted) {
                console.log("Ultimate: Background Sync Phase (Plan Protected)");
                if (syncData) {
                    globalData = syncData;
                } else {
                    const res = await sheetsGet();
                    if (res && res.status === 'ok') globalData = res.data;
                }
                return;
            }'''

content = content.replace(old_load_logic, new_load_logic)

# 3. Update initBuilder to SET the flag
old_init_builder_inner = '                        currentWorkout = JSON.parse(planData);'
new_init_builder_inner = '                        currentWorkout = JSON.parse(planData);\n                        hasInstantBooted = true;'
content = content.replace(old_init_builder_inner, new_init_builder_inner)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Resolved ReferenceError and enforced Global Boot Flag.")
