/* eslint-disable */
import { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';

const DEFAULT_MODALITIES = [
    { name: '500m Row', tip: 'Focus on powerful leg drive (60%), hip swing (20%), and arm pull (20%). Aim for smooth, steady rhythm.' },
    { name: '25 Cal Assault Bike', tip: 'Build cadence over the first 10 calories, then sustain moderate power output to flush legs and lungs.' },
    { name: 'Treadmill Incline Walk', tip: 'Incline 8–12%, speed 2.8–3.5 mph. Maintain tall posture without holding handrails.' },
    { name: '500m SkiErg', tip: 'Hinge hips with deep core engagement and pull downward through lats and triceps.' },
    { name: '5 min Jump Rope', tip: 'Light on the balls of your feet, elbows tight to ribs, prime ankle stiffness and calf elasticity.' },
    { name: 'Dynamic Stretches', tip: "World's greatest stretch, leg swings, arm circles, thoracic rotations, and deep bodyweight squats." }
];

export default function WarmUpCard({ onAdvance }) {
    const { 
        warmUpStatus, 
        selectedWarmUp, 
        setSelectedWarmUp, 
        completeWarmUp, 
        skipWarmUp, 
        resetWarmUp 
    } = useAppContext();

    const [customList, setCustomList] = useState(() => {
        try {
            const cached = localStorage.getItem('gymlog_custom_warmups');
            return cached ? JSON.parse(cached) : [];
        } catch (e) {
            return [];
        }
    });

    const [isAddingCustom, setIsAddingCustom] = useState(false);
    const [customInput, setCustomInput] = useState('');

    useEffect(() => {
        try {
            localStorage.setItem('gymlog_custom_warmups', JSON.stringify(customList));
        } catch (e) {
            console.error('Error saving custom warmups:', e);
        }
    }, [customList]);

    const activeTip = useMemo(() => {
        const matched = DEFAULT_MODALITIES.find(m => m.name.toLowerCase() === (selectedWarmUp || '').toLowerCase());
        if (matched) return matched.tip;
        return 'Elevate core body temperature, mobilize joints, and activate stabilizing muscles.';
    }, [selectedWarmUp]);

    const handleSelectChange = (e) => {
        const val = e.target.value;
        if (val === '__add_custom__') {
            setIsAddingCustom(true);
            return;
        }
        if (setSelectedWarmUp) {
            setSelectedWarmUp(val);
        }
        localStorage.setItem('gymlog_last_warmup', val);
    };

    const handleAddCustom = (e) => {
        e.preventDefault();
        const trimmed = customInput.trim();
        if (!trimmed) return;

        if (!customList.includes(trimmed) && !DEFAULT_MODALITIES.some(m => m.name.toLowerCase() === trimmed.toLowerCase())) {
            setCustomList(prev => [...prev, trimmed]);
        }

        if (setSelectedWarmUp) {
            setSelectedWarmUp(trimmed);
        }
        localStorage.setItem('gymlog_last_warmup', trimmed);
        setCustomInput('');
        setIsAddingCustom(false);
    };

    const handleRemoveCustom = (nameToRemove, e) => {
        e.stopPropagation();
        setCustomList(prev => prev.filter(c => c !== nameToRemove));
        if (selectedWarmUp === nameToRemove) {
            const fallback = DEFAULT_MODALITIES[0].name;
            if (setSelectedWarmUp) {
                setSelectedWarmUp(fallback);
            }
            localStorage.setItem('gymlog_last_warmup', fallback);
        }
    };

    const handleDone = () => {
        completeWarmUp(selectedWarmUp);
        if (onAdvance) {
            onAdvance();
        }
    };

    const handleSkip = () => {
        skipWarmUp();
        if (onAdvance) {
            onAdvance();
        }
    };

    return (
        <div style={{
            background: 'var(--surface-card, #111)',
            border: '1px solid var(--accent)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            boxShadow: '0 4px 20px rgba(249, 115, 22, 0.08)'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ 
                    fontSize: 10, 
                    color: 'var(--accent)', 
                    fontFamily: 'var(--mono)', 
                    textTransform: 'uppercase', 
                    letterSpacing: 1, 
                    fontWeight: 700 
                }}>
                    🔥 PRE-WORKOUT WARM-UP
                </div>
                <span style={{
                    border: '1px solid var(--accent)',
                    color: 'var(--accent)',
                    fontSize: 9,
                    fontFamily: 'var(--mono)',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontWeight: 700,
                    letterSpacing: 0.5
                }}>
                    [RECOMMENDED]
                </span>
            </div>

            {/* Subtitle */}
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.4 }}>
                Prime nervous system &amp; elevate heart rate before loading.
            </div>

            {/* Modality Selector */}
            <div style={{ marginBottom: 12 }}>
                <div style={{ 
                    fontSize: 10, 
                    color: 'var(--muted)', 
                    fontFamily: 'var(--mono)', 
                    textTransform: 'uppercase', 
                    letterSpacing: 1, 
                    marginBottom: 6,
                    fontWeight: 600
                }}>
                    MODALITY SELECTION
                </div>
                <div style={{ position: 'relative' }}>
                    <select
                        value={selectedWarmUp || DEFAULT_MODALITIES[0].name}
                        onChange={handleSelectChange}
                        style={{
                            width: '100%',
                            background: '#0c0c0c',
                            border: '1px solid var(--border)',
                            color: 'var(--text, #fff)',
                            borderRadius: 8,
                            padding: '10px 12px',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            appearance: 'none',
                            WebkitAppearance: 'none'
                        }}
                    >
                        <optgroup label="Standard Presets">
                            {DEFAULT_MODALITIES.map(m => (
                                <option key={m.name} value={m.name}>{m.name}</option>
                            ))}
                        </optgroup>
                        {customList.length > 0 && (
                            <optgroup label="Custom Options">
                                {customList.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </optgroup>
                        )}
                        <option value="__add_custom__">+ Add Custom Modality...</option>
                    </select>
                    <div style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        color: 'var(--muted)',
                        fontSize: 10
                    }}>
                        ▼
                    </div>
                </div>
            </div>

            {/* Inline Custom Modality Input */}
            {isAddingCustom && (
                <form 
                    onSubmit={handleAddCustom}
                    style={{
                        display: 'flex',
                        gap: 8,
                        background: '#0d0d0d',
                        border: '1px solid var(--border)',
                        padding: 10,
                        borderRadius: 8,
                        marginBottom: 12,
                        flexWrap: 'wrap'
                    }}
                >
                    <input
                        type="text"
                        placeholder="e.g. 10 Min Stairmaster"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        autoFocus
                        style={{
                            flex: '1 1 180px',
                            background: '#000',
                            border: '1px solid var(--border)',
                            color: '#fff',
                            borderRadius: 6,
                            padding: '8px 10px',
                            fontSize: 12
                        }}
                    />
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button
                            type="submit"
                            className="btn-success"
                            style={{ padding: '6px 12px', fontSize: 11 }}
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            className="btn-ghost"
                            onClick={() => { setIsAddingCustom(false); setCustomInput(''); }}
                            style={{ padding: '6px 12px', fontSize: 11 }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Custom modality tags */}
            {customList.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>Saved:</span>
                    {customList.map(item => (
                        <span 
                            key={item}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                background: item === selectedWarmUp ? 'rgba(249, 115, 22, 0.15)' : '#161616',
                                color: item === selectedWarmUp ? 'var(--accent)' : 'var(--text)',
                                border: `1px solid ${item === selectedWarmUp ? 'var(--accent)' : 'var(--border)'}`,
                                borderRadius: 12,
                                padding: '2px 8px',
                                fontSize: 11,
                                cursor: 'pointer'
                            }}
                            onClick={() => {
                                if (setSelectedWarmUp) setSelectedWarmUp(item);
                                localStorage.setItem('gymlog_last_warmup', item);
                            }}
                        >
                            {item}
                            <button
                                type="button"
                                onClick={(e) => handleRemoveCustom(item, e)}
                                title={`Delete ${item}`}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--muted)',
                                    cursor: 'pointer',
                                    fontSize: 12,
                                    padding: '0 2px'
                                }}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Coaching Tip Box */}
            <div style={{
                background: '#0d0d0d',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 12,
                color: 'var(--text, #fff)',
                lineHeight: 1.4,
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                marginBottom: 16
            }}>
                <span style={{ fontSize: 13 }}>💡</span>
                <span style={{ color: '#bbb' }}>{activeTip}</span>
            </div>

            {/* Current Status Banner (when viewing completed/skipped card) */}
            {warmUpStatus !== 'pending' && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: warmUpStatus === 'completed' ? 'rgba(34, 197, 94, 0.09)' : 'rgba(239, 68, 68, 0.09)',
                    border: `1px solid ${warmUpStatus === 'completed' ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                    borderRadius: 8,
                    marginBottom: 14,
                    fontSize: 12
                }}>
                    <span style={{ color: warmUpStatus === 'completed' ? 'var(--success)' : '#ef4444', fontWeight: 600 }}>
                        {warmUpStatus === 'completed' 
                            ? `✓ Marked as Completed: ${selectedWarmUp}` 
                            : `⏭️ Marked as Skipped`}
                    </span>
                    <button
                        type="button"
                        className="btn-ghost"
                        onClick={resetWarmUp}
                        style={{ padding: '4px 8px', fontSize: 10, border: '1px solid var(--border)', color: 'var(--muted)' }}
                    >
                        RESET
                    </button>
                </div>
            )}

            {/* Action Buttons: Left: Orange DONE, Right: Red SKIP */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button
                    type="button"
                    className="btn-accent"
                    onClick={handleDone}
                    style={{
                        background: 'var(--accent)',
                        color: '#000',
                        fontWeight: 'bold',
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 13,
                        letterSpacing: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                    }}
                >
                    DONE
                </button>
                <button
                    type="button"
                    className="btn-danger"
                    onClick={handleSkip}
                    style={{
                        background: '#ef4444',
                        color: '#fff',
                        fontWeight: 'bold',
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 13,
                        letterSpacing: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                    }}
                >
                    SKIP
                </button>
            </div>

            {/* Return to Exercise Stepper if manually viewed */}
            {warmUpStatus !== 'pending' && onAdvance && (
                <button
                    type="button"
                    className="btn-ghost"
                    onClick={onAdvance}
                    style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: 11,
                        border: '1px solid var(--border)',
                        color: 'var(--muted)',
                        marginTop: 10,
                        cursor: 'pointer'
                    }}
                >
                    &larr; Return to Exercise Stepper
                </button>
            )}
        </div>
    );
}
