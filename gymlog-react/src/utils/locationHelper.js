export function normalizeLocation(loc) {
    if (!loc) return "";
    const trimmed = loc.trim().toLowerCase();
    if (trimmed === "gym") return "24 hour fitness";
    return trimmed;
}

export function matchesLocation(exerciseLocation, activeLocation) {
    if (!activeLocation || activeLocation.trim().toLowerCase() === "all") return true;
    if (!exerciseLocation || !exerciseLocation.trim()) return true; // Blank is Anywhere
    
    const activeNorm = normalizeLocation(activeLocation);
    const locs = exerciseLocation
        .split(',')
        .map(l => normalizeLocation(l))
        .filter(Boolean);
    
    if (locs.length === 0 || locs.includes("anywhere")) return true;
    return locs.includes(activeNorm);
}
