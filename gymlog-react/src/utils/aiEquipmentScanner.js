import { extractBaseName, INITIAL_VARIATION_OPTIONS } from './exerciseVariations.js';

export const CORE_MOVEMENT_CATEGORIES = [
    'Horizontal Push',
    'Vertical Push',
    'Horizontal Pull',
    'Vertical Pull',
    'Squat',
    'Hinge',
    'Biceps',
    'Triceps',
    'Core'
];

export const AI_PROVIDER_OPTIONS = [
    {
        id: 'gemini',
        label: 'Google Gemini (Free Tier - 1,500/day)',
        defaultModel: 'gemini-2.5-flash',
        models: ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'],
        keyHelpUrl: 'https://aistudio.google.com/apikey',
        keyPlaceholder: 'AIzaSy...'
    },
    {
        id: 'openai',
        label: 'OpenAI (GPT-4o-mini / GPT-4o)',
        defaultModel: 'gpt-4o-mini',
        models: ['gpt-4o-mini', 'gpt-4o'],
        keyHelpUrl: 'https://platform.openai.com/api-keys',
        keyPlaceholder: 'sk-...'
    },
    {
        id: 'anthropic',
        label: 'Anthropic (Claude 3.5 Sonnet)',
        defaultModel: 'claude-3-5-sonnet-latest',
        models: ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest'],
        keyHelpUrl: 'https://console.anthropic.com/settings/keys',
        keyPlaceholder: 'sk-ant-...'
    }
];

