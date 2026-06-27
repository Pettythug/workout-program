import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useGymAPI } from '../hooks/useGymAPI';
import WorkoutCard from './WorkoutCard';
import AccessoryBlock from './AccessoryBlock';
import SettingsModal from './SettingsModal';
import HelpDrawer from './HelpDrawer';


export default function PlanView() {
    const { deleteHistory } = useGymAPI();
    const { exercises, workoutDay, updateWorkoutDay, loading, dailySwaps, locations, activeLocation, updateActiveLocation, exerciseStatus, setExerciseDone, setExerciseSkipped, resetExerciseStatus, deleteSetFromLocalHistory } = useAppContext();
    const [workoutType, setWorkoutType] = useState(() => {
        return localStorage.getItem('gymlog_workoutType') || 'Pull';
    });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [view, setView] = useState('tracker'); // 'tracker' | 'full-list'

    const plannedExercises = useMemo(() => {
        if (!exercises || exercises.length === 0) return [];

        const getBaseName = (name) => name.replace(/\s*\((Single|Alt|DB|Cable)\)/i, "").trim();
        const getMode = (name) => {
            if (name.toLowerCase().includes("(single)")) return "Single";
            if (name.toLowerCase().includes("(alt)")) return "Alt";
            return "Standard";
        };

        const grouped = {};
        exercises.forEach(ex => {
            const base = getBaseName(ex.name);
            const baseKey = base.toLowerCase();
            if (!grouped[baseKey]) grouped[baseKey] = { baseName: base, category: ex.category, variations: {} };
            grouped[baseKey].variations[getMode(ex.name)] = ex;
        });

        const availableGroups = Object.values(grouped);

        const daySwaps = dailySwaps[workoutDay] || {};

        const pick = (categories) => {
            const subset = availableGroups.filter(g => {
                const ex = g.variations["Standard"] || Object.values(g.variations)[0];
                const locMatch = activeLocation === "all" || ex.location === "Anywhere" || !ex.location || ex.location === activeLocation;
                return categories.includes(g.category) && locMatch;
            });
            if (subset.length === 0) return null;
            
            // Smart tracking: use a unique counter for each category block instead of workoutDay
            const rotationKey = categories.join('_').replace(/\s/g, '');
            const idx = parseInt(localStorage.getItem('gymlog_rotation_' + rotationKey) || '0', 10);
            
            const originalPick = subset[idx % subset.length];
            const originalBaseKey = originalPick.baseName.toLowerCase();
            
            let finalPick = originalPick;
            if (daySwaps[originalBaseKey]) {
                const swappedKey = daySwaps[originalBaseKey].toLowerCase();
                if (grouped[swappedKey]) {
                    finalPick = grouped[swappedKey];
                } else {
                    // Custom exercise
                    finalPick = {
                        baseName: daySwaps[originalBaseKey],
                        category: originalPick.category,
                        variations: {
                            "Standard": { name: daySwaps[originalBaseKey], category: originalPick.category, history: [] }
                        }
                    };
                }
            }

            return {
                ...finalPick,
                originalBaseKey,
                rotationKey, // Pass this out so we can increment it when the workout completes
                alternatives: subset.filter(g => g.baseName.toLowerCase() !== finalPick.baseName.toLowerCase())
            };
        };

        const pickedGroups = workoutType === 'Push' ? [
            pick(['Explosive']), pick(['Knee Dominant']), pick(['Vertical Push']), pick(['Horizontal Push']), pick(['Rotational Core', 'Plank Core']),
        ] : [
            pick(['Explosive']), pick(['Hip Dominant']), pick(['Vertical Pull']), pick(['Horizontal Pull']), pick(['Plank Core', 'Rotational Core']),
        ];

        return pickedGroups.filter(Boolean);
    }, [exercises, workoutDay, workoutType, dailySwaps, activeLocation]);

    // Timer states
    const [timerMode, setTimerMode] = useState(() => {
        return localStorage.getItem('gym-plan-timer-mode') || 'stopwatch';
    });
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerIsRunning, setTimerIsRunning] = useState(false);
    const [timerIsCountdown, setTimerIsCountdown] = useState(false);

    // Sync timer mode to localStorage and set initial time
    React.useEffect(() => {
        localStorage.setItem('gym-plan-timer-mode', timerMode);
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
    React.useEffect(() => {
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

    const handleLogSetSaved = () => {
        // Auto-start rest timer if a countdown is configured
        const duration = parseInt(timerMode, 10);
        if (!isNaN(duration) && duration > 0) {
            setTimerSeconds(duration);
            setTimerIsCountdown(true);
            setTimerIsRunning(true);
        }
    };

    const handleExplicitDone = (exName) => {
        if (!window.confirm(`Are you sure you want to mark "${exName}" as DONE?`)) return;
        setExerciseDone(exName);

        // Immediate skipped exercise recycling:
        // Reset any exercises in today's rotation that were skipped back to active status
        plannedExercises.forEach(group => {
            Object.values(group.variations || {}).forEach(v => {
                if (exerciseStatus[v.name] === 'skipped') {
                    resetExerciseStatus(v.name);
                }
            });
        });
    };

    const handleSkip = (exName) => {
        if (!window.confirm(`Are you sure you want to SKIP "${exName}"?`)) return;
        setExerciseSkipped(exName);
    };

    const handleUndo = (exName) => {
        resetExerciseStatus(exName);
    };

    const isGroupCompleteOrSkipped = (group) => {
        const vars = Object.values(group.variations || {});
        return vars.some(v => exerciseStatus[v.name] === 'done' || exerciseStatus[v.name] === 'skipped');
    };



    const toggleWorkoutType = () => {
        const newType = workoutType === 'Push' ? 'Pull' : 'Push';
        if (window.confirm(`You are currently viewing a ${workoutType} workout.\n\nDo you want to switch to a ${newType} workout instead?`)) {
            setWorkoutType(newType);
            localStorage.setItem('gymlog_workoutType', newType);
        }
    };

    const completeWorkout = () => {
        if (!window.confirm("Are you sure you want to finish today's workout and advance to the next day?")) return;

        // Increment the counters for the groups we just used so they rotate next time
        plannedExercises.forEach(group => {
            Object.values(group.variations || {}).forEach(v => {
                if (v && v.rotationKey) {
                    const currentIdx = parseInt(localStorage.getItem('gymlog_rotation_' + v.rotationKey) || '0', 10);
                    localStorage.setItem('gymlog_rotation_' + v.rotationKey, currentIdx + 1);
                }
            });
        });

        // Clear exercise status for all variations in today's rotation
        plannedExercises.forEach(group => {
            Object.values(group.variations || {}).forEach(v => {
                resetExerciseStatus(v.name);
            });
        });

        const newType = workoutType === 'Push' ? 'Pull' : 'Push';
        setWorkoutType(newType);
        localStorage.setItem('gymlog_workoutType', newType);
        updateWorkoutDay(workoutDay + 1);
        setView('tracker');
    };

    const getTodaysLoggedSets = () => {
        const logged = [];
        plannedExercises.forEach(group => {
            Object.values(group.variations || {}).forEach(v => {
                if (v.history && v.history.length > 0) {
                    const todays = v.history.filter(h => h.date && new Date(h.date).toDateString() === new Date().toDateString());
                    if (todays.length > 0) {
                        logged.push({ exercise: v, sets: todays });
                    }
                }
            });
        });
        return logged;
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
            alert("Set deleted successfully.");
        } catch (e) {
            console.error("Error deleting history entry:", e);
            alert("Failed to delete history entry: " + e.message);
        }
    };

    const getRepRange = (day) => {
        const position = ((day - 1) % 16);
        if (position < 4) return '8-12';
        if (position < 8) return '1-3';
        if (position < 12) return '13+';
        return '4-7';
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-dot" style={{ color: 'var(--muted)', fontFamily: 'var(--mono)' }}>Loading...</div>
            </div>
        );
    }

    return (
        <div className="main" style={{ paddingBottom: 100 }}>
            <div className="header" style={{ margin: '-16px -16px 16px', position: 'sticky', top: 0, zIndex: 100 }}>
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: 5, color: 'var(--accent)' }}>PLAN</h1>
                    <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 2, fontFamily: 'var(--mono)', marginTop: 3 }}>
                        #{workoutDay} | {workoutType} Day
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                        className={`workout-badge badge-${workoutType.toLowerCase()}`}
                        onClick={toggleWorkoutType}
                        style={{ cursor: 'pointer', border: 'none', background: workoutType === 'Push' ? 'rgba(249, 115, 22, 0.1)' : 'rgba(192, 132, 252, 0.1)', color: workoutType === 'Push' ? 'var(--push)' : 'var(--pull)', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--mono)', fontWeight: 500 }}
                    >
                        {workoutType}
                    </button>
                    <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: 16 }} onClick={() => setIsHelpOpen(true)}>❓</button>
                    <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: 16 }} onClick={() => setIsSettingsOpen(true)}>⚙️</button>
                </div>
            </div>

            {view === 'tracker' && (() => {
                let activeIdx = 0;
                while (activeIdx < plannedExercises.length) {
                    const group = plannedExercises[activeIdx];
                    if (!isGroupCompleteOrSkipped(group)) break;
                    activeIdx++;
                }

                const isWorkoutComplete = activeIdx >= plannedExercises.length;

                if (isWorkoutComplete) {
                    const todaysLogs = getTodaysLoggedSets();
                    return (
                        <div style={{ padding: 16, background: '#111', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ fontSize: 40 }}>🎉</div>
                                <h2 style={{ fontSize: 22, fontWeight: 'bold', color: 'var(--success)' }}>Workout Complete!</h2>
                                <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Great job finishing today's routine.</p>
                            </div>

                            <div style={{ background: '#0c0c0c', borderRadius: 8, padding: 12, border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Today's Logged Sets</div>
                                {todaysLogs.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 11, padding: 12 }}>No sets logged today</div>
                                ) : (
                                    todaysLogs.map((logGroup, idx) => (
                                        <div key={idx} style={{ marginBottom: idx < todaysLogs.length - 1 ? 16 : 0, borderBottom: idx < todaysLogs.length - 1 ? '1px solid #222' : 'none', paddingBottom: idx < todaysLogs.length - 1 ? 12 : 0 }}>
                                            <div style={{ fontSize: 12, fontWeight: 'bold', color: 'var(--accent)', marginBottom: 6 }}>{logGroup.exercise.name}</div>
                                            {logGroup.sets.map((set, sIdx) => (
                                                <div key={sIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, paddingLeft: 8 }}>
                                                    <div style={{ fontSize: 11, color: 'white' }}>
                                                        <span style={{ color: 'var(--muted)' }}>Set {set.setNum || (sIdx + 1)} ({set.person.toUpperCase()}):</span> {set.timed ? `${set.reps}` : `${set.reps}x${set.weight || 0} lbs`}
                                                    </div>
                                                    <button 
                                                        onClick={() => handleDeleteHistoryEntry({ ...set, exercise: logGroup.exercise.name })}
                                                        style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: 13, padding: '0 4px' }}
                                                        title="Delete Set"
                                                    >
                                                        🗑
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ))
                                )}
                            </div>

                            <button className="btn-success" onClick={completeWorkout} style={{ width: '100%', padding: 16, fontWeight: 'bold', fontSize: 14 }}>
                                Finish Workout
                            </button>
                        </div>
                    );
                }

                const activeGroup = plannedExercises[activeIdx];
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ paddingBottom: 16 }}>
                            <select 
                                value={activeLocation} 
                                onChange={e => updateActiveLocation(e.target.value)}
                                style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--muted)', fontSize: 10, fontFamily: 'var(--mono)' }}
                            >
                                <option value="all">ALL LOCATIONS</option>
                                {locations.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                            </select>
                        </div>

                        <div className="info-bar" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 0 }}>
                            <div className="info-item" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 12, textAlign: 'center' }}>
                                <div className="label" style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>Workout</div>
                                <div className="value" style={{ fontSize: 18, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{workoutDay}</div>
                            </div>
                            <div className="info-item" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 12, textAlign: 'center' }}>
                                <div className="label" style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>Reps</div>
                                <div className="value" style={{ fontSize: 18, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{getRepRange(workoutDay)}</div>
                            </div>
                            <div className="info-item" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 12, textAlign: 'center' }}>
                                <div className="label" style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>Sets</div>
                                <div className="value" style={{ fontSize: 18, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>3</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                            <div>
                                <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>Active Exercise</div>
                                <div style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
                                    {plannedExercises.length - plannedExercises.filter(isGroupCompleteOrSkipped).length} / {plannedExercises.length}
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

                        <div id="exerciseList">
                            <WorkoutCard 
                                key={activeIdx} 
                                group={activeGroup} 
                                index={activeIdx}
                                completedStatus={exerciseStatus}
                                isOpen={true} 
                                onLogSetSaved={handleLogSetSaved} 
                                onExplicitDone={handleExplicitDone}
                                onSkip={handleSkip}
                                onUndo={handleUndo}
                                allExercises={exercises}
                                showAdminFeatures={true}
                                showBestPR={true}
                            />
                        </div>

                        <AccessoryBlock />

                        <button 
                            className="complete-btn" 
                            onClick={completeWorkout}
                            style={{ width: '100%', background: 'rgba(249, 115, 22, 0.1)', color: 'var(--accent)', border: '2px solid var(--accent)', borderRadius: 'var(--radius)', padding: 16, fontWeight: 700, cursor: 'pointer', marginTop: 16, letterSpacing: 1, textTransform: 'uppercase' }}
                        >
                            Complete Workout
                        </button>
                    </div>
                );
            })()}

            {view === 'full-list' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <button className="btn-secondary" onClick={() => setView('tracker')} style={{ padding: 12, fontSize: 14 }}>
                        &larr; BACK TO ACTIVE CARD
                    </button>
                    <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, paddingLeft: 4 }}>Full Exercise Order</div>
                    {plannedExercises.map((group, idx) => {
                        const variations = Object.values(group.variations || {});
                        const isDone = variations.some(v => exerciseStatus[v.name] === 'done');
                        const isSkipped = variations.some(v => exerciseStatus[v.name] === 'skipped');
                        
                        return (
                            <div key={idx} style={{ padding: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: isDone || isSkipped ? 0.6 : 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 'bold' }}>{idx + 1}. {group.baseName}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ fontSize: 11, color: isDone ? 'var(--success)' : isSkipped ? 'var(--skip)' : 'var(--muted)', fontWeight: 'bold' }}>
                                        {isDone ? 'DONE' : isSkipped ? 'SKIPPED' : 'PENDING'}
                                    </div>
                                    {(isDone || isSkipped) && (
                                        <button 
                                            className="btn-ghost" 
                                            style={{ padding: '4px 10px', fontSize: 10, border: '1px solid var(--border)', color: 'white' }}
                                            onClick={() => { 
                                                variations.forEach(v => resetExerciseStatus(v.name));
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
