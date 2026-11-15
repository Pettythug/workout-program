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

function matchesHistoryEntry(a, b) {
    if (!a || !b) return false;
    const samePerson = cleanName(a.person) === cleanName(b.person);
    const sameReps = String(a.reps ?? '').trim() === String(b.reps ?? '').trim();
    const sameWeight = String(a.weight ?? '').trim() === String(b.weight ?? '').trim();
    const sameSetNum = (a.setNum !== undefined && a.setNum !== null && a.setNum !== '' && b.setNum !== undefined && b.setNum !== null && b.setNum !== '')
        ? Number(a.setNum || 1) === Number(b.setNum || 1)
        : true;
    const sameDate = (a.date && b.date)
        ? String(a.date).trim() === String(b.date).trim()
        : true;
    return samePerson && sameReps && sameWeight && sameSetNum && sameDate;
}

function getPendingSetsForExercise(exName, pendingSets) {
    const target = cleanName(exName);
    const result = [];
    (pendingSets || []).forEach(item => {
        if (!item) return;
        if (cleanName(item.exercise) === target) {
            if (Array.isArray(item.entries)) {
                result.push(...item.entries);
            } else {
                result.push(item);
            }
        }
    });
    return result;
}

function getPendingDeletesForExercise(exName, pendingDeletes) {
    const target = cleanName(exName);
    return (pendingDeletes || []).filter(d => d && cleanName(d.exercise) === target);
}

function mergeExerciseHistory(sheetHistory, localHistory, exPendingSets = [], exPendingDeletes = []) {
    const filteredSheetHistory = (sheetHistory || []).filter(
        sh => !(exPendingDeletes || []).some(del => matchesHistoryEntry(sh, del))
    );
    const mergedHistory = [...filteredSheetHistory];
    const todayStr = new Date().toDateString();

    (localHistory || []).forEach(lh => {
        if ((exPendingDeletes || []).some(del => matchesHistoryEntry(lh, del))) return;
        const isToday = Boolean(lh.date && new Date(lh.date).toDateString() === todayStr);
        const isPending = (exPendingSets || []).some(ps => matchesHistoryEntry(lh, ps));
        if (!isToday && !isPending) return;

        const isDuplicate = mergedHistory.some(sh => {
            if (matchesHistoryEntry(sh, lh)) return true;
            const samePerson = cleanName(sh.person) === cleanName(lh.person);
            const sameReps = String(sh.reps) === String(lh.reps);
            const sameWeight = String(sh.weight) === String(lh.weight);
            const sameSetNum = (sh.setNum !== undefined && lh.setNum !== undefined)
                ? Number(sh.setNum || 1) === Number(lh.setNum || 1)
                : true;
            const sameExactTime = Boolean(sh.date && lh.date && sh.date === lh.date);
            const sameCalendarDay = (sh.date && lh.date)
                ? new Date(sh.date).toDateString() === new Date(lh.date).toDateString()
                : true;

            return samePerson && sameReps && sameWeight && sameCalendarDay && (sameExactTime || sameSetNum);
        });
        if (!isDuplicate) {
            mergedHistory.push(lh);
        }
    });

    (exPendingSets || []).forEach(ps => {
        if ((exPendingDeletes || []).some(del => matchesHistoryEntry(ps, del))) return;
        const alreadyIncluded = mergedHistory.some(mh => matchesHistoryEntry(mh, ps));
        if (!alreadyIncluded) {
            mergedHistory.push(ps);
        }
    });

    return mergedHistory;
}

function resolveMergedBest(exerciseName, mergedHistory, sheetBest, makeBest, hasPendingChanges = false) {
    const fallbackBest = sheetBest || makeBest();
    if (isDedicatedBandExercise(exerciseName) && !hasPendingChanges) {
        return fallbackBest;
    }
    if (!hasPendingChanges && !mergedHistory.some(h => isBandTaggedEntry(h))) {
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
        } else if (!hasPendingChanges && !personHasBandEntries && fallbackBest[personKey]) {
            mergedBest[personKey] = fallbackBest[personKey];
        } else {
            mergedBest[personKey] = { r1_3: null, r4_7: null, r8_12: null, r13_plus: null };
        }
    });

    return mergedBest;
}

