/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useGymAPI } from '../hooks/useGymAPI';
import CircuitCard from './CircuitCard';
import WarmUpCard from './WarmUpCard';
import SessionStatsModal from './SessionStatsModal';
import SettingsModal from './SettingsModal';
import HelpDrawer from './HelpDrawer';

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
        formatTimerTime, toggleTimer, resetTimer, startRestTimer,
        sessionStartTime, startSession, resetSessionTime, saveCompletedSession,
        warmUpStatus, selectedWarmUp, resetWarmUp, getDefaultRestForRepRange,
        circuitWorkoutDay, updateCircuitWorkoutDay
    } = useAppContext();
    
    const navigate = useNavigate();
    const [view, setView] = useState('planner'); // 'planner' | 'mimic-setup' | 'tracker' | 'full-list'
    
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    const [viewingWarmUp, setViewingWarmUp] = useState(false);

    const [isWorkoutComplete, setIsWorkoutComplete] = useState(() => {
        return localStorage.getItem('gymlog_circuit_complete') === 'true';
    });
    const [completedSummary, setCompletedSummary] = useState(() => {
        const cached = localStorage.getItem('gymlog_circuit_last_summary');
        return cached ? JSON.parse(cached) : null;
    });

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

    const getRepRange = (day) => {
        const position = ((day - 1) % 16);
        if (position < 4) return '8-12';
        if (position < 8) return '1-3';
        if (position < 12) return '13+';
        return '4-7';
    };

    useEffect(() => {
        localStorage.setItem('gym-circuit-active', JSON.stringify(circuitState));
    }, [circuitState]);

    useEffect(() => {
        if (!timerIsRunning) {
            setTimerMode(getDefaultRestForRepRange(getRepRange(circuitWorkoutDay)));
        }
    }, [circuitWorkoutDay]);

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

    const formatDate = (ts) => {
        const d = new Date(ts);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const formatTime = (ts) => {
        const d = new Date(ts);
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');
        return `${hh}:${min}:${ss}`;
    };

    const startFullBodyCircuit = () => {
        clearAllExerciseStatus();
        setIsWorkoutComplete(false);
        localStorage.setItem('gymlog_circuit_complete', 'false');
        localStorage.removeItem('gymlog_circuit_last_summary');
        setCompletedSummary(null);
        setViewingWarmUp(false);
        if (!sessionStartTime) {
            startSession();
        }

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
        setIsWorkoutComplete(false);
        localStorage.setItem('gymlog_circuit_complete', 'false');
        localStorage.removeItem('gymlog_circuit_last_summary');
        setCompletedSummary(null);
        setViewingWarmUp(false);
        if (!sessionStartTime) {
            startSession();
        }

        updateCircuitState([...machines], {});
        setView('tracker');
    };

    const handleMimicToggle = (cat) => {
        setSelectedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    const startMimicCircuit = () => {
        clearAllExerciseStatus();
        setIsWorkoutComplete(false);
        localStorage.setItem('gymlog_circuit_complete', 'false');
        localStorage.removeItem('gymlog_circuit_last_summary');
        setCompletedSummary(null);
        setViewingWarmUp(false);
        if (!sessionStartTime) {
            startSession();
        }

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
            setIsWorkoutComplete(false);
            localStorage.setItem('gymlog_circuit_complete', 'false');
            localStorage.removeItem('gymlog_circuit_last_summary');
            setCompletedSummary(null);
            resetSessionTime();
            resetWarmUp();
            setViewingWarmUp(false);
        }
    };

    const completeWorkout = () => {
        const endTime = Date.now();
        const startTime = sessionStartTime || (endTime - 30 * 60 * 1000);
        const durationMinutes = Math.max(1, Math.round((endTime - startTime) / 60000));

        const summary = {
            id: `Circuit_${formatDate(startTime)}_${formatTime(startTime)}`,
            date: new Date().toLocaleDateString('en-US'),
            program: 'Circuit',
            workoutDay: circuitWorkoutDay,
            workoutType: 'Circuit Training',
            repRange: getRepRange(circuitWorkoutDay),
            startTime: new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            durationMinutes: durationMinutes,
            startTimestamp: startTime,
            endTimestamp: endTime
        };

        const saved = saveCompletedSession(summary);
        setCompletedSummary(saved || summary);
        localStorage.setItem('gymlog_circuit_last_summary', JSON.stringify(saved || summary));

        setIsWorkoutComplete(true);
        localStorage.setItem('gymlog_circuit_complete', 'true');
    };

    const startNextWorkout = () => {
        const nextDay = (circuitWorkoutDay % 16) + 1;
        updateCircuitWorkoutDay(nextDay);
        
        updateCircuitState([], {});
        clearAllExerciseStatus();
        setIsWorkoutComplete(false);
        localStorage.setItem('gymlog_circuit_complete', 'false');
        localStorage.removeItem('gymlog_circuit_last_summary');
        setCompletedSummary(null);
        resetSessionTime();
        resetWarmUp();
        setViewingWarmUp(false);
        setView('planner');
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
        newMap[exName] = { status: 'skipped' };
        updateCircuitState(circuit, newMap);
        setExerciseSkipped(exName);
    };

    const handleUndo = (exName) => {
        const newMap = { ...completedMap };
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

    if (isWorkoutComplete) {
        return (
            <div style={{ padding: '20px', paddingBottom: '100px' }}>
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--success)', background: '#111', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <div style={{ fontSize: 40 }}>🎉</div>
                    <h2 style={{ fontSize: 22, fontWeight: 'bold' }}>Circuit Complete!</h2>
                    <p style={{ color: 'var(--muted)', fontSize: 13 }}>Great job finishing the circuit workout.</p>

                    {completedSummary && (
                        <div style={{
                            width: '100%',
                            maxWidth: 320,
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 10,
                            padding: '16px',
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                                <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>Total Time</span>
                                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>
                                    {completedSummary.durationMinutes} mins
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>Time Span</span>
                                <span style={{ fontSize: 11, color: 'white', fontFamily: 'var(--mono)' }}>
                                    {completedSummary.startTime} • {completedSummary.endTime}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>Rep Range</span>
                                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>
                                    {completedSummary.repRange || '13+'}
                                </span>
                            </div>
                        </div>
                    )}

                    <button 
                        className="btn-secondary" 
                        onClick={() => setIsStatsOpen(true)}
                        style={{
                            padding: '10px 18px',
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: 'var(--mono)',
                            border: '1px solid #38bdf8',
                            color: '#38bdf8',
                            background: 'rgba(56, 189, 248, 0.1)',
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            cursor: 'pointer'
                        }}
                    >
                        📊 VIEW TIME STATS & AVERAGES
                    </button>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: '240px' }}>
                        <button className="btn-success" onClick={startNextWorkout} style={{ padding: '12px 24px', fontWeight: 'bold', fontSize: 14, width: '100%' }}>
                            START NEW CIRCUIT
                        </button>
                        <button className="btn-ghost" onClick={() => {
                            setIsWorkoutComplete(false);
                            localStorage.setItem('gymlog_circuit_complete', 'false');
                        }} style={{ padding: '8px 16px', fontSize: 11, fontWeight: 'bold', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                            UNDO COMPLETION
                        </button>
                    </div>
                </div>

                <SessionStatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
                <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
                <HelpDrawer showHelp={isHelpOpen} setShowHelp={setIsHelpOpen} />
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', paddingBottom: '100px' }}>
            {/* Header / Modal toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 20, color: 'var(--accent)' }}>Circuit Training</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: 16 }} onClick={() => setIsStatsOpen(true)} title="Session Stats">📊</button>
                    <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: 16 }} onClick={() => setIsHelpOpen(true)} title="Help">❓</button>
                    <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: 16 }} onClick={() => setIsSettingsOpen(true)} title="Settings">⚙️</button>
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
                    {(() => {
                        const showWarmUp = viewingWarmUp || (warmUpStatus === 'pending');

                        let activeIdx = 0;
                        while (activeIdx < circuit.length) {
                            const ex = circuit[activeIdx];
                            const s = completedMap[ex.name];
                            const status = typeof s === 'string' ? s : s?.status;
                            if (status !== 'done' && status !== 'skipped') break;
                            activeIdx++;
                        }

                        return (
                            <>
                                <div className="info-bar" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                                    <div className="info-item" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 12, textAlign: 'center' }}>
                                        <div className="label" style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>Workout</div>
                                        <div className="value" style={{ fontSize: 18, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{circuitWorkoutDay}</div>
                                    </div>
                                    <div className="info-item" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 12, textAlign: 'center' }}>
                                        <div className="label" style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>Reps</div>
                                        <div className="value" style={{ fontSize: 18, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{getRepRange(circuitWorkoutDay)}</div>
                                    </div>
                                    <div className="info-item" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 12, textAlign: 'center' }}>
                                        <div className="label" style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>Rounds</div>
                                        <div className="value" style={{ fontSize: 18, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>1</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                                    <div>
                                        <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>Active Circuit</div>
                                        <div style={{ fontSize: 18, fontWeight: 'bold', color: showWarmUp ? 'var(--accent)' : 'white' }}>
                                            {showWarmUp ? (
                                                <span>WARM-UP <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>(Step #0 / {circuit.length})</span></span>
                                            ) : (
                                                <span>{activeIdx + 1} / {circuit.length}</span>
                                            )}
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
                                            <option value="45">⏳ 45S REST</option>
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
                                    if (!showWarmUp && activeIdx >= circuit.length) {
                                        const lastExName = circuit[circuit.length - 1]?.name;
                                        return (
                                            <div style={{ textAlign: 'center', padding: 40, color: 'var(--success)', background: '#111', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                                                <div style={{ fontSize: 40 }}>🎉</div>
                                                <h2 style={{ fontSize: 22, fontWeight: 'bold' }}>All Circuit Exercises Complete!</h2>
                                                <p style={{ color: 'var(--muted)', fontSize: 13 }}>Tap below to officially complete the workout and log your session time.</p>
                                                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                                                    <button className="btn-success" onClick={completeWorkout} style={{ padding: '12px 24px', fontWeight: 'bold', fontSize: 14 }}>
                                                        Complete Workout
                                                    </button>
                                                    <button className="btn-ghost btn-no-translate" onClick={() => setView('full-list')} style={{ padding: '12px 24px', fontWeight: 'bold', fontSize: 14, border: '1px solid var(--border)' }}>
                                                        📋 VIEW LIST
                                                    </button>
                                                </div>
                                                {lastExName && (
                                                    <button 
                                                        className="btn-ghost" 
                                                        onClick={() => handleUndo(lastExName)} 
                                                        style={{ border: '1px solid var(--border)', padding: '8px 16px', color: 'var(--muted)', fontSize: 12, marginTop: 8 }}
                                                    >
                                                        &larr; Undo Last Submission
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    }

                                    if (showWarmUp) {
                                        return (
                                            <div id="exerciseList">
                                                <WarmUpCard onAdvance={() => setViewingWarmUp(false)} />
                                            </div>
                                        );
                                    }

                                    const ex = circuit[activeIdx];
                                    const upToDateEx = exercises.find(e => e.name === ex.name) || ex;

                                    const wrappedHandleLogSet = async (exObj, logs) => {
                                        const success = await handleLogSet(exObj, logs);
                                        if (success) {
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
                                                onClick={completeWorkout}
                                                style={{ width: '100%', background: 'rgba(249, 115, 22, 0.1)', color: 'var(--accent)', border: '2px solid var(--accent)', borderRadius: 'var(--radius)', padding: 16, fontWeight: 700, cursor: 'pointer', marginTop: 16, letterSpacing: 1, textTransform: 'uppercase' }}
                                            >
                                                Complete Workout
                                            </button>
                                            <button 
                                                className="btn-ghost" 
                                                onClick={() => endCircuit(false)}
                                                style={{ width: '100%', color: 'var(--skip)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: 10, fontSize: 12, fontWeight: 600, marginTop: 8 }}
                                            >
                                                End Circuit (Abandon)
                                            </button>
                                        </>
                                    );
                                })()}
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

                    {/* Pre-Workout Warm-Up Item */}
                    <div 
                        style={{ 
                            padding: 12, 
                            background: 'var(--surface)', 
                            border: '1px solid var(--border)', 
                            borderRadius: 8, 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            cursor: 'pointer',
                            opacity: warmUpStatus === 'completed' || warmUpStatus === 'skipped' ? 0.7 : 1 
                        }}
                        onClick={() => {
                            setViewingWarmUp(true);
                            setView('tracker');
                        }}
                    >
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 'bold', color: 'var(--accent)' }}>
                                🔥 Pre-Workout Warm-Up
                            </div>
                            {selectedWarmUp && (
                                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                                    {selectedWarmUp}
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ 
                                fontSize: 11, 
                                fontWeight: 'bold', 
                                color: warmUpStatus === 'completed' ? 'var(--success)' : warmUpStatus === 'skipped' ? 'var(--skip)' : 'var(--muted)' 
                            }}>
                                {warmUpStatus === 'completed' ? '✓ DONE' : warmUpStatus === 'skipped' ? 'SKIPPED' : 'PENDING'}
                            </div>
                            {(warmUpStatus === 'completed' || warmUpStatus === 'skipped') && (
                                <button 
                                    className="btn-ghost" 
                                    style={{ padding: '4px 10px', fontSize: 10, border: '1px solid var(--border)', color: 'white' }}
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        resetWarmUp();
                                        setViewingWarmUp(true);
                                        setView('tracker'); 
                                    }}
                                >
                                    UNDO
                                </button>
                            )}
                        </div>
                    </div>

                    {circuit.map((ex, idx) => {
                        const s = completedMap[ex.name];
                        const status = typeof s === 'string' ? s : s?.status;
                        const isCompletedOrSkipped = status === 'done' || status === 'skipped';
                        
                        return (
                            <div 
                                key={idx} 
                                style={{ padding: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: isCompletedOrSkipped ? 0.6 : 1, cursor: 'pointer' }}
                                onClick={() => {
                                    setViewingWarmUp(false);
                                    setView('tracker');
                                }}
                            >
                                <div style={{ fontSize: 14, fontWeight: 'bold' }}>{idx + 1}. {ex.name}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ fontSize: 11, color: status === 'done' ? 'var(--success)' : status === 'skipped' ? 'var(--skip)' : 'var(--muted)', fontWeight: 'bold' }}>
                                        {status === 'done' ? 'DONE' : status === 'skipped' ? 'SKIPPED' : 'PENDING'}
                                    </div>
                                    {isCompletedOrSkipped && (
                                        <button 
                                            className="btn-ghost" 
                                            style={{ padding: '4px 10px', fontSize: 10, border: '1px solid var(--border)', color: 'white' }}
                                            onClick={(e) => { 
                                                e.stopPropagation();
                                                handleUndo(ex.name); 
                                                setViewingWarmUp(false);
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

            <SessionStatsModal 
                isOpen={isStatsOpen} 
                onClose={() => setIsStatsOpen(false)} 
            />

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
