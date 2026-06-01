import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useGymAPI } from '../hooks/useGymAPI';

export default function SettingsModal({ isOpen, onClose }) {
    const { people, exercises, locations, hiddenPeople, activePeople, addPersonToRoster, addLocationToRoster, togglePersonHidden, togglePersonActive, createExerciseMeta, removeExerciseFromLocalState } = useAppContext();
    const { deleteExercise } = useGymAPI();
    const [newPerson, setNewPerson] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('gym_api_url') || '');

    const [exName, setExName] = useState('');
    const [exTimed, setExTimed] = useState(false);
    const [exCategory, setExCategory] = useState('');
    const [exLocation, setExLocation] = useState('Anywhere');
    const [exCreateSingle, setExCreateSingle] = useState(false);
    const [exCreateAlt, setExCreateAlt] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [deleteExName, setDeleteExName] = useState('');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const uniqueCategories = useMemo(() => {
        return [...new Set((exercises || []).map(e => e.category).filter(Boolean))].sort();
    }, [exercises]);

    if (!isOpen) return null;

    const handleSaveApiUrl = () => {
        if (apiUrl) {
            localStorage.setItem('gym_api_url', apiUrl);
            alert("API URL saved. Reloading...");
            window.location.reload();
        }
    };

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
        await createExerciseMeta({
            baseName: exName.trim(),
            timed: exTimed,
            category: exCategory,
            location: exLocation,
            createSingle: exCreateSingle,
            createAlt: exCreateAlt
        });
        alert("Exercise(s) created and syncing to backend.");
        setExName('');
        setExTimed(false);
        setExCategory('');
        setExLocation('Anywhere');
        setExCreateSingle(false);
        setExCreateAlt(false);
    };

    const handleDeleteExercise = async () => {
        if (!deleteExName) {
            alert("Please select an exercise to delete.");
            return;
        }
        const pin = prompt("Enter Admin PIN to delete this exercise:");
        if (pin !== "5050") {
            alert("Invalid PIN.");
            return;
        }

        try {
            await deleteExercise(deleteExName);
            removeExerciseFromLocalState(deleteExName);
            alert(`Exercise '${deleteExName}' deleted.`);
            setDeleteExName('');
        } catch (err) {
            alert("Failed to delete exercise: " + err.message);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div style={{ background: '#111', borderRadius: 16, width: '100%', maxWidth: 400, padding: 24, border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontSize: 16, letterSpacing: 1, color: 'var(--accent)' }}>SETTINGS</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer' }}>&#x2715;</button>
                </div>

                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', marginBottom: 8 }}>ROSTER (PEOPLE)</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                        {people.map(p => {
                            const isHidden = hiddenPeople.includes(p);
                            const isActive = activePeople.includes(p);
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
                                        opacity: isHidden ? 0.5 : 1,
                                        border: isHidden ? '1px solid #333' : '1px solid transparent'
                                    }}
                                >
                                    <input 
                                        type="checkbox" 
                                        checked={isActive}
                                        onChange={() => togglePersonActive(p)}
                                        style={{ cursor: 'pointer' }}
                                        title="Toggle Active for Workout"
                                    />
                                    <span
                                        onClick={() => togglePersonHidden(p)}
                                        style={{ cursor: 'pointer', textDecoration: isHidden ? 'line-through' : 'none' }}
                                        title="Click to hide/show from roster"
                                    >
                                        {p}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input 
                            placeholder="New person name..." 
                            value={newPerson} 
                            onChange={e => setNewPerson(e.target.value)}
                            style={{ flex: 1, background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: 'white' }}
                        />
                        <button className="btn-secondary" onClick={handleAddPerson}>ADD</button>
                    </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', marginBottom: 8 }}>LOCATIONS</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                        {locations.map(l => (
                            <div key={l} style={{ background: '#1a1a1a', padding: '6px 10px', borderRadius: 6, fontSize: 12 }}>{l}</div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input 
                            placeholder="New location..." 
                            value={newLocation} 
                            onChange={e => setNewLocation(e.target.value)}
                            style={{ flex: 1, background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: 'white' }}
                        />
                        <button className="btn-secondary" onClick={handleAddLocation}>ADD</button>
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
                                    style={{ flex: 1, background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: 'white' }}
                                >
                                    <option value="">Select Category...</option>
                                    {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    {exCategory && !uniqueCategories.includes(exCategory) && <option value={exCategory}>{exCategory}</option>}
                                    <option value="ADD_NEW">+ Add new category...</option>
                                </select>

                                <select 
                                    value={exLocation}
                                    onChange={e => setExLocation(e.target.value)}
                                    style={{ flex: 1, background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: 'white' }}
                                >
                                    <option value="Anywhere">Anywhere</option>
                                    {locations.filter(l => l !== 'Anywhere').map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <input type="checkbox" checked={exTimed} onChange={e => setExTimed(e.target.checked)} />
                                    Timed
                                </label>
                                <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <input type="checkbox" checked={exCreateSingle} onChange={e => setExCreateSingle(e.target.checked)} />
                                    Create (Single)
                                </label>
                                <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <input type="checkbox" checked={exCreateAlt} onChange={e => setExCreateAlt(e.target.checked)} />
                                    Create (Alt)
                                </label>
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
                    <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', marginBottom: 8 }}>API SYNC URL</label>
                    <input 
                        placeholder="https://script.google.com/.../exec" 
                        value={apiUrl} 
                        onChange={e => setApiUrl(e.target.value)}
                        style={{ width: '100%', background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: 'white', marginBottom: 8 }}
                    />
                    <button className="btn-success" style={{ width: '100%' }} onClick={handleSaveApiUrl}>SAVE URL</button>
                </div>

            </div>
        </div>
    );
}
