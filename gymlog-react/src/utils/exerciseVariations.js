const KNOWN_MODIFIER_TOKENS = new Set([
    'barbell',
    'db',
    'dumbbell',
    'band',
    'cable',
    'single',
    'alt',
    'overhand',
    'underhand',
    'neutral'
]);

const REP_RANGES = ['r1_3', 'r4_7', 'r8_12', 'r13_plus'];

export const INITIAL_VARIATION_OPTIONS = {
    barbell: false,
    dumbbell: false,
    band: false,
    cable: false,
    single: false,
    alt: false,
    overhand: false,
    underhand: false,
    neutral: false
};

function parseVariationName(name) {
    let base = String(name || '').trim();
    const tokens = [];

    while (base) {
        const match = base.match(/\s*\(([^()]+)\)\s*$/);
        if (!match) break;

        const groupTokens = match[1]
            .split(',')
            .map(token => token.trim())
            .filter(Boolean);

        if (groupTokens.length > 0 && groupTokens.every(t => KNOWN_MODIFIER_TOKENS.has(t.toLowerCase()))) {
            tokens.unshift(...groupTokens.map(t => t.toLowerCase()));
            base = base.slice(0, match.index).trim();
        } else {
            break;
        }
    }

    return { baseName: base, tokens };
}

export function extractBaseName(name) {
    return parseVariationName(name).baseName;
}

export function extractEquipmentTag(name) {
    const { tokens } = parseVariationName(name);
    if (tokens.includes('barbell')) return 'Barbell';
    if (tokens.includes('db') || tokens.includes('dumbbell')) return 'DB';
    if (tokens.includes('band')) return 'Band';
    if (tokens.includes('cable')) return 'Cable';
    return null;
}

function formatVariation(baseName, modifiers) {
    const cleanModifiers = modifiers.filter(Boolean);
    if (cleanModifiers.length === 0) return baseName;
    return `${baseName} (${cleanModifiers.join(', ')})`;
}

export function buildVariationNames(baseName, options = {}) {
    const cleanBase = String(baseName || '').trim();
    if (!cleanBase) return [];

    const {
        standard = false,
        barbell = false,
        dumbbell = false,
        band = false,
        cable = false,
        single = false,
        alt = false,
        overhand = false,
        underhand = false,
        neutral = false
    } = options;

    const results = [];
    const seen = new Set();

    const addName = (modifiers = []) => {
        const formatted = formatVariation(cleanBase, modifiers).trim();
        const key = formatted.toLowerCase();
        if (formatted && !seen.has(key)) {
            seen.add(key);
            results.push(formatted);
        }
    };

    const executions = [];
    if (single) executions.push('Single');
    if (alt) executions.push('Alt');

    const grips = [];
    if (overhand) grips.push('Overhand');
    if (underhand) grips.push('Underhand');
    if (neutral) grips.push('Neutral');

    const hasAnyEquipment = Boolean(barbell || dumbbell || band || cable);
    const hasGrips = grips.length > 0;

    // 1. No equipment checked (or explicit standard fallback)
    if (!hasAnyEquipment || standard) {
        if (hasGrips) {
            grips.forEach(grip => addName([grip]));
            executions.forEach(exec => {
                grips.forEach(grip => addName([exec, grip]));
            });
        } else {
            addName([]);
            executions.forEach(exec => addName([exec]));
        }
    }

    // 2. Barbell never auto-combines with Single or Alt
    if (barbell) {
        if (hasGrips) {
            grips.forEach(grip => addName(['Barbell', grip]));
        } else {
            addName(['Barbell']);
        }
    }

    // 3. Dumbbell (DB), Band, and/or Cable
    const equipmentList = [];
    if (dumbbell) equipmentList.push('DB');
    if (band) equipmentList.push('Band');
    if (cable) equipmentList.push('Cable');

    equipmentList.forEach(eq => {
        if (hasGrips) {
            grips.forEach(grip => addName([eq, grip]));
            executions.forEach(exec => {
                grips.forEach(grip => addName([eq, exec, grip]));
            });
        } else {
            addName([eq]);
            executions.forEach(exec => addName([eq, exec]));
        }
    });

    return results;
}

export function isBandTaggedEntry(entry) {
    if (!entry) return false;
    return entry.usedBand === true || /\[band\]/i.test(String(entry.note || ''));
}

export function isDedicatedBandExercise(exerciseName) {
    return /\bband(s)?\b/i.test(String(exerciseName || ''));
}

export function calculateBestForExercise(exercise) {
    if (!exercise || !exercise.history) return {};
    const dedicatedBand = isDedicatedBandExercise(exercise.name);
    const byPerson = {};

    (exercise.history || []).forEach(entry => {
        if (!entry) return;
        if (!dedicatedBand && isBandTaggedEntry(entry)) return;

        const reps = parseInt(String(entry.reps || '').replace(/[^0-9]/g, ''), 10) || 0;
        if (reps <= 0) return; // Strictly exclude entries with reps <= 0 or duration <= 0

        const person = (entry.person || '').toLowerCase().trim();
        if (!person) return;

        let range = entry.range;
        if (range === '1-3' || range === '1_3') range = 'r1_3';
        else if (range === '4-7' || range === '4_7') range = 'r4_7';
        else if (range === '8-12' || range === '8_12') range = 'r8_12';
        else if (range === '13+' || range === '13_plus' || range === '13') range = 'r13_plus';
        if (!REP_RANGES.includes(range)) return;

        if (!byPerson[person]) {
            byPerson[person] = { r1_3: null, r4_7: null, r8_12: null, r13_plus: null };
        }

        const current = byPerson[person][range];
        const newW = parseFloat(String(entry.weight || '').replace(/[^0-9.-]/g, '')) || 0;
        const curW = current ? (parseFloat(String(current.weight || '').replace(/[^0-9.-]/g, '')) || 0) : 0;
        const curR = current ? (parseInt(String(current.reps || '').replace(/[^0-9]/g, ''), 10) || 0) : 0;

        if (!current || newW > curW || (newW === curW && reps > curR)) {
            byPerson[person][range] = { reps: entry.reps, weight: entry.weight };
        }
    });

    return byPerson;
}
