import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useGymAPI } from '../hooks/useGymAPI';
import CircuitCard from './CircuitCard';
import SettingsModal from './SettingsModal';
import HelpDrawer from './HelpDrawer';
import StickyRestBanner from './StickyRestBanner';

const CATEGORY_ORDER = [
    "Explosive",
    "Knee Dominant",
    "Hip Dominant",
    "Horizontal Push",
    "Horizontal Pull",
    "Vertical Push",
    "Vertical Pull",
    "Rotational Core",
    "Plank Core",
    "Accessory"
];

export default function CircuitView() {
    const { logSet, deleteHistory, saveExercise, sheetsPost } = useGymAPI();
    const { 
        exercises, people, activePeople, loading, addSetToLocalHistory, 
        deleteSetFromLocalHistory, logExerciseSet, setExerciseDone, 
        setExerciseSkipped, resetExerciseStatus, clearAllExerciseStatus, 
        updateExerciseInLocalState,
        timerMode, setTimerMode, timerSeconds, timerIsRunning, timerIsCountdown,
        formatTimerTime, toggleTimer, resetTimer, startRestTimer
    } = useAppContext();
    
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
        clearAllExerciseStatus();
        const grouped = {};
        machines.forEach(ex => {
            if (!ex.category) return;
            if (!grouped[ex.category]) grouped[ex.category] = [];
            grouped[ex.category].push(ex);
        });
        console.log("[Circuit Diagnostics] Grouped machines:", grouped);

        const newCircuit = [];
        Object.keys(grouped).forEach(cat => {
            newCircuit.push(pickRandom(grouped[cat]));
        });

        newCircuit.sort((a, b) => {
            const idxA = CATEGORY_ORDER.indexOf(a.category);
            const idxB = CATEGORY_ORDER.indexOf(b.category);
            const valA = idxA === -1 ? 999 : idxA;
            const valB = idxB === -1 ? 999 : idxB;
            return valA - valB;
        });

        updateCircuitState(newCircuit, {});
        setView('tracker');
    };

    const startHitEveryMachine = () => {
        clearAllExerciseStatus();
        updateCircuitState([...machines], {});
        setView('tracker');
    };

    const handleMimicToggle = (cat) => {
        setSelectedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    const startMimicCircuit = () => {
        clearAllExerciseStatus();
        const grouped = {};
        machines.forEach(ex => {
            if (!ex.category) return;
            if (!grouped[ex.category]) grouped[ex.category] = [];
            grouped[ex.category].push(ex);
        });
        console.log("[Circuit Diagnostics] Grouped machines:", grouped);

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

        newCircuit.sort((a, b) => {
            const idxA = CATEGORY_ORDER.indexOf(a.category);
            const idxB = CATEGORY_ORDER.indexOf(b.category);
            const valA = idxA === -1 ? 999 : idxA;
            const valB = idxB === -1 ? 999 : idxB;
            return valA - valB;
        });

        updateCircuitState(newCircuit, {});
        setView('tracker');
    };

    const endCircuit = (force = false) => {
        if (force || window.confirm("Are you sure you want to end the current circuit?")) {
            updateCircuitState([], {});
            setView('planner');
        }
    };

    const handleSwap = async (index, targetEx, isNew) => {
        if (isNew) {
            const pin = prompt("Enter Admin PIN to register this custom exercise on the database:");
            if (pin === null) return;
            try {
                await saveExercise(targetEx, pin);
            } catch (e) {
                console.error("Error saving new swap exercise to backend", e);
                alert("Failed to save swap exercise: " + e.message);
                return;
            }
        }

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

    const handleRemoveExerciseFromCircuit = async (exName) => {
        const exObj = exercises.find(e => e.name === exName);
        if (!exObj) return;
        
        // 1. Save metadata to Sheets (setting isCircuit to false)
        const pin = window.prompt("Admin PIN required to modify exercise metadata:");
        if (pin === null) return;
        
        await sheetsPost({
            action: "saveExercise",
            exercise: exObj.name,
            timed: exObj.timed,
            category: exObj.category || "",
            location: exObj.location || "Anywhere",
            isCircuit: false,
            note: exObj.note || "",
            manufacturer: exObj.manufacturer || "",
            modelSeries: exObj.modelSeries || "",
            baseExercise: exObj.baseExercise || "",
            muscleGroups: exObj.muscleGroups || "",
            fileReference: exObj.fileReference || "",
            pin: pin
        });
        
        // 2. Update local state
        const newCircuit = circuit.filter(e => e.name !== exName);
        const newCompletedMap = { ...completedMap };
        delete newCompletedMap[exName];
        updateCircuitState(newCircuit, newCompletedMap);
        updateExerciseInLocalState(exName, { isCircuit: false });
    };

    const handleLogSet = async (ex, logs) => {
        try {
            const entries = await logExerciseSet(ex, logs);
            if (entries) {
                const newMap = { ...completedMap };
                const currentData = newMap[ex.name] || { status: 'active' };
                
                newMap[ex.name] = {
                    status: typeof currentData === 'string' ? currentData : (currentData.status || 'active')
                };
                updateCircuitState(circuit, newMap);

                startRestTimer(parseInt(timerMode, 10));
                return true;
            }
        } catch (e) {
            console.error("Error logging set:", e);
            alert("Failed to log set: " + e.message);
        }
        return false;
    };

    const handleExplicitDone = (exName) => {
        if (!window.confirm(`Are you sure you want to mark "${exName}" as DONE?`)) return;
        const newMap = { ...completedMap };
        const currentData = newMap[exName] || { status: 'active' };
        newMap[exName] = { status: 'done' };

        // Flip any previously skipped exercises back to active
        Object.keys(newMap).forEach(key => {
            if (newMap[key]?.status === 'skipped') {
                newMap[key].status = 'active';
            }
        });

        updateCircuitState(circuit, newMap);
        setExerciseDone(exName);
    };

    const handleSkip = (exName) => {
        if (!window.confirm(`Are you sure you want to SKIP "${exName}"?`)) return;
        const newMap = { ...completedMap };
        const currentData = newMap[exName] || { status: 'active' };
        newMap[exName] = { status: 'skipped' };
        updateCircuitState(circuit, newMap);
        setExerciseSkipped(exName);
    };

    const handleUndo = (exName) => {
        const newMap = { ...completedMap };
        const currentData = newMap[exName] || { status: 'active' };
        newMap[exName] = { status: 'active' };
        updateCircuitState(circuit, newMap);
        resetExerciseStatus(exName);
    };

    const handleDeleteSet = async (exName, setEntries) => {
        const pin = window.prompt("Enter Admin PIN to confirm deletion:");
        if (pin === null) return;

        try {
            for (const entry of setEntries) {
                await deleteHistory({ ...entry, exercise: exName }, pin);
                deleteSetFromLocalHistory(exName, entry);
            }
            const ex = exercises.find(e => e.name === exName);
            if (ex && ex.history) {
                const remainingTodays = ex.history.filter(h => {
                    const isToday = h.date && new Date(h.date).toDateString() === new Date().toDateString();
                    if (!isToday) return false;
                    const isDeleted = setEntries.some(del => del.date === h.date && del.person === h.person && del.reps === h.reps && del.weight === h.weight);
                    return !isDeleted;
                });
                if (remainingTodays.length === 0) {
                    resetExerciseStatus(exName);
                }
            } else {
                resetExerciseStatus(exName);
            }
        } catch (e) {
            console.error("Error deleting set:", e);
            alert("Failed to delete set: " + e.message);
        }
    };

    const handleDeleteHistoryEntry = async (entry) => {
        const pin = window.prompt("Enter Admin PIN to confirm deletion:");
        if (pin === null) return;

        const exName = entry.exercise;
        if (!exName) {
            alert("Exercise name is missing in history entry.");
            return;
        }

        try {
            await deleteHistory(entry, pin);
            deleteSetFromLocalHistory(exName, entry);
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
            <StickyRestBanner />
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
                            <button className="btn-ghost btn-no-translate" style={{ fontSize: 12, border: '1px solid var(--border)' }} onClick={() => setView('full-list')}>
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
                            const lastExName = circuit[circuit.length - 1]?.name;
                            return (
                                <div style={{ textAlign: 'center', padding: 40, color: 'var(--success)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                    <h2>🎉 Circuit Complete!</h2>
                                    <p>Great job finishing the workout.</p>
                                    <button className="btn-success" onClick={() => endCircuit(true)} style={{ marginTop: 20, padding: 12, width: '200px' }}>Finish</button>
                                    {lastExName && (
                                        <button 
                                            className="btn-ghost" 
                                            onClick={() => handleUndo(lastExName)} 
                                            style={{ border: '1px solid var(--border)', padding: 12, width: '200px', color: 'white', fontSize: 13 }}
                                        >
                                            &larr; Undo Last Submission
                                        </button>
                                    )}
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
                                    onRemove={handleRemoveExerciseFromCircuit}
                                />
                                
                                <button 
                                    className="complete-btn" 
                                    onClick={() => endCircuit(false)}
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
