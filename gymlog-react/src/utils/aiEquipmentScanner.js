/**
 * aiEquipmentScanner.js
 *
 * Core AI Vision Engine for GymLog Equipment Scanning.
 * Analyzes machine placards and handle configurations using Gemini Vision API.
 */

export const CANONICAL_APP_CATEGORIES = [
    'Horizontal Push',
    'Vertical Push',
    'Horizontal Pull',
    'Vertical Pull',
    'Knee Dominant',
    'Hip Dominant',
    'Plank Core',
    'Rotational Core',
    'Explosive'
];

/**
 * Checks whether a category string is part of the canonical app categories or active custom categories.
 */
export function isValidCategory(category, customCategories = []) {
    if (!category || typeof category !== 'string') return false;
    const all = [...CANONICAL_APP_CATEGORIES, ...(customCategories || [])];
    const catLower = category.trim().toLowerCase();
    return all.some(c => c.toLowerCase() === catLower);
}

/**
 * Normalizes an AI candidate category to strictly match canonical app categories or custom categories.
 * Rejects non-canonical classifications like "Squat", "Hinge", "Biceps", "Triceps", "Back", "Chest"
 * and maps them to appropriate biomechanical movements.
 */
export function normalizeCategory(categoryCandidate, customCategories = [], fallback = 'Horizontal Push') {
    const all = [...new Set([...CANONICAL_APP_CATEGORIES, ...(customCategories || [])])];
    if (!categoryCandidate || typeof categoryCandidate !== 'string') {
        return all.includes(fallback) ? fallback : all[0];
    }
    const candidateLower = categoryCandidate.trim().toLowerCase();
    const exact = all.find(c => c.toLowerCase() === candidateLower);
    if (exact) return exact;

    const hasWord = (word) => new RegExp(`\\b${word}\\b`, 'i').test(candidateLower);

    // Movement mapping heuristics with word boundary safety
    if (hasWord('squat') || hasWord('knee') || hasWord('lunge') || candidateLower.includes('leg press') || hasWord('quad') || candidateLower.includes('leg extension')) {
        return 'Knee Dominant';
    }
    if (hasWord('deadlift') || hasWord('hinge') || hasWord('hip') || hasWord('glute') || hasWord('hamstring') || candidateLower.includes('leg curl') || hasWord('rdl')) {
        return 'Hip Dominant';
    }
    if (hasWord('chest') || hasWord('bench') || candidateLower.includes('push up') || candidateLower.includes('push-up') || hasWord('dip') || candidateLower.includes('pec fly') || candidateLower.includes('chest press')) {
        return 'Horizontal Push';
    }
    if (hasWord('overhead') || candidateLower.includes('shoulder press') || candidateLower.includes('military') || candidateLower.includes('vertical push')) {
        return 'Vertical Push';
    }
    if (hasWord('row') || candidateLower.includes('horizontal pull') || candidateLower.includes('seated row')) {
        return 'Horizontal Pull';
    }
    if (candidateLower.includes('pulldown') || candidateLower.includes('pull-down') || candidateLower.includes('pull down') || candidateLower.includes('chin-up') || candidateLower.includes('chin up') || candidateLower.includes('pull-up') || candidateLower.includes('pull up') || hasWord('lat') || hasWord('lats') || hasWord('latissimus')) {
        return 'Vertical Pull';
    }
    if (hasWord('plank') || hasWord('ab') || hasWord('abs') || hasWord('core') || candidateLower.includes('crunch')) {
        return 'Plank Core';
    }
    if (candidateLower.includes('rotat') || candidateLower.includes('twist') || candidateLower.includes('woodchop') || hasWord('oblique') || hasWord('obliques')) {
        return 'Rotational Core';
    }
    if (hasWord('explosive') || hasWord('power') || hasWord('clean') || hasWord('snatch') || hasWord('jump')) {
        return 'Explosive';
    }

    return all.includes(fallback) ? fallback : all[0];
}

/**
 * Normalizes detected handle/variation options to booleans for all 9 supported variation flags.
 */
export function normalizeVariationOptions(rawOptions = {}) {
    const opts = rawOptions || {};
    return {
        barbell: Boolean(opts.barbell),
        dumbbell: Boolean(opts.dumbbell || opts.db),
        band: Boolean(opts.band),
        cable: Boolean(opts.cable),
        single: Boolean(opts.single),
        alt: Boolean(opts.alt),
        overhand: Boolean(opts.overhand),
        underhand: Boolean(opts.underhand),
        neutral: Boolean(opts.neutral)
    };
}

/**
 * Reads and proportionally resizes an image File or Blob to maxDimension,
 * converting it to a compressed JPEG dataUrl and base64 payload.
 */
