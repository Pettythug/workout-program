export function mergeFromSheets(localExercises, sheetsData, localPeople = [], localLocations = []) {
    const { history: allHistory = [], best: allBest = {}, people: sheetPeople, exercises: sheetExercises, locations: sheetDerivedLocs } = sheetsData;
    const people = (sheetPeople && sheetPeople.length > 0) ? sheetPeople : localPeople;
    const mergedLocs = [...new Set([...localLocations, ...(sheetDerivedLocs || [])])];

    const makeBest = () => {
        const b = {};
        people.forEach(p => { b[p.toLowerCase()] = {}; });
        return b;
    };

    const merged = (localExercises || []).map(ex => {
        const sheetHistory = allHistory.filter(h => h.exercise === ex.name);
        const sheetBest    = allBest[ex.name];
        const sheetExInfo  = (sheetExercises || []).find(e => e.name === ex.name);
        return {
            ...ex,
            timed:    sheetExInfo?.timed    ?? ex.timed    ?? false,
            category: sheetExInfo?.category ?? ex.category ?? "",
            location: sheetExInfo?.location ?? ex.location ?? "Anywhere",
            history:  sheetHistory,
            best:     sheetBest || makeBest(),
        };
    });

    // Add any exercises from sheets that aren't in localExercises
    const localExNames = new Set((localExercises || []).map(e => e.name));
    if (sheetExercises) {
        sheetExercises.forEach(sheetEx => {
            if (!localExNames.has(sheetEx.name)) {
                const sheetHistory = allHistory.filter(h => h.exercise === sheetEx.name);
                const sheetBest    = allBest[sheetEx.name];
                merged.push({
                    ...sheetEx,
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
