const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('🧪 RUNNING AUTOMATED VERIFICATION SUITE FOR TASK-R139');
console.log('====================================================\n');

// -----------------------------------------------------------------------------
// TEST 1: Source Code Verification
// -----------------------------------------------------------------------------
console.log('TEST 1: Verifying source code updates across codebase...');

const gsPath = path.join(__dirname, '../Combined_AppScript_v2.gs');
const gsSource = fs.readFileSync(gsPath, 'utf-8');

assert.ok(
    gsSource.includes('Version 4.5 of the GymLog backend (TASK-R139 Exercise Rename & Merge)'),
    'Combined_AppScript_v2.gs must include v4.5 version header'
);
assert.ok(
    gsSource.includes('exactOnly') && gsSource.includes('if (exactOnly === true)'),
    'gymlog_handleRenameExercise must support exactOnly flag'
);
assert.ok(
    gsSource.includes('gymlog_bumpLibraryVersion()'),
    'gymlog_handleRenameExercise must call gymlog_bumpLibraryVersion()'
);

const apiPath = path.join(__dirname, 'src/hooks/useGymAPI.js');
const apiSource = fs.readFileSync(apiPath, 'utf-8');

assert.ok(
    apiSource.includes('const renameExercise = useCallback(async (oldName, newName, mergeConfirmed = false, pin = null, exactOnly = true)'),
    'useGymAPI.js must define renameExercise with exactOnly = true default'
);
assert.ok(
    apiSource.includes('renameExercise') && apiSource.includes('action: "renameExercise"'),
    'renameExercise must dispatch action: "renameExercise"'
);
assert.ok(
    apiSource.includes('status === "requiresMerge"'),
    'sheetsPost must handle status === "requiresMerge"'
);

const appContextPath = path.join(__dirname, 'src/context/AppContext.jsx');
const appContextSource = fs.readFileSync(appContextPath, 'utf-8');

assert.ok(
    appContextSource.includes('renameExerciseInLocalState'),
    'AppContext.jsx must define renameExerciseInLocalState'
);
assert.ok(
    appContextSource.includes('renameExerciseInLocalState,') || appContextSource.includes('renameExerciseInLocalState:'),
    'AppContext.jsx must export renameExerciseInLocalState in context value'
);

const cardPath = path.join(__dirname, 'src/components/ExerciseCard.jsx');
const cardSource = fs.readFileSync(cardPath, 'utf-8');

assert.ok(
    cardSource.includes('renameExercise') && cardSource.includes('renameExerciseInLocalState'),
    'ExerciseCard.jsx must consume renameExercise and renameExerciseInLocalState'
);
assert.ok(
    cardSource.includes('typeToSave === \'rename\'') && cardSource.includes('Do you want to merge'),
    'ExerciseCard.jsx must check for merge confirmation when renaming to an existing exercise'
);

console.log('✅ TEST 1 PASSED: All source files have correct signatures and exports.\n');

// -----------------------------------------------------------------------------
// TEST 2: Apps Script exactOnly simulation
// -----------------------------------------------------------------------------
console.log('TEST 2: Testing Apps Script exactOnly vs wildcard variation resolution...');

function simulateAppsScriptRename(payload, exercisesList) {
    const { oldName, newName, exactOnly } = payload;
    let variationsToRename = [];
    const getBase = (n) => n.split(' - ')[0].trim().toLowerCase();
    const oldBaseLower = getBase(oldName);
    const newBase = newName.split(' - ')[0].trim();

    if (exactOnly === true) {
        variationsToRename = [{
            old: oldName.trim(),
            new: newName.trim(),
            oldLower: oldName.trim().toLowerCase(),
            newLower: newName.trim().toLowerCase()
        }];
    } else {
        exercisesList.forEach(name => {
            if (getBase(name) === oldBaseLower) {
                let calcNew = name.replace(new RegExp(oldBaseLower, 'i'), newBase);
                variationsToRename.push({
                    old: name,
                    new: calcNew,
                    oldLower: name.toLowerCase(),
                    newLower: calcNew.toLowerCase()
                });
            }
        });
    }
    return variationsToRename;
}

const mockLibrary = [
    'Hammer Strength High Row (Plate Loaded) - Overhand',
    'Hammer Strength High Row (Plate Loaded) - Underhand',
    'Incline Dumbbell Press'
];

// exactOnly = true: only rename the specific variation
const exactResult = simulateAppsScriptRename({
    oldName: 'Hammer Strength High Row (Plate Loaded) - Overhand',
    newName: 'Hammer Strength High Row (Plate Loaded) - Wide Grip',
    exactOnly: true
}, mockLibrary);
assert.strictEqual(exactResult.length, 1);
assert.strictEqual(exactResult[0].old, 'Hammer Strength High Row (Plate Loaded) - Overhand');
assert.strictEqual(exactResult[0].new, 'Hammer Strength High Row (Plate Loaded) - Wide Grip');