function normalizeTextForComparison(str) {
    return extractBaseName(String(str || ''))
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function stripGenericMachineWords(normStr) {
    return String(normStr || '')
        .replace(/\b(machine|selectorized|plate loaded|iso lateral|hammer strength|life fitness|matrix|precor|cybex|nautilus|technogym|hoist)\b/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function doesLocationInclude(exerciseLocation, targetLocation) {
    const rawLoc = String(exerciseLocation || '24 Hour Fitness').trim();
    const target = String(targetLocation || '24 Hour Fitness').trim().toLowerCase();
    if (!rawLoc) return false;
    const parts = rawLoc.split(',').map(p => p.trim().toLowerCase()).filter(Boolean);
    return parts.includes(target) || parts.includes('anywhere');
}

export function normalizeCategory(rawCategory, existingExercises = []) {
    const clean = String(rawCategory || '').trim();
    if (!clean) return 'Horizontal Push';

    const exactCore = CORE_MOVEMENT_CATEGORIES.find(
        c => c.toLowerCase() === clean.toLowerCase()
    );
    if (exactCore) return exactCore;

    const existingCategories = [
        ...new Set(
            (existingExercises || [])
                .map(e => String(e?.category || '').trim())
                .filter(Boolean)
        )
    ];
    const exactExisting = existingCategories.find(
        c => c.toLowerCase() === clean.toLowerCase()
    );
    if (exactExisting) return exactExisting;

    const lower = clean.toLowerCase();
    if (lower.includes('horizontal push') || lower.includes('chest') || lower.includes('pec') || lower.includes('bench')) {
        return 'Horizontal Push';
    }
    if (lower.includes('vertical push') || lower.includes('shoulder') || lower.includes('overhead') || lower.includes('deltoid')) {
        return 'Vertical Push';
    }
    if (lower.includes('horizontal pull') || lower.includes('row') || lower.includes('rear delt') || lower.includes('upper back')) {
        return 'Horizontal Pull';
    }
    if (lower.includes('vertical pull') || lower.includes('pulldown') || lower.includes('pull-up') || lower.includes('pullup') || lower.includes('chin') || lower.includes('lat')) {
        return 'Vertical Pull';
    }
    if (lower.includes('squat') || lower.includes('quad') || lower.includes('leg press') || lower.includes('leg extension') || lower.includes('lunge')) {
        return 'Squat';
    }
    if (lower.includes('hinge') || lower.includes('hamstring') || lower.includes('glute') || lower.includes('deadlift') || lower.includes('leg curl') || lower.includes('hip thrust')) {
        return 'Hinge';
    }
    if (lower.includes('bicep') || lower.includes('curl')) {
        return 'Biceps';
    }
    if (lower.includes('tricep') || lower.includes('dip') || lower.includes('pushdown') || lower.includes('extension')) {
        return 'Triceps';
    }
    if (lower.includes('core') || lower.includes('ab') || lower.includes('crunch') || lower.includes('torso') || lower.includes('plank')) {
        return 'Core';
    }

    return clean;
}

export function normalizeVariationOptions(rawOpts = {}) {
    const base = { ...INITIAL_VARIATION_OPTIONS };
    if (!rawOpts || typeof rawOpts !== 'object') return base;

    Object.keys(base).forEach(key => {
        base[key] = Boolean(rawOpts[key]);
    });
    if (rawOpts.db) {
        base.dumbbell = true;
    }
    return base;
}

/**
 * Checks whether a candidate exercise baseName already exists in the user's library,
 * and whether it exists at the targetLocation or only at another gym location.
 */
export function matchAgainstExerciseLibrary(
    candidateBaseName,
    existingExercises = [],
    targetLocation = '24 Hour Fitness'
) {
    const rawCandidate = String(candidateBaseName || '').trim();
    const normCandidate = normalizeTextForComparison(rawCandidate);
    const strippedCandidate = stripGenericMachineWords(normCandidate);

    if (!normCandidate || !Array.isArray(existingExercises) || existingExercises.length === 0) {
        return {
            status: 'new',
            matchedExercises: [],
            existingLocations: [],
            canonicalBaseName: rawCandidate
        };
    }

    const matchedExercises = [];

    for (const ex of existingExercises) {
        if (!ex || !ex.name) continue;
        const exBase = extractBaseName(ex.name);
        const normEx = normalizeTextForComparison(exBase);
        if (!normEx) continue;

        const isExactBaseMatch = normEx === normCandidate;
        const strippedEx = stripGenericMachineWords(normEx);

        // Allow stripped match only if both stripped strings have at least 2 words (e.g. "pec fly" == "machine pec fly")
        const strippedWordsCandidate = strippedCandidate.split(' ').filter(Boolean);
        const strippedWordsEx = strippedEx.split(' ').filter(Boolean);
        const isStrongStrippedMatch =
            strippedCandidate.length >= 6 &&
            strippedEx.length >= 6 &&
            strippedWordsCandidate.length >= 2 &&
            strippedWordsEx.length >= 2 &&
            strippedCandidate === strippedEx;

        if (isExactBaseMatch || isStrongStrippedMatch) {
            matchedExercises.push(ex);
        }
    }

    if (matchedExercises.length === 0) {
        return {
            status: 'new',
            matchedExercises: [],
            existingLocations: [],
            canonicalBaseName: rawCandidate
        };
    }

    const existingLocations = [];
    const seenLocs = new Set();
    matchedExercises.forEach(ex => {
        const rawLoc = String(ex.location || '24 Hour Fitness').trim();
        rawLoc.split(',').map(s => s.trim()).filter(Boolean).forEach(loc => {
            const lower = loc.toLowerCase();
            if (!seenLocs.has(lower)) {
                seenLocs.add(lower);
                existingLocations.push(loc);
            }
        });
    });

    const canonicalBaseName = extractBaseName(matchedExercises[0].name) || rawCandidate;
    const existsAtTarget = matchedExercises.some(ex =>
        doesLocationInclude(ex.location || '24 Hour Fitness', targetLocation)
    );

    return {
        status: existsAtTarget ? 'exists_same_location' : 'exists_other_location',
        matchedExercises,
        existingLocations,
        canonicalBaseName
    };
}

/**
 * Safely parses & normalizes raw JSON from AI vision response or sample preset.
 */
export function normalizeAIScanResult(
    rawInput,
    existingExercises = [],
    targetLocation = '24 Hour Fitness'
) {
    let rawJson = rawInput;
    if (typeof rawInput === 'string') {
        const cleaned = rawInput
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();
        try {
            rawJson = JSON.parse(cleaned);
        } catch (err) {
            const firstBrace = cleaned.indexOf('{');
            const lastBrace = cleaned.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace > firstBrace) {
                rawJson = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
            } else {
                throw new Error('Could not parse AI response as valid JSON.');
            }
        }
    }

    if (!rawJson || typeof rawJson !== 'object') {
        rawJson = {};
    }

    const manufacturer = String(rawJson.manufacturer || 'Unknown Manufacturer').trim();
    const machineTitle = String(rawJson.machineTitle || rawJson.name || 'Scanned Gym Equipment').trim();
    const summary = String(rawJson.summary || rawJson.description || '').trim();
    const rawItems = Array.isArray(rawJson.items) && rawJson.items.length > 0
        ? rawJson.items
        : [rawJson];

    let equipmentKind = String(rawJson.equipmentKind || '').toLowerCase().trim();
    if (!['strength', 'dual_strength', 'cardio'].includes(equipmentKind)) {
        const hasCardio = rawItems.some(it => String(it?.type || '').toLowerCase() === 'cardio' || it?.warmUpName);
        if (hasCardio) {
            equipmentKind = 'cardio';
        } else if (rawItems.length > 1) {
            equipmentKind = 'dual_strength';
        } else {
            equipmentKind = 'strength';
        }
    }

    const normalizedItems = rawItems.map(item => {
        const itemType = (equipmentKind === 'cardio' || String(item?.type || '').toLowerCase() === 'cardio' || Boolean(item?.warmUpName))
            ? 'cardio'
            : 'strength';

        if (itemType === 'cardio') {
            const machineName = String(item.machineName || item.baseName || machineTitle || 'Cardio Machine').trim();
            const warmUpName = String(item.warmUpName || `5 min ${machineName}`).trim();
            const coachingTip = String(
                item.coachingTip ||
                item.setupNote ||
                'Maintain steady cadence and upright posture to elevate core temperature and prime joints before loading.'
            ).trim();

            return {
                type: 'cardio',
                warmUpName,
                machineName,
                coachingTip,
                location: targetLocation
            };
        }

        const rawBaseName = extractBaseName(item.baseName || item.name || machineTitle || 'Custom Machine Exercise');
        const libraryMatch = matchAgainstExerciseLibrary(rawBaseName, existingExercises, targetLocation);
        const resolvedBaseName = libraryMatch.status !== 'new'
            ? libraryMatch.canonicalBaseName
            : rawBaseName;

        const matchedCategory = libraryMatch.matchedExercises[0]?.category;
        const category = matchedCategory || normalizeCategory(item.category, existingExercises);
        const setupNote = String(item.setupNote || item.note || '').trim();
        const variationOptions = normalizeVariationOptions(item.variationOptions || item.options || {});

        return {
            type: 'strength',
            baseName: resolvedBaseName,
            category,
            location: targetLocation,
            setupNote,
            variationOptions,
            libraryMatch
        };
    });

    if (normalizedItems.every(i => i.type === 'strength') && normalizedItems.length > 1) {
        equipmentKind = 'dual_strength';
    }

    return {
        equipmentKind,
        manufacturer,
        machineTitle,
        summary,
        items: normalizedItems
    };
}

/**
 * Computes movement category coverage for a given gym location, combining existing library
 * exercises and dry-run queued items in the scanner lab.
 */
export function computeLocationCategoryCoverage(
    existingExercises = [],
    queuedItems = [],
    targetLocation = '24 Hour Fitness'
) {
    const existingCountsByCat = {};
    const queuedCountsByCat = {};

    CORE_MOVEMENT_CATEGORIES.forEach(cat => {
        existingCountsByCat[cat] = 0;
        queuedCountsByCat[cat] = 0;
    });

    const seenExistingBaseByCat = new Set();
    (existingExercises || []).forEach(ex => {
        if (!ex || !ex.name) return;
        const loc = ex.location || '24 Hour Fitness';
        if (!doesLocationInclude(loc, targetLocation)) return;
        const cat = normalizeCategory(ex.category, existingExercises);
        if (existingCountsByCat[cat] !== undefined) {
            const baseKey = `${cat}::${normalizeTextForComparison(ex.name)}`;
            if (!seenExistingBaseByCat.has(baseKey)) {
                seenExistingBaseByCat.add(baseKey);
                existingCountsByCat[cat] += 1;
            }
        }
    });

    const seenQueuedBaseByCat = new Set();
    (queuedItems || []).forEach(item => {
        if (!item || item.type !== 'strength') return;
        if (item.location && !doesLocationInclude(item.location, targetLocation)) return;
        const cat = normalizeCategory(item.category, existingExercises);
        if (queuedCountsByCat[cat] !== undefined) {
            const baseKey = `${cat}::${normalizeTextForComparison(item.baseName || item.name)}`;
            if (!seenQueuedBaseByCat.has(baseKey)) {
                seenQueuedBaseByCat.add(baseKey);
                queuedCountsByCat[cat] += 1;
            }
        }
    });

    return CORE_MOVEMENT_CATEGORIES.map(category => {
        const existingCount = existingCountsByCat[category] || 0;
        const queuedCount = queuedCountsByCat[category] || 0;
        const totalCount = existingCount + queuedCount;
        return {
            category,
            existingCount,
            queuedCount,
            totalCount,
            isCovered: totalCount > 0
        };
    });
}

/**
 * 4 Rich Sample Presets for 1-click localhost & offline testing.
 */
export const SAMPLE_SCAN_PRESETS = {
    sample_row: {
        equipmentKind: 'strength',
        manufacturer: 'Hammer Strength',
        machineTitle: 'Hammer Strength Iso-Lateral DY Row',
        summary: 'Plate-loaded iso-lateral back row machine with dual handles (underhand & neutral/overhand grips) and independent unilateral arms.',
        items: [
            {
                type: 'strength',
                baseName: 'Hammer Strength Iso-Lateral DY Row',
                category: 'Horizontal Pull',
                setupNote: 'Chest pad height 4; independent iso-lateral arms allow Single or Alternating reps; dual grip handles.',
                variationOptions: {
                    barbell: false,
                    dumbbell: false,
                    band: false,
                    cable: false,
                    single: true,
                    alt: true,
                    overhand: true,
                    underhand: true,
                    neutral: true
                }
            }
        ]
    },
    sample_dual: {
        equipmentKind: 'dual_strength',
        manufacturer: 'Matrix Fitness',
        machineTitle: 'Matrix Ultra Pec Fly / Rear Delt',
        summary: 'Dual-purpose selectorized upper-body machine with overheadcam arm adjustment for both Horizontal Push (Pec Fly) and Horizontal Pull (Rear Delt Fly).',
        items: [
            {
                type: 'strength',
                baseName: 'Machine Pec Fly',
                category: 'Horizontal Push',
                setupNote: 'Arm cam setting 2-4 (front chest fly position); seat height aligned with mid-sternum.',
                variationOptions: {
                    barbell: false,
                    dumbbell: false,
                    band: false,
                    cable: false,
                    single: true,
                    alt: false,
                    overhand: false,
                    underhand: false,
                    neutral: true
                }
            },
            {
                type: 'strength',
                baseName: 'Machine Rear Delt Fly',
                category: 'Horizontal Pull',
                setupNote: 'Arm cam setting 7-8 (rear deltoid position); face pad with chest supported.',
                variationOptions: {
                    barbell: false,
                    dumbbell: false,
                    band: false,
                    cable: false,
                    single: true,
                    alt: false,
                    overhand: true,
                    underhand: false,
                    neutral: true
                }
            }
        ]
    },
    sample_cardio: {
        equipmentKind: 'cardio',
        manufacturer: 'StairMaster',
        machineTitle: 'StairMaster Gauntlet 8 Series',
        summary: 'Revolving staircase cardio conditioning & lower-body warm-up ergometer.',
        items: [
            {
                type: 'cardio',
                warmUpName: '5 min StairMaster Gauntlet',
                machineName: 'StairMaster Gauntlet 8 Series',
                coachingTip: 'Maintain upright posture without leaning on handrails; steady step cadence to elevate heart rate and warm up quads/glutes.'
            }
        ]
    },
    sample_duplicate: {
        equipmentKind: 'strength',
        manufacturer: 'Life Fitness',
        machineTitle: 'Seated Cable Row Station',
        summary: 'Standard dual-pulley seated cable row station with interchangeable grip attachments.',
        items: [
            {
                type: 'strength',
                baseName: 'Seated Cable Row',
                category: 'Horizontal Pull',
                setupNote: 'Brace feet on platform, torso tall, pull handle to lower ribs.',
                variationOptions: {
                    barbell: false,
                    dumbbell: false,
                    band: false,
                    cable: true,
                    single: true,
                    alt: false,
                    overhand: true,
                    underhand: true,
                    neutral: true
                }
            }
        ]
    }
};

export function buildSampleScanResult(presetKey, existingExercises = [], targetLocation = '24 Hour Fitness') {
    const template = SAMPLE_SCAN_PRESETS[presetKey] || SAMPLE_SCAN_PRESETS.sample_row;
    const cloned = JSON.parse(JSON.stringify(template));

    if (presetKey === 'sample_duplicate' && Array.isArray(existingExercises) && existingExercises.length > 0) {
        const firstValid = existingExercises.find(e => e && e.name);
        if (firstValid) {
            const firstBase = extractBaseName(firstValid.name);
            cloned.machineTitle = `${firstBase} Station`;
            cloned.items[0].baseName = firstBase;
            cloned.items[0].category = firstValid.category || 'Horizontal Pull';
        }
    }

    return normalizeAIScanResult(cloned, existingExercises, targetLocation);
}

/**
 * Compresses an uploaded/captured image File or Blob to a lightweight JPEG dataUrl.
 */
export function compressImageFileToDataUrl(file, maxDimension = 1024, quality = 0.72) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error('No image file provided'));
            return;
        }
        const reader = new FileReader();
        reader.onload = event => {
            const img = new Image();
            img.onload = () => {
                let width = img.width || 800;
                let height = img.height || 600;

                if (width > height) {
                    if (width > maxDimension) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    }
                } else if (height > maxDimension) {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const mimeType = 'image/jpeg';
                const dataUrl = canvas.toDataURL(mimeType, quality);
                const base64Data = dataUrl.split(',')[1] || '';
                const sizeKB = Math.max(1, Math.round((base64Data.length * 3) / 4 / 1024));

                resolve({
                    dataUrl,
                    mimeType,
                    base64Data,
                    width,
                    height,
                    sizeKB,
                    fileName: file.name || 'scan.jpg'
                });
            };
            img.onerror = () => reject(new Error('Failed to decode image file'));
            img.src = event.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
    });
}

