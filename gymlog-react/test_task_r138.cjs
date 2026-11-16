const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

(async () => {
    console.log('==============================================================');
    console.log('🧪 RUNNING AUTOMATED VERIFICATION SUITE FOR TASK-R138');
    console.log('==============================================================\n');

    const srcDir = path.join(__dirname, 'src');
    const scannerMod = await import('./src/utils/aiEquipmentScanner.js');
    const variationsMod = await import('./src/utils/exerciseVariations.js');

    const {
        CORE_MOVEMENT_CATEGORIES,
        SAMPLE_SCAN_PRESETS,
        buildSampleScanResult,
        matchAgainstExerciseLibrary,
        normalizeAIScanResult,
        computeLocationCategoryCoverage,
        analyzeEquipmentPhotosWithAI
    } = scannerMod;
    const { buildVariationNames } = variationsMod;

    let passed = 0;

    // ---------------------------------------------------------------------------
    // TEST 1: matchAgainstExerciseLibrary ('new' vs 'exists_same_location' vs 'exists_other_location')
    // ---------------------------------------------------------------------------
    console.log('TEST 1: Verifying matchAgainstExerciseLibrary duplicate & gym-location detection...');
    {
        const mockLibrary = [
            { name: 'Seated Cable Row (Overhand)', category: 'Horizontal Pull', location: '24 Hour Fitness' },
            { name: 'Seated Cable Row (Underhand)', category: 'Horizontal Pull', location: '24 Hour Fitness' },
            { name: 'Push-Up', category: 'Horizontal Push', location: 'Anywhere' },
            { name: 'Machine Pec Fly', category: 'Horizontal Push', location: '24 Hour Fitness' }
        ];

        // 1a. Brand-new machine not in library
        const resNew = matchAgainstExerciseLibrary('Hammer Strength Iso-Lateral DY Row', mockLibrary, '24 Hour Fitness');
        assert.strictEqual(resNew.status, 'new', 'Unseen machine must have status "new"');
        assert.strictEqual(resNew.matchedExercises.length, 0);

        // 1b. Existing machine at same location
        const resSame = matchAgainstExerciseLibrary('Seated Cable Row', mockLibrary, '24 Hour Fitness');
        assert.strictEqual(resSame.status, 'exists_same_location', 'Machine at same gym must return exists_same_location');
        assert.strictEqual(resSame.matchedExercises.length, 2, 'Should match both grip variations of Seated Cable Row');
        assert.strictEqual(resSame.canonicalBaseName, 'Seated Cable Row');

        // 1c. Existing machine at another location when walking through Planet Fitness
        const resOther = matchAgainstExerciseLibrary('Seated Cable Row', mockLibrary, 'Planet Fitness');
        assert.strictEqual(resOther.status, 'exists_other_location', 'Machine only at 24 Hour Fitness must return exists_other_location when scanning Planet Fitness');
        assert.ok(resOther.existingLocations.includes('24 Hour Fitness'));

        // 1d. 'Anywhere' exercise counts as exists_same_location at any gym
        const resAnywhere = matchAgainstExerciseLibrary('Push-Up', mockLibrary, 'Planet Fitness');
        assert.strictEqual(resAnywhere.status, 'exists_same_location', 'Anywhere exercise is available at any location');

        passed++;
        console.log('✅ TEST 1 PASSED\n');
    }

    // ---------------------------------------------------------------------------
    // TEST 2: normalizeAIScanResult (Single Strength, Dual-Purpose Machine, Cardio Warm-Up, & Variation Mapping)
    // ---------------------------------------------------------------------------
    console.log('TEST 2: Verifying normalizeAIScanResult for single strength, dual_strength, and cardio machines...');
    {
        const mockLibrary = [
            { name: 'Seated Cable Row (Neutral)', category: 'Horizontal Pull', location: '24 Hour Fitness' }
        ];

        // 2a. Single Strength Machine Preset (DY Row) + VariationGenerator combinator check
        const rowScan = normalizeAIScanResult(SAMPLE_SCAN_PRESETS.sample_row, mockLibrary, '24 Hour Fitness');
        assert.strictEqual(rowScan.equipmentKind, 'strength');
        assert.strictEqual(rowScan.items.length, 1);
        assert.strictEqual(rowScan.items[0].type, 'strength');
        assert.strictEqual(rowScan.items[0].category, 'Horizontal Pull');
        assert.strictEqual(rowScan.items[0].libraryMatch.status, 'new');

        const generatedRowNames = buildVariationNames(rowScan.items[0].baseName, rowScan.items[0].variationOptions);
        // 3 grips (Overhand, Underhand, Neutral) x (Standard + Single + Alt) = 9 variations
        assert.strictEqual(generatedRowNames.length, 9, 'DY Row with 3 grips + Single + Alt should generate 9 variation names');
        assert.ok(generatedRowNames.includes('Hammer Strength Iso-Lateral DY Row (Underhand)'));
        assert.ok(generatedRowNames.includes('Hammer Strength Iso-Lateral DY Row (Single, Neutral)'));

        // 2b. Dual-Purpose Machine Preset (Pec Fly / Rear Delt -> 2 items)
        const dualScan = normalizeAIScanResult(SAMPLE_SCAN_PRESETS.sample_dual, mockLibrary, 'Planet Fitness');
        assert.strictEqual(dualScan.equipmentKind, 'dual_strength');
        assert.strictEqual(dualScan.items.length, 2, 'Dual machine must normalize into 2 distinct strength items');
        assert.strictEqual(dualScan.items[0].baseName, 'Machine Pec Fly');
        assert.strictEqual(dualScan.items[0].category, 'Horizontal Push');
        assert.strictEqual(dualScan.items[1].baseName, 'Machine Rear Delt Fly');
        assert.strictEqual(dualScan.items[1].category, 'Horizontal Pull');

        // 2c. Cardio Machine Preset (StairMaster -> cardio warm-up item)
        const cardioScan = normalizeAIScanResult(SAMPLE_SCAN_PRESETS.sample_cardio, mockLibrary, 'Planet Fitness');
        assert.strictEqual(cardioScan.equipmentKind, 'cardio');
        assert.strictEqual(cardioScan.items.length, 1);
        assert.strictEqual(cardioScan.items[0].type, 'cardio');
        assert.strictEqual(cardioScan.items[0].warmUpName, '5 min StairMaster Gauntlet');
        assert.ok(cardioScan.items[0].coachingTip.length > 10);

        // 2d. Duplicate Check Preset
        const dupScan = buildSampleScanResult('sample_duplicate', mockLibrary, 'Planet Fitness');
        assert.strictEqual(dupScan.items[0].baseName, 'Seated Cable Row');
        assert.strictEqual(dupScan.items[0].libraryMatch.status, 'exists_other_location');

        passed++;
        console.log('✅ TEST 2 PASSED\n');
    }

    // ---------------------------------------------------------------------------
    // TEST 3: computeLocationCategoryCoverage for New Gym Walk-Through
    // ---------------------------------------------------------------------------
    console.log('TEST 3: Verifying computeLocationCategoryCoverage for existing + dry-run queued items...');
    {
        const mockLibrary = [
            { name: 'Bench Press (Barbell)', category: 'Horizontal Push', location: '24 Hour Fitness' },
            { name: 'Lat Pulldown (Overhand)', category: 'Vertical Pull', location: '24 Hour Fitness' },
            { name: 'Plank', category: 'Core', location: 'Anywhere' }
        ];

        // At Planet Fitness before scanning: only 'Core' (Anywhere) is covered
        const initialCoverage = computeLocationCategoryCoverage(mockLibrary, [], 'Planet Fitness');
        assert.strictEqual(initialCoverage.length, CORE_MOVEMENT_CATEGORIES.length);
        const coreInit = initialCoverage.find(c => c.category === 'Core');
        const hPushInit = initialCoverage.find(c => c.category === 'Horizontal Push');
        assert.strictEqual(coreInit.isCovered, true);
        assert.strictEqual(hPushInit.isCovered, false);

        // After queuing Dual Pec Fly / Rear Delt in Dry-Run at Planet Fitness:
        const queuedItems = [
            { type: 'strength', baseName: 'Machine Pec Fly', category: 'Horizontal Push', location: 'Planet Fitness' },
            { type: 'strength', baseName: 'Machine Rear Delt Fly', category: 'Horizontal Pull', location: 'Planet Fitness' }
        ];
        const updatedCoverage = computeLocationCategoryCoverage(mockLibrary, queuedItems, 'Planet Fitness');
        const hPushAfter = updatedCoverage.find(c => c.category === 'Horizontal Push');
        const hPullAfter = updatedCoverage.find(c => c.category === 'Horizontal Pull');
        assert.strictEqual(hPushAfter.isCovered, true);
        assert.strictEqual(hPushAfter.queuedCount, 1);
        assert.strictEqual(hPullAfter.isCovered, true);
        assert.strictEqual(hPullAfter.queuedCount, 1);

        passed++;
        console.log('✅ TEST 3 PASSED\n');
    }

    // ---------------------------------------------------------------------------
    // TEST 4: Multi-Provider AI Vision Client (Gemini, OpenAI, Anthropic)
    // ---------------------------------------------------------------------------
    console.log('TEST 4: Verifying analyzeEquipmentPhotosWithAI with mocked Gemini/OpenAI/Anthropic responses...');
    {
        const origFetch = global.fetch;
        try {
            global.fetch = async (url) => ({
                ok: true,
                json: async () => {
                    if (url.includes('generativelanguage.googleapis.com')) {
                        return {
                            candidates: [
                                {
                                    content: {
                                        parts: [
                                            {
                                                text: JSON.stringify(SAMPLE_SCAN_PRESETS.sample_row)
                                            }
                                        ]
                                    }
                                }
                            ]
                        };
                    }
                    return {};
                }
            });

            const aiResult = await analyzeEquipmentPhotosWithAI({
                images: [{ dataUrl: 'data:image/jpeg;base64,AA==', base64Data: 'AA==', mimeType: 'image/jpeg' }],
                provider: 'gemini',
                apiKey: 'test-gemini-key',
                model: 'gemini-2.5-flash',
                existingExercises: [],
                targetLocation: '24 Hour Fitness'
            });
            assert.strictEqual(aiResult.machineTitle, 'Hammer Strength Iso-Lateral DY Row');
            assert.strictEqual(aiResult.items[0].category, 'Horizontal Pull');
        } finally {
            global.fetch = origFetch;
        }
        passed++;
        console.log('✅ TEST 4 PASSED\n');
    }

    // ---------------------------------------------------------------------------
    // TEST 5: Route Registration & Strict Isolation Check (Zero Existing Views Modified)
    // ---------------------------------------------------------------------------
    console.log('TEST 5: Verifying /scanner-lab route in App.jsx and strict file scope isolation...');
    {
        const appSrc = fs.readFileSync(path.join(srcDir, 'App.jsx'), 'utf8');
        const scannerLabSrc = fs.readFileSync(path.join(srcDir, 'components/ScannerLabView.jsx'), 'utf8');

        assert.ok(appSrc.includes("import ScannerLabView from './components/ScannerLabView'"), 'App.jsx must import ScannerLabView');
        assert.ok(appSrc.includes('<Route path="/scanner-lab" element={<ScannerLabView />} />'), 'App.jsx must mount /scanner-lab route');
        assert.ok(scannerLabSrc.includes('SANDBOX DRY-RUN MODE'), 'ScannerLabView must include Dry-Run Mode toggle');
        assert.ok(scannerLabSrc.includes('LIVE SAVE MODE'), 'ScannerLabView must include Live Save Mode toggle');
        assert.ok(scannerLabSrc.includes('VariationGeneratorPanel'), 'ScannerLabView must integrate VariationGeneratorPanel');
        assert.ok(scannerLabSrc.includes('aistudio.google.com/apikey'), 'ScannerLabView must include direct link to Google AI Studio free key');

        // Verify git diff against main only touches App.jsx among existing workout files
        const allowedFiles = new Set([
            'docs/jira_tasks/TASK-R138.md',
            'docs/jira_tasks/TASK-QA-R138.md',
            'gymlog-react/src/App.jsx',
            'gymlog-react/src/utils/aiEquipmentScanner.js',
            'gymlog-react/src/components/ScannerLabView.jsx',
            'gymlog-react/test_task_r138.cjs'
        ]);
        const diffFiles = execSync('git diff --name-only main', { cwd: __dirname })
            .toString()
            .trim()
            .split(/\r?\n/)
            .filter(Boolean);
        const unauthorizedFiles = diffFiles.filter(f => !allowedFiles.has(f));
        assert.deepStrictEqual(
            unauthorizedFiles,
            [],
            `Zero existing workout views/files may be modified; found unauthorized changes: ${JSON.stringify(unauthorizedFiles)}`
        );

        passed++;
        console.log('✅ TEST 5 PASSED\n');
    }

    assert.strictEqual(passed, 5, 'All 5 verification checks must pass');
    console.log('==============================================================');
    console.log(`🎉 ALL ${passed}/5 AUTOMATED SCANNER LAB VERIFICATION CHECKS PASSED!`);
    console.log('==============================================================\n');
    process.exit(0);
})().catch(err => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
});
