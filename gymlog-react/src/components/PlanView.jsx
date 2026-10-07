import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { matchesLocation } from '../utils/locationHelper';
import ExerciseCard from './ExerciseCard';
import WarmUpCard from './WarmUpCard';
import AccessoryBlock from './AccessoryBlock';
import SettingsModal from './SettingsModal';
import HelpDrawer from './HelpDrawer';
import SessionStatsModal from './SessionStatsModal';
import GuestUpgradeModal from './GuestUpgradeModal';

export default function PlanView() {
    const { 
        exercises, workoutDay, updateWorkoutDay, loading, dailySwaps, 
        locations, activeLocation, updateActiveLocation, exerciseStatus, 
        resetExerciseStatus, clearAllExerciseStatus,
        sessionStartTime, resetSessionTime, completeWorkoutBatch, deviceOwner,
        timerMode, setTimerMode, timerSeconds, timerIsRunning, timerIsCountdown,
        formatTimerTime, toggleTimer, resetTimer, startRestTimer,
        warmUpStatus, selectedWarmUp, resetWarmUp, getDefaultRestForRepRange
    } = useAppContext();
    // Push on odd days (1, 3, 5...), Pull on even days (2, 4, 6...)
    const [overrideSplit, setOverrideSplit] = useState({ day: workoutDay, type: null });
    const workoutType = (overrideSplit.day === workoutDay && overrideSplit.type) 
        ? overrideSplit.type 
        : ((workoutDay % 2 === 1) ? 'Push' : 'Pull');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [view, setView] = useState('tracker'); // 'tracker' | 'full-list'
    const [viewingWarmUp, setViewingWarmUp] = useState(false);
    const [isWorkoutComplete, setIsWorkoutComplete] = useState(() => {
        return localStorage.getItem('gymlog_plan_complete') === 'true';
    });
    const [completedSummary, setCompletedSummary] = useState(() => {
        try {
            const cached = localStorage.getItem('gymlog_plan_last_summary');
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    });



    const [accessoriesList, setAccessoriesList] = useState(() => {
        try {
            const saved = localStorage.getItem('gymlog_session_accessories');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('gymlog_session_accessories', JSON.stringify(accessoriesList));
    }, [accessoriesList]);

    const getRepRange = (day) => {
        const position = ((day - 1) % 16);
        if (position < 4) return '8-12';
        if (position < 8) return '1-3';
        if (position < 12) return '13+';
        return '4-7';
    };

    useEffect(() => {
        if (!timerIsRunning) {
            setTimerMode(getDefaultRestForRepRange(getRepRange(workoutDay)));
        }
    }, [workoutDay]);

    const groupedExercises = useMemo(() => {
        if (!exercises || exercises.length === 0) return {};

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

        return grouped;
    }, [exercises]);

    const plannedExercises = useMemo(() => {
        if (!groupedExercises || Object.keys(groupedExercises).length === 0) return [];

        const availableGroups = Object.values(groupedExercises);

        const daySwaps = dailySwaps[workoutDay] || {};

        const pick = (categories) => {
            let subset = availableGroups.filter(g => {
                const ex = g.variations["Standard"] || Object.values(g.variations)[0];
                return categories.includes(g.category) && matchesLocation(ex.location, activeLocation);
            });
            if (subset.length === 0) {
                subset = availableGroups.filter(g => {
                    const ex = g.variations["Standard"] || Object.values(g.variations)[0];
                    return categories.includes(g.category) && matchesLocation(ex.location, "Anywhere");
                });
            }
            if (subset.length === 0) {
                subset = availableGroups.filter(g => {
                    return categories.includes(g.category);
                });
            }
            if (subset.length === 0) return null;
            
            // Deterministic calculation: daily categories (like Explosive) increment every day,
            // while split-specific categories increment on alternating workout days
            const isDailyCategory = categories.includes('Explosive') || categories.includes('Rotational Core') || categories.includes('Plank Core');
            const dayCycleIndex = isDailyCategory 
                ? Math.max(0, workoutDay - 1) 
                : Math.max(0, Math.floor((workoutDay - 1) / 2));
            const originalPick = subset[dayCycleIndex % subset.length];
            const originalBaseKey = originalPick.baseName.toLowerCase();
            
            let finalPick = originalPick;
            if (daySwaps[originalBaseKey]) {
                const swappedName = daySwaps[originalBaseKey];
                const foundEx = exercises.find(e => e.name.toLowerCase() === swappedName.toLowerCase());
                if (foundEx) {
                    finalPick = {
                        baseName: foundEx.name,
                        category: foundEx.category,
                        variations: { "Standard": foundEx },
                        ex: foundEx
                    };
                } else if (groupedExercises[swappedName.toLowerCase()]) {
                    finalPick = groupedExercises[swappedName.toLowerCase()];
                } else {
                    finalPick = {
                        baseName: swappedName,
                        category: originalPick.category,
                        variations: {
                            "Standard": { name: swappedName, category: originalPick.category, history: [] }
                        },
                        ex: { name: swappedName, category: originalPick.category, history: [] }
                    };
                }
            }

            return {
                ...finalPick,
                originalBaseKey,
                alternatives: subset.filter(g => g.baseName.toLowerCase() !== finalPick.baseName.toLowerCase())
            };
        };

        const pickedGroups = workoutType === 'Push' ? [
            pick(['Explosive']), pick(['Knee Dominant']), pick(['Vertical Push']), pick(['Horizontal Push']), pick(['Rotational Core', 'Plank Core']),
        ] : [
            pick(['Explosive']), pick(['Hip Dominant']), pick(['Vertical Pull']), pick(['Horizontal Pull']), pick(['Plank Core', 'Rotational Core']),
        ];

        return pickedGroups.filter(Boolean);
    }, [groupedExercises, workoutDay, workoutType, dailySwaps, activeLocation]);

    const resolvedAccessories = useMemo(() => {
        if (!accessoriesList || !groupedExercises) return [];
        return accessoriesList.map(item => {
            const baseName = item && item.baseName ? item.baseName : item;
            if (!baseName) return null;
            const baseKey = baseName.toLowerCase();
            return groupedExercises[baseKey] || null;
        }).filter(Boolean);
    }, [groupedExercises, accessoriesList]);

    const handleLogSetSaved = () => {
        startRestTimer(parseInt(timerMode, 10));
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
            setOverrideSplit({ day: workoutDay, type: newType });
        }
    };

    const completeWorkout = () => {
        const endTime = Date.now();
        const startTime = sessionStartTime || (endTime - 45 * 60 * 1000);
        const durationMinutes = Math.max(1, Math.round((endTime - startTime) / 60000));
        const repRange = getRepRange(workoutDay);

        const summary = {
            id: `session_plan_${Date.now()}`,
            date: new Date().toLocaleDateString('en-US'),
            program: 'Plan',
            workoutDay: workoutDay,
            workoutType: workoutType,
            repRange: repRange,
            startTime: new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            durationMinutes: durationMinutes,
            startTimestamp: startTime,
            endTimestamp: endTime
        };

        const owner = deviceOwner || "Brian";
        const ownerLower = owner.toLowerCase();
        const nextDay = workoutDay + 1;
        const calcType = (nextDay % 2 === 1) ? 'Push' : 'Pull';

        const updatedSettings = {
            [`builder_workout_num_${ownerLower}`]: nextDay,
            [`builder_workout_type_${ownerLower}`]: calcType,
            'builder_workout_num': nextDay,
            'builder_workout_type': calcType,
            [`${owner}_Plan_Day`]: nextDay
        };

        completeWorkoutBatch(summary, updatedSettings).then(saved => {
            setCompletedSummary(saved || summary);
            localStorage.setItem('gymlog_plan_last_summary', JSON.stringify(saved || summary));
        });

        setIsWorkoutComplete(true);
        localStorage.setItem('gymlog_plan_complete', 'true');
        if (deviceOwner === 'Guest' || !deviceOwner) {
            setIsUpgradeModalOpen(true);
        }
    };

    const startNextWorkout = () => {
        // 1. Clear global checkmarks
        clearAllExerciseStatus();

        // 2. Progress day (split & exercises automatically derive from workoutDay)
        updateWorkoutDay(workoutDay + 1, true);

        // 4. Reset completion state & session time
        setIsWorkoutComplete(false);
        localStorage.setItem('gymlog_plan_complete', 'false');
        localStorage.removeItem('gymlog_plan_last_summary');
        setCompletedSummary(null);
        resetSessionTime();
        resetWarmUp();
        setViewingWarmUp(false);
        setView('tracker');

        // 5. Clean up accessories
        localStorage.removeItem('gymlog_session_accessories');
        setAccessoriesList([]);
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
            <div className="header" style={{ marginBottom: 16 }}>
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
                if (isWorkoutComplete) {
                    return (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--success)', background: '#111', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                            <div style={{ fontSize: 40 }}>🎉</div>
                            <h2 style={{ fontSize: 22, fontWeight: 'bold' }}>Workout Day Complete!</h2>
                            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Great job finishing all exercises.</p>

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
                                            {completedSummary.repRange}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {(deviceOwner === 'Guest' || !deviceOwner) && (
                                <div style={{ width: '100%', maxWidth: 360, margin: '8px 0' }}>
                                    <GuestUpgradeModal isInline={true} />
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
                                    START NEXT WORKOUT
                                </button>
                                <button className="btn-ghost" onClick={() => {
                                    setIsWorkoutComplete(false);
                                    localStorage.setItem('gymlog_plan_complete', 'false');
                                }} style={{ padding: '8px 16px', fontSize: 11, fontWeight: 'bold', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                                    UNDO COMPLETION
                                </button>
                            </div>
                        </div>
                    );
                }

                const showWarmUp = viewingWarmUp || (warmUpStatus === 'pending');

                let activeIdx = 0;
                while (activeIdx < plannedExercises.length) {
                    const group = plannedExercises[activeIdx];
                    if (!isGroupCompleteOrSkipped(group)) break;
                    activeIdx++;
                }

                if (!showWarmUp && activeIdx >= plannedExercises.length) {
                    return (
                        <>
                            <div style={{ textAlign: 'center', padding: 40, color: 'var(--success)', background: '#111', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                                <div style={{ fontSize: 40 }}>✅</div>
                                <h2 style={{ fontSize: 22, fontWeight: 'bold' }}>All Exercises Done!</h2>
                                <p style={{ color: 'var(--muted)', fontSize: 13 }}>Tap below to officially complete the workout.</p>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <button className="btn-success" onClick={completeWorkout} style={{ padding: '12px 24px', fontWeight: 'bold', fontSize: 14 }}>
                                        Complete Workout
                                    </button>
                                    <button className="btn-ghost btn-no-translate" onClick={() => setView('full-list')} style={{ padding: '12px 24px', fontWeight: 'bold', fontSize: 14, border: '1px solid var(--border)' }}>
                                        📋 VIEW LIST
                                    </button>
                                </div>
                            </div>
                            <AccessoryBlock excludeNames={plannedExercises.map(e => e.baseName)} accessoriesList={resolvedAccessories} setAccessoriesList={setAccessoriesList} onLogSet={handleLogSetSaved} />
                        </>
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
                                <div style={{ fontSize: 18, fontWeight: 'bold', color: showWarmUp ? 'var(--accent)' : 'white' }}>
                                    {showWarmUp ? (
                                        <span>WARM-UP <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>(1 / {plannedExercises.length + 1})</span></span>
                                    ) : (
                                        <span>{activeIdx + 1} / {plannedExercises.length}</span>
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

                        <div id="exerciseList">
                            {showWarmUp ? (
                                <WarmUpCard onAdvance={() => setViewingWarmUp(false)} />
                            ) : (
                                <ExerciseCard 
                                    key={activeIdx} 
                                    group={activeGroup} 
                                    isOpen={true} 
                                    onLogSet={handleLogSetSaved} 
                                />
                            )}
                        </div>

                        <AccessoryBlock excludeNames={plannedExercises.map(e => e.baseName)} accessoriesList={resolvedAccessories} setAccessoriesList={setAccessoriesList} onLogSet={handleLogSetSaved} />

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
                                        const allPending = plannedExercises.every(group => {
                                            const vars = Object.values(group.variations || {});
                                            return vars.every(v => exerciseStatus[v.name] !== 'done' && exerciseStatus[v.name] !== 'skipped');
                                        });
                                        if (allPending) {
                                            resetSessionTime();
                                        }
                                        setViewingWarmUp(true);
                                        setView('tracker'); 
                                    }}
                                >
                                    UNDO
                                </button>
                            )}
                        </div>
                    </div>

                    {plannedExercises.map((group, idx) => {
                        const ex = group.ex || (group.variations && (group.variations["Standard"] || Object.values(group.variations)[0])) || group;
                        const displayName = ex?.name || group.baseName || ("Exercise " + (idx + 1));
                        const variations = Object.values(group.variations || {});
                        const isDone = variations.some(v => exerciseStatus[v.name] === 'done');
                        const isSkipped = variations.some(v => exerciseStatus[v.name] === 'skipped');
                        
                        return (
                            <div 
                                key={idx} 
                                style={{ 
                                    padding: 12, 
                                    background: 'var(--surface)', 
                                    border: '1px solid var(--border)', 
                                    borderRadius: 8, 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    cursor: 'pointer',
                                    opacity: isDone || isSkipped ? 0.6 : 1 
                                }}
                                onClick={() => {
                                    setViewingWarmUp(false);
                                    setView('tracker');
                                }}
                            >
                                <div style={{ fontSize: 14, fontWeight: 'bold' }}>{idx + 1}. {displayName}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ fontSize: 11, color: isDone ? 'var(--success)' : isSkipped ? 'var(--skip)' : 'var(--muted)', fontWeight: 'bold' }}>
                                        {isDone ? 'DONE' : isSkipped ? 'SKIPPED' : 'PENDING'}
                                    </div>
                                    {(isDone || isSkipped) && (
                                        <button 
                                            className="btn-ghost" 
                                            style={{ padding: '4px 10px', fontSize: 10, border: '1px solid var(--border)', color: 'white' }}
                                            onClick={(e) => { 
                                                e.stopPropagation();
                                                resetExerciseStatus(displayName);
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

            <GuestUpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
            />
        </div>
    );
}
