import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext, safeReadLocalJSON } from '../context/AppContext';
import VariationGeneratorPanel from './VariationGeneratorPanel';
import { buildVariationNames, INITIAL_VARIATION_OPTIONS } from '../utils/exerciseVariations';
import {
    CORE_MOVEMENT_CATEGORIES,
    AI_PROVIDER_OPTIONS,
    SAMPLE_SCAN_PRESETS,
    buildSampleScanResult,
    matchAgainstExerciseLibrary,
    normalizeAIScanResult,
    computeLocationCategoryCoverage,
    compressImageFileToDataUrl,
    analyzeEquipmentPhotosWithAI
} from '../utils/aiEquipmentScanner';

export default function ScannerLabView() {
    const navigate = useNavigate();
    const {
        exercises = [],
        locations = ['Anywhere', 'Home', '24 Hour Fitness'],
        activeLocation = '24 Hour Fitness',
        deviceOwner = 'Guest',
        createExerciseMeta,
        addExerciseToLocalState,
        addLocationToRoster
    } = useAppContext();

    const ownerKey = (deviceOwner && deviceOwner.trim()) ? deviceOwner.trim() : 'Guest';
    const configStorageKey = `gymlog_ai_scanner_config_${ownerKey}`;

    // Mode Toggle: 'dry_run' (Default) vs 'live_save'
    const [labMode, setLabMode] = useState('dry_run');

    // Section 1: AI Connection Setup ("Way B" Per-User Key Manager)
    const [aiConfig, setAiConfig] = useState(() => {
        const saved = safeReadLocalJSON(configStorageKey, null);
        return {
            provider: saved?.provider || 'gemini',
            model: saved?.model || 'gemini-2.5-flash',
            apiKey: saved?.apiKey || ''
        };
    });
    const [showApiKey, setShowApiKey] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(true);
    const [configToast, setConfigToast] = useState('');

    useEffect(() => {
        const saved = safeReadLocalJSON(configStorageKey, null);
        if (saved) {
            setAiConfig({
                provider: saved.provider || 'gemini',
                model: saved.model || 'gemini-2.5-flash',
                apiKey: saved.apiKey || ''
            });
        }
    }, [configStorageKey]);

    const activeProviderMeta = useMemo(() => {
        return AI_PROVIDER_OPTIONS.find(p => p.id === aiConfig.provider) || AI_PROVIDER_OPTIONS[0];
    }, [aiConfig.provider]);

    const handleProviderChange = (newProviderId) => {
        const found = AI_PROVIDER_OPTIONS.find(p => p.id === newProviderId) || AI_PROVIDER_OPTIONS[0];
        setAiConfig(prev => ({
            ...prev,
            provider: found.id,
            model: found.defaultModel
        }));
    };

    const handleSaveConfig = () => {
        try {
            localStorage.setItem(configStorageKey, JSON.stringify(aiConfig));
            setConfigToast(`Saved ${activeProviderMeta.label} key for ${ownerKey}!`);
            setTimeout(() => setConfigToast(''), 3000);
        } catch (err) {
            setConfigToast('Error saving key to localStorage');
        }
    };

    // Section 2: Target Gym Location & Coverage Checklist
    const [selectedLocation, setSelectedLocation] = useState(activeLocation || '24 Hour Fitness');
    const [isCreatingNewLocation, setIsCreatingNewLocation] = useState(false);
    const [newLocationInput, setNewLocationInput] = useState('');
    const [showCoverageChecklist, setShowCoverageChecklist] = useState(true);

    const effectiveTargetLocation = useMemo(() => {
        if (isCreatingNewLocation && newLocationInput.trim()) {
            return newLocationInput.trim();
        }
        return selectedLocation || '24 Hour Fitness';
    }, [isCreatingNewLocation, newLocationInput, selectedLocation]);

    // Section 3: Photo Upload / Capture & Sample Presets
    const [uploadedPhotos, setUploadedPhotos] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [scanError, setScanError] = useState('');
    const [activeSampleKey, setActiveSampleKey] = useState(null);
    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);

    // Section 4: Active Scan Result & Editable Draft Items
    const [scanResult, setScanResult] = useState(null);
    const [draftItems, setDraftItems] = useState([]);
    const [actionFeedback, setActionFeedback] = useState('');

    // Section 5: Lab Walk-Through Queue
    const [walkThroughQueue, setWalkThroughQueue] = useState([]);

    const allCategories = useMemo(() => {
        const set = new Set(CORE_MOVEMENT_CATEGORIES);
        (exercises || []).forEach(ex => {
            if (ex?.category) set.add(ex.category);
        });
        return Array.from(set);
    }, [exercises]);

    const existingExerciseNames = useMemo(() => {
        return new Set((exercises || []).map(e => (e.name || '').trim().toLowerCase()));
    }, [exercises]);

    const coverageStats = useMemo(() => {
        return computeLocationCategoryCoverage(exercises, walkThroughQueue, effectiveTargetLocation);
    }, [exercises, walkThroughQueue, effectiveTargetLocation]);

    const coveredCount = useMemo(() => {
        return coverageStats.filter(c => c.isCovered).length;
    }, [coverageStats]);

    const hydrateDraftItems = (normalized) => {
        if (!normalized || !Array.isArray(normalized.items)) {
            setDraftItems([]);
            return;
        }
        setDraftItems(
            normalized.items.map((item, idx) => ({
                ...item,
                id: `item_${Date.now()}_${idx}`,
                variationOptions: item.variationOptions || { ...INITIAL_VARIATION_OPTIONS },
                excludedPreviewNames: new Set(),
                isSaving: false,
                savedStatus: null
            }))
        );
    };

    // Re-evaluate library match whenever effectiveTargetLocation or exercises change
    useEffect(() => {
        setDraftItems(prev =>
            prev.map(item => {
                if (item.type !== 'strength') return item;
                return {
                    ...item,
                    location: effectiveTargetLocation,
                    libraryMatch: matchAgainstExerciseLibrary(item.baseName, exercises, effectiveTargetLocation)
                };
            })
        );
    }, [effectiveTargetLocation, exercises]);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files || []).slice(0, 3);
        if (files.length === 0) return;
        setScanError('');
        setActiveSampleKey(null);
        try {
            const compressedList = await Promise.all(
                files.map(file => compressImageFileToDataUrl(file, 1024, 0.72))
            );
            setUploadedPhotos(prev => [...prev, ...compressedList].slice(0, 3));
        } catch (err) {
            setScanError(err.message || 'Failed to process image file.');
        } finally {
            e.target.value = '';
        }
    };

    const handleRemovePhoto = (idxToRemove) => {
        setUploadedPhotos(prev => prev.filter((_, idx) => idx !== idxToRemove));
    };

    const handleLoadSamplePreset = (presetKey) => {
        setScanError('');
        setActionFeedback('');
        setActiveSampleKey(presetKey);
        const normalized = buildSampleScanResult(presetKey, exercises, effectiveTargetLocation);
        setScanResult(normalized);
        hydrateDraftItems(normalized);
    };

    const handleRunAIAnalysis = async () => {
        setScanError('');
        setActionFeedback('');
        setIsAnalyzing(true);
        try {
            const normalized = await analyzeEquipmentPhotosWithAI({
                images: uploadedPhotos,
                provider: aiConfig.provider,
                apiKey: aiConfig.apiKey,
                model: aiConfig.model,
                existingExercises: exercises,
                targetLocation: effectiveTargetLocation
            });
            setScanResult(normalized);
            hydrateDraftItems(normalized);
        } catch (err) {
            setScanError(err.message || 'AI analysis failed.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const updateDraftItemField = (itemId, field, value) => {
        setDraftItems(prev =>
            prev.map(item => {
                if (item.id !== itemId) return item;
                const next = { ...item, [field]: value, savedStatus: null };
                if (field === 'baseName' && item.type === 'strength') {
                    next.libraryMatch = matchAgainstExerciseLibrary(value, exercises, effectiveTargetLocation);
                }
                return next;
            })
        );
    };

    const handleToggleVariationOption = (itemId, optionKey, checked) => {
        setDraftItems(prev =>
            prev.map(item => {
                if (item.id !== itemId) return item;
                return {
                    ...item,
                    variationOptions: {
                        ...(item.variationOptions || INITIAL_VARIATION_OPTIONS),
                        [optionKey]: checked
                    },
                    excludedPreviewNames: new Set(),
                    savedStatus: null
                };
            })
        );
    };

    const handleTogglePreviewName = (itemId, varName) => {
        setDraftItems(prev =>
            prev.map(item => {
                if (item.id !== itemId) return item;
                const nextExcluded = new Set(item.excludedPreviewNames || []);
                if (nextExcluded.has(varName)) {
                    nextExcluded.delete(varName);
                } else {
                    nextExcluded.add(varName);
                }
                return {
                    ...item,
                    excludedPreviewNames: nextExcluded,
                    savedStatus: null
                };
            })
        );
    };

    const handleConfirmStrengthItem = async (item) => {
        const allGenerated = buildVariationNames(item.baseName, item.variationOptions);
        const selectedVariations = allGenerated.filter(n => !item.excludedPreviewNames?.has(n));
        const finalNames = selectedVariations.length > 0 ? selectedVariations : [item.baseName.trim()];

        if (!finalNames[0]) {
            setScanError('Exercise base name cannot be empty.');
            return;
        }

        if (labMode === 'dry_run') {
            const queuedEntry = {
                id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                type: 'strength',
                mode: 'DRY-RUN',
                baseName: item.baseName.trim(),
                category: item.category,
                location: effectiveTargetLocation,
                variationNames: finalNames,
                setupNote: item.setupNote
            };
            setWalkThroughQueue(prev => [queuedEntry, ...prev]);
            setDraftItems(prev =>
                prev.map(d => (d.id === item.id ? { ...d, savedStatus: `Queued ${finalNames.length} variation(s) in Dry-Run!` } : d))
            );
            setActionFeedback(`🛡️ Dry-Run: Added "${item.baseName}" (${finalNames.length} variation${finalNames.length === 1 ? '' : 's'}) to Walk-Through Queue for ${effectiveTargetLocation}.`);
            return;
        }

        // LIVE SAVE MODE
        setDraftItems(prev => prev.map(d => (d.id === item.id ? { ...d, isSaving: true } : d)));
        try {
            if (isCreatingNewLocation && newLocationInput.trim() && !locations.includes(effectiveTargetLocation)) {
                if (addLocationToRoster) {
                    addLocationToRoster(effectiveTargetLocation);
                }
            }

            let pin = 'guest';
            if (deviceOwner && deviceOwner !== 'Guest') {
                const cachedPins = safeReadLocalJSON('gymlog_user_pins', {});
                const ownerLower = deviceOwner.toLowerCase();
                pin = cachedPins[ownerLower] || localStorage.getItem('gymlog_pin_' + ownerLower) || '';
            }

            if (createExerciseMeta) {
                await createExerciseMeta(
                    {
                        baseName: item.baseName.trim(),
                        variationNames: finalNames,
                        category: item.category,
                        location: effectiveTargetLocation,
                        timed: false,
                        isCircuit: false,
                        manufacturer: scanResult?.manufacturer || '',
                        note: item.setupNote || ''
                    },
                    pin
                );
            } else if (addExerciseToLocalState) {
                finalNames.forEach(vName => {
                    addExerciseToLocalState({
                        name: vName,
                        category: item.category,
                        location: effectiveTargetLocation,
                        timed: false,
                        note: item.setupNote || ''
                    });
                });
            }

            // Save compressed photo thumbnail locally under gymlog_custom_photos if a photo was uploaded
            if (uploadedPhotos.length > 0 && uploadedPhotos[0]?.dataUrl) {
                try {
                    const customPhotos = safeReadLocalJSON('gymlog_custom_photos', {});
                    customPhotos[item.baseName.trim()] = uploadedPhotos[0].dataUrl;
                    finalNames.forEach(vName => {
                        customPhotos[vName] = uploadedPhotos[0].dataUrl;
                    });
                    localStorage.setItem('gymlog_custom_photos', JSON.stringify(customPhotos));
                } catch (photoErr) {
                    console.warn('Could not cache custom photo in localStorage:', photoErr);
                }
            }

            const queuedEntry = {
                id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                type: 'strength',
                mode: 'LIVE-SAVED',
                baseName: item.baseName.trim(),
                category: item.category,
                location: effectiveTargetLocation,
                variationNames: finalNames,
                setupNote: item.setupNote
            };
            setWalkThroughQueue(prev => [queuedEntry, ...prev]);
            setDraftItems(prev =>
                prev.map(d =>
                    d.id === item.id
                        ? { ...d, isSaving: false, savedStatus: `Saved ${finalNames.length} variation(s) to Live Library!` }
                        : d
                )
            );
            setActionFeedback(`🚀 Live Save: Created ${finalNames.length} variation(s) for "${item.baseName}" at ${effectiveTargetLocation}!`);
        } catch (err) {
            setDraftItems(prev => prev.map(d => (d.id === item.id ? { ...d, isSaving: false } : d)));
            setScanError(err.message || 'Failed to save exercise variations.');
        }
    };

    const handleConfirmCardioItem = (item) => {
        const cleanWarmUp = String(item.warmUpName || '').trim();
        if (!cleanWarmUp) {
            setScanError('Warm-up name cannot be empty.');
            return;
        }

        if (labMode === 'dry_run') {
            const queuedEntry = {
                id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                type: 'cardio',
                mode: 'DRY-RUN',
                warmUpName: cleanWarmUp,
                machineName: item.machineName,
                coachingTip: item.coachingTip,
                location: effectiveTargetLocation
            };
            setWalkThroughQueue(prev => [queuedEntry, ...prev]);
            setDraftItems(prev =>
                prev.map(d => (d.id === item.id ? { ...d, savedStatus: 'Queued Cardio Warm-Up in Dry-Run!' } : d))
            );
            setActionFeedback(`🛡️ Dry-Run: Added "${cleanWarmUp}" to Walk-Through Queue.`);
            return;
        }

        // LIVE SAVE MODE: Append to gymlog_custom_warmups
        try {
            const existingWarmups = safeReadLocalJSON('gymlog_custom_warmups', []);
            const nextWarmups = Array.isArray(existingWarmups) ? [...existingWarmups] : [];
            if (!nextWarmups.some(w => String(w).toLowerCase() === cleanWarmUp.toLowerCase())) {
                nextWarmups.push(cleanWarmUp);
                localStorage.setItem('gymlog_custom_warmups', JSON.stringify(nextWarmups));
            }
            const queuedEntry = {
                id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                type: 'cardio',
                mode: 'LIVE-SAVED',
                warmUpName: cleanWarmUp,
                machineName: item.machineName,
                coachingTip: item.coachingTip,
                location: effectiveTargetLocation
            };
            setWalkThroughQueue(prev => [queuedEntry, ...prev]);
            setDraftItems(prev =>
                prev.map(d => (d.id === item.id ? { ...d, savedStatus: 'Saved to Live Warm-Up Modalities!' } : d))
            );
            setActionFeedback(`🚀 Live Save: Added "${cleanWarmUp}" to Warm-Up Card dropdown!`);
        } catch (err) {
            setScanError('Failed to save custom warm-up to localStorage.');
        }
    };

    const renderLibraryMatchBadge = (libraryMatch) => {
        if (!libraryMatch || libraryMatch.status === 'new') {
            return (
                <span
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid #10b981',
                        color: '#34d399',
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 10,
                        fontFamily: 'var(--mono)',
                        fontWeight: 700
                    }}
                >
                    🆕 BRAND-NEW MACHINE
                </span>
            );
        }

        if (libraryMatch.status === 'exists_same_location') {
            return (
                <span
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        background: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid #3b82f6',
                        color: '#60a5fa',
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 10,
                        fontFamily: 'var(--mono)',
                        fontWeight: 700
                    }}
                >
                    ✅ ALREADY IN LIBRARY AT THIS LOCATION ({libraryMatch.matchedExercises.length} variation{libraryMatch.matchedExercises.length === 1 ? '' : 's'})
                </span>
            );
        }

        return (
            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'rgba(168, 85, 247, 0.15)',
                    border: '1px solid #a855f7',
                    color: '#c084fc',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: 10,
                    fontFamily: 'var(--mono)',
                    fontWeight: 700
                }}
            >
                📍 EXISTS AT ANOTHER GYM ({libraryMatch.existingLocations.join(', ')})
            </span>
        );
    };

    return (
        <div
            style={{
                maxWidth: 760,
                margin: '0 auto',
                padding: '12px 12px 48px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16
            }}
        >
            {/* Top Lab Banner & Safety Mode Switch */}
            <div
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--accent)',
                    borderRadius: 12,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                        <div style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--mono)', fontWeight: 700, letterSpacing: 1 }}>
                            🧪 AI EQUIPMENT &amp; CARDIO SCANNER LAB (ISOLATED SANDBOX)
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'white', marginTop: 2 }}>
                            Smart Gym Walk-Through &amp; Machine Onboarding
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/lift')}
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid var(--border)',
                            color: 'white',
                            borderRadius: 8,
                            padding: '6px 12px',
                            fontSize: 12,
                            fontFamily: 'var(--mono)',
                            cursor: 'pointer'
                        }}
                    >
                        ← Back to App
                    </button>
                </div>

                {/* Safety Mode Toggle */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                    <button
                        type="button"
                        onClick={() => setLabMode('dry_run')}
                        style={{
                            padding: '10px 12px',
                            borderRadius: 8,
                            border: labMode === 'dry_run' ? '2px solid #10b981' : '1px solid var(--border)',
                            background: labMode === 'dry_run' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(255,255,255,0.03)',
                            color: labMode === 'dry_run' ? '#34d399' : 'var(--muted)',
                            fontWeight: 700,
                            fontSize: 12,
                            fontFamily: 'var(--mono)',
                            cursor: 'pointer',
                            textAlign: 'left'
                        }}
                    >
                        🛡️ SANDBOX DRY-RUN MODE
                        <div style={{ fontSize: 10, fontWeight: 400, marginTop: 2, opacity: 0.85 }}>
                            Default — Zero writes to Google Sheets or live library
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setLabMode('live_save')}
                        style={{
                            padding: '10px 12px',
                            borderRadius: 8,
                            border: labMode === 'live_save' ? '2px solid var(--accent)' : '1px solid var(--border)',
                            background: labMode === 'live_save' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255,255,255,0.03)',
                            color: labMode === 'live_save' ? 'var(--accent)' : 'var(--muted)',
                            fontWeight: 700,
                            fontSize: 12,
                            fontFamily: 'var(--mono)',
                            cursor: 'pointer',
                            textAlign: 'left'
                        }}
                    >
                        🚀 LIVE SAVE MODE
                        <div style={{ fontSize: 10, fontWeight: 400, marginTop: 2, opacity: 0.85 }}>
                            Saves approved variations &amp; warm-ups to your live app
                        </div>
                    </button>
                </div>
            </div>

            {/* Section 1: AI Connection Setup ("Way B" Per-User Key Manager) */}
            <div
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: 14
                }}
            >
                <div
                    onClick={() => setIsConfigOpen(prev => !prev)}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
                            1. AI Provider &amp; Personal Key ({ownerKey})
                        </span>
                        <span
                            style={{
                                fontSize: 10,
                                fontFamily: 'var(--mono)',
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: aiConfig.apiKey ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.07)',
                                color: aiConfig.apiKey ? '#34d399' : 'var(--muted)'
                            }}
                        >
                            {aiConfig.apiKey ? `✓ Key Configured (${activeProviderMeta.id})` : 'Optional for Sample Presets'}
                        </span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                        {isConfigOpen ? '▼ Hide' : '▶ Expand'}
                    </span>
                </div>

                {isConfigOpen && (
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: 4 }}>
                                    AI VISION PROVIDER
                                </label>
                                <select
                                    value={aiConfig.provider}
                                    onChange={e => handleProviderChange(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: 8,
                                        borderRadius: 8,
                                        background: '#0c0c0c',
                                        border: '1px solid var(--border)',
                                        color: 'white',
                                        fontSize: 12
                                    }}
                                >
                                    {AI_PROVIDER_OPTIONS.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: 4 }}>
                                    MODEL
                                </label>
                                <select
                                    value={aiConfig.model}
                                    onChange={e => setAiConfig(prev => ({ ...prev, model: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: 8,
                                        borderRadius: 8,
                                        background: '#0c0c0c',
                                        border: '1px solid var(--border)',
                                        color: 'white',
                                        fontSize: 12,
                                        fontFamily: 'var(--mono)'
                                    }}
                                >
                                    {activeProviderMeta.models.map(m => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            <input
                                type={showApiKey ? 'text' : 'password'}
                                placeholder={activeProviderMeta.keyPlaceholder}
                                value={aiConfig.apiKey}
                                onChange={e => setAiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                                style={{
                                    flex: 1,
                                    minWidth: 200,
                                    padding: '8px 10px',
                                    borderRadius: 8,
                                    background: '#0c0c0c',
                                    border: '1px solid var(--border)',
                                    color: 'white',
                                    fontSize: 12,
                                    fontFamily: 'var(--mono)'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowApiKey(prev => !prev)}
                                style={{
                                    padding: '8px 10px',
                                    borderRadius: 8,
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--muted)',
                                    fontSize: 11,
                                    fontFamily: 'var(--mono)',
                                    cursor: 'pointer'
                                }}
                            >
                                {showApiKey ? 'Hide' : 'Show'}
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveConfig}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: 8,
                                    background: 'var(--accent)',
                                    border: 'none',
                                    color: 'black',
                                    fontWeight: 700,
                                    fontSize: 11,
                                    fontFamily: 'var(--mono)',
                                    cursor: 'pointer'
                                }}
                            >
                                Save Key to My Profile
                            </button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: 11 }}>
                            <a
                                href="https://aistudio.google.com/apikey"
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: 'var(--accent)', textDecoration: 'underline', fontFamily: 'var(--mono)' }}
                            >
                                🔑 Get Free Google Gemini Key (aistudio.google.com/apikey)
                            </a>
                            {configToast && (
                                <span style={{ color: '#34d399', fontFamily: 'var(--mono)', fontSize: 11 }}>
                                    {configToast}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Section 2: Target Gym Location & "Gym Walk-Through" Coverage Checklist */}
            <div
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 11, fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
                        2. Target Gym Location &amp; Walk-Through Coverage
                    </span>
                    <button
                        type="button"
                        onClick={() => setIsCreatingNewLocation(prev => !prev)}
                        style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            background: isCreatingNewLocation ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255,255,255,0.06)',
                            border: '1px solid var(--accent)',
                            color: 'var(--accent)',
                            fontSize: 11,
                            fontFamily: 'var(--mono)',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        {isCreatingNewLocation ? 'Use Existing Location' : '+ New Gym Location...'}
                    </button>
                </div>

                {!isCreatingNewLocation ? (
                    <select
                        value={selectedLocation}
                        onChange={e => setSelectedLocation(e.target.value)}
                        style={{
                            width: '100%',
                            padding: 10,
                            borderRadius: 8,
                            background: '#0c0c0c',
                            border: '1px solid var(--border)',
                            color: 'white',
                            fontSize: 13,
                            fontWeight: 600
                        }}
                    >
                        {locations.map(loc => (
                            <option key={loc} value={loc}>
                                📍 {loc}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type="text"
                        placeholder="Enter new gym name (e.g. Planet Fitness, Equinox, Hotel Gym)..."
                        value={newLocationInput}
                        onChange={e => setNewLocationInput(e.target.value)}
                        style={{
                            width: '100%',
                            padding: 10,
                            borderRadius: 8,
                            background: '#0c0c0c',
                            border: '1px solid var(--accent)',
                            color: 'white',
                            fontSize: 13,
                            boxSizing: 'border-box'
                        }}
                    />
                )}

                {/* Collapsible Gym Movement Coverage Checklist */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                    <div
                        onClick={() => setShowCoverageChecklist(prev => !prev)}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            marginBottom: showCoverageChecklist ? 8 : 0
                        }}
                    >
                        <span style={{ fontSize: 11, fontFamily: 'var(--mono)', fontWeight: 700, color: 'white' }}>
                            📊 Gym Movement Coverage Checklist — <span style={{ color: 'var(--accent)' }}>{effectiveTargetLocation}</span> ({coveredCount}/{CORE_MOVEMENT_CATEGORIES.length} covered)
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                            {showCoverageChecklist ? '▼' : '▶'}
                        </span>
                    </div>

                    {showCoverageChecklist && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 6 }}>
                            {coverageStats.map(stat => (
                                <div
                                    key={stat.category}
                                    style={{
                                        padding: '6px 8px',
                                        borderRadius: 6,
                                        background: stat.isCovered ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        border: stat.isCovered ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: 11,
                                        fontFamily: 'var(--mono)'
                                    }}
                                >
                                    <span style={{ color: stat.isCovered ? 'white' : '#fca5a5', fontWeight: 600 }}>
                                        {stat.isCovered ? '✅' : '⚠️'} {stat.category}
                                    </span>
                                    <span style={{ color: stat.isCovered ? '#34d399' : '#f87171', fontSize: 10 }}>
                                        {stat.totalCount}
                                        {stat.queuedCount > 0 ? ` (+${stat.queuedCount})` : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Section 3: Photo Capture / Upload + 1-Click Localhost Sample Presets */}
            <div
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                }}
            >
                <div style={{ fontSize: 11, fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
                    3. Capture Equipment Photo(s) or Run a 1-Click Sample Scan
                </div>

                {/* Hidden File Inputs */}
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
                <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        style={{
                            flex: 1,
                            minWidth: 180,
                            padding: '12px 14px',
                            borderRadius: 8,
                            background: 'var(--accent)',
                            border: 'none',
                            color: 'black',
                            fontWeight: 800,
                            fontSize: 13,
                            fontFamily: 'var(--mono)',
                            cursor: 'pointer'
                        }}
                    >
                        📷 Snap Machine Photo (Camera)
                    </button>

                    <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        style={{
                            flex: 1,
                            minWidth: 180,
                            padding: '12px 14px',
                            borderRadius: 8,
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid var(--border)',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: 13,
                            fontFamily: 'var(--mono)',
                            cursor: 'pointer'
                        }}
                    >
                        🖼️ Upload Photo(s) (Up to 3)
                    </button>
                </div>

                {/* Uploaded Photo Thumbnails */}
                {uploadedPhotos.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {uploadedPhotos.map((photo, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        position: 'relative',
                                        width: 100,
                                        height: 100,
                                        borderRadius: 8,
                                        overflow: 'hidden',
                                        border: '1px solid var(--accent)',
                                        background: '#000'
                                    }}
                                >
                                    <img
                                        src={photo.dataUrl}
                                        alt={`Scan ${idx + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <span
                                        style={{
                                            position: 'absolute',
                                            bottom: 4,
                                            left: 4,
                                            background: 'rgba(0,0,0,0.75)',
                                            color: '#34d399',
                                            fontSize: 9,
                                            fontFamily: 'var(--mono)',
                                            padding: '1px 4px',
                                            borderRadius: 4
                                        }}
                                    >
                                        {photo.sizeKB} KB
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemovePhoto(idx)}
                                        style={{
                                            position: 'absolute',
                                            top: 4,
                                            right: 4,
                                            background: 'rgba(0,0,0,0.8)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: 20,
                                            height: 20,
                                            fontSize: 11,
                                            cursor: 'pointer',
                                            lineHeight: 1
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            disabled={isAnalyzing}
                            onClick={handleRunAIAnalysis}
                            style={{
                                padding: '12px 16px',
                                borderRadius: 8,
                                background: '#10b981',
                                border: 'none',
                                color: 'black',
                                fontWeight: 800,
                                fontSize: 13,
                                fontFamily: 'var(--mono)',
                                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                                opacity: isAnalyzing ? 0.7 : 1
                            }}
                        >
                            {isAnalyzing
                                ? `⏳ Analyzing ${uploadedPhotos.length} Photo(s) with ${activeProviderMeta.label}...`
                                : `🔍 Analyze ${uploadedPhotos.length} Photo(s) with AI (${activeProviderMeta.id.toUpperCase()})`}
                        </button>
                    </div>
                )}

                {/* 1-Click Localhost Test Bar */}
                <div
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px dashed var(--border)',
                        borderRadius: 8,
                        padding: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8
                    }}
                >
                    <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', fontWeight: 700 }}>
                        🧪 No Photo Handy? Try an Instant Sample Scan (Works Offline &amp; Without API Key):
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))', gap: 6 }}>
                        <button
                            type="button"
                            onClick={() => handleLoadSamplePreset('sample_row')}
                            style={{
                                padding: '8px 10px',
                                borderRadius: 6,
                                background: activeSampleKey === 'sample_row' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255,255,255,0.06)',
                                border: activeSampleKey === 'sample_row' ? '1px solid var(--accent)' : '1px solid var(--border)',
                                color: 'white',
                                fontSize: 11,
                                fontFamily: 'var(--mono)',
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                        >
                            🦾 New Strength Machine (DY Row)
                        </button>

                        <button
                            type="button"
                            onClick={() => handleLoadSamplePreset('sample_dual')}
                            style={{
                                padding: '8px 10px',
                                borderRadius: 6,
                                background: activeSampleKey === 'sample_dual' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255,255,255,0.06)',
                                border: activeSampleKey === 'sample_dual' ? '1px solid var(--accent)' : '1px solid var(--border)',
                                color: 'white',
                                fontSize: 11,
                                fontFamily: 'var(--mono)',
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                        >
                            🔄 Dual-Purpose Machine (Pec Fly / Rear Delt)
                        </button>

                        <button
                            type="button"
                            onClick={() => handleLoadSamplePreset('sample_cardio')}
                            style={{
                                padding: '8px 10px',
                                borderRadius: 6,
                                background: activeSampleKey === 'sample_cardio' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255,255,255,0.06)',
                                border: activeSampleKey === 'sample_cardio' ? '1px solid var(--accent)' : '1px solid var(--border)',
                                color: 'white',
                                fontSize: 11,
                                fontFamily: 'var(--mono)',
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                        >
                            🔥 Cardio Machine (StairMaster Warm-Up)
                        </button>

                        <button
                            type="button"
                            onClick={() => handleLoadSamplePreset('sample_duplicate')}
                            style={{
                                padding: '8px 10px',
                                borderRadius: 6,
                                background: activeSampleKey === 'sample_duplicate' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255,255,255,0.06)',
                                border: activeSampleKey === 'sample_duplicate' ? '1px solid var(--accent)' : '1px solid var(--border)',
                                color: 'white',
                                fontSize: 11,
                                fontFamily: 'var(--mono)',
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                        >
                            📍 Existing Machine Duplicate Check
                        </button>
                    </div>
                </div>

                {scanError && (
                    <div
                        style={{
                            padding: 10,
                            borderRadius: 8,
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid #ef4444',
                            color: '#fca5a5',
                            fontSize: 12,
                            fontFamily: 'var(--mono)'
                        }}
                    >
                        ⚠️ {scanError}
                    </div>
                )}

                {actionFeedback && (
                    <div
                        style={{
                            padding: 10,
                            borderRadius: 8,
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid #10b981',
                            color: '#34d399',
                            fontSize: 12,
                            fontFamily: 'var(--mono)'
                        }}
                    >
                        {actionFeedback}
                    </div>
                )}
            </div>

            {/* Section 4: Interactive Scan Result & Review Editor */}
            {scanResult && (
                <div
                    style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--accent)',
                        borderRadius: 12,
                        padding: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16
                    }}
                >
                    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                            <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>
                                4. Scan Result Review — {scanResult.equipmentKind === 'dual_strength' ? '🔄 DUAL-MOVEMENT MACHINE (2 EXERCISES)' : scanResult.equipmentKind === 'cardio' ? '🔥 CARDIO / WARM-UP MACHINE' : '🦾 STRENGTH MACHINE'}
                            </span>
                            <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)' }}>
                                Manufacturer: <strong style={{ color: 'white' }}>{scanResult.manufacturer}</strong>
                            </span>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'white', marginTop: 4 }}>
                            {scanResult.machineTitle}
                        </div>
                        {scanResult.summary && (
                            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, lineHeight: 1.4 }}>
                                {scanResult.summary}
                            </div>
                        )}
                    </div>

                    {draftItems.map((item, idx) => {
                        if (item.type === 'cardio') {
                            return (
                                <div
                                    key={item.id}
                                    style={{
                                        background: 'rgba(249, 115, 22, 0.06)',
                                        border: '1px solid var(--accent)',
                                        borderRadius: 10,
                                        padding: 14,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 10
                                    }}
                                >
                                    <div style={{ fontSize: 11, fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--accent)' }}>
                                        🔥 CARDIO / WARM-UP EQUIPMENT DETECTED
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: 4 }}>
                                            WARM-UP PRESET NAME (FOR PRE-WORKOUT WARM-UP CARD)
                                        </label>
                                        <input
                                            type="text"
                                            value={item.warmUpName}
                                            onChange={e => updateDraftItemField(item.id, 'warmUpName', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 10px',
                                                borderRadius: 8,
                                                background: '#0c0c0c',
                                                border: '1px solid var(--border)',
                                                color: 'white',
                                                fontSize: 13,
                                                fontWeight: 700,
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: 4 }}>
                                            COACHING TIP / PACING CUE
                                        </label>
                                        <input
                                            type="text"
                                            value={item.coachingTip}
                                            onChange={e => updateDraftItemField(item.id, 'coachingTip', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 10px',
                                                borderRadius: 8,
                                                background: '#0c0c0c',
                                                border: '1px solid var(--border)',
                                                color: 'white',
                                                fontSize: 12,
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleConfirmCardioItem(item)}
                                        style={{
                                            padding: '12px 14px',
                                            borderRadius: 8,
                                            background: labMode === 'dry_run' ? '#10b981' : 'var(--accent)',
                                            border: 'none',
                                            color: 'black',
                                            fontWeight: 800,
                                            fontSize: 12,
                                            fontFamily: 'var(--mono)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {labMode === 'dry_run'
                                            ? '➕ Add Warm-Up to Walk-Through Test Queue (Dry Run)'
                                            : '💾 Save to Warm-Up Modalities'}
                                    </button>

                                    {item.savedStatus && (
                                        <div style={{ fontSize: 11, color: '#34d399', fontFamily: 'var(--mono)', fontWeight: 700 }}>
                                            ✓ {item.savedStatus}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        // Strength Exercise Item
                        const generatedNames = buildVariationNames(item.baseName, item.variationOptions);
                        const selectedCount = generatedNames.filter(n => !item.excludedPreviewNames?.has(n)).length;

                        return (
                            <div
                                key={item.id}
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 10,
                                    padding: 14,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 12
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                    <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', fontWeight: 700 }}>
                                        MOVEMENT #{idx + 1} • 📍 {effectiveTargetLocation}
                                    </span>
                                    {renderLibraryMatchBadge(item.libraryMatch)}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: 4 }}>
                                            BASE EXERCISE NAME
                                        </label>
                                        <input
                                            type="text"
                                            value={item.baseName}
                                            onChange={e => updateDraftItemField(item.id, 'baseName', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 10px',
                                                borderRadius: 8,
                                                background: '#0c0c0c',
                                                border: '1px solid var(--border)',
                                                color: 'white',
                                                fontSize: 13,
                                                fontWeight: 700,
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: 4 }}>
                                            MOVEMENT CATEGORY
                                        </label>
                                        <select
                                            value={item.category}
                                            onChange={e => updateDraftItemField(item.id, 'category', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 10px',
                                                borderRadius: 8,
                                                background: '#0c0c0c',
                                                border: '1px solid var(--border)',
                                                color: 'white',
                                                fontSize: 13,
                                                boxSizing: 'border-box'
                                            }}
                                        >
                                            {allCategories.map(cat => (
                                                <option key={cat} value={cat}>
                                                    {cat}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: 4 }}>
                                        SETUP / PLACARD NOTE (OPTIONAL)
                                    </label>
                                    <input
                                        type="text"
                                        value={item.setupNote}
                                        onChange={e => updateDraftItemField(item.id, 'setupNote', e.target.value)}
                                        placeholder="Seat height, cam setting, handle notes..."
                                        style={{
                                            width: '100%',
                                            padding: '8px 10px',
                                            borderRadius: 8,
                                            background: '#0c0c0c',
                                            border: '1px solid var(--border)',
                                            color: 'white',
                                            fontSize: 12,
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                {/* Pre-checked VariationGeneratorPanel */}
                                <VariationGeneratorPanel
                                    title="AI-Detected Grips & Execution Variations"
                                    subtitle="Check or uncheck any box before adding"
                                    options={item.variationOptions}
                                    onToggleOption={(optKey, checked) => handleToggleVariationOption(item.id, optKey, checked)}
                                    generatedNames={generatedNames}
                                    excludedPreviewNames={item.excludedPreviewNames}
                                    onTogglePreviewName={varName => handleTogglePreviewName(item.id, varName)}
                                    existingExerciseNames={existingExerciseNames}
                                    showPreview={true}
                                    disabled={item.isSaving}
                                />

                                <button
                                    type="button"
                                    disabled={item.isSaving || selectedCount === 0}
                                    onClick={() => handleConfirmStrengthItem(item)}
                                    style={{
                                        padding: '12px 14px',
                                        borderRadius: 8,
                                        background: labMode === 'dry_run' ? '#10b981' : 'var(--accent)',
                                        border: 'none',
                                        color: 'black',
                                        fontWeight: 800,
                                        fontSize: 12,
                                        fontFamily: 'var(--mono)',
                                        cursor: item.isSaving || selectedCount === 0 ? 'not-allowed' : 'pointer',
                                        opacity: item.isSaving || selectedCount === 0 ? 0.6 : 1
                                    }}
                                >
                                    {item.isSaving
                                        ? 'Saving...'
                                        : labMode === 'dry_run'
                                            ? `➕ Add ${selectedCount} Variation(s) to Walk-Through Test Queue (Dry Run)`
                                            : `💾 Save ${selectedCount} Variation(s) to Live Library`}
                                </button>

                                {item.savedStatus && (
                                    <div style={{ fontSize: 11, color: '#34d399', fontFamily: 'var(--mono)', fontWeight: 700 }}>
                                        ✓ {item.savedStatus}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Section 5: Lab Walk-Through Queue Summary */}
            <div
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
                        5. Lab Walk-Through Session Queue ({walkThroughQueue.length})
                    </span>
                    {walkThroughQueue.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setWalkThroughQueue([])}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border)',
                                color: 'var(--muted)',
                                borderRadius: 6,
                                padding: '3px 8px',
                                fontSize: 10,
                                fontFamily: 'var(--mono)',
                                cursor: 'pointer'
                            }}
                        >
                            Clear Queue
                        </button>
                    )}
                </div>

                {walkThroughQueue.length === 0 ? (
                    <div style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
                        No machines queued yet in this session. Try one of the 1-Click Sample Scan buttons above!
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {walkThroughQueue.map(q => (
                            <div
                                key={q.id}
                                style={{
                                    padding: '8px 10px',
                                    borderRadius: 8,
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid var(--border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 8
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>
                                        {q.type === 'cardio' ? `🔥 ${q.warmUpName}` : `🦾 ${q.baseName}`}
                                    </div>
                                    <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 2 }}>
                                        {q.type === 'cardio'
                                            ? `Cardio Warm-Up • 📍 ${q.location}`
                                            : `${q.category} • 📍 ${q.location} • ${(q.variationNames || []).length} variation(s): ${(q.variationNames || []).join(', ')}`}
                                    </div>
                                </div>
                                <span
                                    style={{
                                        fontSize: 9,
                                        fontFamily: 'var(--mono)',
                                        fontWeight: 700,
                                        padding: '2px 6px',
                                        borderRadius: 4,
                                        background: q.mode === 'DRY-RUN' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(249, 115, 22, 0.2)',
                                        color: q.mode === 'DRY-RUN' ? '#34d399' : 'var(--accent)'
                                    }}
                                >
                                    {q.mode}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
