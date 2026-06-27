import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useGymAPI } from '../hooks/useGymAPI';
import CircuitCard from './CircuitCard';
import SettingsModal from './SettingsModal';
import HelpDrawer from './HelpDrawer';

export default function CircuitView() {
    const { logSet, deleteHistory, saveExercise } = useGymAPI();
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

    // Timer states
    const [timerMode, setTimerMode] = useState(() => {
        return localStorage.getItem('gym-timer-mode') || 'stopwatch';
    });
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerIsRunning, setTimerIsRunning] = useState(false);
    const [timerIsCountdown, setTimerIsCountdown] = useState(false);

    // Sync timer mode to localStorage and set initial time
    useEffect(() => {
        localStorage.setItem('gym-timer-mode', timerMode);
        setTimerIsRunning(false);
        if (timerMode === 'stopwatch') {
            setTimerSeconds(0);
            setTimerIsCountdown(false);
        } else {
            setTimerSeconds(parseInt(timerMode, 10));
            setTimerIsCountdown(true);
        }
    }, [timerMode]);

    // Timer interval effect
    useEffect(() => {
        let interval = null;
        if (timerIsRunning) {
            interval = setInterval(() => {
                setTimerSeconds(prev => {
                    if (timerIsCountdown) {
                        if (prev <= 1) {
                            setTimerIsRunning(false);
                            // Visual and sound alert (native Web Audio API beep)
                            try {
                                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                                const osc = ctx.createOscillator();
                                const gain = ctx.createGain();
                                osc.connect(gain);
                                gain.connect(ctx.destination);
                                osc.frequency.value = 800; // 800Hz
                                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                                osc.start();
                                osc.stop(ctx.currentTime + 0.15);
                            } catch (e) {
                                console.error("Beep error:", e);
                            }
                            return 0;
                        }
                        return prev - 1;
                    } else {
                        return prev + 1;
                    }
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerIsRunning, timerIsCountdown]);

    const formatTimerTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => {
        setTimerIsRunning(!timerIsRunning);
    };

    const resetTimer = () => {
        setTimerIsRunning(false);
        if (timerMode === 'stopwatch') {
            setTimerSeconds(0);
        } else {
            setTimerSeconds(parseInt(timerMode, 10));
        }
    };

    // Accordion state
    const [openCardIndex, setOpenCardIndex] = useState(0);

    // Mimic setup state
    const [selectedCategories, setSelectedCategories] = useState({});

    useEffect(() => {
        localStorage.setItem('gym-circuit-active', JSON.stringify(circuitState));
    }, [circuitState]);

    useEffect(() => {
        if (circuit.length === 0) return;
        
        let allDoneOrSkipped = true;
        let hasSkipped = false;
        
        circuit.forEach(ex => {
            const currentData = completedMap[ex.name];
            const status = typeof currentData === 'string' ? currentData : currentData?.status;
            
            if (status !== 'done' && status !== 'skipped') allDoneOrSkipped = false;
            if (status === 'skipped') hasSkipped = true;
        });

        if (allDoneOrSkipped && hasSkipped) {
            const newMap = { ...completedMap };
            Object.keys(newMap).forEach(key => {
                if (newMap[key]?.status === 'skipped') {
                    newMap[key].status = 'active';
                }
            });
            updateCircuitState(circuit, newMap);
        }
    }, [circuit, completedMap]);

    const updateCircuitState = (newCircuit, newCompletedMap) => {
        setCircuitState({
            circuit: newCircuit,
            completedMap: newCompletedMap
        });
    };

    const machines = useMemo(() => {
        return (exercises || []).filter(ex => ex.isCircuit);
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

    const handleSwap = async (index, targetEx, isNew) => {
        const oldName = circuit[index].name;
        const newCircuit = [...circuit];
        newCircuit[index] = targetEx;
        
        const newMap = { ...completedMap };
        if (newMap[oldName]) {
            newMap[targetEx.name] = newMap[oldName];
            delete newMap[oldName];
        }
        
        updateCircuitState(newCircuit, newMap);

        if (isNew) {
            try {
                await saveExercise(targetEx);
            } catch (e) {
                console.error("Error saving new swap exercise to backend", e);
            }
        }
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

                // Auto-start rest timer if a countdown is configured
                const duration = parseInt(timerMode, 10);
                if (!isNaN(duration) && duration > 0) {
                    setTimerSeconds(duration);
                    setTimerIsCountdown(true);
                    setTimerIsRunning(true);
                }

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
        if (!window.confirm(`Are you sure you want to mark "${exName}" as DONE?`)) return;
        const newMap = { ...completedMap };
        const currentData = newMap[exName] || { status: 'active', sets: [] };
        const sets = typeof currentData === 'string' ? [] : (currentData.sets || []);
        newMap[exName] = { status: 'done', sets };

        // Flip any previously skipped exercises back to active
        Object.keys(newMap).forEach(key => {
            if (newMap[key]?.status === 'skipped') {
                newMap[key].status = 'active';
            }
        });

        updateCircuitState(circuit, newMap);
    };

    const handleSkip = (exName) => {
        if (!window.confirm(`Are you sure you want to SKIP "${exName}"?`)) return;
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

            if (entry.date && new Date(entry.date).toDateString() === new Date().toDateString()) {
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div>
                            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>Active Circuit</div>
                            <div style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
                                {circuit.length - Object.keys(completedMap).filter(k => {
                                    const s = completedMap[k];
                                    const status = typeof s === 'string' ? s : s?.status;
                                    return status === 'done' || status === 'skipped';
                                }).length} / {circuit.length}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn-ghost" style={{ fontSize: 12, border: '1px solid var(--border)' }} onClick={() => setView('full-list')}>
                                📋 FULL LIST
                            </button>
                        </div>
                    </div>

                    {/* Timer Widget */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#111', padding: 12, borderRadius: 12, border: '1px solid var(--border)', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 120px' }}>
                            <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                                {timerIsCountdown ? '⏳ REST COUNTDOWN' : '⏱️ STOPWATCH'}
                            </div>
                            <div style={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'var(--mono)', color: timerIsCountdown && timerSeconds <= 10 && timerSeconds > 0 ? '#ef4444' : 'var(--accent)', transition: 'color 0.3s' }}>
                                {formatTimerTime(timerSeconds)}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                            <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: 11, border: '1px solid var(--border)', background: timerIsRunning ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: timerIsRunning ? '#ef4444' : 'white' }} onClick={toggleTimer}>
                                {timerIsRunning ? '⏸️ PAUSE' : '▶️ START'}
                            </button>
                            <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: 11, border: '1px solid var(--border)' }} onClick={resetTimer}>
                                🔄 RESET
                            </button>
                            <select 
                                value={timerMode} 
                                onChange={e => setTimerMode(e.target.value)}
                                style={{ background: '#000', border: '1px solid var(--border)', color: 'white', fontSize: 11, padding: 6, borderRadius: 4, cursor: 'pointer' }}
                            >
                                <option value="stopwatch">⏱️ STOPWATCH</option>
                                <option value="30">⏳ 30S REST</option>
                                <option value="60">⏳ 60S REST</option>
                                <option value="90">⏳ 90S REST</option>
                                <option value="120">⏳ 2M REST</option>
                                <option value="180">⏳ 3M REST</option>
                                <option value="240">⏳ 4M REST</option>
                                <option value="300">⏳ 5M REST</option>
                            </select>
                        </div>
                    </div>

                    {(() => {
                        let activeIdx = 0;
                        while (activeIdx < circuit.length) {
                            const ex = circuit[activeIdx];
                            const s = completedMap[ex.name];
                            const status = typeof s === 'string' ? s : s?.status;
                            if (status !== 'done' && status !== 'skipped') break;
                            activeIdx++;
                        }

                        if (activeIdx >= circuit.length) {
                            return (
                                <div style={{ textAlign: 'center', padding: 40, color: 'var(--success)' }}>
                                    <h2>🎉 Circuit Complete!</h2>
                                    <p>Great job finishing the workout.</p>
                                    <button className="btn-success" onClick={endCircuit} style={{ marginTop: 20, padding: 12 }}>Finish</button>
                                </div>
                            );
                        }

                        const ex = circuit[activeIdx];
                        const upToDateEx = exercises.find(e => e.name === ex.name) || ex;

                        const wrappedHandleLogSet = async (exObj, logs) => {
                            const success = await handleLogSet(exObj, logs);
                            if (success) {
                                // Find the actual DOM log set button and blur it to close keyboard
                                document.activeElement?.blur();
                            }
                            return success;
                        };

                        const wrappedHandleSkip = () => {
                            handleSkip(ex.name);
                        };

                        return (
                            <>
                                <CircuitCard 
                                    key={`${ex.name}-${activeIdx}`} 
                                    ex={upToDateEx} 
                                    index={activeIdx} 
                                    completedStatus={completedMap[ex.name]} 
                                    activePeople={activePeople} 
                                    onLogSet={wrappedHandleLogSet} 
                                    onExplicitDone={handleExplicitDone} 
                                    onSkip={wrappedHandleSkip} 
                                    onUndo={handleUndo} 
                                    onDeleteSet={handleDeleteSet}
                                    onDeleteHistoryEntry={handleDeleteHistoryEntry}
                                    isOpen={true}
                                    onToggle={() => {}}
                                    onSwap={handleSwap}
                                    allExercises={exercises}
                                />
                                
                                <button 
                                    className="complete-btn" 
                                    onClick={endCircuit}
                                    style={{ width: '100%', background: 'var(--skip)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: 16, fontWeight: 800, cursor: 'pointer', marginTop: 16, letterSpacing: 1.5, textTransform: 'uppercase', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}
                                >
                                    End Circuit
                                </button>
                            </>
                        );
                    })()}
                </div>
            )}

            {view === 'full-list' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <button className="btn-secondary" onClick={() => setView('tracker')} style={{ padding: 12, fontSize: 14 }}>
                        &larr; BACK TO ACTIVE CARD
                    </button>
                    <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, paddingLeft: 4 }}>Full Circuit Order</div>
                    {circuit.map((ex, idx) => {
                        const s = completedMap[ex.name];
                        const status = typeof s === 'string' ? s : s?.status;
                        const isCompletedOrSkipped = status === 'done' || status === 'skipped';
                        
                        return (
                            <div key={idx} style={{ padding: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: isCompletedOrSkipped ? 0.6 : 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 'bold' }}>{idx + 1}. {ex.name}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ fontSize: 11, color: status === 'done' ? 'var(--success)' : status === 'skipped' ? 'var(--skip)' : 'var(--muted)', fontWeight: 'bold' }}>
                                        {status === 'done' ? 'DONE' : status === 'skipped' ? 'SKIPPED' : 'PENDING'}
                                    </div>
                                    {isCompletedOrSkipped && (
                                        <button 
                                            className="btn-ghost" 
                                            style={{ padding: '4px 10px', fontSize: 10, border: '1px solid var(--border)', color: 'white' }}
                                            onClick={() => { 
                                                handleUndo(ex.name); 
                                                setView('tracker'); 
                                            }}
                                        >
                                            UNDO
                                        </button>
                                    )}
                                </div>
                            </div>
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
