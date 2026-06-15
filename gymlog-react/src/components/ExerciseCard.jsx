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
        <div style={{ background: '#111', border: '1px solid var(--border)', borderRadius: 12, padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>{person.toUpperCase()}</div>
            <div style={{ display: 'flex', gap: 4, fontSize: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                {targetRanges.map((tr, idx) => (
                    <React.Fragment key={tr.key}>
                        <span style={tr.isActive ? { color: 'var(--accent)', fontWeight: 'bold' } : { color: 'var(--muted)' }}>
                            {tr.label} ({tr.bestValue})
                        </span>
                        {idx < targetRanges.length - 1 && <span style={{ color: 'var(--muted)' }}>@</span>}
                    </React.Fragment>
                ))}
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


const REP_RANGES = [
    { key: "r1_3", label: "1-3 reps" },
    { key: "r4_7", label: "4-7 reps" },
    { key: "r8_12", label: "8-12 reps" },
    { key: "r13_plus", label: "13+ reps" }
];

export default function ExerciseCard({ group }) {
    const { people, activePeople, exerciseStatus, setExerciseDone, setExerciseSkipped, resetExerciseStatus, addSetToLocalHistory, deleteSetFromLocalHistory, workoutDay, swapExercise, exercises, locations } = useAppContext();
    const { logSet, deleteHistory, saveExercise } = useGymAPI();
    
    const [mode, setMode] = useState("Standard"); // "Standard", "Single", "Alt"
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("LOG"); // "LOG", "HISTORY"
    const [logInputs, setLogInputs] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState("");
    const [isSwapping, setIsSwapping] = useState(false);
    const [customSwap, setCustomSwap] = useState("");
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
            const todayStr = new Date().toLocaleDateString('en-US');
            let nextSetNum = 1;
            if (ex.history && ex.history.length > 0) {
                const todaysEntries = ex.history.filter(h => h.date === todayStr);
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
                            date: new Date().toLocaleDateString('en-US'),
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
                            date: new Date().toLocaleDateString('en-US'),
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

    return (
        <div className={`exercise-card ${isDone ? "cardDone" : isSkipped ? "cardSkipped" : ""}`} style={{ borderColor: isDone ? 'var(--success)' : isSkipped ? 'var(--skip)' : 'var(--accent)', opacity: isDone || isSkipped ? 0.6 : 1 }}>
            <div className="exercise-header" style={{ padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div onClick={handleOpen} style={{ flex: 1 }}>
                    {ex.category && <div style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>{ex.category}</div>}
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{group.baseName}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 3 }}>
                        Best: <span style={{ color: 'var(--accent)' }}>{activePeople.length > 0 ? getBest(activePeople[0].toLowerCase()) : "N/A"}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {!isDone && !isSkipped && (
                        <>
                            <button className="btn-success" style={{ padding: '4px 8px', fontSize: 10 }} onClick={(e) => { e.stopPropagation(); setExerciseDone(ex.name); }}>DONE</button>
                            <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: 10 }} onClick={(e) => { e.stopPropagation(); setExerciseSkipped(ex.name); }}>SKIP</button>
                        </>
                    )}
                    {(isDone || isSkipped) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: isDone ? 'var(--success)' : 'var(--muted)' }}>
                                {isDone ? 'COMPLETED' : 'SKIPPED'}
                            </div>
                            <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: 10 }} onClick={(e) => { e.stopPropagation(); resetExerciseStatus(ex.name); }}>UNDO</button>
                        </div>
                    )}
                    <div onClick={handleOpen} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--muted)', padding: '0 8px' }}>
                        ▼
                    </div>
                </div>
            </div>

            {isOpen && (
                <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    {hasVariations && (
                        <div style={{ display: 'flex', background: '#111', borderRadius: 8, padding: 4, marginBottom: 16 }}>
                            {Object.keys(variations).map(v => (
                                <button 
                                    key={v}
                                    onClick={() => setMode(v)}
                                    style={{ 
                                        flex: 1, 
                                        background: mode === v ? '#1a1a1a' : 'none', 
                                        border: 'none', 
                                        color: mode === v ? 'var(--accent)' : 'var(--muted)', 
                                        padding: '6px', 
                                        borderRadius: 6,
                                        fontSize: 11,
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    )}

                    {group.originalBaseKey && (
                        <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn-ghost" onClick={() => setIsSwapping(!isSwapping)} style={{ flex: 1, textAlign: 'center', fontSize: 11, padding: '4px 0' }}>
                                    {isSwapping ? "CANCEL SWAP" : "SWAP EXERCISE"}
                                </button>
                                <button className="btn-ghost" onClick={() => setShowImage(true)} style={{ flex: 1, textAlign: 'center', fontSize: 11, padding: '4px 0' }}>
                                    📸 IMAGE
                                </button>
                                <button className="btn-ghost" onClick={() => {}} style={{ flex: 1, textAlign: 'center', fontSize: 11, padding: '4px 0', opacity: 0.5, pointerEvents: 'none' }}>
                                    METADATA ▼
                                </button>
                            </div>
                            {isSwapping && (
                                <div style={{ background: '#111', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Swap for another {ex.category}:</div>
                                    <select 
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                swapExercise(workoutDay, group.originalBaseKey, e.target.value);
                                                setIsSwapping(false);
                                            }
                                        }}
                                        style={{ width: '100%', background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'white', marginBottom: 8 }}
                                        value=""
                                    >
                                        <option value="" disabled>Select alternative...</option>
                                        {(group.alternatives || []).filter(alt => alt.category === ex.category).map(alt => (
                                            <option key={alt.baseName} value={alt.baseName}>{alt.baseName}</option>
                                        ))}
                                    </select>
                                    <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Or Custom Swap:</div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <input 
                                            value={customSwap}
                                            onChange={e => setCustomSwap(e.target.value)}
                                            placeholder="Enter custom name"
                                            style={{ flex: 1, background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'white' }}
                                        />
                                        <button 
                                            className="btn-success"
                                            onClick={() => {
                                                if (customSwap.trim()) {
                                                    swapExercise(workoutDay, group.originalBaseKey, customSwap.trim());
                                                    setIsSwapping(false);
                                                    setCustomSwap("");
                                                }
                                            }}
                                        >
                                            CONFIRM
                                        </button>
                                    </div>
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
                        <button className={activeTab === "LOG" ? "btn-success" : "btn-ghost"} onClick={() => setActiveTab("LOG")} style={{ flex: 1 }}>LOG SET</button>
                        <button className={activeTab === "HISTORY" ? "btn-secondary" : "btn-ghost"} onClick={() => setActiveTab("HISTORY")} style={{ flex: 1 }}>HISTORY</button>
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
                            <button className="btn-success" style={{ width: '100%' }} onClick={handleSaveSet} disabled={isSaving}>
                                {isSaving ? "SAVING..." : "SAVE SET"}
                            </button>
                        </div>
                    )}

                    {activeTab === "HISTORY" && (
                        <div style={{ background: '#0c0c0c', borderRadius: 8, padding: 12, border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, marginBottom: 12 }}>RECENT HISTORY</div>
                            {(!ex.history || ex.history.filter(h => activePeople.some(p => p.toLowerCase() === h.person.toLowerCase())).length === 0) ? (
                                <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 11 }}>No entries yet</div>
                            ) : (
                                ex.history.filter(h => activePeople.some(p => p.toLowerCase() === h.person.toLowerCase())).slice(0, 5).map((h, i) => (
                                    <div key={i} style={{ paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ fontSize: 9, color: 'var(--muted)' }}>{h.date}</div>
                                                <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>{h.person.toUpperCase()}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ fontSize: 12, fontWeight: 700 }}>
                                                    {ex.timed ? `${h.reps} ${h.weight ? `@ ${h.weight}lbs` : ''}` : `${h.reps}x${h.weight || 0}`}
                                                </div>
                                                <button className="btn-ghost" onClick={() => handleDeleteHistory(h)} style={{ padding: '0 4px', fontSize: 12, color: 'var(--skip)' }}>
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
                            <img 
                                src={`${import.meta.env.BASE_URL}images/${group.baseName.replace(/\//g, " ")}.jpg`} 
                                alt={group.baseName} 
                                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8 }}
                                onError={(e) => { e.target.style.display = 'none'; e.target.insertAdjacentHTML('afterend', '<div style=\"color: var(--muted); padding: 32px; text-align: center; border: 1px dashed var(--border); border-radius: 8px;\">Image not found for this exercise.</div>'); }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
