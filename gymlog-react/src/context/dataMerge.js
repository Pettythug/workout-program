import { MACHINE_IMAGE_MAP } from '../utils/imageMapping';
import {
    calculateBestForExercise,
    isBandTaggedEntry,
    isDedicatedBandExercise
} from '../utils/exerciseVariations';

function getImageFile(name) {
    if (!name) return null;
    if (MACHINE_IMAGE_MAP[name]) return MACHINE_IMAGE_MAP[name];
    const normalized = name.replace(/\bISO-Lateral\b/gi, "Iso-Lateral");
    return MACHINE_IMAGE_MAP[normalized] || null;
}

const cleanName = n => (n || '').trim().toLowerCase();

function mergeExerciseHistory(sheetHistory, localHistory) {
    const mergedHistory = [...sheetHistory];
    const todayStr = new Date().toDateString();

    (localHistory || []).forEach(lh => {
        const isToday = lh.date && new Date(lh.date).toDateString() === todayStr;
        if (!isToday) return;

        const isDuplicate = sheetHistory.some(sh => {
            const samePerson = cleanName(sh.person) === cleanName(lh.person);
            const sameReps = String(sh.reps) === String(lh.reps);
            const sameWeight = String(sh.weight) === String(lh.weight);
            const sameSetNum = (sh.setNum !== undefined && lh.setNum !== undefined)
                ? Number(sh.setNum || 1) === Number(lh.setNum || 1)
                : true;
            const sameExactTime = Boolean(sh.date && lh.date && sh.date === lh.date);

            return samePerson && sameReps && sameWeight && (sameExactTime || sameSetNum);
        });
        if (!isDuplicate) {
            mergedHistory.push(lh);
        }
    });

    return mergedHistory;
}

function resolveMergedBest(exerciseName, mergedHistory, sheetBest, makeBest) {
    const fallbackBest = sheetBest || makeBest();
    if (isDedicatedBandExercise(exerciseName) || !mergedHistory.some(h => isBandTaggedEntry(h))) {
        return fallbackBest;
    }

    const computedBest = calculateBestForExercise({ name: exerciseName, history: mergedHistory });
    const mergedBest = makeBest();
    const personKeys = new Set([
        ...Object.keys(mergedBest),
        ...Object.keys(fallbackBest),
        ...Object.keys(computedBest)
    ]);

    personKeys.forEach(personKey => {
        const computedForPerson = computedBest[personKey];
        const hasComputedEntries = computedForPerson && Object.values(computedForPerson).some(Boolean);
        const personHasBandEntries = mergedHistory.some(
            h => cleanName(h.person) === personKey && isBandTaggedEntry(h)
        );

        if (hasComputedEntries) {
            mergedBest[personKey] = computedForPerson;
        } else if (!personHasBandEntries && fallbackBest[personKey]) {
            mergedBest[personKey] = fallbackBest[personKey];
        } else {
            mergedBest[personKey] = { r1_3: null, r4_7: null, r8_12: null, r13_plus: null };
        }
    });

    return mergedBest;
}

export function mergeFromSheets(localExercises, sheetsData, localPeople = [], localLocations = []) {
    const { history: allHistory = [], best: allBest = {}, people: sheetPeople, exercises: sheetExercises, locations: sheetDerivedLocs } = sheetsData;
    const people = (sheetPeople && sheetPeople.length > 0) ? sheetPeople : localPeople;
    const mergedLocs = [...new Set([...localLocations, ...(sheetDerivedLocs || [])])];

    const makeBest = () => {
        const b = {};
        people.forEach(p => { b[p.toLowerCase()] = {}; });
        return b;
    };

    let baseExercises = localExercises || [];
    if (sheetExercises && sheetExercises.length > 0) {
        baseExercises = baseExercises.filter(ex => sheetExercises.some(se => se.name === ex.name));
    }

    const merged = baseExercises.map(ex => {
        const sheetHistory = allHistory.filter(h => cleanName(h.exercise) === cleanName(ex.name));
        const bestKey = Object.keys(allBest).find(k => cleanName(k) === cleanName(ex.name));
        const sheetBest = bestKey ? allBest[bestKey] : undefined;
        const sheetExInfo  = (sheetExercises || []).find(e => cleanName(e.name) === cleanName(ex.name));
        
        let fileReference = getImageFile(ex.name) || getImageFile(sheetExInfo?.name);
        if (!fileReference) {
            fileReference = sheetExInfo?.fileReference ?? ex.fileReference;
            if (!fileReference && ex.name) {
                fileReference = `${ex.name.replace(/\//g, '_')}.jpg`;
            }
        }

        const mergedHistory = mergeExerciseHistory(sheetHistory, ex.history);

        return {
            ...ex,
            fileReference,
            timed:     sheetExInfo?.timed     ?? ex.timed     ?? false,
            category:  sheetExInfo?.category  ?? ex.category  ?? "",
            location:  sheetExInfo?.location  ?? ex.location  ?? "Anywhere",
            isCircuit: sheetExInfo?.isCircuit ?? ex.isCircuit ?? false,
            history:   mergedHistory,
            best:      resolveMergedBest(ex.name, mergedHistory, sheetBest, makeBest),
        };
    });

    // Add any exercises from sheets that aren't in localExercises
    const localExNames = new Set((localExercises || []).map(e => e.name));
    if (sheetExercises) {
        sheetExercises.forEach(sheetEx => {
            if (!localExNames.has(sheetEx.name)) {
                const sheetHistory = allHistory.filter(h => cleanName(h.exercise) === cleanName(sheetEx.name));
                const bestKey = Object.keys(allBest).find(k => cleanName(k) === cleanName(sheetEx.name));
                const sheetBest = bestKey ? allBest[bestKey] : undefined;
                
                let fileReference = getImageFile(sheetEx.name);
                if (!fileReference) {
                    fileReference = sheetEx.fileReference;
                    if (!fileReference && sheetEx.name) {
                        fileReference = `${sheetEx.name.replace(/\//g, '_')}.jpg`;
                    }
                }

                const mergedHistory = mergeExerciseHistory(sheetHistory, sheetEx.history);

                merged.push({
                    ...sheetEx,
                    fileReference,
                    timed: sheetEx.timed ?? false,
                    category: sheetEx.category ?? "",
                    location: sheetEx.location ?? "Anywhere",
                    history: mergedHistory,
                    best: resolveMergedBest(sheetEx.name, mergedHistory, sheetBest, makeBest),
                });
            }
        });
    }

    return { exercises: merged, people, locations: mergedLocs };
}
