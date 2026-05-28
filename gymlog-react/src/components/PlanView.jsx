import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import ExerciseCard from './ExerciseCard';

export default function PlanView() {
    const { exercises, workoutDay, updateWorkoutDay, loading } = useAppContext();
    const [workoutType, setWorkoutType] = useState(() => {
        return localStorage.getItem('gymlog_workoutType') || 'Pull';
    });

    const toggleWorkoutType = () => {
        const newType = workoutType === 'Push' ? 'Pull' : 'Push';
        if (window.confirm(`You are currently viewing a ${workoutType} workout.\n\nDo you want to switch to a ${newType} workout instead?`)) {
            setWorkoutType(newType);
            localStorage.setItem('gymlog_workoutType', newType);
        }
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

        const pick = (categories) => {
            const subset = availableGroups.filter(g => categories.includes(g.category));
            if (subset.length === 0) return null;
            // Deterministic pick based on workoutDay to keep it stable
            const idx = workoutDay % subset.length;
            return subset[idx];
        };

        const pickedGroups = workoutType === 'Push' ? [
            pick(['Explosive']), pick(['Knee Dominant']), pick(['Vertical Push']), pick(['Horizontal Push']), pick(['Rotational Core', 'Plank Core']),
        ] : [
            pick(['Explosive']), pick(['Hip Dominant']), pick(['Vertical Pull']), pick(['Horizontal Pull']), pick(['Plank Core', 'Rotational Core']),
        ];

        return pickedGroups.filter(Boolean);
    }, [exercises, workoutDay, workoutType]);

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
                        #{workoutDay} · {workoutType} Day
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
                </div>
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

            <button 
                className="complete-btn" 
                onClick={() => updateWorkoutDay(workoutDay + 1)}
                style={{ width: '100%', background: 'rgba(249, 115, 22, 0.1)', color: 'var(--accent)', border: '2px solid var(--accent)', borderRadius: 'var(--radius)', padding: 16, fontWeight: 700, cursor: 'pointer', marginTop: 16, letterSpacing: 1, textTransform: 'uppercase' }}
            >
                Complete Workout
            </button>
        </div>
    );
}
