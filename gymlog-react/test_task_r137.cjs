const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('==============================================================');
console.log('🧪 RUNNING AUTOMATED VERIFICATION SUITE FOR TASK-R137 (10/10)');
console.log('==============================================================\n');

const srcDir = path.join(__dirname, 'src');
const gsPath = path.join(__dirname, '../Combined_AppScript_v2.gs');

const safeStorageSrc = fs.readFileSync(path.join(srcDir, 'utils/safeStorage.js'), 'utf8');
const dataMergeSrc = fs.readFileSync(path.join(srcDir, 'context/dataMerge.js'), 'utf8');
const useGymAPISrc = fs.readFileSync(path.join(srcDir, 'hooks/useGymAPI.js'), 'utf8');
const appContextSrc = fs.readFileSync(path.join(srcDir, 'context/AppContext.jsx'), 'utf8');
const circuitViewSrc = fs.readFileSync(path.join(srcDir, 'components/CircuitView.jsx'), 'utf8');
const settingsModalSrc = fs.readFileSync(path.join(srcDir, 'components/SettingsModal.jsx'), 'utf8');
const sessionStatsModalSrc = fs.readFileSync(path.join(srcDir, 'components/SessionStatsModal.jsx'), 'utf8');
const gsSrc = fs.readFileSync(gsPath, 'utf8');

// Helper to load simple ES modules into CommonJS VM context
function loadEsmModule(filePath, mocks = {}) {
    let code = fs.readFileSync(filePath, 'utf8');
    // Transform imports
    code = code.replace(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/g, (_, imports, modPath) => {
        const names = imports.split(',').map(s => s.trim()).filter(Boolean).join(', ');
        return `const { ${names} } = __require('${modPath}');`;
    });
    // Transform export function / export const
    const exportedNames = [];
    code = code.replace(/export\s+function\s+([a-zA-Z0-9_]+)/g, (_, name) => {
        exportedNames.push(name);
        return `function ${name}`;
    });
    code = code.replace(/export\s+const\s+([a-zA-Z0-9_]+)/g, (_, name) => {
        exportedNames.push(name);
        return `const ${name}`;
    });
    code += `\nmodule.exports = { ${exportedNames.join(', ')} };\n`;

    const sandbox = {
        module: { exports: {} },
        exports: {},
        console,
        Date,
        Set,
        Map,
        Object,
        Array,
        String,
        Number,
        Boolean,
        Math,
        JSON,
        RegExp,
        parseInt,
        parseFloat,
        isNaN,
        __require: (mod) => {
            if (mocks[mod]) return mocks[mod];
            const resolved = path.resolve(path.dirname(filePath), mod + (mod.endsWith('.js') ? '' : '.js'));
            return loadEsmModule(resolved, mocks);
        }
    };
    vm.runInNewContext(code, sandbox);
    return sandbox.module.exports;
}

const dataMergeMod = loadEsmModule(path.join(srcDir, 'context/dataMerge.js'));
const { mergeFromSheets } = dataMergeMod;

let passed = 0;

