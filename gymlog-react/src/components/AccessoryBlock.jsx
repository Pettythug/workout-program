import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { matchesLocation } from '../utils/locationHelper';
import ExerciseCard from './ExerciseCard';

export default function AccessoryBlock({ excludeNames = [], accessoriesList = [], setAccessoriesList, onLogSet }) {
    const { exercises, activeLocation } = useAppContext();
 
    const handleAddAccessory = () => {
        if (!exercises) return;
        const accessories = exercises.filter(ex => {
            const isAcc = ex.category && ex.category.toLowerCase().includes('accessory');
            const locMatch = matchesLocation(ex.location, activeLocation);
            return isAcc && locMatch;
        });
        if (accessories.length === 0) return;
 
        let selected = null;
        let retries = 0;
        const getBaseName = (n) => n.replace(/\s*\((Single|Alt|DB|Cable)\)/i, "").trim();

        while (retries < 10) {
            const randomIdx = Math.floor(Math.random() * accessories.length);
            const candidate = accessories[randomIdx];
            const candidateBase = getBaseName(candidate.name).toLowerCase();

            const isPlanned = excludeNames.some(name => getBaseName(name).toLowerCase() === candidateBase);
            const isAlreadySelected = accessoriesList.some(item => getBaseName(item.baseName).toLowerCase() === candidateBase);

            if (!isPlanned && !isAlreadySelected) {
                selected = candidate;
                break;
            }
            retries++;
        }

        // Fallback: If no unique exercise is found after 10 retries, pick any random candidate
        if (!selected) {
            selected = accessories[Math.floor(Math.random() * accessories.length)];
        }

        const group = {
            baseName: selected.name,
            category: selected.category,
            variations: { "Standard": selected }
        };
        setAccessoriesList(prev => [...prev, group]);
    };

    const handleSwapAccessory = (index) => {
        if (!exercises) return;
        const accessories = exercises.filter(ex => {
            const isAcc = ex.category && ex.category.toLowerCase().includes('accessory');
            const locMatch = matchesLocation(ex.location, activeLocation);
            return isAcc && locMatch;
        });
        if (accessories.length === 0) return;

        let selected = null;
        let retries = 0;
        const getBaseName = (n) => n.replace(/\s*\((Single|Alt|DB|Cable)\)/i, "").trim();

        while (retries < 10) {
            const randomIdx = Math.floor(Math.random() * accessories.length);
            const candidate = accessories[randomIdx];
            const candidateBase = getBaseName(candidate.name).toLowerCase();

            const isPlanned = excludeNames.some(name => getBaseName(name).toLowerCase() === candidateBase);
            const isAlreadySelected = accessoriesList.some(item => getBaseName(item.baseName).toLowerCase() === candidateBase);

            if (!isPlanned && !isAlreadySelected) {
                selected = candidate;
                break;
            }
            retries++;
        }

        // Fallback: If no unique exercise is found after 10 retries, pick any random candidate
        if (!selected) {
            selected = accessories[Math.floor(Math.random() * accessories.length)];
        }

        const group = {
            baseName: selected.name,
            category: selected.category,
            variations: { "Standard": selected }
        };

        setAccessoriesList(prev => {
            const next = [...prev];
            next[index] = group;
            return next;
        });
    };
 
    return (
        <div style={{ marginTop: 24, marginBottom: 16 }}>
            {accessoriesList.length === 0 ? (
                <button 
                    onClick={handleAddAccessory}
                    style={{
                        width: '100%',
                        background: 'transparent',
                        color: 'var(--muted)',
                        border: '1px dashed var(--muted)',
                        borderRadius: 'var(--radius)',
                        padding: 16,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: 1
                    }}
                >
                    Got More in the Tank? +
                </button>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {accessoriesList.map((acc, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.8, paddingLeft: 2 }}>
                                Bonus Accessory #{idx + 1}
                            </div>
                            <ExerciseCard group={acc} onLogSet={onLogSet} />
                            <button 
                                onClick={() => handleSwapAccessory(idx)}
                                style={{
                                    width: '100%',
                                    background: 'transparent',
                                    color: 'var(--muted)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    padding: 10,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    fontSize: 10
                                }}
                            >
                                Swap Bonus
                            </button>
                        </div>
                    ))}
                    
                    <button 
                        onClick={handleAddAccessory}
                        style={{
                            width: '100%',
                            background: 'transparent',
                            color: 'var(--muted)',
                            border: '1px dashed var(--muted)',
                            borderRadius: 'var(--radius)',
                            padding: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            fontSize: 11,
                            letterSpacing: 1,
                            marginTop: 8
                        }}
                    >
                        ➕ ADD ANOTHER ACCESSORY
                    </button>
                </div>
            )}
        </div>
    );
}
