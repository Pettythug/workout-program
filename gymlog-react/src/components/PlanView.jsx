import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import ExerciseCard from './ExerciseCard';
import AccessoryBlock from './AccessoryBlock';
import SettingsModal from './SettingsModal';
import HelpDrawer from './HelpDrawer';

export default function PlanView() {
    const { exercises, workoutDay, updateWorkoutDay, loading, dailySwaps, locations, activeLocation, updateActiveLocation, exerciseStatus, resetExerciseStatus } = useAppContext();
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
            pick(['Explosive']), pick(['Knee Dominant']), pick(['Vertical Push']), pick(['Horizontal Push']), pick(['Core']),
        ] : [
            pick(['Explosive']), pick(['Hip Dominant']), pick(['Vertical Pull']), pick(['Horizontal Pull']), pick(['Core']),
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

    const isGroupCompleteOrSkipped = (group) => {
        const vars = Object.values(group.variations || {});
        return vars.some(v => exerciseStatus[v.name] === 'done' || exerciseStatus[v.name] === 'skipped');
    };

    const prevDoneCountRef = React.useRef(0);

    // Effect to recycle skipped exercises back to active if all are done/skipped OR a new exercise is done
    React.useEffect(() => {
        if (!plannedExercises || plannedExercises.length === 0) return;
        
        let allDoneOrSkipped = true;
        let hasSkipped = false;
        let skippedVariations = [];
        let currentDoneCount = 0;
        
        plannedExercises.forEach(group => {
            const vars = Object.values(group.variations || {});
            const doneOrSkipped = vars.some(v => exerciseStatus[v.name] === 'done' || exerciseStatus[v.name] === 'skipped');
            const skipped = vars.some(v => exerciseStatus[v.name] === 'skipped');
            
            vars.forEach(v => {
                if (exerciseStatus[v.name] === 'done') currentDoneCount++;
            });
            
            if (!doneOrSkipped) allDoneOrSkipped = false;
            if (skipped) {
                hasSkipped = true;
                vars.forEach(v => {
                    if (exerciseStatus[v.name] === 'skipped') {
                        skippedVariations.push(v.name);
                    }
                });
            }
        });

        const justFinishedOne = currentDoneCount > prevDoneCountRef.current;
        prevDoneCountRef.current = currentDoneCount;

        if ((allDoneOrSkipped || justFinishedOne) && hasSkipped) {
            // Reset the skipped ones back to active
            skippedVariations.forEach(varName => {
                resetExerciseStatus(varName);
            });
        }
    }, [plannedExercises, exerciseStatus, resetExerciseStatus]);

    const toggleWorkoutType = () => {
        const newType = workoutType === 'Push' ? 'Pull' : 'Push';
        if (window.confirm(`You are currently viewing a ${workoutType} workout.\n\nDo you want to switch to a ${newType} workout instead?`)) {
            setWorkoutType(newType);
            localStorage.setItem('gymlog_workoutType', newType);
        }
    };

    const completeWorkout = () => {
        // Increment the counters for the groups we just used so they rotate next time
        plannedExercises.forEach(ex => {
            if (ex && ex.rotationKey) {
                const currentIdx = parseInt(localStorage.getItem('gymlog_rotation_' + ex.rotationKey) || '0', 10);
                localStorage.setItem('gymlog_rotation_' + ex.rotationKey, currentIdx + 1);
            }
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
                    return (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--success)', background: '#111', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                            <div style={{ fontSize: 40 }}>🎉</div>
                            <h2 style={{ fontSize: 22, fontWeight: 'bold' }}>Workout Complete!</h2>
                            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Great job finishing all exercises.</p>
                            <button className="btn-success" onClick={completeWorkout} style={{ padding: '12px 24px', fontWeight: 'bold', fontSize: 14 }}>
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

                        <div id="exerciseList">
                            <ExerciseCard 
                                key={activeIdx} 
                                group={activeGroup} 
                                isOpen={true} 
                                onLogSet={handleLogSetSaved} 
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
