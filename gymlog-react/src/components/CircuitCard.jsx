import React, { useState } from 'react';
import { useTargetLock } from '../hooks/useTargetLock';

const PersonRow = ({ person, ex, input, updateInput }) => {
    const key = person.toLowerCase();
    const { targetRanges } = useTargetLock(ex, key);

    return (
        <div style={{ background: '#1a1a1a', padding: 8, borderRadius: 8, marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 'bold', color: 'var(--accent)' }}>{person.toUpperCase()}</span>
                <div style={{ display: 'flex', gap: 4, fontSize: 10 }}>
                    {targetRanges.map((tr, idx) => (
                        <React.Fragment key={tr.key}>
                            <span style={tr.isActive ? { color: '#ff8c00', fontWeight: 'bold' } : { color: 'var(--muted)' }}>
                                {tr.label} ({tr.bestValue})
                            </span>
                            {idx < targetRanges.length - 1 && <span style={{ color: 'var(--muted)' }}>@</span>}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
                {ex.timed ? (
                    <input 
                        placeholder="mm:ss" 
                        value={input.duration || ""} 
                        onChange={e => updateInput(key, "duration", e.target.value)}
                        style={{ flex: 1, background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'white', textAlign: 'center' }}
                    />
                ) : (
                    <>
                        <input 
                            placeholder="Reps" 
                            type="number"
                            value={input.reps || ""} 
                            onChange={e => updateInput(key, "reps", e.target.value)}
                            style={{ flex: 1, background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'white', textAlign: 'center' }}
                        />
                        <input 
                            placeholder="Lbs" 
                            type="number"
                            value={input.weight || ""} 
                            onChange={e => updateInput(key, "weight", e.target.value)}
                            style={{ flex: 1, background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'white', textAlign: 'center' }}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default function CircuitCard({ ex, index, completedStatus, activePeople, onLogSet, onExplicitDone, onSkip, onUndo }) {
    const status = typeof completedStatus === 'string' ? completedStatus : (completedStatus?.status || 'active');
    const sets = typeof completedStatus === 'object' ? (completedStatus?.sets || []) : [];

    const isDone = status === 'done';
    const isSkipped = status === 'skipped';

    const [inputs, setInputs] = useState(() => {
        const initial = {};
        activePeople.forEach(p => {
            initial[p.toLowerCase()] = { reps: "", weight: "", duration: "" };
        });
        return initial;
    });

    const [note, setNote] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const updateInput = (personKey, field, value) => {
        setInputs(prev => ({
            ...prev,
            [personKey]: { ...prev[personKey], [field]: value }
        }));
    };

    const toggleNotePhrase = (phrase) => {
        setNote(prev => {
            if (prev.includes(phrase)) {
                return prev.replace(phrase, "").replace(/,\s*,/g, ",").replace(/(^,)|(,$)/g, "").trim();
            } else {
                return prev ? `${prev}, ${phrase}` : phrase;
            }
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        const logData = {};
        activePeople.forEach(p => {
            const key = p.toLowerCase();
            logData[key] = { ...inputs[key], note };
        });

        const success = await onLogSet(ex, logData);
        if (success) {
            const cleared = {};
            activePeople.forEach(p => {
                cleared[p.toLowerCase()] = { reps: "", weight: "", duration: "" };
            });
            setInputs(cleared);
            setNote("");
        }
        setIsSaving(false);
    };

    return (
        <div style={{ 
            background: '#111', 
            border: `1px solid ${isDone ? 'var(--success)' : isSkipped ? 'var(--skip)' : 'var(--border)'}`, 
            borderRadius: 12, 
            padding: 16,
            opacity: isDone || isSkipped ? 0.6 : 1
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', textTransform: 'uppercase', marginBottom: 4 }}>
                        {index + 1}. {ex.category || 'Uncategorized'}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>{ex.name}</div>
                </div>
            </div>

            {(isDone || isSkipped) ? (
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a', padding: 12, borderRadius: 8 }}>
                    <div style={{ fontWeight: 'bold', color: isDone ? 'var(--success)' : 'var(--skip)' }}>
                        {isDone ? 'COMPLETED' : 'SKIPPED'}
                    </div>
                    <button className="btn-ghost" onClick={() => onUndo(ex.name)}>UNDO</button>
                </div>
            ) : (
                <div style={{ marginTop: 16 }}>
                    {activePeople.map(p => (
                        <PersonRow key={p} person={p} ex={ex} input={inputs[p.toLowerCase()] || {}} updateInput={updateInput} />
                    ))}

                    <div style={{ marginTop: 12, marginBottom: 12 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <input type="checkbox" checked={note.includes("Single Leg")} onChange={() => toggleNotePhrase("Single Leg")} />
                                Single Leg
                            </label>
                            <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <input type="checkbox" checked={note.includes("Alternating")} onChange={() => toggleNotePhrase("Alternating")} />
                                Alternating
                            </label>
                        </div>
                        <input 
                            placeholder="Notes..." 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            style={{ width: '100%', background: '#0c0c0c', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'white' }}
                        />
                    </div>

                    <button className="btn-success" style={{ width: '100%', padding: 12, fontWeight: 'bold', marginBottom: 12 }} onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "SAVING..." : `LOG SET ${sets.length + 1}`}
                    </button>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-secondary" style={{ flex: 1, padding: 8 }} onClick={() => onExplicitDone(ex.name)}>DONE</button>
                        <button className="btn-ghost" style={{ flex: 1, padding: 8 }} onClick={() => onSkip(ex.name)}>SKIP</button>
                    </div>
                </div>
            )}

            {sets.length > 0 && (
                <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, marginBottom: 8 }}>LOGGED SETS</div>
                    {sets.map((setEntries, sIdx) => {
                        const summary = setEntries.map(e => `${e.person[0].toUpperCase()}:${ex.timed ? e.reps : e.reps + '@' + (e.weight || 0)}`).join('   ');
                        return (
                            <div key={sIdx} style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
                                <span style={{ color: 'var(--accent)' }}>L{sIdx + 1}:</span> <span style={{ color: 'white' }}>{summary}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