export async function compressImageFileToDataUrl(file, maxDimension = 1024, quality = 0.72) {
    if (!file) {
        throw new Error('No image file provided for compression');
    }

    // Unit test / Node.js mock support
    if (typeof window === 'undefined' || typeof document === 'undefined' || !window.FileReader) {
        const mockBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
        return {
            dataUrl: `data:image/jpeg;base64,${mockBase64}`,
            base64Data: mockBase64,
            mimeType: 'image/jpeg',
            sizeKB: 1
        };
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.onload = (e) => {
            const img = new Image();
            img.onerror = () => reject(new Error('Failed to load image element'));
            img.onload = () => {
                let { width, height } = img;
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    } else {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, width);
                canvas.height = Math.max(1, height);
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas 2D context unavailable'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);
                const mimeType = 'image/jpeg';
                const dataUrl = canvas.toDataURL(mimeType, quality);
                const base64Data = dataUrl.split(',')[1] || '';
                const sizeKB = Math.round((base64Data.length * 0.75) / 1024);

                resolve({
                    dataUrl,
                    base64Data,
                    mimeType,
                    sizeKB
                });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Analyzes machine placard & handle photos using Gemini multimodal vision.
 */
export async function analyzeMachinePhotoWithAI({
    imageBase64,
    mimeType = 'image/jpeg',
    apiKey,
    model = 'gemini-2.5-flash',
    availableCategories = []
}) {
    if (!apiKey || !apiKey.trim()) {
        throw new Error('Gemini API key is required. Please set it in Settings.');
    }
    if (!imageBase64 || !imageBase64.trim()) {
        throw new Error('Image data is required for machine analysis.');
    }

    const rawBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const cleanMimeType = (mimeType || 'image/jpeg').trim();
    const categoryList = [...new Set([...CANONICAL_APP_CATEGORIES, ...(availableCategories || [])])];

    const promptText = `You are an expert biomechanics gym equipment scanner for GymLog.
Analyze this photo of a gym machine, cable station, or exercise apparatus. Inspect the machine frame, branding/placard, handles, seat, and pulleys.

CRITICAL INSTRUCTIONS:
1. Identify the specific machine base name (e.g., "Hammer Strength High Row", "Cable Lat Pulldown", "Precor Leg Press", "Life Fitness Pec Fly").
2. Map the movement category STRICTLY to ONE of these exact categories:
${categoryList.map(c => `- "${c}"`).join('\n')}
Do NOT use non-canonical categories like "Back", "Chest", "Arms", "Biceps", "Legs", "Squat", or "Hinge". You must pick from the list above.
3. Detect handle types and exercise variation options supported by this machine:
- overhand (true/false)
- underhand (true/false)
- neutral (true/false)
- single (true if independent/single arm/leg is supported, e.g. iso-lateral or unilateral cable/lever)
- alt (true if alternating sides is supported)
- cable (true if cable-driven or pulley-based)
- dumbbell (true if dumbbell-based)
- barbell (true if barbell-based, e.g. Smith machine or barbell rack)
- band (true if resistance band pegs or attachment points exist)
4. List 2-3 notable detected features (e.g., "Iso-lateral independent arms", "Multi-grip rotating handles").
5. Return your confidence score (0.0 to 1.0).

Return ONLY valid JSON matching this schema:
{
  "baseName": string,
  "category": string,
  "variationOptions": {
    "overhand": boolean,
    "underhand": boolean,
    "neutral": boolean,
    "single": boolean,
    "alt": boolean,
    "cable": boolean,
    "dumbbell": boolean,
    "barbell": boolean,
    "band": boolean
  },
  "detectedFeatures": string[],
  "confidence": number
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: promptText },
                    {
                        inline_data: {
                            mime_type: cleanMimeType,
                            data: rawBase64
                        }
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        let errDetails = '';
        try {
            const errJson = await response.json();
            errDetails = errJson?.error?.message || JSON.stringify(errJson);
        } catch {
            errDetails = await response.text();
        }
        throw new Error(`Gemini API Error (${response.status}): ${errDetails}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
        throw new Error('Gemini API returned an empty or invalid response structure');
    }

    const cleanJson = candidateText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

    let parsed;
    try {
        parsed = JSON.parse(cleanJson);
    } catch (parseErr) {
        throw new Error(`Failed to parse Gemini JSON output: ${parseErr.message}`);
    }

    return {
        baseName: String(parsed.baseName || 'Gym Machine').trim(),
        category: normalizeCategory(parsed.category, availableCategories),
        variationOptions: normalizeVariationOptions(parsed.variationOptions),
        detectedFeatures: Array.isArray(parsed.detectedFeatures) ? parsed.detectedFeatures : [],
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9
    };
}

/**
 * Rich sample preset for instant 1-click desktop localhost testing without an image.
 */
export const SAMPLE_MACHINE_PRESET = {
    baseName: 'Hammer Strength Iso-Lateral High Row',
    category: 'Vertical Pull',
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
    },
    detectedFeatures: [
        'Iso-lateral independent arms',
        'Dual grip handles (overhand and neutral)',
        'Pin-loaded weight stack with instructional placard'
    ],
    confidence: 0.98
};
