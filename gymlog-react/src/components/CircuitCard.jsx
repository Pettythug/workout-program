import React, { useState, useEffect, useMemo } from 'react';
import { useTargetLock } from '../hooks/useTargetLock';
import ImageModal from './ImageModal';

const formatLogDate = (dateStr) => {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const today = new Date();
        if (d.toDateString() === today.toDateString()) {
            return `Today, ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
        }
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString()) {
            return `Yesterday, ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
        }
        return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + `, ` + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch (e) {
        return dateStr;
    }
};

const PersonRow = ({ person, ex, input, updateInput, toast, setToast }) => {
    const key = person.toLowerCase();
    const { targetRanges } = useTargetLock(ex, key);

    const toggleNotePhrase = (phrase) => {
        if (toast) setToast("");
        let prev = input.note || "";
        if (prev.includes(phrase)) {
            updateInput(key, "note", prev.replace(phrase, "").replace(/,\s*,/g, ",").replace(/(^,)|(,$)/g, "").trim());
        } else {
            updateInput(key, "note", prev ? `${prev}, ${phrase}` : phrase);
        }
    };

    return (
        <div style={{ background: '#1a1a1a', padding: 8, borderRadius: 8, marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 'bold', color: 'var(--accent)' }}>{person.toUpperCase()}</span>
                <div style={{ display: 'flex', gap: 4, fontSize: 10 }}>
                    {targetRanges.map((tr, idx) => (
                        <React.Fragment key={tr.key}>
                            <span style={tr.isActive ? { color: '#ff8c00', fontWeight: 'bold' } : { color: 'var(--muted)' }}>
                                {tr.label} ({tr.bestValue})
                            </span>
                            {idx < targetRanges.length - 1 && <span style={{ color: 'var(--muted)' }}>@</span>}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-start' }}>
                {ex.timed ? (
                    <>
                        <input 
                            placeholder="secs" 
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={input.duration || ""} 
                            onChange={e => updateInput(key, "duration", e.target.value)}
                            style={{ background: '#0c0c0c', border: '1px solid var(--accent)', borderRadius: 8, padding: 8, width: 70, color: 'white', textAlign: 'center', fontSize: 16, fontFamily: 'var(--mono)', outline: 'none' }}
                        />
                        <input 
                            placeholder="lbs" 
                            type="text"
                            inputMode="decimal"
                            value={input.weight || ""} 
                            onChange={e => updateInput(key, "weight", e.target.value)}
                            style={{ background: '#0c0c0c', border: '1px solid var(--accent)', borderRadius: 8, padding: 8, width: 70, color: 'white', textAlign: 'center', fontSize: 16, fontFamily: 'var(--mono)', outline: 'none' }}
                        />
                    </>
                ) : (
                    <>
                        <input 
                            placeholder="reps" 
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={input.reps || ""} 
                            onChange={e => updateInput(key, "reps", e.target.value)}
                            style={{ background: '#0c0c0c', border: '1px solid var(--accent)', borderRadius: 8, padding: 8, width: 70, color: 'white', textAlign: 'center', fontSize: 16, fontFamily: 'var(--mono)', outline: 'none' }}
                        />
                        <input 
                            placeholder="lbs" 
                            type="text"
                            inputMode="decimal"
                            value={input.weight || ""} 
                            onChange={e => updateInput(key, "weight", e.target.value)}
                            style={{ background: '#0c0c0c', border: '1px solid var(--accent)', borderRadius: 8, padding: 8, width: 70, color: 'white', textAlign: 'center', fontSize: 16, fontFamily: 'var(--mono)', outline: 'none' }}
                        />
                    </>
                )}
            </div>
            <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                    <label style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--muted)' }}>
                        <input type="checkbox" checked={(input.note || "").includes("Singles")} onChange={() => toggleNotePhrase("Singles")} />
                        Singles
                    </label>
                    <label style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--muted)' }}>
                        <input type="checkbox" checked={(input.note || "").includes("Alternating")} onChange={() => toggleNotePhrase("Alternating")} />
                        Alternating
                    </label>
                </div>
                <input 
                    placeholder="Notes..." 
                    value={input.note || ""}
                    onChange={(e) => updateInput(key, "note", e.target.value)}
                    style={{ width: '100%', background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 8px', color: 'white', fontSize: 12 }}
                />
            </div>
        </div>
    );
};

export default function CircuitCard({ ex, index, completedStatus, activePeople, onLogSet, onExplicitDone, onSkip, onUndo, onDeleteSet, onDeleteHistoryEntry, isOpen, onToggle, onSwap, allExercises, onRemove }) {
    const status = typeof completedStatus === 'string' ? completedStatus : (completedStatus?.status || 'active');
    
    const sets = useMemo(() => {
        if (!ex.history) return [];
        const todaysEntries = ex.history.filter(h => h.date && new Date(h.date).toDateString() === new Date().toDateString());
        
        // Group by setNum
        const groups = {};
        todaysEntries.forEach(h => {
            const sNum = h.setNum || 1;
            if (!groups[sNum]) groups[sNum] = [];
            groups[sNum].push(h);
        });
        
        // Return sorted lists
        return Object.keys(groups)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(key => groups[key]);
    }, [ex.history]);

    const isDone = status === 'done';
    const isSkipped = status === 'skipped';

    const [activeTab, setActiveTab] = useState("LOG");

    // Swap State
    const [swapMode, setSwapMode] = useState(null);
    const [customSwapState, setCustomSwapState] = useState(null);
    const [showImage, setShowImage] = useState(false);
    const [toast, setToast] = useState("");

    const [inputs, setInputs] = useState(() => {
        const initial = {};
        activePeople.forEach(p => {
            initial[p.toLowerCase()] = { reps: "", weight: "", duration: "", note: "" };
        });
        return initial;
    });

    useEffect(() => {
        setInputs(prev => {
            const next = { ...prev };
            activePeople.forEach(p => {
                const key = p.toLowerCase();
                if (!next[key]) {
                    next[key] = { reps: "", weight: "", duration: "", note: "" };
                }
            });
            return next;
        });
    }, [activePeople]);

    const [isSaving, setIsSaving] = useState(false);

    const updateInput = (personKey, field, value) => {
        if (toast) setToast("");
        setInputs(prev => {
            let sanitizedValue = value;
            if (field === 'reps') {
                sanitizedValue = value.replace(/[^0-9]/g, '');
            } else if (field === 'weight') {
                sanitizedValue = value.replace(/[^0-9.]/g, '');
                const parts = sanitizedValue.split('.');
                if (parts.length > 2) {
                    sanitizedValue = parts[0] + '.' + parts.slice(1).join('');
                }
            }
            return {
                ...prev,
                [personKey]: { ...prev[personKey], [field]: sanitizedValue }
            };
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        const logData = {};
        activePeople.forEach(p => {
            const key = p.toLowerCase();
            logData[key] = { ...inputs[key] };
        });

        const success = await onLogSet(ex, logData);
        if (success) {
            const cleared = {};
            activePeople.forEach(p => {
                cleared[p.toLowerCase()] = { reps: "", weight: "", duration: "", note: "" };
            });
            setInputs(cleared);
            setToast("Set Saved!");
        }
        setIsSaving(false);
    };

    const baseName = ex.name.replace(" (Single)", "").replace(" (Alt)", "");
    const hasSingle = (allExercises || []).some(e => e.name === `${baseName} (Single)`);
    const hasAlt = (allExercises || []).some(e => e.name === `${baseName} (Alt)`);
    const currentMode = ex.name.includes("(Single)") ? "single" : ex.name.includes("(Alt)") ? "alt" : "std";

    const switchVariation = (targetMode) => {
        let targetName = baseName;
        if (targetMode === 'single') targetName = `${baseName} (Single)`;
        if (targetMode === 'alt') targetName = `${baseName} (Alt)`;
        const targetEx = (allExercises || []).find(e => e.name === targetName) || { ...ex, name: targetName };
        onSwap(index, targetEx);
    };

    const executeSwap = (swapPayload) => {
        const isCustom = typeof swapPayload === 'object';
        const stdName = isCustom ? swapPayload.name.trim() : swapPayload.trim();
        if (!stdName) return alert("Exercise name cannot be blank.");
        
        let targetEx = (allExercises || []).find(e => e.name.toLowerCase() === stdName.toLowerCase());
        let isNew = false;
        if (!targetEx) {
            isNew = true;
            targetEx = { 
                name: stdName, 
                category: isCustom ? swapPayload.category : (ex.category || "General"),
                muscle: isCustom ? swapPayload.muscle : (ex.muscleGroups || ex.muscle || ""),
                muscleGroups: isCustom ? swapPayload.muscle : (ex.muscleGroups || ex.muscle || ""),
                manufacturer: isCustom ? swapPayload.manufacturer : (ex.manufacturer || ""),
                baseExercise: isCustom ? swapPayload.baseExercise : (ex.baseExercise || ""),
                timed: false, history: [],
                isCircuit: true
            };
        }
        
        onSwap(index, targetEx, isNew);
        setSwapMode(null);
        setCustomSwapState(null);
    };

    const handleRemoveClick = async () => {
        if (window.confirm(`Are you sure you want to remove "${ex.name}" from the Circuit Generator permanently?`)) {
            try {
                await onRemove(ex.name);
            } catch (err) {
                alert("Failed to remove exercise from circuit: " + err.message);
            }
        }
    };

    // Calculate generic selections for custom swap
    const allCategories = [...new Set((allExercises || []).map(e => e.category).filter(Boolean))].sort();
    const allManufacturers = [...new Set((allExercises || []).map(e => e.manufacturer).filter(Boolean))].sort();
    const allMuscles = [...new Set((allExercises || []).map(e => e.muscle).filter(Boolean))].sort();

    const getImageUrl = (fileRef) => {
        if (!fileRef) return `${import.meta.env.BASE_URL}images/placeholder.jpg`;
        if (!fileRef.includes('.') && fileRef.length > 10) {
            return `https://docs.google.com/uc?export=view&id=${fileRef}`;
        }
        return `${import.meta.env.BASE_URL}images/${fileRef}`;
    };
    const imgSrc = getImageUrl(ex.fileReference);

    return (
        <div style={{ 
            background: '#111', 
            border: `1px solid ${isDone ? 'var(--success)' : isSkipped ? 'var(--skip)' : isOpen ? 'var(--accent)' : 'var(--border)'}`, 
            borderRadius: 12, 
            opacity: isSkipped ? 0.5 : 1,
            boxShadow: isDone ? '0 4px 20px rgba(34, 197, 94, 0.12)' : 'none',
            overflow: 'hidden'
        }}>
            <div 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, cursor: 'pointer', background: isOpen ? '#1a1a1a' : 'transparent' }}
                onClick={onToggle}
            >
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
                            {index + 1}. {ex.category || 'Uncategorized'}
                        </div>
                        {(hasSingle || hasAlt) && (
                            <div style={{ display: "flex", gap: 4 }}>
                                <button onClick={(e) => { e.stopPropagation(); switchVariation('std'); }} className="btn-ghost btn-no-translate" style={{ padding: '2px 6px', fontSize: 10, border: `1px solid ${currentMode==='std' ? 'var(--accent)' : 'transparent'}`, color: currentMode==='std' ? 'white' : 'var(--muted)' }}>STD</button>
                                {hasSingle && <button onClick={(e) => { e.stopPropagation(); switchVariation('single'); }} className="btn-ghost btn-no-translate" style={{ padding: '2px 6px', fontSize: 10, border: `1px solid ${currentMode==='single' ? 'var(--accent)' : 'transparent'}`, color: currentMode==='single' ? 'white' : 'var(--muted)' }}>SINGLES</button>}
                                {hasAlt && <button onClick={(e) => { e.stopPropagation(); switchVariation('alt'); }} className="btn-ghost btn-no-translate" style={{ padding: '2px 6px', fontSize: 10, border: `1px solid ${currentMode==='alt' ? 'var(--accent)' : 'transparent'}`, color: currentMode==='alt' ? 'white' : 'var(--muted)' }}>ALT</button>}
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>{ex.name}</div>
                        {isDone && (
                            <span style={{ 
                                background: 'rgba(34, 197, 94, 0.15)', 
                                color: 'var(--success)', 
                                fontSize: 9, 
                                fontWeight: 800, 
                                padding: '2px 6px', 
                                borderRadius: 4, 
                                letterSpacing: 0.5 
                            }}>COMPLETED</span>
                        )}
                        {isSkipped && (
                            <span style={{ 
                                background: 'rgba(239, 68, 68, 0.15)', 
                                color: 'var(--skip)', 
                                fontSize: 9, 
                                fontWeight: 800, 
                                padding: '2px 6px', 
                                borderRadius: 4, 
                                letterSpacing: 0.5 
                            }}>SKIPPED</span>
                        )}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://www.google.com/search?q=${encodeURIComponent(ex.name + ' exercise tutorial')}`, '_blank');
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent)',
                                cursor: 'pointer',
                                fontSize: 14,
                                padding: '2px 6px',
                                borderRadius: 4,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0.7,
                                transition: 'opacity 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                            onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
                            title="Search exercise info"
                        >
                            ℹ️
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid #222' }}>
                    {(isDone || isSkipped) ? (
                        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a', padding: 12, borderRadius: 8 }}>
                            <div style={{ fontWeight: 'bold', color: isDone ? 'var(--success)' : 'var(--skip)' }}>
                                {isDone ? 'COMPLETED' : 'SKIPPED'}
                            </div>
                            <button className="btn-ghost" onClick={() => onUndo(ex.name)}>UNDO</button>
                        </div>
                    ) : (
                <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                        <button 
                            className={activeTab === "LOG" ? "btn-success" : "btn-ghost"} 
                            onClick={() => setActiveTab("LOG")} 
                            style={{ flex: 1, padding: '8px' }}
                        >
                            LOG SET
                        </button>
                        <button 
                            className={activeTab === "HISTORY" ? "btn-secondary" : "btn-ghost"} 
                            onClick={() => setActiveTab("HISTORY")} 
                            style={{ flex: 1, padding: '8px' }}
                        >
                            HISTORY
                        </button>
                    </div>

                    {activeTab === "LOG" && (
                        <div>
                            {activePeople.map(p => (
                                <PersonRow key={p} person={p} ex={ex} input={inputs[p.toLowerCase()] || {}} updateInput={updateInput} toast={toast} setToast={setToast} />
                            ))}

                            <button className="btn-success" style={{ width: '100%', padding: 12, fontWeight: 'bold', marginTop: 12, marginBottom: 12 }} onClick={handleSave} disabled={isSaving}>
                                {isSaving ? "SAVING..." : `LOG SET ${sets.length + 1}`}
                            </button>

                            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                <button className="btn-secondary" style={{ flex: 1, padding: '10px', fontSize: 12, fontWeight: 'bold' }} onClick={() => onExplicitDone(ex.name)}>DONE</button>
                                <button className="btn-danger" style={{ flex: 1, padding: '10px', fontSize: 12, fontWeight: 'bold' }} onClick={() => onSkip(ex.name)}>SKIP</button>
                            </div>

                            {/* Swap UI */}
                            <div style={{ marginTop: 16, borderTop: "1px solid #222", paddingTop: 16 }}>
                                {swapMode === ex.name ? (
                                    <div style={{ background: "#0e0e0e", padding: 12, borderRadius: 8, border: "1px solid var(--border)" }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase" }}>Swap Exercise</div>
                                        <select 
                                            onChange={(e) => {
                                                if (e.target.value === "custom") {
                                                    setCustomSwapState({
                                                        name: "",
                                                        category: ex.category || "General",
                                                        manufacturer: "",
                                                        baseExercise: "",
                                                        muscle: ""
                                                    });
                                                } else if (e.target.value) {
                                                    executeSwap(e.target.value);
                                                }
                                            }}
                                            style={{ width: "100%", background: "#000", border: "1px solid var(--border)", color: "var(--text)", padding: 8, borderRadius: 4, marginBottom: 8 }}
                                        >
                                            <option value="">-- Select Exercise --</option>
                                            <option value="custom">-- New Custom Exercise --</option>
                                            {(allExercises || []).filter(e => e.category === ex.category && e.isCircuit === true).map(e => <option key={e.name} value={e.name}>{e.name}</option>)}
                                        </select>

                                        {customSwapState && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, padding: 8, border: "1px solid #333", borderRadius: 4 }}>
                                                <div style={{ fontSize: 10, color: "var(--muted)" }}>Custom Exercise Details</div>
                                                <input placeholder="Exercise Name" value={customSwapState.name} onChange={e => setCustomSwapState({...customSwapState, name: e.target.value})} style={{ background: "#000", border: "1px solid var(--border)", color: "white", padding: 8, borderRadius: 4, fontSize: 14 }} />
                                                
                                                <select
                                                    value={customSwapState.category}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        if (val === "ADD_NEW") {
                                                            const newCat = window.prompt("Enter new category name:");
                                                            if (newCat) {
                                                                setCustomSwapState({ ...customSwapState, category: newCat });
                                                            } else {
                                                                setCustomSwapState({ ...customSwapState, category: val });
                                                            }
                                                        } else {
                                                            setCustomSwapState({ ...customSwapState, category: val });
                                                        }
                                                    }}
                                                    style={{ background: "#000", border: "1px solid var(--border)", color: "var(--text)", padding: 8, borderRadius: 4, fontSize: 12 }}
                                                >
                                                    <option value="">Select Category...</option>
                                                    {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                                    {customSwapState.category && !allCategories.includes(customSwapState.category) && customSwapState.category !== "ADD_NEW" && (
                                                        <option value={customSwapState.category}>{customSwapState.category}</option>
                                                    )}
                                                    <option value="ADD_NEW">+ Add new...</option>
                                                </select>

                                                <input list="manufacturer-list" placeholder="Manufacturer" value={customSwapState.manufacturer} onChange={e => setCustomSwapState({...customSwapState, manufacturer: e.target.value})} style={{ background: "#000", border: "1px solid var(--border)", color: "var(--text)", padding: 8, borderRadius: 4, fontSize: 12 }} />
                                                <datalist id="manufacturer-list">{allManufacturers.map(m => <option key={m} value={m} />)}</datalist>

                                                <input list="muscle-list" placeholder="Muscles" value={customSwapState.muscle} onChange={e => setCustomSwapState({...customSwapState, muscle: e.target.value})} style={{ background: "#000", border: "1px solid var(--border)", color: "var(--text)", padding: 8, borderRadius: 4, fontSize: 12 }} />
                                                <datalist id="muscle-list">{allMuscles.map(m => <option key={m} value={m} />)}</datalist>

                                                <button 
                                                    onClick={() => executeSwap(customSwapState)}
                                                    className="btn-success"
                                                    style={{ padding: "12px", marginTop: 4 }}
                                                >SAVE & SWAP</button>
                                            </div>
                                        )}
                                        <button onClick={() => { setSwapMode(null); setCustomSwapState(null); }} className="btn-ghost" style={{ width: "100%", padding: 12, marginTop: 8, fontSize: 14, color: 'var(--skip)', borderColor: 'var(--skip)' }}>CANCEL SWAP</button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        <button 
                                            onClick={() => setSwapMode(ex.name)}
                                            className="btn-ghost btn-no-translate"
                                            style={{ flex: 1, minWidth: '75px', padding: '10px 4px', fontSize: 11 }}
                                        >
                                            🔄 SWAP
                                        </button>
                                        <button 
                                            onClick={() => setShowImage(true)}
                                            className="btn-ghost btn-no-translate"
                                            style={{ flex: 1, minWidth: '75px', padding: '10px 4px', fontSize: 11 }}
                                        >
                                            📸 IMAGE
                                        </button>
                                        <button 
                                            onClick={handleRemoveClick}
                                            className="btn-ghost btn-no-translate"
                                            style={{ flex: 1, minWidth: '75px', padding: '10px 4px', fontSize: 11, color: 'var(--skip)', borderColor: 'var(--skip)' }}
                                        >
                                            ❌ REMOVE
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "HISTORY" && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ background: '#0c0c0c', borderRadius: 8, padding: 12, border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>LOGGED SETS</div>
                                {sets.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 11 }}>No logged sets in this session</div>
                                ) : (
                                    sets.map((setEntries, sIdx) => {
                                        const timeStr = setEntries[0]?.date ? new Date(setEntries[0].date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
                                        const summary = setEntries.map(e => {
                                            const formatted = ex.timed ? `${e.reps}s ${e.weight ? `@ ${e.weight}lbs` : ''}` : `${e.reps}x${e.weight || 0}`;
                                            return `${e.person[0].toUpperCase()}:${formatted}`;
                                        }).join('   ');
                                        return (
                                            <div key={sIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                                                    <span style={{ color: 'var(--accent)' }}>L{sIdx + 1}</span>
                                                    {timeStr && <span style={{ color: 'var(--muted)', fontSize: 9, marginLeft: 4 }}>({timeStr})</span>}
                                                    <span style={{ color: 'var(--muted)' }}>:</span> <span style={{ color: 'white' }}> {summary}</span>
                                                </div>
                                                <button 
                                                    onClick={() => onDeleteSet(ex.name, setEntries)}
                                                    style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}
                                                    title="Delete Set"
                                                >
                                                    🗑
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div style={{ background: '#0c0c0c', borderRadius: 8, padding: 12, border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase' }}>RECENT HISTORY</div>
                                {(!ex.history || ex.history.filter(h => activePeople.some(p => p.toLowerCase() === h.person.toLowerCase())).length === 0) ? (
                                    <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 11 }}>No entries yet</div>
                                ) : (
                                    ex.history.filter(h => activePeople.some(p => p.toLowerCase() === h.person.toLowerCase())).slice(0, 5).map((h, i) => (
                                        <div key={i} style={{ paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontSize: 9, color: 'var(--muted)' }}>{formatLogDate(h.date)}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>{h.person.toUpperCase()}</div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ fontSize: 12, fontWeight: 700, textAlign: 'right' }}>
                                                        {ex.timed ? `${h.reps}s ${h.weight ? `@ ${h.weight}lbs` : ''}` : `${h.reps}x${h.weight || 0}`}
                                                    </div>
                                                    <button 
                                                        onClick={() => onDeleteHistoryEntry({ ...h, exercise: ex.name })}
                                                        style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}
                                                        title="Delete History Entry"
                                                    >
                                                        🗑
                                                    </button>
                                                </div>
                                            </div>
                                            {h.note && (
                                                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, fontStyle: 'italic' }}>
                                                    "{h.note}"
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
                </div>
            )}
            {showImage && (
                <ImageModal 
                    ex={ex} 
                    baseName={baseName} 
                    isOpen={showImage} 
                    onClose={() => setShowImage(false)} 
                    setToast={setToast} 
                />
            )}
            {toast && <div style={{ color: 'var(--success)', fontSize: 12, textAlign: 'center', marginTop: 12 }}>{toast}</div>}
        </div>
    );
}