function buildEquipmentScannerSystemPrompt(existingExercises = [], targetLocation = '24 Hour Fitness') {
    const sampleExisting = [
        ...new Set(
            (existingExercises || [])
                .map(e => extractBaseName(e?.name))
                .filter(Boolean)
        )
    ].slice(0, 120);

    return `You are an expert Strength & Conditioning Biomechanics and Gym Equipment Vision Analyzer.
Analyze the user's gym equipment photo(s) (which may include the machine frame and/or instructional placard) for location "${targetLocation}".

Determine:
1. "equipmentKind":
   - "strength": Single-movement resistance machine, cable station, or free-weight station.
   - "dual_strength": Dual-purpose machine that performs 2 distinct exercises (e.g., Pec Fly / Rear Delt, Assisted Dip / Chin-Up, Bicep Curl / Tricep Extension, Leg Extension / Seated Leg Curl). Return 2 items in "items".
   - "cardio": Cardio or conditioning machine (e.g., StairMaster, Treadmill, Concept2 RowErg, Assault AirBike, SkiErg, Elliptical).
2. If an exercise matches one of the user's existing canonical exercise base names, reuse that exact "baseName" so we don't create a duplicate under a slightly different wording.
   Existing exercise base names in user's library: ${JSON.stringify(sampleExisting)}
3. Map "category" for strength items to one of: ${JSON.stringify(CORE_MOVEMENT_CATEGORIES)}.
4. For strength items, inspect the handles and movement arms to set "variationOptions" booleans:
   - "barbell", "dumbbell", "band", "cable"
   - "single" (can be performed one arm/leg at a time), "alt" (independent iso-lateral arms/legs that can alternate)
   - "overhand" (pronated grip handles), "underhand" (supinated grip handles), "neutral" (parallel/vertical grip handles)

Return ONLY valid JSON matching this schema:
{
  "equipmentKind": "strength" | "dual_strength" | "cardio",
  "manufacturer": "Brand name if visible (e.g. Hammer Strength, Life Fitness, Matrix, Precor, Technogym, Rogue)",
  "machineTitle": "Full machine model or station name",
  "summary": "1-sentence biomechanical summary",
  "items": [
    {
      "type": "strength" | "cardio",
      "baseName": "Clean canonical exercise name without grip/equipment parentheses (for strength)",
      "category": "One of the 9 core movement categories (for strength)",
      "setupNote": "Seat/pad/cam setup cues or placard tips",
      "variationOptions": {
        "barbell": false,
        "dumbbell": false,
        "band": false,
        "cable": false,
        "single": false,
        "alt": false,
        "overhand": false,
        "underhand": false,
        "neutral": false
      },
      "warmUpName": "e.g. '5 min StairMaster' or '500m Row' (for cardio)",
      "machineName": "Cardio machine name (for cardio)",
      "coachingTip": "Warm-up pacing/posture coaching cue (for cardio)"
    }
  ]
}`;
}

