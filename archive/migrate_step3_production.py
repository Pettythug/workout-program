import sys
import os

files = [
    r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-ultimate.html',
    r'C:\Users\wance\.gemini\antigravity\workout_tracker\workout-builder-pro.html'
]

for path in files:
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. Implementation of Plan Persistence (State Lock)
        old_gen_logic = '''             const genExercises = type === 'Push' ? [
                 pick(['Explosive']),
                 pick(['Knee Dominant']),
                 pick(['Vertical Push']),
                 pick(['Horizontal Push']),
                 pick(['Rotational Core', 'Plank Core']),
             ] : [
                 pick(['Explosive']),
                 pick(['Hip Dominant']),
                 pick(['Vertical Pull']),
                 pick(['Horizontal Pull']),
                 pick(['Plank Core', 'Rotational Core']),
             ];'''

        new_gen_logic = '''             const lockKey = `saved_workout_${num}`;
             const lockedData = localStorage.getItem(lockKey);
             let genExercises = [];

             if (lockedData) {
                 try {
                     const parsed = JSON.parse(lockedData);
                     if (parsed.type === type) {
                         genExercises = parsed.exercises;
                     } else { throw new Error("Type mismatch"); }
                 } catch(e) { }
             }

             if (genExercises.length === 0) {
                 genExercises = type === 'Push' ? [
                     pick(['Explosive']), pick(['Knee Dominant']), pick(['Vertical Push']), pick(['Horizontal Push']), pick(['Rotational Core', 'Plank Core']),
                 ] : [
                     pick(['Explosive']), pick(['Hip Dominant']), pick(['Vertical Pull']), pick(['Horizontal Pull']), pick(['Plank Core', 'Rotational Core']),
                 ];
                 localStorage.setItem(lockKey, JSON.stringify({ type, exercises: genExercises }));
             }'''
        
        if 'const lockKey' not in content:
             content = content.replace(old_gen_logic, new_gen_logic)

        # 2. Cleanup on Complete
        if 'localStorage.removeItem(`saved_workout_${currentWorkout.workoutNum}`)' not in content:
            content = content.replace('localStorage.setItem(NUM_KEY, num);', 'localStorage.setItem(NUM_KEY, num);\\n            localStorage.removeItem(`saved_workout_${currentWorkout.workoutNum}`);')

        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Plan Persistence migrated to {os.path.basename(path)}")