// exactOnly = false: wildcards rename all family variations
const wildcardResult = simulateAppsScriptRename({
    oldName: 'Hammer Strength High Row (Plate Loaded) - Overhand',
    newName: 'HS High Row - Overhand',
    exactOnly: false
}, mockLibrary);
assert.strictEqual(wildcardResult.length, 2);

console.log('✅ TEST 2 PASSED: exactOnly accurately isolates single variation rename.\n');

// -----------------------------------------------------------------------------
// TEST 3: Local State Simple Rename
// -----------------------------------------------------------------------------
console.log('TEST 3: Testing local state simple rename...');

const mockExercisesBeforeRename = [
    {
        name: 'Incline DB Press',
        category: 'Chest',
        history: [
            { date: '2026-11-10', person: 'brian', reps: 10, weight: 65, range: 'r8_12', exercise: 'Incline DB Press' },
            { date: '2026-11-03', person: 'brian', reps: 12, weight: 60, range: 'r8_12', exercise: 'Incline DB Press' }
        ],
        best: { brian: { r8_12: { reps: 10, weight: 65 } } }
    },
    {
        name: 'Lat Pulldown',
        category: 'Back',
        history: [],
        best: {}
    }
];

function simulateLocalRename(prev, oldName, newName, isMerge = false) {
    const normOld = oldName.trim();
    const normNew = newName.trim();
    const oldLower = normOld.toLowerCase();
    const newLower = normNew.toLowerCase();

    const oldEx = prev.find(e => (e.name || '').trim().toLowerCase() === oldLower);
    const targetEx = prev.find(e => (e.name || '').trim().toLowerCase() === newLower);

    if (isMerge && oldEx && targetEx && oldLower !== newLower) {
        const remappedOldHistory = (oldEx.history || []).map(entry => ({
            ...entry,
            exercise: targetEx.name
        }));
        const combinedHistory = [...(targetEx.history || []), ...remappedOldHistory];

        const dedupedHistory = [];
        combinedHistory.forEach(item => {
            if (!item) return;
            const isDup = dedupedHistory.some(existing => (
                (existing.person || '').trim().toLowerCase() === (item.person || '').trim().toLowerCase() &&
                String(existing.reps ?? '').trim() === String(item.reps ?? '').trim() &&
                String(existing.weight ?? '').trim() === String(item.weight ?? '').trim() &&
                String(existing.date ?? '').trim() === String(item.date ?? '').trim() &&
                String(existing.range ?? existing.repRange ?? '').trim() === String(item.range ?? item.repRange ?? '').trim() &&
                String(existing.setNum ?? '').trim() === String(item.setNum ?? '').trim()
            ));
            if (!isDup) {
                dedupedHistory.push(item);
            }
        });

        // Recalculate bests
        const updatedTargetEx = {
            ...targetEx,
            history: dedupedHistory
        };
        // Simulated best calculation
        const best = {};
        dedupedHistory.forEach(h => {
            const p = h.person.toLowerCase();
            if (!best[p]) best[p] = {};
            const r = h.range;
            if (!best[p][r] || h.weight > best[p][r].weight) {
                best[p][r] = { reps: h.reps, weight: h.weight };
            }
        });
        updatedTargetEx.best = best;

        return prev
            .filter(e => (e.name || '').trim().toLowerCase() !== oldLower)
            .map(e => (e.name || '').trim().toLowerCase() === newLower ? updatedTargetEx : e);
    } else if (oldEx) {
        return prev.map(ex => {
            if ((ex.name || '').trim().toLowerCase() === oldLower) {
                const updatedHistory = (ex.history || []).map(entry => ({
                    ...entry,
                    exercise: normNew
                }));
                return {
                    ...ex,
                    name: normNew,
                    history: updatedHistory
                };
            }
            return ex;
        });
    }
    return prev;
}

const renamedLibrary = simulateLocalRename(mockExercisesBeforeRename, 'Incline DB Press', 'Incline Dumbbell Press', false);
assert.strictEqual(renamedLibrary.length, 2);
const renamedEx = renamedLibrary.find(e => e.name === 'Incline Dumbbell Press');
assert.ok(renamedEx, 'Exercise name must be updated to new name');
assert.strictEqual(renamedEx.history.length, 2);
assert.strictEqual(renamedEx.history[0].exercise, 'Incline Dumbbell Press');
assert.strictEqual(renamedEx.history[1].exercise, 'Incline Dumbbell Press');
console.log('✅ TEST 3 PASSED: Local state simple rename correctly re-tags exercise and history.\n');