/**
 * Calls the selected AI vision provider (Google Gemini, OpenAI, or Anthropic) directly from the browser
 * and returns the normalized scan result.
 */
export async function analyzeEquipmentPhotosWithAI({
    images = [],
    provider = 'gemini',
    apiKey = '',
    model = '',
    existingExercises = [],
    targetLocation = '24 Hour Fitness'
}) {
    const trimmedKey = String(apiKey || '').trim();
    if (!trimmedKey) {
        throw new Error('Please enter your API key in Section 1 (or use the 1-Click Sample Scan buttons below for instant keyless testing).');
    }
    if (!Array.isArray(images) || images.length === 0) {
        throw new Error('Please select or capture at least 1 photo first.');
    }

    const promptText = buildEquipmentScannerSystemPrompt(existingExercises, targetLocation);
    const normProvider = String(provider || 'gemini').toLowerCase().trim();

    if (normProvider === 'gemini') {
        const selectedModel = model || 'gemini-2.5-flash';
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(selectedModel)}:generateContent?key=${encodeURIComponent(trimmedKey)}`;

        const parts = [
            { text: promptText },
            ...images.map(img => ({
                inline_data: {
                    mime_type: img.mimeType || 'image/jpeg',
                    data: img.base64Data || (img.dataUrl ? img.dataUrl.split(',')[1] : '')
                }
            }))
        ];

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: {
                    temperature: 0.1,
                    response_mime_type: 'application/json'
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text().catch(() => '');
            throw new Error(`Gemini API Error (${response.status}): ${errText.slice(0, 240)}`);
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (!rawText) {
            throw new Error('Gemini returned an empty response.');
        }
        return normalizeAIScanResult(rawText, existingExercises, targetLocation);
    }

    if (normProvider === 'openai') {
        const selectedModel = model || 'gpt-4o-mini';
        const content = [
            { type: 'text', text: promptText },
            ...images.map(img => ({
                type: 'image_url',
                image_url: {
                    url: img.dataUrl || `data:${img.mimeType || 'image/jpeg'};base64,${img.base64Data}`
                }
            }))
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${trimmedKey}`
            },
            body: JSON.stringify({
                model: selectedModel,
                temperature: 0.1,
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'user', content }
                ]
            })
        });

        if (!response.ok) {
            const errText = await response.text().catch(() => '');
            throw new Error(`OpenAI API Error (${response.status}): ${errText.slice(0, 240)}`);
        }

        const data = await response.json();
        const rawText = data?.choices?.[0]?.message?.content || '';
        if (!rawText) {
            throw new Error('OpenAI returned an empty response.');
        }
        return normalizeAIScanResult(rawText, existingExercises, targetLocation);
    }

    if (normProvider === 'anthropic') {
        const selectedModel = model || 'claude-3-5-sonnet-latest';
        const content = [
            ...images.map(img => ({
                type: 'image',
                source: {
                    type: 'base64',
                    media_type: img.mimeType || 'image/jpeg',
                    data: img.base64Data || (img.dataUrl ? img.dataUrl.split(',')[1] : '')
                }
            })),
            { type: 'text', text: promptText }
        ];

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': trimmedKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: selectedModel,
                max_tokens: 1500,
                temperature: 0.1,
                messages: [
                    { role: 'user', content }
                ]
            })
        });

        if (!response.ok) {
            const errText = await response.text().catch(() => '');
            throw new Error(`Anthropic API Error (${response.status}): ${errText.slice(0, 240)}`);
        }

        const data = await response.json();
        const rawText = data?.content?.[0]?.text || '';
        if (!rawText) {
            throw new Error('Anthropic returned an empty response.');
        }
        return normalizeAIScanResult(rawText, existingExercises, targetLocation);
    }

    throw new Error(`Unsupported AI provider: ${provider}`);
}