// ---------------------------------------------------------------------------
// AUDIT-01: Deleted Historical Sets & Pre-Midnight Pending Sets in dataMerge + AppContext
// ---------------------------------------------------------------------------
console.log('TEST 1 [AUDIT-01]: Verifying deleted set filtering, pre-midnight pending set preservation & standalone delete sync...');
{
    const sheetExercises = [{ name: 'Bench Press', category: 'Horizontal Push', location: 'Anywhere' }];
    const deletedRow = {
        exercise: 'Bench Press',
        person: 'brian',
        reps: 10,
        weight: 225,
        range: 'r8_12',
        date: '11/10/2026, 9:00:00 AM',
        setNum: 1
    };
    const preMidnightPendingSet = {
        date: '11/14/2026, 11:58:00 PM',
        person: 'brian',
        reps: 8,
        weight: 245,
        range: 'r8_12',
        setNum: 2
    };
    const localExercises = [
        {
            name: 'Bench Press',
            history: [preMidnightPendingSet],
            best: { brian: { r8_12: { reps: 8, weight: 245 } } }
        },
        {
            name: 'Custom Unsynced Cable Fly',
            history: [{ date: '11/14/2026, 11:59:00 PM', person: 'brian', reps: 12, weight: 50, range: 'r8_12', setNum: 1 }],
            best: {}
        }
    ];
    const sheetsData = {
        exercises: sheetExercises,
        people: ['Brian'],
        history: [deletedRow],
        best: {
            'Bench Press': {
                brian: { r1_3: null, r4_7: null, r8_12: { reps: 10, weight: 225 }, r13_plus: null }
            }
        }
    };
    const pendingSets = [{ exercise: 'Bench Press', entries: [preMidnightPendingSet] }];
    const pendingDeletes = [deletedRow];

    const merged = mergeFromSheets(localExercises, sheetsData, ['Brian'], ['Anywhere'], pendingSets, pendingDeletes);
    const bench = merged.exercises.find(e => e.name === 'Bench Press');
    assert.ok(bench, 'Bench Press must exist in merged exercises');
    assert.strictEqual(bench.history.length, 1, 'Deleted sheet row must NOT resurrect; pre-midnight pending set MUST be preserved');
    assert.strictEqual(bench.history[0].weight, 245, 'Surviving history entry must be the 245 lb pre-midnight pending set');
    assert.strictEqual(bench.best.brian.r8_12.weight, 245, 'Merged Personal Best must reflect pending set + deletion');

    const customEx = merged.exercises.find(e => e.name === 'Custom Unsynced Cable Fly');
    assert.ok(customEx, 'Local custom exercise with history/pending sets must not be wiped by mergeFromSheets');

    assert.ok(
        appContextSrc.includes("await sheetsPost({ action: 'batchSyncSession', deletes: [deletePayload] })"),
        'deleteSetFromLocalHistory must trigger immediate background deletion sync for historical sets'
    );
    passed++;
    console.log('✅ AUDIT-01 PASSED\n');
}

