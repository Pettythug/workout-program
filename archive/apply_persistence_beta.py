import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-variation-beta.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Implementation of STATE LOCKING (Persistence across refresh)
# We need to update the workout generation logic to check localStorage first.
# I will find the generateWorkout function and the logic that calls it.

old_gen_logic = '''            currentWorkout = {
                type: type,
                workoutNum: num,
                repRange: activeRange, 
                exercises: genExercises
            };'''

new_gen_logic = '''            // STATE LOCKING: Check if this workout number already has a saved plan
            const lockKey = `saved_workout_${num}`;
            const lockedPlan = localStorage.getItem(lockKey);
            
            if (lockedPlan) {
                try {
                    const parsed = JSON.parse(lockedPlan);
                    // Ensure the type matches (in case you changed Push/Pull)
                    if (parsed.type === type) {
                        currentWorkout = parsed;
                        console.log("Ultimate: Loaded locked plan for Workout #" + num);
                    } else {
                        throw new Error("Type mismatch");
                    }
                } catch(e) {
                    currentWorkout = { type, workoutNum: num, repRange: activeRange, exercises: genExercises };
                }
            } else {
                currentWorkout = { type, workoutNum: num, repRange: activeRange, exercises: genExercises };
                localStorage.setItem(lockKey, JSON.stringify(currentWorkout));
            }'''
content = content.replace(old_gen_logic, new_gen_logic)

# 2. Update logSet and history strings to "Workout #" instead of "Builder #"
content = content.replace('Builder #', 'Workout #')

# 3. Add SKIP logic
# First, add the skipExercise function
content = content.replace('function skipExercise(idx, exerciseName) {', '''async function skipExercise(idx, exerciseName) {
            const reason = prompt("Reason for skipping? (Optional)", "");
            if (reason === null) return; // Cancelled

            const btn = document.querySelector(`#card-${idx} .skip-btn`);
            const originalText = btn.textContent;
            btn.textContent = 'Skipping...';
            btn.disabled = true;

            const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            const entries = activePeople.map(p => ({
                date: dateStr,
                person: p.toLowerCase(),
                reps: "0",
                weight: "0",
                range: getRange(0) || "r1_3",
                note: `SKIPPED: ${reason || "No reason provided"} — (Workout #${currentWorkout.workoutNum})`,
                setNum: 0,
                timed: false
            }));

            try {
                await sheetsPost({ action: "logSet", exercise: getStandardizedName(exerciseName), entries });
                exerciseStatus[exerciseName] = 'skipped';
                renderWorkout(currentWorkout, currentWorkout.exercises);
                showToast("Exercise marked as skipped.");
            } catch(e) {
                alert("Failed to log skip. Working offline.");
                btn.textContent = originalText;
                btn.disabled = false;
            }
        }
        function old_skipExercise(idx, exerciseName) {''')

# 4. Update the Complete Workout guard
content = content.replace('async function completeWorkout() {', '''async function completeWorkout() {
            const pending = currentWorkout.exercises.filter(ex => !exerciseStatus[ex.name] || (exerciseStatus[ex.name] !== 'done' && exerciseStatus[ex.name] !== 'skipped'));
            
            if (pending.length > 0) {
                const confirmSkip = confirm(`You have ${pending.length} unfinished exercises. Mark them all as skipped and complete?`);
                if (!confirmSkip) return;
                
                // Auto-skip remaining
                for (const ex of pending) {
                    const idx = currentWorkout.exercises.findIndex(e => e.name === ex.name);
                    // We don't prompt for reason here to keep it fast
                    const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    const entries = activePeople.map(p => ({
                        date: dateStr,
                        person: p.toLowerCase(),
                        reps: "0",
                        weight: "0",
                        range: "r1_3",
                        note: `AUTO-SKIPPED on Completion — (Workout #${currentWorkout.workoutNum})`,
                        setNum: 0,
                        timed: false
                    }));
                    await sheetsPost({ action: "logSet", exercise: getStandardizedName(ex.name), entries });
                    exerciseStatus[ex.name] = 'skipped';
                }
            }
''')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Implemented State Locking, Smart Skip, and Completion Guard in Beta.")
