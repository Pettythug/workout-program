import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useGymAPI } from '../hooks/useGymAPI';
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
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={input.reps || ""} 
                            onChange={e => updateLogInput(key, "reps", e.target.value)}
                            style={{ background: '#0c0c0c', border: '1px solid var(--accent)', borderRadius: 8, padding: 8, width: 70, color: 'white', textAlign: 'center', fontSize: 16, fontFamily: 'var(--mono)', outline: 'none' }}
                        />
                        <input 
                            placeholder="lbs" 
                            type="text"
                            inputMode="decimal"
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
                    onChange={(e) => updateLogInput(key, "note", e.target.value)}
                    style={{ width: '100%', background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 8px', color: 'white', fontSize: 12 }}
                />
            </div>
        </div>
    );
};

export default function ExerciseCard({ group, onLogSet, isOpen: propIsOpen }) {
    const { people, activePeople, exerciseStatus, setExerciseDone, setExerciseSkipped, resetExerciseStatus, addSetToLocalHistory, deleteSetFromLocalHistory, workoutDay, swapExercise, exercises, locations, logExerciseSet } = useAppContext();
    const { logSet, deleteHistory, saveExercise } = useGymAPI();
    
    const [mode, setMode] = useState("Standard"); // "Standard", "Single", "Alt"
    const [isOpenState, setIsOpenState] = useState(false);
    const isOpen = propIsOpen !== undefined ? propIsOpen : isOpenState;
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

    const todaysSets = useMemo(() => {
        if (!ex || !ex.history || ex.history.length === 0) return [];
        const todayStr = new Date().toDateString();
        return ex.history.filter(h => h.date && new Date(h.date).toDateString() === todayStr);
    }, [ex]);

    const groupedSets = useMemo(() => {
        const groups = {};
        todaysSets.forEach(h => {
            const sNum = h.setNum || 1;
            if (!groups[sNum]) {
                groups[sNum] = [];
            }
            groups[sNum].push(h);
        });
        return Object.keys(groups)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(key => groups[key]);
    }, [todaysSets]);

    const hasVariations = Object.keys(variations).length > 1;
    const isDone = exerciseStatus[ex.name] === 'done';
    const isSkipped = exerciseStatus[ex.name] === 'skipped';

    const isGroupDone = useMemo(() => {
        return Object.values(variations).some(v => exerciseStatus[v.name] === 'done');
    }, [variations, exerciseStatus]);

    const isGroupSkipped = useMemo(() => {
        return Object.values(variations).some(v => exerciseStatus[v.name] === 'skipped');
    }, [variations, exerciseStatus]);

    const getImageUrl = (fileRef) => {
        if (!fileRef) return `${import.meta.env.BASE_URL}images/placeholder.jpg`;
        if (!fileRef.includes('.') && fileRef.length > 10) {
            return `https://docs.google.com/uc?export=view&id=${fileRef}`;
        }
        return `${import.meta.env.BASE_URL}images/${fileRef}`;
    };
    const imgSrc = getImageUrl(ex.fileReference);

    const getNextSetNumber = () => {
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
        return nextSetNum;
    };

    // Initialize log inputs if empty
    const initLogInputs = () => {
        setLogInputs(prev => {
            const next = { ...prev };
            people.forEach(p => {
                const key = p.toLowerCase();
                if (!next[key]) {
                    next[key] = { reps: "", weight: "", duration: "", note: "" };
                }
            });
            return next;
        });
    };

    const clearLogInputs = () => {
        const cleared = {};
        people.forEach(p => {
            cleared[p.toLowerCase()] = { reps: "", weight: "", duration: "", note: "" };
        });
        setLogInputs(cleared);
    };

    // Auto-initialize when opened
    React.useEffect(() => {
        if (isOpen) {
            initLogInputs();
        }
    }, [isOpen, people]);

    const handleOpen = () => {
        if (propIsOpen === undefined) {
            setIsOpenState(!isOpenState);
        }
    };

    const updateLogInput = (personKey, field, value) => {
        setLogInputs(prev => {
            const next = { ...prev };
            if (!next[personKey]) {
                next[personKey] = { reps: "", weight: "", duration: "", note: "" };
            }
            let sanitizedValue = value;
            if (field === 'reps') {
                sanitizedValue = value.replace(/[^0-9]/g, ''); // Digits only
            } else if (field === 'weight') {
                sanitizedValue = value.replace(/[^0-9.]/g, ''); // Digits and decimal points
                const parts = sanitizedValue.split('.');
                if (parts.length > 2) {
                    sanitizedValue = parts[0] + '.' + parts.slice(1).join('');
                }
            }
            next[personKey] = { ...next[personKey], [field]: sanitizedValue };
            return next;
        });
    };

    const handleSaveSet = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            const entries = await logExerciseSet(ex, logInputs);
            if (entries) {
                clearLogInputs();
                setToast("Set Saved!");
                if (onLogSet) {
                    onLogSet();
                }
            }
        } catch (e) {
            console.error("Error in handleSaveSet:", e);
            alert("Failed to log set: " + e.message);
        } finally {
            setIsSaving(false);
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
        if (pin === null) return;

        try {
            setToast("Updating metadata...");
            setEditMode(null);
            await saveExercise(payload, pin);
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
        if (pin === null) return;
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
    };

    const handleDeleteLoggedSet = async (setEntries) => {
        if (!setEntries || setEntries.length === 0) return;
        const pin = prompt("Admin PIN required:");
        if (pin === null) return;
        try {
            setToast("Deleting set...");
            for (const entry of setEntries) {
                await deleteHistory({ exercise: ex.name, ...entry }, pin);
                deleteSetFromLocalHistory(ex.name, entry);
            }
            setToast("Set deleted!");
            setTimeout(() => setToast(""), 2000);
        } catch (e) {
            console.error(e);
            setToast("Error deleting");
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
            const pin = prompt("Enter Admin PIN to register this custom exercise on the database:");
            if (pin === null) return;
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
                await saveExercise(targetEx, pin);
            } catch (e) {
                console.error("Error saving new swap exercise to backend", e);
                alert("Failed to save swap exercise: " + e.message);
                return;
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
            border: `1px solid ${isGroupDone ? 'var(--success)' : isGroupSkipped ? 'var(--skip)' : isOpen ? 'var(--accent)' : 'var(--border)'}`, 
            borderRadius: 12, 
            opacity: isGroupSkipped && !isGroupDone ? 0.5 : 1,
            boxShadow: isGroupDone ? '0 4px 20px rgba(34, 197, 94, 0.12)' : 'none',
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
                                        className="btn-ghost btn-no-translate" 
                                        style={{ padding: '2px 6px', fontSize: 10, border: `1px solid ${mode===v ? 'var(--accent)' : 'transparent'}`, color: mode===v ? 'white' : 'var(--muted)' }}
                                    >
                                        {v === 'Single' ? 'SINGLES' : v.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>{ex.name}</div>
                        {isGroupDone && (
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
                        {(isGroupSkipped && !isGroupDone) && (
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
                    <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 3 }}>
                        Best: <span style={{ color: 'var(--accent)' }}>{activePeople.length > 0 ? getBest(activePeople[0].toLowerCase()) : "N/A"}</span>
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
                            <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); resetExerciseStatus(ex.name); }}>UNDO</button>
                        </div>
                    ) : (
                        <div style={{ marginTop: 16 }}>
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
                                        <button className="btn-ghost btn-no-translate" style={{ flex: 1, fontSize: 10, padding: '6px 8px', color: 'var(--muted)' }} onClick={() => handleOpenEdit('rename')}>RENAME</button>
                                        <button className="btn-ghost btn-no-translate" style={{ flex: 1, fontSize: 10, padding: '6px 8px', color: 'var(--muted)' }} onClick={() => handleOpenEdit('category')}>CATEGORY</button>
                                        <button className="btn-ghost btn-no-translate" style={{ flex: 1, fontSize: 10, padding: '6px 8px', color: 'var(--muted)' }} onClick={() => handleOpenEdit('location')}>LOCATION</button>
                                        <button className={ex.isCircuit ? "btn-accent btn-no-translate" : "btn-ghost btn-no-translate"} style={{ flex: 1, fontSize: 10, padding: '6px 8px', color: ex.isCircuit ? '#000' : 'var(--muted)' }} onClick={() => handleOpenEdit('circuit')}>
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

                                    {todaysSets.length > 0 && (
                                        <div style={{ background: '#1a1a1a', borderRadius: 8, padding: 8, marginTop: 8, border: '1px solid var(--border)' }}>
                                            <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>Today's Sets</div>
                                            {todaysSets.map((h, i) => {
                                                const timeStr = h.date ? new Date(h.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
                                                return (
                                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '2px 0' }}>
                                                        <span style={{ color: 'var(--accent)' }}>
                                                            {h.person.toUpperCase()} - Set {h.setNum || i + 1}
                                                            {timeStr && <span style={{ color: 'var(--muted)', fontSize: 9, marginLeft: 6 }}>({timeStr})</span>}
                                                        </span>
                                                        <span>{ex.timed ? `${h.reps} ${h.weight ? `@ ${h.weight}lbs` : ''}` : `${h.reps}x${h.weight || 0}`}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <button className="btn-success" style={{ width: '100%', padding: 12, fontWeight: 'bold', marginTop: 12, marginBottom: 12 }} onClick={handleSaveSet} disabled={isSaving}>
                                        {isSaving ? "SAVING..." : `LOG SET ${getNextSetNumber()}`}
                                    </button>

                                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                        <button className="btn-secondary" style={{ flex: 1, padding: '10px', fontSize: 12, fontWeight: 'bold' }} onClick={(e) => { 
                                            e.stopPropagation(); 
                                            if (window.confirm(`Are you sure you want to mark "${ex.name}" as DONE?`)) {
                                                setExerciseDone(ex.name); 
                                            }
                                        }}>DONE</button>
                                        <button className="btn-danger" style={{ flex: 1, padding: '10px', fontSize: 12, fontWeight: 'bold' }} onClick={(e) => { 
                                            e.stopPropagation(); 
                                            if (window.confirm(`Are you sure you want to SKIP "${ex.name}"?`)) {
                                                setExerciseSkipped(ex.name); 
                                            }
                                        }}>SKIP</button>
                                    </div>
                                </div>
                            )}

                            {activeTab === "HISTORY" && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ background: '#0c0c0c', borderRadius: 8, padding: 12, border: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>LOGGED SETS</div>
                                        {groupedSets.length === 0 ? (
                                            <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 11 }}>No logged sets in this session</div>
                                        ) : (
                                            groupedSets.map((setEntries, sIdx) => {
                                                const timeStr = setEntries[0]?.date ? new Date(setEntries[0].date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
                                                const summary = setEntries.map(e => {
                                                    const formatted = ex.timed ? `${e.reps} ${e.weight ? `@ ${e.weight}lbs` : ''}` : `${e.reps}x${e.weight || 0}`;
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
                                                            onClick={() => handleDeleteLoggedSet(setEntries)}
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

                            {group.originalBaseKey && (
                                <div style={{ marginTop: 16, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ marginTop: group.originalBaseKey ? 0 : 16, marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <button onClick={() => setShowImage(true)} className="btn-ghost" style={{ flex: 1, minWidth: '75px', textAlign: 'center', fontSize: 11, padding: '10px 4px' }}>
                                    📸 IMAGE
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {toast && <div style={{ color: 'var(--success)', fontSize: 12, textAlign: 'center', marginTop: 12 }}>{toast}</div>}
                </div>
            )}

            <ImageModal 
                ex={ex} 
                baseName={group.baseName} 
                isOpen={showImage} 
                onClose={() => setShowImage(false)} 
                setToast={setToast} 
            />
        </div>
    );
}