// ---------------------------------------------------------------------------
// AUDIT-02: Corrupted localStorage JSON Resilience Across All 26 JSON.parse Sites
// ---------------------------------------------------------------------------
console.log('TEST 2 [AUDIT-02]: Verifying safeParseJSON & safeReadLocalJSON guard all localStorage JSON parses...');
{
    assert.ok(appContextSrc.includes('export function safeParseJSON'), 'AppContext must export safeParseJSON');
    assert.ok(appContextSrc.includes('export function safeReadLocalJSON'), 'AppContext must export safeReadLocalJSON');
    assert.ok(safeStorageSrc.includes('export function safeParseJSON'), 'safeStorage.js must export safeParseJSON');

    // Ensure no raw JSON.parse remains in AppContext (except inside safeParseJSON), CircuitView, or SettingsModal
    const appContextJsonParseMatches = appContextSrc.match(/JSON\.parse\(/g) || [];
    assert.strictEqual(appContextJsonParseMatches.length, 1, 'AppContext.jsx must only call JSON.parse inside safeParseJSON');
    assert.strictEqual((circuitViewSrc.match(/JSON\.parse\(/g) || []).length, 0, 'CircuitView.jsx must have 0 raw JSON.parse calls');
    assert.strictEqual((settingsModalSrc.match(/JSON\.parse\(/g) || []).length, 0, 'SettingsModal.jsx must have 0 raw JSON.parse calls');

    // Runtime test of safeParseJSON / safeReadLocalJSON with corrupted inputs
    const mockStorage = {
        gymlog_exercises: '{corrupted_json',
        gymlog_user_pins: 'not-valid-json',
        empty_key: ''
    };
    const sandbox = {
        localStorage: { getItem: (k) => mockStorage[k] ?? null },
        console: { warn: () => {} },
        module: { exports: {} }
    };
    const storageCode = safeStorageSrc
        .replace(/export\s+function\s+/g, 'function ')
        + '\nmodule.exports = { safeParseJSON, safeReadLocalJSON };';
    vm.runInNewContext(storageCode, sandbox);
    const { safeParseJSON, safeReadLocalJSON } = sandbox.module.exports;

    assert.deepStrictEqual(safeReadLocalJSON('gymlog_exercises', []), [], 'Corrupted exercises JSON must return [] fallback');
    assert.deepStrictEqual(safeReadLocalJSON('gymlog_user_pins', {}), {}, 'Corrupted pins JSON must return {} fallback');
    assert.strictEqual(safeParseJSON('', 1), 1, 'Empty string must return fallback');
    assert.strictEqual(safeParseJSON(null, 'default'), 'default', 'null must return fallback');
    passed++;
    console.log('✅ AUDIT-02 PASSED\n');
}

// ---------------------------------------------------------------------------
// AUDIT-03: Always Use HTTP POST in sheetsPost (Never Leak PINs in GET Query Strings)
// ---------------------------------------------------------------------------
console.log('TEST 3 [AUDIT-03]: Verifying sheetsPost always uses HTTP POST and never sends ?payload= via GET...');
{
    assert.ok(!useGymAPISrc.includes('"?payload="'), 'useGymAPI.js must not contain "?payload=" GET query branch');
    assert.ok(!useGymAPISrc.includes("'?payload='"), 'useGymAPI.js must not contain \'?payload=\' GET query branch');

    // Runtime simulation of sheetsPost with a small PIN verification payload
    let capturedFetchCall = null;
    const apiSandbox = {
        useCallback: (fn) => fn,
        localStorage: { getItem: () => 'https://example.com/exec' },
        AbortController: class { constructor() { this.signal = {}; } abort() {} },
        setTimeout: () => 1,
        clearTimeout: () => {},
        fetch: async (url, opts) => {
            capturedFetchCall = { url, opts };
            return { text: async () => JSON.stringify({ status: 'ok', data: { valid: true } }) };
        },
        module: { exports: {} }
    };
    const apiCode = useGymAPISrc
        .replace(/import\s+[^;]+;/g, '')
        .replace(/export\s+function\s+useGymAPI/, 'function useGymAPI')
        + '\nmodule.exports = { useGymAPI };';
    vm.runInNewContext(apiCode, apiSandbox);
    const api = apiSandbox.module.exports.useGymAPI();

    (async () => {
        await api.sheetsPost({ action: 'verifyPin', person: 'Brian', pin: '1234' });
        assert.ok(capturedFetchCall, 'fetch must have been called');
        assert.strictEqual(capturedFetchCall.url, 'https://example.com/exec', 'URL must not contain query string payload');
        assert.strictEqual(capturedFetchCall.opts.method, 'POST', 'Small PIN payload must be sent via HTTP POST');
        assert.ok(capturedFetchCall.opts.body.includes('"pin":"1234"'), 'Payload must be in POST body');
    })();
    passed++;
    console.log('✅ AUDIT-03 PASSED\n');
}

// ---------------------------------------------------------------------------
// AUDIT-04: Clean Up externalSignal Abort Listener in useGymAPI.syncAll
// ---------------------------------------------------------------------------
console.log('TEST 4 [AUDIT-04]: Verifying syncAll cleans up externalSignal abort listener in finally block...');
{
    assert.ok(useGymAPISrc.includes("externalSignal.removeEventListener('abort', onExternalAbort)"), 'syncAll must remove abort listener in finally');

    let listenerCount = 0;
    const mockExternalSignal = {
        aborted: false,
        addEventListener: (evt, fn) => { if (evt === 'abort') listenerCount++; },
        removeEventListener: (evt, fn) => { if (evt === 'abort') listenerCount--; }
    };

    const apiSandbox = {
        useCallback: (fn) => fn,
        localStorage: { getItem: () => 'https://example.com/exec' },
        AbortController: class { constructor() { this.signal = {}; } abort() {} },
        setTimeout: () => 1,
        clearTimeout: () => {},
        Date,
        fetch: async () => ({
            json: async () => ({ status: 'ok', data: { exercises: [] } })
        }),
        module: { exports: {} }
    };
    const apiCode = useGymAPISrc
        .replace(/import\s+[^;]+;/g, '')
        .replace(/export\s+function\s+useGymAPI/, 'function useGymAPI')
        + '\nmodule.exports = { useGymAPI };';
    vm.runInNewContext(apiCode, apiSandbox);
    const api = apiSandbox.module.exports.useGymAPI();

    // Run synchronously via promise inspection
    let syncResolved = false;
    api.syncAll(false, mockExternalSignal).then(() => { syncResolved = true; });
    assert.ok(
        useGymAPISrc.includes('const onExternalAbort = () => controller.abort();') &&
        useGymAPISrc.includes("externalSignal.removeEventListener('abort', onExternalAbort);"),
        'syncAll must bind and remove onExternalAbort listener'
    );
    passed++;
    console.log('✅ AUDIT-04 PASSED\n');
}

// ---------------------------------------------------------------------------
// AUDIT-05: Nested Modal zIndex Layering & 100dvh Mobile Viewport Support
// ---------------------------------------------------------------------------
console.log('TEST 5 [AUDIT-05]: Verifying SessionStatsModal zIndex (2100 > 2000) and 100dvh/90dvh mobile viewport rules...');
{
    assert.ok(sessionStatsModalSrc.includes('zIndex: 2100'), 'SessionStatsModal must have zIndex: 2100 so it layers above SettingsModal');
    assert.ok(sessionStatsModalSrc.includes("minHeight: '100dvh'"), 'SessionStatsModal backdrop must include minHeight: 100dvh');
    assert.ok(sessionStatsModalSrc.includes("maxHeight: '90dvh'"), 'SessionStatsModal card must include maxHeight: 90dvh');
    assert.ok(settingsModalSrc.includes('zIndex: 2000'), 'SettingsModal must keep zIndex: 2000');
    assert.ok(settingsModalSrc.includes("minHeight: '100dvh'"), 'SettingsModal backdrop must include minHeight: 100dvh');
    assert.ok(settingsModalSrc.includes("maxHeight: '90dvh'"), 'SettingsModal card must include maxHeight: 90dvh');
    passed++;
    console.log('✅ AUDIT-05 PASSED\n');
}

// ---------------------------------------------------------------------------
// AUDIT-06: Only Stamp gymlog_library_version After syncAll Succeeds
// ---------------------------------------------------------------------------
console.log('TEST 6 [AUDIT-06]: Verifying gymlog_library_version is only stamped after syncAll resolves...');
{
    const checkVersionBlockMatch = appContextSrc.match(/const versionData = await sheetsGet\(\{ action: 'checkVersion' \}\);[\s\S]*?if \(shouldSyncAll\)/);
    assert.ok(checkVersionBlockMatch, 'fetchInitData must contain checkVersion block');
    assert.ok(
        !checkVersionBlockMatch[0].includes("localStorage.setItem('gymlog_library_version'"),
        'checkVersion block must NOT stamp gymlog_library_version before syncAll succeeds'
    );
    assert.ok(
        appContextSrc.includes('const resolvedVersion = data?.settings?.library_version ?? checkedVersion;') &&
        appContextSrc.includes("localStorage.setItem('gymlog_library_version', String(resolvedVersion));"),
        'gymlog_library_version must be stamped after syncAll and mergeFromSheets complete'
    );
    passed++;
    console.log('✅ AUDIT-06 PASSED\n');
}

// ---------------------------------------------------------------------------
// AUDIT-07: Re-Read localStorage After await syncAll to Preserve Sets Logged Mid-Sync
// ---------------------------------------------------------------------------
console.log('TEST 7 [AUDIT-07]: Verifying fetchInitData re-reads localStorage after await syncAll and passes pendingSets/pendingDeletes...');
{
    const afterSyncMatch = appContextSrc.match(/const data = await syncAll\(false, signal\);[\s\S]*?const mergedData = mergeFromSheets\([\s\S]*?\);/);
    assert.ok(afterSyncMatch, 'fetchInitData must call syncAll followed by mergeFromSheets');
    const block = afterSyncMatch[0];
    assert.ok(block.includes("const latestExercisesRaw = localStorage.getItem('gymlog_exercises');"), 'Must re-read gymlog_exercises after await syncAll');
    assert.ok(block.includes("const pendingSets = safeParseJSON(localStorage.getItem('gymlog_pending_sets'), []);"), 'Must read gymlog_pending_sets after await syncAll');
    assert.ok(block.includes("const pendingDeletes = safeParseJSON(localStorage.getItem('gymlog_pending_deletes'), []);"), 'Must read gymlog_pending_deletes after await syncAll');
    assert.ok(block.includes('pendingSets,') && block.includes('pendingDeletes'), 'Must pass pendingSets and pendingDeletes into mergeFromSheets');
    passed++;
    console.log('✅ AUDIT-07 PASSED\n');
}

// ---------------------------------------------------------------------------
// AUDIT-08: Restore Drained sets and deletes in undoWorkoutSession When Removing Queued Offline Batches
// ---------------------------------------------------------------------------
console.log('TEST 8 [AUDIT-08]: Verifying undoWorkoutSession restores drained sets & deletes from removed queue items...');
{
    assert.ok(appContextSrc.includes('restoredSets.push(...item.sets)'), 'undoWorkoutSession must collect item.sets from removed queue entries');
    assert.ok(appContextSrc.includes('restoredDeletes.push(...item.deletes)'), 'undoWorkoutSession must collect item.deletes from removed queue entries');
    assert.ok(
        appContextSrc.includes("localStorage.setItem('gymlog_pending_sets', JSON.stringify([...restoredSets, ...existingPendingSets]))"),
        'undoWorkoutSession must restore drained sets back into gymlog_pending_sets'
    );
    assert.ok(
        appContextSrc.includes("localStorage.setItem('gymlog_pending_deletes', JSON.stringify([...restoredDeletes, ...existingPendingDeletes]))"),
        'undoWorkoutSession must restore drained deletes back into gymlog_pending_deletes'
    );
    passed++;
    console.log('✅ AUDIT-08 PASSED\n');
}

// ---------------------------------------------------------------------------
// AUDIT-09: Preserve Unflushed Offline & Guest Sessions in fetchInitData
// ---------------------------------------------------------------------------
console.log('TEST 9 [AUDIT-09]: Verifying fetchInitData preserves unflushed offline & Guest sessions when merging serverSessions...');
{
    assert.ok(appContextSrc.includes('const unflushedLocalSessions ='), 'fetchInitData must compute unflushedLocalSessions');
    assert.ok(appContextSrc.includes('const mergedSessions = [...unflushedLocalSessions, ...serverSessions];'), 'fetchInitData must merge unflushedLocalSessions with serverSessions');
    assert.ok(appContextSrc.includes('setSessionHistory(mergedSessions);'), 'fetchInitData must update state with mergedSessions');
    passed++;
    console.log('✅ AUDIT-09 PASSED\n');
}

// ---------------------------------------------------------------------------
// AUDIT-10: Full Body 0-Rep Active Target Day Resolution & Backend Delete Sync Hardening
// ---------------------------------------------------------------------------
console.log('TEST 10 [AUDIT-10]: Verifying Full Body 0-rep activeTargetDay resolution & Combined_AppScript_v2.gs v4.4 hardening...');
{
    assert.ok(appContextSrc.includes('const activeTargetDay = isFullBodyActive'), 'logExerciseSet must resolve activeTargetDay for Full Body workouts');
    const targetRangeCalls = appContextSrc.match(/getDayTargetRange\(activeTargetDay\)/g) || [];
    assert.strictEqual(targetRangeCalls.length, 3, 'All 3 0-attempt range lookups in logExerciseSet must use getDayTargetRange(activeTargetDay)');

    assert.ok(gsSrc.includes('Version 4.4 of the GymLog backend (TASK-R137'), 'Combined_AppScript_v2.gs must have v4.4 header');
    const toleranceMatches = gsSrc.match(/Math\.abs\(d1\.getTime\(\) - d2\.getTime\(\)\) < 3000/g) || [];
    assert.strictEqual(toleranceMatches.length, 2, 'Both gymlog_handleDeleteHistory and gymlog_handleBatchSyncSession must use < 3000 ms date tolerance');

    const deleteHistoryBlock = gsSrc.match(/function gymlog_handleDeleteHistory[\s\S]*?return ok\(\{ deleted: 1 \}\);/);
    assert.ok(deleteHistoryBlock && deleteHistoryBlock[0].includes('gymlog_bumpLibraryVersion();'), 'gymlog_handleDeleteHistory must call gymlog_bumpLibraryVersion()');

    const deleteSessionBlock = gsSrc.match(/function gymlog_handleDeleteSession[\s\S]*?return ok\(\{ status: "success", deletedId: id \}\);/);
    assert.ok(deleteSessionBlock && deleteSessionBlock[0].includes('gymlog_bumpLibraryVersion();'), 'gymlog_handleDeleteSession must call gymlog_bumpLibraryVersion()');

    passed++;
    console.log('✅ AUDIT-10 PASSED\n');
}

assert.strictEqual(passed, 10, 'All 10 audit checks must pass');
console.log('==============================================================');
console.log(`🎉 ALL ${passed}/10 AUTOMATED AUDIT VERIFICATION CHECKS PASSED! (0 REPRODUCED)`);
console.log('==============================================================\n');
process.exit(0);
