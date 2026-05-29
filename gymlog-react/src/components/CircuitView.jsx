import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';

export default function CircuitView() {
    const { exercises, people, activePeople, loading } = useAppContext();
    
    const [view, setView] = useState('planner'); // 'planner' | 'mimic-setup' | 'tracker'
    
    // Circuit states synced to 'gym-circuit-active'
    const [circuitState, setCircuitState] = useState(() => {
        const cached = localStorage.getItem('gym-circuit-active');
        return cached ? JSON.parse(cached) : { circuit: [], completedMap: {} };
    });
    const circuit = circuitState.circuit || [];
    const completedMap = circuitState.completedMap || {};

    // Roster state
    const [showRosterModal, setShowRosterModal] = useState(false);
    const [circuitPeople, setCircuitPeople] = useState(activePeople);

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

    const uniqueCategories = useMemo(() => {
        return [...new Set((exercises || []).map(e => e.category).filter(Boolean))].sort();
    }, [exercises]);

    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const startFullBodyCircuit = () => {
        const grouped = {};
        exercises.forEach(ex => {
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
        updateCircuitState([...exercises], {});
        setView('tracker');
    };

    const handleMimicToggle = (cat) => {
        setSelectedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    const startMimicCircuit = () => {
        const grouped = {};
        exercises.forEach(ex => {
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

    const toggleCircuitPerson = (person) => {
        setCircuitPeople(prev => {
            if (prev.includes(person)) return prev.filter(p => p !== person);
            return [...prev, person];
        });
    };

    if (loading) {
        return <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>;
    }

    return (
        <div style={{ padding: '20px', paddingBottom: '100px' }}>
            {/* Header / Modal toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 20, color: 'var(--accent)' }}>Circuit Training</h2>
                <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setShowRosterModal(true)}>
                    ROSTER ({circuitPeople.length})
                </button>
            </div>

            {/* Roster Modal */}
            {showRosterModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <div style={{ background: '#111', borderRadius: 16, width: '100%', maxWidth: 350, padding: 24, border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ margin: 0, fontSize: 16, color: 'var(--accent)' }}>CIRCUIT ROSTER</h3>
                            <button onClick={() => setShowRosterModal(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer' }}>&#x2715;</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {people.map(p => (
                                <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16 }}>
                                    <input 
                                        type="checkbox" 
                                        style={{ width: 20, height: 20 }}
                                        checked={circuitPeople.includes(p)} 
                                        onChange={() => toggleCircuitPerson(p)} 
                                    />
                                    {p}
                                </label>
                            ))}
                        </div>
                        <button className="btn-success" style={{ width: '100%', marginTop: 24 }} onClick={() => setShowRosterModal(false)}>DONE</button>
                    </div>
                </div>
            )}

            {/* View Switching */}
            {view === 'planner' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {circuit.length > 0 && (
                        <button className="btn-success" style={{ padding: 16, fontSize: 16, fontWeight: 'bold' }} onClick={() => setView('tracker')}>
                            RESUME ACTIVE CIRCUIT
                        </button>
                    )}
                    
                    <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', marginTop: 16, marginBottom: 8, letterSpacing: 1 }}>Select Circuit Mode</div>
                    
                    <button className="btn-secondary" style={{ padding: 16, fontSize: 16, textAlign: 'left' }} onClick={startFullBodyCircuit}>
                        <div>⚡ Full Body Circuit</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 'normal', marginTop: 4 }}>Randomly picks 1 machine for each category</div>
                    </button>
                    
                    <button className="btn-secondary" style={{ padding: 16, fontSize: 16, textAlign: 'left' }} onClick={() => setView('mimic-setup')}>
                        <div>🎯 Plan Exercise Mimic</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 'normal', marginTop: 4 }}>Select categories and randomly generate</div>
                    </button>

                    <button className="btn-secondary" style={{ padding: 16, fontSize: 16, textAlign: 'left' }} onClick={startHitEveryMachine}>
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
                            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>Remaining</div>
                            <div style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
                                {circuit.length - Object.keys(completedMap).length} / {circuit.length}
                            </div>
                        </div>
                        <button className="btn-ghost" style={{ color: 'var(--skip)', borderColor: 'var(--skip)' }} onClick={endCircuit}>
                            END CIRCUIT
                        </button>
                    </div>

                    {circuit.map((ex, idx) => {
                        const isDone = completedMap[ex.name] === 'done';
                        const isSkipped = completedMap[ex.name] === 'skipped';
                        
                        return (
                            <div key={idx} style={{ 
                                background: '#111', 
                                border: `1px solid ${isDone ? 'var(--success)' : isSkipped ? 'var(--skip)' : 'var(--border)'}`, 
                                borderRadius: 12, 
                                padding: 16,
                                opacity: isDone || isSkipped ? 0.6 : 1
                            }}>
                                <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', textTransform: 'uppercase', marginBottom: 4 }}>
                                    {ex.category || 'Uncategorized'}
                                </div>
                                <div style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>{ex.name}</div>
                                
                                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                                    {/* Placeholder for Story 5.3 Inputs */}
                                    <div style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>
                                        (Inputs and Sync to be implemented in Story 5.3)
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
