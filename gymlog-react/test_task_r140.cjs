const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('🧪 RUNNING AUTOMATED VERIFICATION SUITE FOR TASK-R140');
console.log('====================================================\n');

async function runTests() {
    // -----------------------------------------------------------------------------
    // TEST 1: Canonical category mapping & validation
    // -----------------------------------------------------------------------------
    console.log('TEST 1: Verifying canonical category mapping and validation...');

    const scannerModulePath = path.resolve(__dirname, 'src/utils/aiEquipmentScanner.js');
    const {
        CANONICAL_APP_CATEGORIES,
        isValidCategory,
        normalizeCategory,
        normalizeVariationOptions,
        compressImageFileToDataUrl,
        analyzeMachinePhotoWithAI,
        SAMPLE_MACHINE_PRESET
    } = await import('file://' + scannerModulePath.replace(/\\/g, '/'));

    const expectedCanonicalCategories = [
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

    assert.deepStrictEqual(
        CANONICAL_APP_CATEGORIES,
        expectedCanonicalCategories,
        'CANONICAL_APP_CATEGORIES must contain the exact 9 canonical movement patterns'
    );

    // Verify all canonical categories are recognized as valid
    for (const cat of expectedCanonicalCategories) {
        assert.strictEqual(
            isValidCategory(cat),
            true,
            `Expected '${cat}' to be recognized as valid canonical category`
        );
        assert.strictEqual(
            isValidCategory(cat.toLowerCase()),
            true,
            `Expected case-insensitive match for '${cat}'`
        );
    }

    // Verify invalid non-canonical categories are REJECTED
    const invalidCategories = ['Squat', 'Hinge', 'Biceps', 'Triceps', 'Chest', 'Back', 'Arms', 'Legs', 'Cardio'];
    for (const invalid of invalidCategories) {
        assert.strictEqual(
            isValidCategory(invalid),
            false,
            `Expected '${invalid}' to be REJECTED as non-canonical`
        );
    }

    // Verify custom categories can be accepted when passed
    assert.strictEqual(
        isValidCategory('Custom Calisthenics', ['Custom Calisthenics', 'Olympic Lifting']),
        true,
        'Should accept custom categories when provided in the active list'
    );

    // Verify normalizeCategory maps non-canonical inputs to proper movements
    assert.strictEqual(normalizeCategory('Squat Machine'), 'Knee Dominant');
    assert.strictEqual(normalizeCategory('Leg Press'), 'Knee Dominant');
    assert.strictEqual(normalizeCategory('Hinge / Deadlift'), 'Hip Dominant');
    assert.strictEqual(normalizeCategory('Hamstring Curl'), 'Hip Dominant');
    assert.strictEqual(normalizeCategory('Chest Press Machine'), 'Horizontal Push');
    assert.strictEqual(normalizeCategory('Incline Bench Press'), 'Horizontal Push');
    assert.strictEqual(normalizeCategory('Shoulder Overhead Press'), 'Vertical Push');
    assert.strictEqual(normalizeCategory('Seated Cable Row'), 'Horizontal Pull');
    assert.strictEqual(normalizeCategory('Lat Pulldown'), 'Vertical Pull');
    assert.strictEqual(normalizeCategory('Abdominal Plank Machine'), 'Plank Core');
    assert.strictEqual(normalizeCategory('Torso Rotation / Twist'), 'Rotational Core');
    assert.strictEqual(normalizeCategory('Explosive Power Push'), 'Explosive');

    // Any completely unknown category must fallback to a valid canonical category
    const fallbackTest = normalizeCategory('UnknownRandomApparatus123');
    assert.ok(
        CANONICAL_APP_CATEGORIES.includes(fallbackTest),
        `Normalized category '${fallbackTest}' must be one of the canonical categories`
    );

    console.log('✅ TEST 1 PASSED: Category validation and normalization logic strictly adheres to canonical patterns.\n');

    // -----------------------------------------------------------------------------
    // TEST 2: Variation options boolean normalization & variation generation
    // -----------------------------------------------------------------------------
    console.log('TEST 2: Verifying variation options boolean mapping...');

    const variationsModulePath = path.resolve(__dirname, 'src/utils/exerciseVariations.js');
    const { buildVariationNames } = await import('file://' + variationsModulePath.replace(/\\/g, '/'));

    const rawOptions = {
        single: 1,
        alt: 'true',
        overhand: true,
        underhand: true,
        neutral: true,
        cable: false,
        dumbbell: null,
        barbell: undefined,
        band: 0
    };

    const normalized = normalizeVariationOptions(rawOptions);
    assert.strictEqual(normalized.single, true);
    assert.strictEqual(normalized.alt, true);
    assert.strictEqual(normalized.overhand, true);
    assert.strictEqual(normalized.underhand, true);
    assert.strictEqual(normalized.neutral, true);
    assert.strictEqual(normalized.cable, false);
    assert.strictEqual(normalized.dumbbell, false);
    assert.strictEqual(normalized.barbell, false);
    assert.strictEqual(normalized.band, false);

    // Verify variation generation using SAMPLE_MACHINE_PRESET
    assert.ok(SAMPLE_MACHINE_PRESET.baseName, 'Preset must have baseName');
    assert.ok(CANONICAL_APP_CATEGORIES.includes(SAMPLE_MACHINE_PRESET.category), 'Preset category must be canonical');
    assert.ok(SAMPLE_MACHINE_PRESET.confidence >= 0.9, 'Preset confidence must be >= 0.9');

    const generatedVariations = buildVariationNames(SAMPLE_MACHINE_PRESET.baseName, SAMPLE_MACHINE_PRESET.variationOptions);
    assert.ok(generatedVariations.length > 0, 'Should generate variations from sample preset options');
    assert.ok(
        generatedVariations.some(v => v.includes('(Single')),
        'Variations must include Single flag'
    );
    assert.ok(
        generatedVariations.some(v => v.includes('Overhand')),
        'Variations must include Overhand flag'
    );

    console.log(`✅ TEST 2 PASSED: Variation normalization produced ${generatedVariations.length} variations from preset.\n`);

    // -----------------------------------------------------------------------------
    // TEST 3: Canvas image compression helper
    // -----------------------------------------------------------------------------
    console.log('TEST 3: Verifying image compression helper...');

    const compressionResult = await compressImageFileToDataUrl({ name: 'test_placard.jpg' });
    assert.ok(compressionResult.dataUrl, 'Result must contain dataUrl');
    assert.ok(compressionResult.base64Data, 'Result must contain base64Data');
    assert.strictEqual(compressionResult.mimeType, 'image/jpeg');
    assert.ok(compressionResult.sizeKB >= 1, 'Result sizeKB must be >= 1');

    await assert.rejects(
        async () => {
            await compressImageFileToDataUrl(null);
        },
        /No image file provided/,
        'Should reject if null file is passed'
    );

    console.log('✅ TEST 3 PASSED: Image compression helper handles files and validation properly.\n');

    // -----------------------------------------------------------------------------
    // TEST 4: Gemini Vision Analysis API client validation
    // -----------------------------------------------------------------------------
    console.log('TEST 4: Verifying Gemini vision analysis error handling and parameter checks...');

    await assert.rejects(
        async () => {
            await analyzeMachinePhotoWithAI({ imageBase64: 'abc', apiKey: '' });
        },
        /Gemini API key is required/,
        'Should throw if apiKey is empty'
    );

    await assert.rejects(
        async () => {
            await analyzeMachinePhotoWithAI({ imageBase64: '', apiKey: 'AIzaSyFakeKey' });
        },
        /Image data is required/,
        'Should throw if imageBase64 is empty'
    );

    console.log('✅ TEST 4 PASSED: Gemini vision analysis API client enforces parameter validation.\n');

    // -----------------------------------------------------------------------------
    // TEST 5: SettingsModal.jsx integration check
    // -----------------------------------------------------------------------------
    console.log('TEST 5: Verifying SettingsModal.jsx source code integration...');

    const settingsModalPath = path.resolve(__dirname, 'src/components/SettingsModal.jsx');
    const settingsSource = fs.readFileSync(settingsModalPath, 'utf-8');

    assert.ok(
        settingsSource.includes('aiEquipmentScanner'),
        'SettingsModal.jsx must import from aiEquipmentScanner'
    );
    assert.ok(
        settingsSource.includes('📷 SCAN MACHINE WITH AI'),
        'SettingsModal.jsx must contain the 📷 SCAN MACHINE WITH AI button'
    );
    assert.ok(
        settingsSource.includes('btn-accent'),
        'SettingsModal.jsx scan button must use btn-accent style'
    );
    assert.ok(
        settingsSource.includes('capture="environment"'),
        'SettingsModal.jsx must have camera capture file input'
    );
    assert.ok(
        settingsSource.includes('🧪 Try Sample Photo'),
        'SettingsModal.jsx must contain 🧪 Try Sample Photo button'
    );
    assert.ok(
        settingsSource.includes('gymlog_gemini_api_key'),
        'SettingsModal.jsx must store and read gymlog_gemini_api_key'
    );
    assert.ok(
        settingsSource.includes('https://aistudio.google.com/apikey'),
        'SettingsModal.jsx must link to Google AI Studio for free API keys'
    );
    assert.ok(
        settingsSource.includes('🔍 Analyzing machine placard & handles with AI...'),
        'SettingsModal.jsx must show the loading message during analysis'
    );
    assert.ok(
        settingsSource.includes('✓ Machine scanned! Review details and variations below.'),
        'SettingsModal.jsx must show the success confirmation banner'
    );
    assert.ok(
        settingsSource.includes('CANONICAL_APP_CATEGORIES'),
        'SettingsModal.jsx must use CANONICAL_APP_CATEGORIES for category options'
    );

    console.log('✅ TEST 5 PASSED: SettingsModal.jsx includes all required UI components and state bindings.\n');

    console.log('====================================================');
    console.log('🎉 ALL AUTOMATED VERIFICATION SUITES PASSED FOR TASK-R140');
    console.log('====================================================');
}

runTests().catch(err => {
    console.error('❌ TEST FAILED:', err);
    process.exit(1);
});
