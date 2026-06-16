import { MACHINE_IMAGE_MAP } from '../utils/imageMapping';

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
        const sheetHistory = allHistory.filter(h => h.exercise === ex.name);
        const sheetBest    = allBest[ex.name];
        const sheetExInfo  = (sheetExercises || []).find(e => e.name === ex.name);
        
        let fileReference = MACHINE_IMAGE_MAP[ex.name] || MACHINE_IMAGE_MAP[sheetExInfo?.name];
        if (!fileReference) {
            fileReference = sheetExInfo?.fileReference ?? ex.fileReference;
            if (!fileReference && ex.name) {
                fileReference = `${ex.name.replace(/\//g, '_')}.jpg`;
            }
        }

        return {
            ...ex,
            fileReference,
            timed:     sheetExInfo?.timed     ?? ex.timed     ?? false,
            category:  sheetExInfo?.category  ?? ex.category  ?? "",
            location:  sheetExInfo?.location  ?? ex.location  ?? "Anywhere",
            isCircuit: sheetExInfo?.isCircuit ?? ex.isCircuit ?? false,
            history:   sheetHistory,
            best:      sheetBest || makeBest(),
        };
    });

    // Add any exercises from sheets that aren't in localExercises
    const localExNames = new Set((localExercises || []).map(e => e.name));
    if (sheetExercises) {
        sheetExercises.forEach(sheetEx => {
            if (!localExNames.has(sheetEx.name)) {
                const sheetHistory = allHistory.filter(h => h.exercise === sheetEx.name);
                const sheetBest    = allBest[sheetEx.name];
                
                let fileReference = MACHINE_IMAGE_MAP[sheetEx.name];
                if (!fileReference) {
                    fileReference = sheetEx.fileReference;
                    if (!fileReference && sheetEx.name) {
                        fileReference = `${sheetEx.name.replace(/\//g, '_')}.jpg`;
                    }
                }

                merged.push({
                    ...sheetEx,
                    fileReference,
                    timed: sheetEx.timed ?? false,
                    category: sheetEx.category ?? "",
                    location: sheetEx.location ?? "Anywhere",
                    history: sheetHistory,
                    best: sheetBest || makeBest(),
                });
            }
        });
    }

    return { exercises: merged, people, locations: mergedLocs };
}