export function mergeFromSheets(localExercises, sheetsData, localPeople = [], localLocations = [], pendingSets = [], pendingDeletes = []) {
    const { history: allHistory = [], best: allBest = {}, people: sheetPeople, exercises: sheetExercises, locations: sheetDerivedLocs } = sheetsData || {};
    const hasSheetHistory = Array.isArray(sheetsData?.history);
    const people = (sheetPeople && sheetPeople.length > 0) ? sheetPeople : localPeople;
    const mergedLocs = [...new Set([...localLocations, ...(sheetDerivedLocs || [])])];

    const makeBest = () => {
        const b = {};
        people.forEach(p => { b[p.toLowerCase()] = {}; });
        return b;
    };

    let baseExercises = localExercises || [];
    if (sheetExercises && sheetExercises.length > 0) {
        baseExercises = baseExercises.filter(ex =>
            sheetExercises.some(se => cleanName(se.name) === cleanName(ex.name)) ||
            getPendingSetsForExercise(ex.name, pendingSets).length > 0 ||
            (ex.history && ex.history.length > 0)
        );
    }

    const merged = baseExercises.map(ex => {
        const sheetHistory = hasSheetHistory
            ? allHistory.filter(h => cleanName(h.exercise) === cleanName(ex.name))
            : (ex.history || []);
        const bestKey = Object.keys(allBest).find(k => cleanName(k) === cleanName(ex.name));
        const sheetBest = bestKey ? allBest[bestKey] : ex.best;
        const sheetExInfo  = (sheetExercises || []).find(e => cleanName(e.name) === cleanName(ex.name));
        
        let fileReference = getImageFile(ex.name) || getImageFile(sheetExInfo?.name);
        if (!fileReference) {
            fileReference = sheetExInfo?.fileReference ?? ex.fileReference;
            if (!fileReference && ex.name) {
                fileReference = `${ex.name.replace(/\//g, '_')}.jpg`;
            }
        }

        const exPendingSets = getPendingSetsForExercise(ex.name, pendingSets);
        const exPendingDeletes = getPendingDeletesForExercise(ex.name, pendingDeletes);
        const hasPendingChanges = exPendingSets.length > 0 || exPendingDeletes.length > 0;
        const mergedHistory = mergeExerciseHistory(sheetHistory, ex.history, exPendingSets, exPendingDeletes);

        return {
            ...ex,
            fileReference,
            timed:     sheetExInfo?.timed     ?? ex.timed     ?? false,
            category:  sheetExInfo?.category  ?? ex.category  ?? "",
            location:  sheetExInfo?.location  ?? ex.location  ?? "Anywhere",
            isCircuit: sheetExInfo?.isCircuit ?? ex.isCircuit ?? false,
            history:   mergedHistory,
            best:      resolveMergedBest(ex.name, mergedHistory, sheetBest, makeBest, hasPendingChanges),
        };
    });

    // Add any exercises from sheets that aren't in localExercises
    const localExNames = new Set((localExercises || []).map(e => cleanName(e.name)));
    if (sheetExercises) {
        sheetExercises.forEach(sheetEx => {
            if (!localExNames.has(cleanName(sheetEx.name))) {
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

                const exPendingSets = getPendingSetsForExercise(sheetEx.name, pendingSets);
                const exPendingDeletes = getPendingDeletesForExercise(sheetEx.name, pendingDeletes);
                const hasPendingChanges = exPendingSets.length > 0 || exPendingDeletes.length > 0;
                const mergedHistory = mergeExerciseHistory(sheetHistory, sheetEx.history, exPendingSets, exPendingDeletes);

                merged.push({
                    ...sheetEx,
                    fileReference,
                    timed: sheetEx.timed ?? false,
                    category: sheetEx.category ?? "",
                    location: sheetEx.location ?? "Anywhere",
                    history: mergedHistory,
                    best: resolveMergedBest(sheetEx.name, mergedHistory, sheetBest, makeBest, hasPendingChanges),
                });
            }
        });
    }

    return { exercises: merged, people, locations: mergedLocs };
}
