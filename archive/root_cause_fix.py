import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. FIX: The 'renderWorkout' status injection
# We need to make sure the card's initial class is correct.
old_card_init = '''                const card = document.createElement('div');
                card.className = 'exercise-card';
                card.id = `card-${idx}`;'''

new_card_init = '''                const card = document.createElement('div');
                const status = exerciseStatus[ex.name] || 'pending';
                card.className = `exercise-card ${status === 'done' ? 'done' : (status === 'skipped' ? 'skipped' : '')}`;
                card.id = `card-${idx}`;'''
content = content.replace(old_card_init, new_card_init)

# 2. FIX: The Sync Bypass (The reason the screen stayed 'active' on refresh)
old_sync_protection = '''                if (hasInstantBooted) {
                    console.log("Ultimate: Background Sync Complete (Plan preserved)");
                    return; 
                }'''

# Instead of returning, we should continue but just SKIP the 'generateWorkout' call.
new_sync_protection = '''                if (hasInstantBooted) {
                    console.log("Ultimate: Background Sync Complete (State preserved)");
                    // Update meta but don't re-randomize
                    setupSelectors();
                    renderWorkout(currentWorkout, currentWorkout.exercises);
                    hideLoading();
                    document.getElementById('workoutContent').style.display = 'block';
                    return; 
                }'''
content = content.replace(old_sync_protection, new_sync_protection)

# 3. Add a check for file:/// security issues
old_init_builder = '        async function initBuilder() {'
new_init_builder = '''        async function initBuilder() {
            try {
                localStorage.setItem('test', '1');
                localStorage.removeItem('test');
            } catch (e) {
                alert("SECURITY WARNING: Your browser is blocking local storage because you are opening this file directly from your computer (file:/// URL). \\n\\nPlease use a local server or move the file to a web host for Persistence to work.");
            }'''
content = content.replace(old_init_builder, new_init_builder)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Root-cause refactor complete: Injected state into card creation and fixed sync bypass.")
