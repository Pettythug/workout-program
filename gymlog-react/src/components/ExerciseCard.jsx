import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useGymAPI } from '../hooks/useGymAPI';
import { useTargetLock } from '../hooks/useTargetLock';

const PersonLogSection = ({ person, ex, input, updateLogInput }) => {
    const key = person.toLowerCase();
    const { targetRanges } = useTargetLock(ex, key);

    const toggleNotePhrase = (phrase) => {
        let prev = input.note || "";
        if (prev.includes(phrase)) {
            updateLogInput(key, "note", prev.replace(phrase, "").replace(/,\s*,/g, ",").replace(/(^,)|(,$)/g, "").trim());
        } else {
            updateLogInput(key, "note", prev ? `${prev}, ${phrase}` : phrase);
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
                        onChange={e => updateLogInput(key, "duration", e.target.value)}
                        style={{ background: '#0c0c0c', border: '1px solid var(--accent)', borderRadius: 8, padding: 8, width: 80, color: 'white', textAlign: 'center', fontSize: 16, fontFamily: 'var(--mono)', outline: 'none' }}
                    />
                ) : (
                    <>
                        <input 
                            placeholder="reps" 
                            type="number"
                            value={input.reps || ""} 
                            onChange={e => updateLogInput(key, "reps", e.target.value)}
                            style={{ background: '#0c0c0c', border: '1px solid var(--accent)', borderRadius: 8, padding: 8, width: 70, color: 'white', textAlign: 'center', fontSize: 16, fontFamily: 'var(--mono)', outline: 'none' }}
                        />
                        <input 
                            placeholder="lbs" 
                            type="number"
                            value={input.weight || ""} 
                            onChange={e => updateLogInput(key, "weight", e.target.value)}
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
                    onChange={(e) => updateLogInput(key, "note", e.target.value)}
                    style={{ width: '100%', background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 8px', color: 'white', fontSize: 12 }}
                />
            </div>
        </div>
    );
};

export default function ExerciseCard({ group }) {
    const { people, activePeople, exerciseStatus, setExerciseDone, setExerciseSkipped, resetExerciseStatus, addSetToLocalHistory, deleteSetFromLocalHistory, workoutDay, swapExercise, exercises, locations } = useAppContext();
    const { logSet, deleteHistory, saveExercise } = useGymAPI();
    
    const [mode, setMode] = useState("Standard"); // "Standard", "Single", "Alt"
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("LOG"); // "LOG", "HISTORY"
    const [logInputs, setLogInputs] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState("");
    
    // Swap State
    const [swapMode, setSwapMode] = useState(null);
    const [customSwapState, setCustomSwapState] = useState(null);

    const [editMode, setEditMode] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [showImage, setShowImage] = useState(false);

    const uniqueCategories = useMemo(() => {
        return [...new Set((exercises || []).map(e => e.category).filter(Boolean))].sort();
    }, [exercises]);

    // Fallback to "Standard" if not provided
    const variations = group.variations || {};
    const ex = variations[mode] || variations["Standard"] || Object.values(variations)[0];
    if (!ex) return null;

    const hasVariations = Object.keys(variations).length > 1;
    const isDone = exerciseStatus[ex.name] === 'done';
    const isSkipped = exerciseStatus[ex.name] === 'skipped';

    const imgSrc = ex.fileReference 
        ? `${import.meta.env.BASE_URL}images/${ex.fileReference}` 
        : `${import.meta.env.BASE_URL}images/placeholder.jpg`;

    // Initialize log inputs if empty
    const initLogInputs = () => {
        if (Object.keys(logInputs).length === 0) {
            const initial = {};
            people.forEach(p => {
                initial[p.toLowerCase()] = { reps: "", weight: "", duration: "", note: "" };
            });
            setLogInputs(initial);
        }
    };

    const handleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) initLogInputs();
    };

    const updateLogInput = (personKey, field, value) => {
        setLogInputs(prev => ({
            ...prev,
            [personKey]: { ...prev[personKey], [field]: value }
        }));
    };

    const handleSaveSet = async () => {
        if (isSaving) return;
        setIsSaving(true);
        
        try {
            const todayStr = new Date().toLocaleString('en-US');
            let nextSetNum = 1;
            if (ex.history && ex.history.length > 0) {
                const todaysEntries = ex.history.filter(h => h.date && new Date(h.date).toDateString() === new Date().toDateString());
                if (todaysEntries.length > 0) {
                    const maxSetNum = todaysEntries.reduce((max, h) => {
                        const num = parseInt(h.setNum) || 0;
                        return num > max ? num : max;
                    }, 0);
                    nextSetNum = maxSetNum + 1;
                }
            }

            const entries = [];
            for (const person of activePeople) {
                const key = person.toLowerCase();
                const input = logInputs[key] || {};
                
                if (ex.timed) {
                    if (input.duration) {
                        entries.push({
                            date: new Date().toLocaleString('en-US'),
                            person: key,
                            reps: input.duration,
                            weight: input.weight || "",
                            range: "r13_plus",
                            timed: true,
                            note: input.note || "",
                            setNum: nextSetNum
                        });
                    }
                } else {
                    if (input.reps) {
                        // Match spreadsheet schema exactly
                        const r = parseInt(input.reps);
                        let range = "r13_plus";
                        if (r <= 3) range = "r1_3";
                        else if (r <= 7) range = "r4_7";
                        else if (r <= 12) range = "r8_12";

                        entries.push({
                            date: new Date().toLocaleString('en-US'),
                            person: key,
                            reps: r,
                            weight: input.weight || "",
                            range: range,
                            timed: false,
                            note: input.note || "",
                            setNum: nextSetNum
                        });
                    }
                }
            }

            if (entries.length > 0) {
                await logSet(ex.name, entries);
                addSetToLocalHistory(ex.name, entries);
                setToast("Set Saved!");
                setTimeout(() => setToast(""), 2000);
            }
        } catch (e) {
            console.error(e);
            setToast("Error saving set");
            setTimeout(() => setToast(""), 2000);
        } finally {
            setIsSaving(false);
            initLogInputs(); // Clear inputs
        }
    };

    const handleOpenEdit = (type) => {
        if (type === 'circuit') {
            handleSaveInlineEdit('circuit');
            return;
        }
        setEditMode(type);
        if (type === 'rename') setEditValue(ex.name);
        else if (type === 'category') setEditValue(ex.category || '');
        else if (type === 'location') setEditValue(ex.location || 'Anywhere');
    };

    const handleSaveInlineEdit = async (explicitType = null) => {
        const typeToSave = explicitType || editMode;
        if (!typeToSave) return;

        let payload = { name: ex.name, exercise: ex.name, category: ex.category, location: ex.location, isCircuit: ex.isCircuit };
        let finalValue = editValue;

        if (typeToSave === 'circuit') {
            const confirmMsg = ex.isCircuit 
                ? `Remove '${ex.name}' from Circuit Generator?`
                : `Add '${ex.name}' to Circuit Generator?`;
            if (!window.confirm(confirmMsg)) return;
            payload.isCircuit = !ex.isCircuit;
        } else {
            if (finalValue === "ADD_NEW") {
                finalValue = prompt(`Enter new ${typeToSave} name:`);
                if (!finalValue) return;
            }

            if (typeToSave === 'rename') {
                if (!finalValue || finalValue === ex.name) { setEditMode(null); return; }
                payload.newName = finalValue;
            } else if (typeToSave === 'category') {
                if (finalValue === ex.category) { setEditMode(null); return; }
                payload.category = finalValue;
            } else if (typeToSave === 'location') {
                if (finalValue === ex.location) { setEditMode(null); return; }
                payload.location = finalValue;
            }
        }

        const pin = prompt("Admin PIN required to save:");
        if (pin !== "5050") {
            if (pin !== null) {
                setToast("Invalid PIN");
                setTimeout(() => setToast(""), 2000);
            }
            return;
        }

        try {
            setToast("Updating metadata...");
            setEditMode(null);
            await saveExercise(payload);
            setToast("Updated! Reload to see changes.");
            setTimeout(() => setToast(""), 3000);
        } catch (e) {
            console.error(e);
            setToast("Error updating");
            setTimeout(() => setToast(""), 2000);
        }
    };

    const handleDeleteHistory = async (entry) => {
        const pin = prompt("Admin PIN required:");
        if (pin === "5050") {
            try {
                await deleteHistory({ exercise: ex.name, ...entry }, pin);
                deleteSetFromLocalHistory(ex.name, entry);
                setToast("Entry deleted!");
                setTimeout(() => setToast(""), 2000);
            } catch (e) {
                console.error(e);
                setToast("Error deleting");
                setTimeout(() => setToast(""), 2000);
            }
        } else if (pin !== null) {
            setToast("Invalid PIN");
            setTimeout(() => setToast(""), 2000);
        }
    };

    const getBest = (personKey) => {
        if (!ex.best || !ex.best[personKey]) return "No data";
        const validKeys = Object.keys(ex.best[personKey]).filter(k => ex.best[personKey][k] !== null);
        if (validKeys.length === 0) return "No data";
        const b = ex.best[personKey][validKeys[0]];
        return ex.timed ? `${b.reps}` : `${b.reps}x${b.weight}`;
    };

    const executeSwap = async (swapPayload) => {
        const isCustom = typeof swapPayload === 'object';
        const stdName = isCustom ? swapPayload.name.trim() : swapPayload.trim();
        if (!stdName) return alert("Exercise name cannot be blank.");
        
        let targetEx = (exercises || []).find(e => e.name.toLowerCase() === stdName.toLowerCase());
        
        if (!targetEx) {
            targetEx = { 
                name: stdName, 
                category: isCustom ? swapPayload.category : (ex.category || "General"),
                muscle: isCustom ? swapPayload.muscle : (ex.muscleGroups || ex.muscle || ""),
                muscleGroups: isCustom ? swapPayload.muscle : (ex.muscleGroups || ex.muscle || ""),
                manufacturer: isCustom ? swapPayload.manufacturer : (ex.manufacturer || ""),
                baseExercise: isCustom ? swapPayload.baseExercise : (ex.baseExercise || ""),
                timed: false, history: [],
                isCircuit: false
            };
            try {
                await saveExercise(targetEx);
            } catch (e) {
                console.error("Error saving new swap exercise to backend", e);
            }
        }
        
        swapExercise(workoutDay, group.originalBaseKey, targetEx.name);
        setSwapMode(null);
        setCustomSwapState(null);
    };

    const allCategories = [...new Set((exercises || []).map(e => e.category).filter(Boolean))].sort();
    const allManufacturers = [...new Set((exercises || []).map(e => e.manufacturer).filter(Boolean))].sort();
    const allMuscles = [...new Set((exercises || []).map(e => e.muscle).filter(Boolean))].sort();

    return (
        <div style={{ 
            background: '#111', 
            border: `1px solid ${isDone ? 'var(--success)' : isSkipped ? 'var(--skip)' : isOpen ? 'var(--accent)' : 'var(--border)'}`, 
            borderRadius: 12, 
            opacity: isDone || isSkipped ? 0.6 : 1,
            overflow: 'hidden',
            marginBottom: 16
        }}>
            <div 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, cursor: 'pointer', background: isOpen ? '#1a1a1a' : 'transparent' }}
                onClick={handleOpen}
            >
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
                            {ex.category || 'Uncategorized'}
                        </div>
                        {hasVariations && (
                            <div style={{ display: "flex", gap: 4 }}>
                                {Object.keys(variations).map(v => (
                                    <button 
                                        key={v}
                                        onClick={(e) => { e.stopPropagation(); setMode(v); }}
                                        className="btn-ghost" 
                                        style={{ padding: '2px 6px', fontSize: 10, border: `1px solid ${mode===v ? 'var(--accent)' : 'transparent'}`, color: mode===v ? 'white' : 'var(--muted)' }}
                                    >
                                        {v.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>{ex.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 3 }}>
                        Best: <span style={{ color: 'var(--accent)' }}>{activePeople.length > 0 ? getBest(activePeople[0].toLowerCase()) : "N/A"}</span>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid #222' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, marginTop: 16 }}>
                        {!isDone && !isSkipped && (
                            <>
                                <button className="btn-success" style={{ flex: 1, padding: '8px', fontSize: 12, fontWeight: 'bold' }} onClick={(e) => { e.stopPropagation(); setExerciseDone(ex.name); }}>DONE</button>
                                <button className="btn-danger" style={{ flex: 1, padding: '8px', fontSize: 12, fontWeight: 'bold' }} onClick={(e) => { e.stopPropagation(); setExerciseSkipped(ex.name); }}>SKIP</button>
                            </>
                        )}
                        {(isDone || isSkipped) && (
                            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a', padding: 12, borderRadius: 8 }}>
                                <div style={{ fontWeight: 'bold', color: isDone ? 'var(--success)' : 'var(--skip)' }}>
                                    {isDone ? 'COMPLETED' : 'SKIPPED'}
                                </div>
                                <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); resetExerciseStatus(ex.name); }}>UNDO</button>
                            </div>
                        )}
                    </div>

                    {group.originalBaseKey && (
                        <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                                        {(group.alternatives || []).filter(alt => alt.category === ex.category).map(alt => (
                                            <option key={alt.baseName} value={alt.baseName}>{alt.baseName}</option>
                                        ))}
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
                                    <button onClick={() => setSwapMode(ex.name)} className="btn-ghost" style={{ flex: 1, minWidth: '75px', textAlign: 'center', fontSize: 11, padding: '10px 4px' }}>
                                        🔄 SWAP
                                    </button>
                                    <button onClick={() => setShowImage(true)} className="btn-ghost" style={{ flex: 1, minWidth: '75px', textAlign: 'center', fontSize: 11, padding: '10px 4px' }}>
                                        📸 IMAGE
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, borderTop: group.originalBaseKey ? 'none' : '1px solid var(--border)', paddingTop: group.originalBaseKey ? 0 : 8 }}>
                        {editMode ? (
                            <div style={{ display: 'flex', gap: 8, width: '100%', alignItems: 'center' }}>
                                {editMode === 'rename' && (
                                    <input 
                                        value={editValue} onChange={e => setEditValue(e.target.value)} 
                                        style={{ flex: 1, background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'white' }}
                                        autoFocus
                                    />
                                )}
                                {editMode === 'category' && (
                                    <select 
                                        value={editValue} onChange={e => setEditValue(e.target.value)}
                                        style={{ flex: 1, background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'white' }}
                                    >
                                        <option value="">Select Category...</option>
                                        {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        <option value="ADD_NEW">+ Add new...</option>
                                    </select>
                                )}
                                {editMode === 'location' && (
                                    <select 
                                        value={editValue} onChange={e => setEditValue(e.target.value)}
                                        style={{ flex: 1, background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'white' }}
                                    >
                                        <option value="Anywhere">Anywhere</option>
                                        {(locations || []).filter(l => l !== 'Anywhere').map(l => <option key={l} value={l}>{l}</option>)}
                                        <option value="ADD_NEW">+ Add new...</option>
                                    </select>
                                )}
                                <button className="btn-success" onClick={() => handleSaveInlineEdit()} style={{ padding: '8px 16px', fontSize: 12 }}>SAVE</button>
                                <button className="btn-ghost" onClick={() => setEditMode(null)} style={{ padding: '8px 12px', fontSize: 12, color: 'var(--muted)' }}>CANCEL</button>
                            </div>
                        ) : (
                            <>
                                <button className="btn-ghost" style={{ flex: 1, fontSize: 9, padding: '4px', color: 'var(--muted)' }} onClick={() => handleOpenEdit('rename')}>RENAME</button>
                                <button className="btn-ghost" style={{ flex: 1, fontSize: 9, padding: '4px', color: 'var(--muted)' }} onClick={() => handleOpenEdit('category')}>CATEGORY</button>
                                <button className="btn-ghost" style={{ flex: 1, fontSize: 9, padding: '4px', color: 'var(--muted)' }} onClick={() => handleOpenEdit('location')}>LOCATION</button>
                                <button className={ex.isCircuit ? "btn-accent" : "btn-ghost"} style={{ flex: 1, fontSize: 9, padding: '4px', color: ex.isCircuit ? '#000' : 'var(--muted)' }} onClick={() => handleOpenEdit('circuit')}>
                                    {ex.isCircuit ? "★ IN CIRCUIT" : "☆ ADD TO CIRCUIT"}
                                </button>
                            </>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                        <button className={activeTab === "LOG" ? "btn-success" : "btn-ghost"} onClick={() => setActiveTab("LOG")} style={{ flex: 1, padding: '8px' }}>LOG SET</button>
                        <button className={activeTab === "HISTORY" ? "btn-secondary" : "btn-ghost"} onClick={() => setActiveTab("HISTORY")} style={{ flex: 1, padding: '8px' }}>HISTORY</button>
                    </div>

                    {activeTab === "LOG" && (
                        <div>
                            {activePeople.map(person => {
                                const key = person.toLowerCase();
                                const input = logInputs[key] || {};
                                return (
                                    <PersonLogSection 
                                        key={person} 
                                        person={person} 
                                        ex={ex} 
                                        input={input} 
                                        updateLogInput={updateLogInput} 
                                    />
                                );
                            })}
                            <button className="btn-success" style={{ width: '100%', padding: 12, fontWeight: 'bold', marginTop: 12, marginBottom: 12 }} onClick={handleSaveSet} disabled={isSaving}>
                                {isSaving ? "SAVING..." : "SAVE SET"}
                            </button>
                        </div>
                    )}

                    {activeTab === "HISTORY" && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                                                        onClick={() => handleDeleteHistory(h)}
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
                    
                    {toast && <div style={{ color: 'var(--success)', fontSize: 12, textAlign: 'center', marginTop: 12 }}>{toast}</div>}
                </div>
            )}

            {showImage && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }} onClick={() => setShowImage(false)}>
                    <div style={{ background: '#111', padding: 16, borderRadius: 12, position: 'relative', maxWidth: '100%', maxHeight: '100%', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div style={{ fontSize: 16, fontWeight: 700 }}>{group.baseName}</div>
                            <button className="btn-ghost" onClick={() => setShowImage(false)} style={{ fontSize: 20, padding: 0, lineHeight: 1 }}>×</button>
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
                            {ex.fileReference ? (
                                <img 
                                    src={imgSrc} 
                                    alt={group.baseName} 
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