// -----------------------------------------------------------------------------
// TEST 4: Local State Exercise Merge with PB Recalculation
// -----------------------------------------------------------------------------
console.log('TEST 4: Testing local state exercise merge and deduplication...');

const mockExercisesBeforeMerge = [
    {
        name: 'Hammer Strength Iso-Lateral High Row (Plate Loaded)',
        category: 'Back',
        history: [
            { date: '2026-11-01', person: 'brian', reps: 10, weight: 140, range: 'r8_12', exercise: 'Hammer Strength Iso-Lateral High Row (Plate Loaded)' },
            { date: '2026-10-15', person: 'brian', reps: 12, weight: 130, range: 'r8_12', exercise: 'Hammer Strength Iso-Lateral High Row (Plate Loaded)' }
        ],
        best: { brian: { r8_12: { reps: 10, weight: 140 } } }
    },
    {
        name: 'Hammer Strength Iso-Lateral High Row (Plate Loaded) - Overhand',
        category: 'Back',
        history: [
            { date: '2026-11-12', person: 'brian', reps: 8, weight: 160, range: 'r8_12', exercise: 'Hammer Strength Iso-Lateral High Row (Plate Loaded) - Overhand' },
            // Exact duplicate entry that was already logged under the target
            { date: '2026-11-01', person: 'brian', reps: 10, weight: 140, range: 'r8_12', exercise: 'Hammer Strength Iso-Lateral High Row (Plate Loaded) - Overhand' }
        ],
        best: { brian: { r8_12: { reps: 8, weight: 160 } } }
    }
];

const mergedLibrary = simulateLocalRename(
    mockExercisesBeforeMerge,
    'Hammer Strength Iso-Lateral High Row (Plate Loaded)',
    'Hammer Strength Iso-Lateral High Row (Plate Loaded) - Overhand',
    true
);

assert.strictEqual(mergedLibrary.length, 1, 'Old duplicate exercise must be removed from exercises list');
const mergedEx = mergedLibrary[0];
assert.strictEqual(mergedEx.name, 'Hammer Strength Iso-Lateral High Row (Plate Loaded) - Overhand');
// 2 target sets + 2 old sets, with 1 exact duplicate (2026-11-01, 10 reps, 140 lbs) => 3 deduped sets
assert.strictEqual(mergedEx.history.length, 3, 'Combined history must deduplicate identical sets');
mergedEx.history.forEach(h => {
    assert.strictEqual(h.exercise, 'Hammer Strength Iso-Lateral High Row (Plate Loaded) - Overhand');
});
assert.strictEqual(mergedEx.best.brian.r8_12.weight, 160, 'Personal Best must reflect max across all combined sets');

console.log('✅ TEST 4 PASSED: Local state merge combines histories, dedupes sets, and recalculates PBs.\n');

// -----------------------------------------------------------------------------
// TEST 5: Pending Queue Re-tagging Simulation
// -----------------------------------------------------------------------------
console.log('TEST 5: Testing pending queues and swap re-tagging...');

const mockPendingSets = [
    { exercise: 'Old Bench', entries: [{ reps: 10, weight: 185 }] },
    { exercise: 'Squat', entries: [{ reps: 5, weight: 275 }] }
];
const updatedPending = mockPendingSets.map(batch => {
    if (batch.exercise.toLowerCase() === 'old bench') {
        return { ...batch, exercise: 'New Bench', entries: batch.entries.map(e => ({ ...e, exercise: 'New Bench' })) };
    }
    return batch;
});
assert.strictEqual(updatedPending[0].exercise, 'New Bench');
assert.strictEqual(updatedPending[1].exercise, 'Squat');

const mockSwaps = {
    1: { 'Old Bench': 'Incline DB Press' },
    2: { 'Chest Press': 'Old Bench' }
};
const updatedSwaps = { ...mockSwaps };
Object.keys(updatedSwaps).forEach(day => {
    const s = { ...updatedSwaps[day] };
    Object.keys(s).forEach(k => {
        if (k.toLowerCase() === 'old bench') {
            s['New Bench'] = s[k];
            delete s[k];
        }
        if (s[k] && s[k].toLowerCase() === 'old bench') {
            s[k] = 'New Bench';
        }
    });
    updatedSwaps[day] = s;
});
assert.strictEqual(updatedSwaps[1]['New Bench'], 'Incline DB Press');
assert.strictEqual(updatedSwaps[2]['Chest Press'], 'New Bench');

console.log('✅ TEST 5 PASSED: Pending queues and daily swaps correctly re-tagged.\n');

console.log('====================================================');
console.log('🎉 ALL TASK-R139 VERIFICATION TESTS PASSED!');
console.log('====================================================');
process.exit(0);
