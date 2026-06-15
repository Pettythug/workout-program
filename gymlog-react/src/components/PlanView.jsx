import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import ExerciseCard from './ExerciseCard';
import AccessoryBlock from './AccessoryBlock';
import SettingsModal from './SettingsModal';
import HelpDrawer from './HelpDrawer';

export default function PlanView() {
    const { exercises, workoutDay, updateWorkoutDay, loading, dailySwaps, locations, activeLocation, updateActiveLocation } = useAppContext();
    const [workoutType, setWorkoutType] = useState(() => {
        return localStorage.getItem('gymlog_workoutType') || 'Pull';
    });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

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

        const newType = workoutType === 'Push' ? 'Pull' : 'Push';
        setWorkoutType(newType);
        localStorage.setItem('gymlog_workoutType', newType);
        updateWorkoutDay(workoutDay + 1);
    };

    const getRepRange = (day) => {
        const position = ((day - 1) % 16);
        if (position < 4) return '8-12';
        if (position < 8) return '1-3';
        if (position < 12) return '13+';
        return '4-7';
    };

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
    }, [exercises, workoutType, dailySwaps, activeLocation]);

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

            <div className="info-bar" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
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

            <div className="section-label" style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, paddingLeft: 2 }}>Exercises</div>
            
            <div id="exerciseList">
                {plannedExercises.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No exercises found.</div>
                ) : (
                    plannedExercises.map((group, idx) => (
                        <ExerciseCard key={idx} group={group} />
                    ))
                )}
            </div>

            <AccessoryBlock />

            <button 
                className="complete-btn" 
                onClick={completeWorkout}
                style={{ width: '100%', background: 'rgba(249, 115, 22, 0.1)', color: 'var(--accent)', border: '2px solid var(--accent)', borderRadius: 'var(--radius)', padding: 16, fontWeight: 700, cursor: 'pointer', marginTop: 16, letterSpacing: 1, textTransform: 'uppercase' }}
            >
                Complete Workout
            </button>

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
