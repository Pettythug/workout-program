import React, { useState } from 'react';
import { useTargetLock } from '../hooks/useTargetLock';

const PersonRow = ({ person, ex, input, updateInput }) => {
    const key = person.toLowerCase();
    const { targetRanges } = useTargetLock(ex, key);

    const toggleNotePhrase = (phrase) => {
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
                    <input 
                        placeholder="mm:ss" 
                        value={input.duration || ""} 
                        onChange={e => updateInput(key, "duration", e.target.value)}
                        style={{ background: '#0c0c0c', border: '1px solid var(--accent)', borderRadius: 8, padding: 8, width: 80, color: 'white', textAlign: 'center', fontSize: 16, fontFamily: 'var(--mono)', outline: 'none' }}
                    />
                ) : (
                    <>
                        <input 
                            placeholder="reps" 
                            type="number"
                            value={input.reps || ""} 
                            onChange={e => updateInput(key, "reps", e.target.value)}
                            style={{ background: '#0c0c0c', border: '1px solid var(--accent)', borderRadius: 8, padding: 8, width: 70, color: 'white', textAlign: 'center', fontSize: 16, fontFamily: 'var(--mono)', outline: 'none' }}
                        />
                        <input 
                            placeholder="lbs" 
                            type="number"
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
                        <input type="checkbox" checked={(input.note || "").includes("Single Leg")} onChange={() => toggleNotePhrase("Single Leg")} />
                        Single Leg
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

export default function CircuitCard({ ex, index, completedStatus, activePeople, onLogSet, onExplicitDone, onSkip, onUndo, onDeleteSet, onDeleteHistoryEntry, isOpen, onToggle, onSwap, allExercises }) {
    const status = typeof completedStatus === 'string' ? completedStatus : (completedStatus?.status || 'active');
    const sets = typeof completedStatus === 'object' ? (completedStatus?.sets || []) : [];

    const isDone = status === 'done';
    const isSkipped = status === 'skipped';

    const [activeTab, setActiveTab] = useState("LOG");

    // Swap State
    const [swapMode, setSwapMode] = useState(null);
    const [customSwapState, setCustomSwapState] = useState(null);
    const [showImage, setShowImage] = useState(false);

    const [inputs, setInputs] = useState(() => {
        const initial = {};
        activePeople.forEach(p => {
            initial[p.toLowerCase()] = { reps: "", weight: "", duration: "", note: "" };
        });
        return initial;
    });

    const [isSaving, setIsSaving] = useState(false);

    const updateInput = (personKey, field, value) => {
        setInputs(prev => ({
            ...prev,
            [personKey]: { ...prev[personKey], [field]: value }
        }));
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

    // Calculate generic selections for custom swap
    const allCategories = [...new Set((allExercises || []).map(e => e.category).filter(Boolean))].sort();
    const allManufacturers = [...new Set((allExercises || []).map(e => e.manufacturer).filter(Boolean))].sort();
    const allMuscles = [...new Set((allExercises || []).map(e => e.muscle).filter(Boolean))].sort();

    const imgSrc = ex.fileReference 
        ? `${import.meta.env.BASE_URL}images/${ex.fileReference}` 
        : `${import.meta.env.BASE_URL}images/placeholder.jpg`;

    return (
        <div style={{ 
            background: '#111', 
            border: `1px solid ${isDone ? 'var(--success)' : isSkipped ? 'var(--skip)' : isOpen ? 'var(--accent)' : 'var(--border)'}`, 
            borderRadius: 12, 
            opacity: isDone || isSkipped ? 0.6 : 1,
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
                                <button onClick={(e) => { e.stopPropagation(); switchVariation('std'); }} className="btn-ghost" style={{ padding: '2px 6px', fontSize: 10, border: `1px solid ${currentMode==='std' ? 'var(--accent)' : 'transparent'}`, color: currentMode==='std' ? 'white' : 'var(--muted)' }}>STD</button>
                                {hasSingle && <button onClick={(e) => { e.stopPropagation(); switchVariation('single'); }} className="btn-ghost" style={{ padding: '2px 6px', fontSize: 10, border: `1px solid ${currentMode==='single' ? 'var(--accent)' : 'transparent'}`, color: currentMode==='single' ? 'white' : 'var(--muted)' }}>SINGLE</button>}
                                {hasAlt && <button onClick={(e) => { e.stopPropagation(); switchVariation('alt'); }} className="btn-ghost" style={{ padding: '2px 6px', fontSize: 10, border: `1px solid ${currentMode==='alt' ? 'var(--accent)' : 'transparent'}`, color: currentMode==='alt' ? 'white' : 'var(--muted)' }}>ALT</button>}
                            </div>
                        )}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>{ex.name}</div>
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
                                <PersonRow key={p} person={p} ex={ex} input={inputs[p.toLowerCase()] || {}} updateInput={updateInput} />
                            ))}

                            <button className="btn-success" style={{ width: '100%', padding: 12, fontWeight: 'bold', marginTop: 12, marginBottom: 12 }} onClick={handleSave} disabled={isSaving}>
                                {isSaving ? "SAVING..." : `LOG SET ${sets.length + 1}`}
                            </button>

                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn-secondary" style={{ flex: 1, padding: 8 }} onClick={() => onExplicitDone(ex.name)}>DONE</button>
                                <button className="btn-danger" style={{ flex: 1, padding: 8 }} onClick={() => onSkip(ex.name)}>SKIP</button>
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
                                                
                                                <input list="category-list" placeholder="Category" value={customSwapState.category} onChange={e => setCustomSwapState({...customSwapState, category: e.target.value})} style={{ background: "#000", border: "1px solid var(--border)", color: "var(--text)", padding: 8, borderRadius: 4, fontSize: 12 }} />
                                                <datalist id="category-list">{allCategories.map(c => <option key={c} value={c} />)}</datalist>

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
                                            className="btn-ghost"
                                            style={{ flex: 1, minWidth: '75px', padding: '10px 4px', fontSize: 11 }}
                                        >
                                            🔄 SWAP
                                        </button>
                                        <button 
                                            onClick={() => setShowImage(true)}
                                            className="btn-ghost"
                                            style={{ flex: 1, minWidth: '75px', padding: '10px 4px', fontSize: 11 }}
                                        >
                                            📸 IMAGE
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
                                        const summary = setEntries.map(e => `${e.person[0].toUpperCase()}:${ex.timed ? e.reps : e.reps + '@' + (e.weight || 0)}`).join('   ');
                                        return (
                                            <div key={sIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                                                    <span style={{ color: 'var(--accent)' }}>L{sIdx + 1}:</span> <span style={{ color: 'white' }}>{summary}</span>
                                                </div>
                                                <button 
                                                    onClick={() => onDeleteSet(ex.name, sIdx)}
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
                                                    <div style={{ fontSize: 9, color: 'var(--muted)' }}>{h.date}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>{h.person.toUpperCase()}</div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ fontSize: 12, fontWeight: 700, textAlign: 'right' }}>
                                                        {ex.timed ? `${h.reps} ${h.weight ? `@ ${h.weight}lbs` : ''}` : `${h.reps}x${h.weight || 0}`}
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
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }} onClick={() => setShowImage(false)}>
                    <div style={{ background: '#111', padding: 16, borderRadius: 12, position: 'relative', maxWidth: '100%', maxHeight: '100%', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div style={{ fontSize: 16, fontWeight: 700 }}>{baseName}</div>
                            <button className="btn-ghost" onClick={() => setShowImage(false)} style={{ fontSize: 20, padding: 0, lineHeight: 1 }}>×</button>
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
                            {ex.fileReference ? (
                                <img 
                                    src={imgSrc} 
                                    alt={baseName} 
                                    style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8 }}
                                    onError={(e) => { 
                                        if (!e.target.dataset.retried) {
                                            e.target.dataset.retried = true;
                                            const safeName = (ex.name || "").replace(/\s*\/\s*/g, " ");
                                            e.target.src = `${import.meta.env.BASE_URL}images/${safeName}.jpg`;
                                        } else {
                                            e.target.style.display = 'none'; 
                                            e.target.insertAdjacentHTML('afterend', '<div style=\"color: var(--muted); padding: 32px; text-align: center; border: 1px dashed var(--border); border-radius: 8px;\">Image not found for this exercise.</div>'); 
                                        }
                                    }}
                                />
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
