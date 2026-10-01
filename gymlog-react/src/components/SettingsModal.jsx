import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useGymAPI } from '../hooks/useGymAPI';
import SessionStatsModal from './SessionStatsModal';
import { createPortal } from 'react-dom';

export default function SettingsModal({ isOpen, onClose }) {
    const { 
        people, exercises, locations, activePeople, deviceOwner, 
        updateDeviceOwner, addPersonToRoster, removePersonFromRoster, 
        addLocationToRoster, removeLocationFromRoster, togglePersonActive, 
        createExerciseMeta, removeExerciseFromLocalState, clearAllExerciseStatus,
        workoutDay, fullBodyWorkoutDay, circuitWorkoutDay,
        updateWorkoutDay, updateFullBodyWorkoutDay, updateCircuitWorkoutDay
    } = useAppContext();
    const { deleteExercise } = useGymAPI();
    const [newPerson, setNewPerson] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [isStatsOpen, setIsStatsOpen] = useState(false);

    const [exName, setExName] = useState('');
    const [exTimed, setExTimed] = useState(false);
    const [exCategory, setExCategory] = useState('');
    const [exLocation, setExLocation] = useState('Anywhere');
    const [exCreateStandard, setExCreateStandard] = useState(true);
    const [exCreateSingle, setExCreateSingle] = useState(false);
    const [exCreateAlt, setExCreateAlt] = useState(false);
    const [exIsCircuit, setExIsCircuit] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [deleteExName, setDeleteExName] = useState('');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const [planDayInput, setPlanDayInput] = useState(workoutDay);
    const [fullBodyDayInput, setFullBodyDayInput] = useState(fullBodyWorkoutDay);
    const [circuitDayInput, setCircuitDayInput] = useState(circuitWorkoutDay);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPlanDayInput(workoutDay);
        setFullBodyDayInput(fullBodyWorkoutDay);
        setCircuitDayInput(circuitWorkoutDay);
    }, [workoutDay, fullBodyWorkoutDay, circuitWorkoutDay]);

    const uniqueCategories = useMemo(() => {
        return [...new Set((exercises || []).map(e => e.category).filter(Boolean))].sort();
    }, [exercises]);

    if (!isOpen) return null;

    const handleAddPerson = () => {
        if (!newPerson.trim()) return;
        const newName = newPerson.trim();
        addPersonToRoster(newName);
        setNewPerson('');
        alert(`${newName} added and syncing to backend.`);
    };

    const handleAddLocation = () => {
        if (!newLocation.trim()) return;
        const newLoc = newLocation.trim();
        addLocationToRoster(newLoc);
        setNewLocation('');
        alert(`${newLoc} added and syncing to backend.`);
    };

    const handleCategoryChange = (e) => {
        if (e.target.value === "ADD_NEW") {
            const newCat = prompt("Enter new category name:");
            if (newCat) {
                setExCategory(newCat);
            }
        } else {
            setExCategory(e.target.value);
        }
    };

    const handleCreateExercise = async () => {
        if (!exName.trim()) {
            alert("Please enter an exercise name.");
            return;
        }
        const pin = prompt("Enter Admin PIN to create this exercise:");
        if (pin === null) return;
        try {
            await createExerciseMeta({
                baseName: exName.trim(),
                timed: exTimed,
                category: exCategory,
                location: exLocation,
                createStandard: exCreateStandard,
                createSingle: exCreateSingle,
                createAlt: exCreateAlt,
                isCircuit: exIsCircuit
            }, pin);
            alert("Exercise(s) created and syncing to backend.");
            setExName('');
            setExTimed(false);
            setExCategory('');
            setExLocation('Anywhere');
            setExCreateStandard(true);
            setExCreateSingle(false);
            setExCreateAlt(false);
            setExIsCircuit(false);
        } catch (err) {
            alert("Failed to create exercise: " + err.message);
        }
    };

    const handleDeleteExercise = async () => {
        if (!deleteExName) {
            alert("Please select an exercise to delete.");
            return;
        }
        const pin = prompt("Enter Admin PIN to delete this exercise:");
        if (pin === null) return;

        try {
            await deleteExercise(deleteExName, pin);
            removeExerciseFromLocalState(deleteExName);
            alert(`Exercise '${deleteExName}' deleted.`);
            setDeleteExName('');
        } catch (err) {
            alert("Failed to delete exercise: " + err.message);
        }
    };

    return createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 12, boxSizing: 'border-box' }}>
            <div style={{ background: '#111', borderRadius: 16, width: '100%', maxWidth: 420, padding: 20, border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', overflowX: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontSize: 16, letterSpacing: 1, color: 'var(--accent)' }}>SETTINGS</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer' }}>&#x2715;</button>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <button
                        className="btn-secondary"
                        onClick={() => setIsStatsOpen(true)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            background: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid #38bdf8',
                            color: '#38bdf8',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        📊 Workout Time & Averages
                    </button>
                </div>

                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', marginBottom: 8 }}>DEVICE OWNER</label>
                    <select 
                        value={deviceOwner}
                        onChange={e => updateDeviceOwner(e.target.value)}
                        style={{ width: '100%', background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: 'white' }}
                    >
                        {people.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8 }}>The device owner is locked as an active participant.</p>
                </div>

                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', marginBottom: 8 }}>ROSTER (PEOPLE)</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                        {people.map(p => {
                            const isActive = activePeople.includes(p);
                            const isOwner = p === deviceOwner;
                            return (
                                <div 
                                    key={p} 
                                    style={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        background: '#1a1a1a', 
                                        padding: '6px 10px', 
                                        borderRadius: 6, 
                                        fontSize: 12, 
                                        border: '1px solid transparent'
                                    }}
                                >
                                    <input 
                                        type="checkbox" 
                                        checked={isActive}
                                        onChange={() => togglePersonActive(p)}
                                        disabled={isOwner}
                                        style={{ cursor: isOwner ? 'not-allowed' : 'pointer', opacity: isOwner ? 0.5 : 1 }}
                                        title={isOwner ? "Device owner must be active" : "Toggle Active for Workout"}
                                    />
                                    <span style={{ flex: 1, opacity: isOwner ? 0.8 : 1 }}>
                                        {p} {isOwner && <span style={{fontSize: 10, color:'var(--accent)', marginLeft: 4}}>(Owner)</span>}
                                    </span>
                                    {!isOwner && (
                                        <button 
                                            onClick={() => {
                                                if(window.confirm(`Are you sure you want to permanently delete ${p} from the roster?`)) {
                                                    removePersonFromRoster(p);
                                                }
                                            }}
                                            style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '0 4px', fontSize: 10, fontWeight: 'bold' }}
                                            title="Delete Person"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ display: 'flex', gap: 8, width: '100%', boxSizing: 'border-box' }}>
                        <input 
                            placeholder="New person name..." 
                            value={newPerson} 
                            onChange={e => setNewPerson(e.target.value)}
                            style={{ flex: 1, minWidth: 0, background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: 'white', boxSizing: 'border-box' }}
                        />
                        <button className="btn-secondary" onClick={handleAddPerson} style={{ flexShrink: 0, padding: "10px 14px" }}>ADD</button>
                    </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', marginBottom: 8 }}>LOCATIONS</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                        {locations.map(l => (
                            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1a1a1a', padding: '6px 10px', borderRadius: 6, fontSize: 12 }}>
                                <span>{l}</span>
                                {l !== "Anywhere" && (
                                    <button 
                                        onClick={() => {
                                            if(window.confirm(`Are you sure you want to permanently delete ${l} from the roster?`)) {
                                                removeLocationFromRoster(l);
                                            }
                                        }}
                                        style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '0 4px', fontSize: 10, fontWeight: 'bold' }}
                                        title="Delete Location"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input 
                            placeholder="New location..." 
                            value={newLocation} 
                            onChange={e => setNewLocation(e.target.value)}
                            style={{ flex: 1, minWidth: 0, background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: 'white', boxSizing: 'border-box' }}
                        />
                        <button className="btn-secondary" onClick={handleAddLocation} style={{ flexShrink: 0, padding: "10px 14px" }}>ADD</button>
                    </div>
                </div>

                <div style={{ marginBottom: 24, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    <div 
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => setIsCreateOpen(!isCreateOpen)}
                    >
                        <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--accent)', margin: 0, cursor: 'pointer' }}>
                            CREATE EXERCISE
                        </label>
                        <span style={{ color: 'var(--muted)' }}>{isCreateOpen ? '▲' : '▼'}</span>
                    </div>
                    
                    {isCreateOpen && (
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <input 
                                placeholder="Base Exercise Name..." 
                                value={exName} 
                                onChange={e => setExName(e.target.value)}
                                style={{ width: '100%', background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: 'white' }}
                            />
                            
                            <div style={{ display: 'flex', gap: 8 }}>
                                <select 
                                    value={exCategory}
                                    onChange={handleCategoryChange}
                                    style={{ flex: 1, minWidth: 0, background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: 'white', boxSizing: 'border-box' }}
                                >
                                    <option value="">Select Category...</option>
                                    {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    {exCategory && !uniqueCategories.includes(exCategory) && <option value={exCategory}>{exCategory}</option>}
                                    <option value="ADD_NEW">+ Add new category...</option>
                                </select>

                                <select 
                                    value={exLocation}
                                    onChange={e => setExLocation(e.target.value)}
                                    style={{ flex: 1, minWidth: 0, background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: 'white', boxSizing: 'border-box' }}
                                >
                                    <option value="Anywhere">Anywhere</option>
                                    {locations.filter(l => l !== 'Anywhere').map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                                <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <input type="checkbox" checked={exTimed} onChange={e => setExTimed(e.target.checked)} />
                                    Timed
                                </label>
                                <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <input type="checkbox" checked={exIsCircuit} onChange={e => setExIsCircuit(e.target.checked)} />
                                    Circuit Eligible
                                </label>
                            </div>
                            <div style={{ marginTop: 8, padding: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Generate Modalities</div>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'white', fontSize: 12, cursor: 'pointer' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={exCreateStandard} 
                                            onChange={e => setExCreateStandard(e.target.checked)}
                                        />
                                        Standard
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'white', fontSize: 12, cursor: 'pointer' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={exCreateAlt} 
                                            onChange={e => setExCreateAlt(e.target.checked)}
                                        />
                                        Alternating
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'white', fontSize: 12, cursor: 'pointer' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={exCreateSingle} 
                                            onChange={e => setExCreateSingle(e.target.checked)}
                                        />
                                        Singles
                                    </label>
                                </div>
                            </div>

                            <button className="btn-success" onClick={handleCreateExercise} style={{ marginTop: 8, width: '100%' }}>
                                CREATE & SYNC
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: 24, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    <div 
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => setIsDeleteOpen(!isDeleteOpen)}
                    >
                        <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--mono)', color: '#ff4444', margin: 0, cursor: 'pointer' }}>
                            DELETE EXERCISE
                        </label>
                        <span style={{ color: 'var(--muted)' }}>{isDeleteOpen ? '▲' : '▼'}</span>
                    </div>
                    
                    {isDeleteOpen && (
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <select 
                                value={deleteExName}
                                onChange={e => setDeleteExName(e.target.value)}
                                style={{ width: '100%', background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: 'white' }}
                            >
                                <option value="">Select Exercise to Delete...</option>
                                {[...exercises].sort((a, b) => a.name.localeCompare(b.name)).map(ex => (
                                    <option key={ex.name} value={ex.name}>{ex.name}</option>
                                ))}
                            </select>

                            <button className="btn-danger" onClick={handleDeleteExercise} style={{ marginTop: 8, width: '100%', background: '#ff4444', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                DELETE EXERCISE
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: 24, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', marginBottom: 8 }}>WORKOUT PROGRESS OVERRIDE</label>
                    <p style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 12 }}>Active Device Owner: <strong style={{ color: 'var(--accent)' }}>{deviceOwner}</strong></p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 13, color: 'white' }}>Plan Workout #</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button 
                                    className="btn-ghost"
                                    onClick={() => updateWorkoutDay(Math.max(1, workoutDay - 1))}
                                    style={{ padding: '4px 12px', border: '1px solid var(--border)', borderRadius: 8, color: 'white', background: '#1a1a1a' }}
                                >-</button>
                                <input 
                                    type="text" 
                                    value={planDayInput} 
                                    onChange={e => {
                                        setPlanDayInput(e.target.value);
                                        const parsed = parseInt(e.target.value, 10);
                                        if (!isNaN(parsed) && parsed >= 1) {
                                            updateWorkoutDay(parsed);
                                        }
                                    }}
                                    onBlur={() => {
                                        const parsed = parseInt(planDayInput, 10);
                                        if (isNaN(parsed) || parsed < 1) {
                                            setPlanDayInput(workoutDay);
                                        } else {
                                            setPlanDayInput(parsed);
                                            updateWorkoutDay(parsed);
                                        }
                                    }}
                                    style={{ width: 60, background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'white', textAlign: 'center' }}
                                />
                                <button 
                                    className="btn-ghost"
                                    onClick={() => updateWorkoutDay(workoutDay + 1)}
                                    style={{ padding: '4px 12px', border: '1px solid var(--border)', borderRadius: 8, color: 'white', background: '#1a1a1a' }}
                                >+</button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 13, color: 'white' }}>Full Body Workout #</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button 
                                    className="btn-ghost"
                                    onClick={() => updateFullBodyWorkoutDay(Math.max(1, fullBodyWorkoutDay - 1))}
                                    style={{ padding: '4px 12px', border: '1px solid var(--border)', borderRadius: 8, color: 'white', background: '#1a1a1a' }}
                                >-</button>
                                <input 
                                    type="text" 
                                    value={fullBodyDayInput} 
                                    onChange={e => {
                                        setFullBodyDayInput(e.target.value);
                                        const parsed = parseInt(e.target.value, 10);
                                        if (!isNaN(parsed) && parsed >= 1) {
                                            updateFullBodyWorkoutDay(parsed);
                                        }
                                    }}
                                    onBlur={() => {
                                        const parsed = parseInt(fullBodyDayInput, 10);
                                        if (isNaN(parsed) || parsed < 1) {
                                            setFullBodyDayInput(fullBodyWorkoutDay);
                                        } else {
                                            setFullBodyDayInput(parsed);
                                            updateFullBodyWorkoutDay(parsed);
                                        }
                                    }}
                                    style={{ width: 60, background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'white', textAlign: 'center' }}
                                />
                                <button 
                                    className="btn-ghost"
                                    onClick={() => updateFullBodyWorkoutDay(fullBodyWorkoutDay + 1)}
                                    style={{ padding: '4px 12px', border: '1px solid var(--border)', borderRadius: 8, color: 'white', background: '#1a1a1a' }}
                                >+</button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 13, color: 'white' }}>Circuit Workout #</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button 
                                    className="btn-ghost"
                                    onClick={() => updateCircuitWorkoutDay(Math.max(1, circuitWorkoutDay - 1))}
                                    style={{ padding: '4px 12px', border: '1px solid var(--border)', borderRadius: 8, color: 'white', background: '#1a1a1a' }}
                                >-</button>
                                <input 
                                    type="text" 
                                    value={circuitDayInput} 
                                    onChange={e => {
                                        setCircuitDayInput(e.target.value);
                                        const parsed = parseInt(e.target.value, 10);
                                        if (!isNaN(parsed) && parsed >= 1) {
                                            updateCircuitWorkoutDay(parsed);
                                        }
                                    }}
                                    onBlur={() => {
                                        const parsed = parseInt(circuitDayInput, 10);
                                        if (isNaN(parsed) || parsed < 1) {
                                            setCircuitDayInput(circuitWorkoutDay);
                                        } else {
                                            setCircuitDayInput(parsed);
                                            updateCircuitWorkoutDay(parsed);
                                        }
                                    }}
                                    style={{ width: 60, background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'white', textAlign: 'center' }}
                                />
                                <button 
                                    className="btn-ghost"
                                    onClick={() => updateCircuitWorkoutDay(circuitWorkoutDay + 1)}
                                    style={{ padding: '4px 12px', border: '1px solid var(--border)', borderRadius: 8, color: 'white', background: '#1a1a1a' }}
                                >+</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: 24, borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button 
                        className="btn-danger" 
                        onClick={() => {
                            if (window.confirm("Are you sure you want to clear all completed/skipped checkmarks for today?")) {
                                clearAllExerciseStatus();
                                alert("Checkmarks cleared.");
                            }
                        }}
                        style={{ width: "100%", padding: 12 }}
                    >
                        ⚠️ RESET CHECKMARKS
                    </button>
                    <button 
                        className="btn-ghost btn-no-translate" 
                        onClick={() => {
                            if (window.confirm("Are you sure you want to clear your stored PIN numbers from this device? You will be prompted to enter them again next time you log a set.")) {
                                Object.keys(localStorage).forEach(key => {
                                    if (key.startsWith('gymlog_pin_')) {
                                        localStorage.removeItem(key);
                                    }
                                });
                                alert("Stored PINs cleared from device.");
                            }
                        }}
                        style={{ width: "100%", padding: 12, border: '1px solid var(--border)', color: 'white' }}
                    >
                        🔑 CLEAR CACHED PINS
                    </button>
                </div>

            </div>

            <SessionStatsModal 
                isOpen={isStatsOpen} 
                onClose={() => setIsStatsOpen(false)} 
            />
        </div>,
        document.body
    );
}
