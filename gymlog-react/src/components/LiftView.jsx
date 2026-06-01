import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import ExerciseCard from './ExerciseCard';
import SettingsModal from './SettingsModal';
import HelpDrawer from './HelpDrawer';

export default function LiftView() {
    const { exercises, loading, locations, activeLocation, updateActiveLocation } = useAppContext();
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const getBaseName = (name) => {
        return name.replace(/\s*\((Single|Alt|DB|Cable)\)/i, "").trim();
    };

    const getMode = (name) => {
        if (name.toLowerCase().includes("(single)")) return "Single";
        if (name.toLowerCase().includes("(alt)")) return "Alt";
        return "Standard";
    };

    const filteredAndGrouped = useMemo(() => {
        if (!exercises) return [];

        const filtered = exercises.filter(e => {
            const nameMatch = e.name.toLowerCase().includes(search.toLowerCase());
            const catMatch = !categoryFilter || e.category === categoryFilter;
            const locMatch = activeLocation === "all" 
                || e.location === "Anywhere" 
                || !e.location 
                || e.location === activeLocation;
            return nameMatch && catMatch && locMatch;
        });

        const grouped = {};
        filtered.forEach(ex => {
            const base = getBaseName(ex.name);
            const baseKey = base.toLowerCase();
            if (!grouped[baseKey]) grouped[baseKey] = { baseName: base, variations: {} };
            grouped[baseKey].variations[getMode(ex.name)] = ex;
        });

        return Object.values(grouped).sort((a, b) => a.baseName.localeCompare(b.baseName));
    }, [exercises, search, activeLocation, categoryFilter]);

    const categories = useMemo(() => {
        return [...new Set((exercises || []).map(e => e.category).filter(Boolean))].sort();
    }, [exercises]);

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--muted)', fontFamily: 'var(--mono)' }}>Loading...</div>
            </div>
        );
    }

    return (
        <div className="main" style={{ paddingBottom: 100 }}>
            <div className="header" style={{ margin: '-16px -16px 16px', position: 'sticky', top: 0, zIndex: 100 }}>
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: 5, color: 'var(--accent)' }}>LIFT</h1>
                    <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 2, fontFamily: 'var(--mono)', marginTop: 3 }}>
                        STABILIZATION V4.0
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: 16 }} onClick={() => setIsHelpOpen(true)}>❓</button>
                    <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: 16 }} onClick={() => setIsSettingsOpen(true)}>⚙️</button>
                </div>
            </div>

            <div style={{ padding: '0 0 16px' }}>
                <input 
                    placeholder="Search machines..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ 
                        width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', 
                        borderRadius: 12, padding: '12px 16px', color: 'var(--text)', fontSize: 14, outline: 'none'
                    }}
                />
            </div>

            <div style={{ display: 'flex', gap: 8, paddingBottom: 16 }}>
                <select 
                    value={activeLocation} 
                    onChange={e => updateActiveLocation(e.target.value)}
                    style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--muted)', fontSize: 10, fontFamily: 'var(--mono)' }}
                >
                    <option value="all">ANYWHERE / ALL</option>
                    {locations.filter(l => l !== 'Anywhere').map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                </select>

                <select 
                    value={categoryFilter} 
                    onChange={e => setCategoryFilter(e.target.value)}
                    style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--muted)', fontSize: 10, fontFamily: 'var(--mono)' }}
                >
                    <option value="">ALL CATEGORIES</option>
                    {categories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
            </div>

            <div>
                {filteredAndGrouped.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No exercises found.</div>
                ) : (
                    filteredAndGrouped.map((group, idx) => (
                        <ExerciseCard key={idx} group={group} />
                    ))
                )}
            </div>

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
