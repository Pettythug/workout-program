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
        SAMPLE_MACHINE_PRESET,
        getPhotoSrc
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
    assert.ok(SAMPLE_MACHINE_PRESET.baseName.includes('(Plate-Loaded)'), 'SAMPLE_MACHINE_PRESET baseName must include (Plate-Loaded)');
    assert.strictEqual(SAMPLE_MACHINE_PRESET.manufacturer, 'Hammer Strength', 'Preset must include manufacturer');
    assert.strictEqual(SAMPLE_MACHINE_PRESET.modelSeries, 'Iso-Lateral', 'Preset must include modelSeries');
    assert.strictEqual(SAMPLE_MACHINE_PRESET.baseExercise, 'High Row', 'Preset must include baseExercise');
    assert.strictEqual(SAMPLE_MACHINE_PRESET.muscleGroups, 'Latissimus Dorsi', 'Preset must include muscleGroups');
    assert.strictEqual(SAMPLE_MACHINE_PRESET.fileReference, '20260517_090721.jpg', 'Preset must include fileReference');
    assert.strictEqual(SAMPLE_MACHINE_PRESET.location, '24 Hour Fitness', 'Preset must include location');
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

    console.log(`✅ TEST 2 PASSED: Variation normalization produced ${generatedVariations.length} variations from preset with Columns F-J metadata.\n`);

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
    console.log('TEST 5: Verifying SettingsModal.jsx and aiEquipmentScanner.js integration...');

    const settingsModalPath = path.resolve(__dirname, 'src/components/SettingsModal.jsx');
    const settingsSource = fs.readFileSync(settingsModalPath, 'utf-8');

    const scannerPath = path.resolve(__dirname, 'src/utils/aiEquipmentScanner.js');
    const scannerSource = fs.readFileSync(scannerPath, 'utf-8');

    // 1. aiEquipmentScanner prompt checks
    assert.ok(
        scannerSource.includes('(Plate-Loaded)'),
        'aiEquipmentScanner.js must instruct Gemini to detect and append (Plate-Loaded)'
    );
    assert.ok(
        scannerSource.includes('"manufacturer"') &&
        scannerSource.includes('"modelSeries"') &&
        scannerSource.includes('"baseExercise"') &&
        scannerSource.includes('"muscleGroups"') &&
        scannerSource.includes('"fileReference"'),
        'aiEquipmentScanner.js must extract Columns F through J metadata in JSON schema'
    );

    // 2. SettingsModal.jsx bindings and features
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

    // Columns F-J metadata passing to createExerciseMeta
    assert.ok(
        settingsSource.includes('manufacturer: exManufacturer'),
        'SettingsModal.jsx must pass manufacturer to createExerciseMeta'
    );
    assert.ok(
        settingsSource.includes('modelSeries: exModelSeries'),
        'SettingsModal.jsx must pass modelSeries to createExerciseMeta'
    );
    assert.ok(
        settingsSource.includes('baseExercise: exBaseExercise'),
        'SettingsModal.jsx must pass baseExercise to createExerciseMeta'
    );
    assert.ok(
        settingsSource.includes('muscleGroups: exMuscleGroups'),
        'SettingsModal.jsx must pass muscleGroups to createExerciseMeta'
    );
    assert.ok(
        settingsSource.includes('fileReference: exFileReference'),
        'SettingsModal.jsx must pass fileReference to createExerciseMeta'
    );

    // Layout tightening & styling checks
    assert.ok(
        settingsSource.includes("flexWrap: 'wrap'") && settingsSource.includes('gap: 8') && settingsSource.includes("width: '100%'"),
        'SettingsModal.jsx must style scan action buttons with flexWrap: wrap, gap: 8, width: 100% to prevent overflow'
    );
    assert.ok(
        settingsSource.includes('⚙️ Configure Gemini API Key'),
        'SettingsModal.jsx must include sleek toggle: ⚙️ Configure Gemini API Key'
    );
    assert.ok(
        settingsSource.includes('width: 48') && settingsSource.includes('height: 48'),
        'SettingsModal.jsx must render 48x48 photo thumbnail preview'
    );

    console.log('✅ TEST 5 PASSED: SettingsModal.jsx and aiEquipmentScanner.js include all required Columns F-J bindings, layout wrapping, and thumbnail previews.\n');

    // -----------------------------------------------------------------------------
    // TEST 6: Photo source resolution & Fullscreen Photo Inspector Modal
    // -----------------------------------------------------------------------------
    console.log('TEST 6: Verifying getPhotoSrc and Fullscreen Photo Inspector Modal...');

    // 1. getPhotoSrc unit testing across data:, http:, blob:, and local filenames
    assert.strictEqual(getPhotoSrc(null), null, 'getPhotoSrc(null) must return null');
    assert.strictEqual(getPhotoSrc(undefined), null, 'getPhotoSrc(undefined) must return null');
    assert.strictEqual(getPhotoSrc(''), null, 'getPhotoSrc("") must return null');

    const sampleDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...';
    assert.strictEqual(getPhotoSrc(sampleDataUrl), sampleDataUrl, 'Must return data: URLs verbatim');

    const sampleHttpUrl = 'http://example.com/machines/leg-press.jpg';
    assert.strictEqual(getPhotoSrc(sampleHttpUrl), sampleHttpUrl, 'Must return http: URLs verbatim');

    const sampleHttpsUrl = 'https://example.com/machines/high-row.jpg';
    assert.strictEqual(getPhotoSrc(sampleHttpsUrl), sampleHttpsUrl, 'Must return https: URLs verbatim');

    const sampleBlobUrl = 'blob:http://localhost:5173/d38101a2-5fc8-4721-a3f2-10872ef74a44';
    assert.strictEqual(getPhotoSrc(sampleBlobUrl), sampleBlobUrl, 'Must return blob: URLs verbatim');

    // Relative image filenames must resolve to BASE_URL + images/
    const sampleFilename = '20260517_090721.jpg';
    assert.strictEqual(
        getPhotoSrc(sampleFilename),
        '/images/20260517_090721.jpg',
        'Must resolve local filenames with default BASE_URL /'
    );
    assert.strictEqual(
        getPhotoSrc(sampleFilename, '/gymlog/'),
        '/gymlog/images/20260517_090721.jpg',
        'Must resolve local filenames with custom BASE_URL'
    );

    // 2. SettingsModal.jsx getPhotoSrc definition check
    assert.ok(
        settingsSource.includes('const getPhotoSrc =') || settingsSource.includes('function getPhotoSrc'),
        'SettingsModal.jsx must define getPhotoSrc'
    );
    assert.ok(
        settingsSource.includes('${import.meta.env.BASE_URL}images/${ref}') || settingsSource.includes('images/'),
        'SettingsModal.jsx getPhotoSrc must resolve to BASE_URL images path'
    );

    // 3. Clickable thumbnail affordance
    assert.ok(
        settingsSource.includes('🔍 Tap to view'),
        'SettingsModal.jsx must provide 🔍 Tap to view affordance'
    );
    assert.ok(
        settingsSource.includes('setIsPhotoInspectorOpen(true)'),
        'SettingsModal.jsx clicking thumbnail must set isPhotoInspectorOpen to true'
    );

    // 4. Modal overlay header, body, and responsive styling
    assert.ok(
        settingsSource.includes('📷 Machine Photo Preview'),
        'SettingsModal.jsx must contain 📷 Machine Photo Preview in modal inspector header'
    );
    assert.ok(
        settingsSource.includes("maxHeight: '70vh'"),
        'SettingsModal.jsx modal image must specify maxHeight: 70vh for large crisp preview'
    );
    assert.ok(
        settingsSource.includes("objectFit: 'contain'"),
        'SettingsModal.jsx modal image must specify objectFit: contain'
    );

    // 5. Action footer buttons & bindings
    assert.ok(
        settingsSource.includes('[ ✓ Keep Photo ]'),
        'SettingsModal.jsx must contain [ ✓ Keep Photo ] action button'
    );
    assert.ok(
        settingsSource.includes('[ 📸 Retake / Replace ]'),
        'SettingsModal.jsx must contain [ 📸 Retake / Replace ] action button'
    );
    assert.ok(
        settingsSource.includes('[ 🗑️ Remove Photo ]'),
        'SettingsModal.jsx must contain [ 🗑️ Remove Photo ] action button'
    );

    // Verify retake button triggers fileInputRef
    assert.ok(
        settingsSource.includes('fileInputRef.current?.click()'),
        'SettingsModal.jsx must trigger fileInputRef click for retake'
    );

    console.log('✅ TEST 6 PASSED: getPhotoSrc and Fullscreen Photo Inspector Modal meet all functional and responsive requirements.\n');

    console.log('====================================================');
    console.log('🎉 ALL AUTOMATED VERIFICATION SUITES PASSED FOR TASK-R140');
    console.log('====================================================');
}

runTests().catch(err => {
    console.error('❌ TEST FAILED:', err);
    process.exit(1);
});
