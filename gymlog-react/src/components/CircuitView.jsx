import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useGymAPI } from '../hooks/useGymAPI';
import CircuitCard from './CircuitCard';
import SettingsModal from './SettingsModal';
import HelpDrawer from './HelpDrawer';

export default function CircuitView() {
    const { logSet, deleteHistory } = useGymAPI();
    const { exercises, people, activePeople, loading, addSetToLocalHistory, deleteSetFromLocalHistory } = useAppContext();
    
    const navigate = useNavigate();
    const [view, setView] = useState('planner'); // 'planner' | 'mimic-setup' | 'tracker'
    
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    // Circuit states synced to 'gym-circuit-active'
    const [circuitState, setCircuitState] = useState(() => {
        const cached = localStorage.getItem('gym-circuit-active');
        return cached ? JSON.parse(cached) : { circuit: [], completedMap: {} };
    });
    const circuit = circuitState.circuit || [];
    const completedMap = circuitState.completedMap || {};

    // Accordion state
    const [openCardIndex, setOpenCardIndex] = useState(0);

    // Mimic setup state
    const [selectedCategories, setSelectedCategories] = useState({});

    useEffect(() => {
        localStorage.setItem('gym-circuit-active', JSON.stringify(circuitState));
    }, [circuitState]);

    const updateCircuitState = (newCircuit, newCompletedMap) => {
        setCircuitState({
            circuit: newCircuit,
            completedMap: newCompletedMap
        });
    };

    const machines = useMemo(() => {
        return (exercises || []).filter(ex => ex.manufacturer || ex.fileReference || ex.baseExercise);
    }, [exercises]);

    const uniqueCategories = useMemo(() => {
        return [...new Set(machines.map(e => e.category).filter(Boolean))].sort();
    }, [machines]);

    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const startFullBodyCircuit = () => {
        const grouped = {};
        machines.forEach(ex => {
            if (!ex.category) return;
            if (!grouped[ex.category]) grouped[ex.category] = [];
            grouped[ex.category].push(ex);
        });

        const newCircuit = [];
        Object.keys(grouped).forEach(cat => {
            newCircuit.push(pickRandom(grouped[cat]));
        });

        updateCircuitState(newCircuit, {});
        setView('tracker');
    };

    const startHitEveryMachine = () => {
        updateCircuitState([...machines], {});
        setView('tracker');
    };

    const handleMimicToggle = (cat) => {
        setSelectedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    const startMimicCircuit = () => {
        const grouped = {};
        machines.forEach(ex => {
            if (!ex.category) return;
            if (!grouped[ex.category]) grouped[ex.category] = [];
            grouped[ex.category].push(ex);
        });

        const newCircuit = [];
        Object.keys(grouped).forEach(cat => {
            if (selectedCategories[cat]) {
                newCircuit.push(pickRandom(grouped[cat]));
            }
        });

        if (newCircuit.length === 0) {
            alert("Please select at least one category.");
            return;
        }

        updateCircuitState(newCircuit, {});
        setView('tracker');
    };

    const endCircuit = () => {
        if (window.confirm("Are you sure you want to end the current circuit?")) {
            updateCircuitState([], {});
            setView('planner');
        }
    };

    const handleSwap = (index, targetEx) => {
        const oldName = circuit[index].name;
        const newCircuit = [...circuit];
        newCircuit[index] = targetEx;
        
        const newMap = { ...completedMap };
        if (newMap[oldName]) {
            newMap[targetEx.name] = newMap[oldName];
            delete newMap[oldName];
        }
        
        updateCircuitState(newCircuit, newMap);
    };

    const handleLogSet = async (ex, logs) => {
        console.log("handleLogSet CALLED", {ex, logs});

        const newMap = { ...completedMap };
        const currentData = newMap[ex.name] || { status: 'active', sets: [] };
        const currentSets = typeof currentData === 'string' ? [] : (currentData.sets || []);
        const nextSetNum = currentSets.length + 1;

        const entries = [];
        for (const person of activePeople) {
            const key = person.toLowerCase();
            const input = logs[key];
            if (!input) continue;
            
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

        console.log("ENTRIES:", entries);
        if (entries.length > 0) {
            try {
                await logSet(ex.name, entries);
                addSetToLocalHistory(ex.name, entries);
                
                const newMap = { ...completedMap };
                const currentData = newMap[ex.name] || { status: 'active', sets: [] };
                const currentSets = typeof currentData === 'string' ? [] : (currentData.sets || []);
                
                newMap[ex.name] = {
                    status: typeof currentData === 'string' ? currentData : (currentData.status || 'active'),
                    sets: [...currentSets, entries]
                };
                updateCircuitState(circuit, newMap);
                return true;
            } catch (e) {
                console.error("Error logging set:", e);
                alert("Failed to log set: " + e.message);
                return false;
            }
        }
        return false;
    };

    const handleExplicitDone = (exName) => {
        const newMap = { ...completedMap };
        const currentData = newMap[exName] || { status: 'active', sets: [] };
        const sets = typeof currentData === 'string' ? [] : (currentData.sets || []);
        newMap[exName] = { status: 'done', sets };
        updateCircuitState(circuit, newMap);
    };

    const handleSkip = (exName) => {
        const newMap = { ...completedMap };
        const currentData = newMap[exName] || { status: 'active', sets: [] };
        const sets = typeof currentData === 'string' ? [] : (currentData.sets || []);
        newMap[exName] = { status: 'skipped', sets };
        updateCircuitState(circuit, newMap);
    };

    const handleUndo = (exName) => {
        const newMap = { ...completedMap };
        const currentData = newMap[exName] || { status: 'active', sets: [] };
        const sets = typeof currentData === 'string' ? [] : (currentData.sets || []);
        newMap[exName] = { status: 'active', sets };
        updateCircuitState(circuit, newMap);
    };

    const handleDeleteSet = async (exName, setIdx) => {
        const pin = window.prompt("Enter Admin PIN to confirm deletion:");
        if (pin === null) return;
        if (pin !== "5050") {
            alert("Incorrect Admin PIN.");
            return;
        }

        const currentData = completedMap[exName];
        if (!currentData || typeof currentData === 'string') return;
        
        const sets = currentData.sets || [];
        const setEntries = sets[setIdx];
        if (!setEntries) return;

        try {
            for (const entry of setEntries) {
                await deleteHistory({ ...entry, exercise: exName }, pin);
                deleteSetFromLocalHistory(exName, entry);
            }

            const updatedSets = sets.filter((_, idx) => idx !== setIdx);
            const newMap = {
                ...completedMap,
                [exName]: {
                    ...currentData,
                    sets: updatedSets
                }
            };
            updateCircuitState(circuit, newMap);
        } catch (e) {
            console.error("Error deleting set:", e);
            alert("Failed to delete set: " + e.message);
        }
    };

    const handleDeleteHistoryEntry = async (entry) => {
        const pin = window.prompt("Enter Admin PIN to confirm deletion:");
        if (pin === null) return;
        if (pin !== "5050") {
            alert("Incorrect Admin PIN.");
            return;
        }

        const exName = entry.exercise;
        if (!exName) {
            alert("Exercise name is missing in history entry.");
            return;
        }

        try {
            await deleteHistory(entry, pin);
            deleteSetFromLocalHistory(exName, entry);

            const todayStr = new Date().toLocaleDateString('en-US');
            if (entry.date === todayStr) {
                const currentData = completedMap[exName];
                if (currentData && typeof currentData !== 'string') {
                    const sets = currentData.sets || [];
                    let setIdxToRemove = -1;
                    let entryIdxToRemove = -1;
                    
                    for (let sIdx = 0; sIdx < sets.length; sIdx++) {
                        const setEntries = sets[sIdx];
                        const foundIdx = setEntries.findIndex(e => 
                            e.person === entry.person && 
                            e.reps === entry.reps && 
                            e.weight === entry.weight &&
                            e.date === entry.date
                        );
                        if (foundIdx !== -1) {
                            setIdxToRemove = sIdx;
                            entryIdxToRemove = foundIdx;
                            break;
                        }
                    }

                    if (setIdxToRemove !== -1) {
                        const currentSet = sets[setIdxToRemove];
                        const updatedSet = currentSet.filter((_, idx) => idx !== entryIdxToRemove);
                        
                        let updatedSets;
                        if (updatedSet.length === 0) {
                            updatedSets = sets.filter((_, idx) => idx !== setIdxToRemove);
                        } else {
                            updatedSets = sets.map((s, idx) => idx === setIdxToRemove ? updatedSet : s);
                        }

                        const newMap = {
                            ...completedMap,
                            [exName]: {
                                ...currentData,
                                sets: updatedSets
                            }
                        };
                        updateCircuitState(circuit, newMap);
                    }
                }
            }
        } catch (e) {
            console.error("Error deleting history entry:", e);
            alert("Failed to delete history entry: " + e.message);
        }
    };

    if (loading) {
        return <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>;
    }

    return (
        <div style={{ padding: '20px', paddingBottom: '100px' }}>
            {/* Header / Modal toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 20, color: 'var(--accent)' }}>Circuit Training</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: 16 }} onClick={() => setIsHelpOpen(true)}>❓</button>
                    <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: 16 }} onClick={() => setIsSettingsOpen(true)}>⚙️</button>
                </div>
            </div>

            {/* View Switching */}
            {view === 'planner' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {circuit.length > 0 && (
                        <button className="btn-success" style={{ padding: 16, fontSize: 16, fontWeight: 'bold' }} onClick={() => setView('tracker')}>
                            RESUME ACTIVE CIRCUIT
                        </button>
                    )}
                    
                    <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', marginTop: 16, marginBottom: 8, letterSpacing: 1 }}>Select Circuit Mode</div>
                    
                    <button className="btn-secondary" style={{ padding: 16, fontSize: 16, textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} onClick={startFullBodyCircuit}>
                        <div>🤖 Full Body Circuit</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 'normal', marginTop: 4 }}>Randomly picks 1 machine for each category</div>
                    </button>
                    
                    <button className="btn-secondary" style={{ padding: 16, fontSize: 16, textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} onClick={() => setView('mimic-setup')}>
                        <div>🎭 Plan Exercise Mimic</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 'normal', marginTop: 4 }}>Select categories and randomly generate</div>
                    </button>

                    <button className="btn-secondary" style={{ padding: 16, fontSize: 16, textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} onClick={startHitEveryMachine}>
                        <div>🔥 Hit Every Machine</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 'normal', marginTop: 4 }}>All machines in current order</div>
                    </button>
                </div>
            )}

            {view === 'mimic-setup' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <button className="btn-ghost" onClick={() => setView('planner')} style={{ padding: '6px 12px' }}>&larr; BACK</button>
                        <div style={{ fontSize: 14, color: 'var(--muted)', textTransform: 'uppercase' }}>Select Categories</div>
                    </div>

                    <div style={{ background: '#111', borderRadius: 12, border: '1px solid var(--border)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {uniqueCategories.map(cat => (
                            <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16 }}>
                                <input 
                                    type="checkbox" 
                                    style={{ width: 20, height: 20 }}
                                    checked={!!selectedCategories[cat]} 
                                    onChange={() => handleMimicToggle(cat)} 
                                />
                                {cat}
                            </label>
                        ))}
                    </div>

                    <button className="btn-success" style={{ padding: 16, fontSize: 16, fontWeight: 'bold' }} onClick={startMimicCircuit}>
                        GENERATE CIRCUIT
                    </button>
                </div>
            )}

            {view === 'tracker' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <button className="btn-secondary" onClick={() => setView('planner')} style={{ padding: 12, fontSize: 14 }}>
                        &larr; BACK TO CIRCUIT PLANNER
                    </button>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div>
                            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>Remaining</div>
                            <div style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
                                {circuit.length - Object.keys(completedMap).filter(k => {
                                    const s = completedMap[k];
                                    const status = typeof s === 'string' ? s : s?.status;
                                    return status === 'done' || status === 'skipped';
                                }).length} / {circuit.length}
                            </div>
                        </div>
                        <button className="btn-ghost" style={{ color: 'var(--skip)', borderColor: 'var(--skip)' }} onClick={endCircuit}>
                            END CIRCUIT
                        </button>
                    </div>

                    {circuit.map((ex, idx) => {
                        const upToDateEx = exercises.find(e => e.name === ex.name) || ex;
                        return (
                                <CircuitCard 
                                    key={`${ex.name}-${idx}`} 
                                    ex={upToDateEx} 
                                    index={idx} 
                                    completedStatus={completedMap[ex.name]} 
                                    activePeople={activePeople} 
                                    onLogSet={handleLogSet} 
                                    onExplicitDone={handleExplicitDone} 
                                    onSkip={handleSkip} 
                                    onUndo={handleUndo} 
                                    onDeleteSet={handleDeleteSet}
                                    onDeleteHistoryEntry={handleDeleteHistoryEntry}
                                    isOpen={openCardIndex === idx}
                                    onToggle={() => setOpenCardIndex(openCardIndex === idx ? -1 : idx)}
                                    onSwap={handleSwap}
                                    allExercises={exercises}
                                />
                        );
                    })}
                </div>
            )}

            <SettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
            />

            <HelpDrawer 
                showHelp={isHelpOpen} 
                setShowHelp={setIsHelpOpen} 
            />
        </div>
    );
}
