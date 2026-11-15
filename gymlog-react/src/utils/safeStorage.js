export function safeParseJSON(raw, fallback = null) {
    if (raw === null || raw === undefined || raw === '') return fallback;
    try {
        const parsed = JSON.parse(raw);
        return parsed !== null && parsed !== undefined ? parsed : fallback;
    } catch (e) {
        console.warn('[safeParseJSON] Corrupted JSON detected, using fallback:', e);
        return fallback;
    }
}

export function safeReadLocalJSON(key, fallback = null) {
    try {
        const raw = localStorage.getItem(key);
        return safeParseJSON(raw, fallback);
    } catch (e) {
        return fallback;
    }
}
