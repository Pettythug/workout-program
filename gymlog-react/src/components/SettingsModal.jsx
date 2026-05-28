import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function SettingsModal({ isOpen, onClose, locations, setLocations }) {
    const { people } = useAppContext();
    const [newPerson, setNewPerson] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('gym_api_url') || '');

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
        const updated = [...people, newPerson.trim()];
        // Note: Full save logic would involve AppContext/GymAPI. 
        // We'll update local storage and notify context if implemented, 
        // but for now we write directly to the local storage used by AppContext.
        localStorage.setItem('gymlog_people', JSON.stringify(updated));
        setNewPerson('');
        alert(`${newPerson.trim()} added. Refresh to see changes.`);
    };

    const handleAddLocation = () => {
        if (!newLocation.trim()) return;
        const updated = [...locations, newLocation.trim()];
        setLocations(updated);
        localStorage.setItem('gymlog_locations', JSON.stringify(updated));
        setNewLocation('');
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
                        {people.map(p => (
                            <div key={p} style={{ background: '#1a1a1a', padding: '6px 10px', borderRadius: 6, fontSize: 12 }}>{p}</div>
                        ))}
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

                <div style={{ marginBottom: 24 }}>
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
