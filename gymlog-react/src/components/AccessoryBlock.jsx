/* eslint-disable */
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { matchesLocation } from '../utils/locationHelper';
import { extractBaseName } from '../utils/exerciseVariations';
import ExerciseCard from './ExerciseCard';

export default function AccessoryBlock({ excludeNames = [], accessoriesList = [], setAccessoriesList, onLogSet }) {
    const { exercises, activeLocation } = useAppContext();
    const [lastAddedIdx, setLastAddedIdx] = useState(null);

    const getCandidateAccessories = () => {
        if (!exercises || exercises.length === 0) return [];
        const allAccessories = exercises.filter(
            ex => ex.category && ex.category.toLowerCase().includes('accessory')
        );
        const locFiltered = allAccessories.filter(
            ex => matchesLocation(ex.location, activeLocation)
        );
        return locFiltered.length > 0 ? locFiltered : allAccessories;
    };

    const getAccessoryAlternatives = () => {
        const accessories = getCandidateAccessories();
        const grouped = {};
        accessories.forEach(ex => {
            if (!ex || !ex.name) return;
            if (!grouped[ex.name]) {
                grouped[ex.name] = {
                    baseName: ex.name,
                    category: ex.category,
                    variations: { Standard: ex },
                    ex
                };
            }
        });
        return Object.values(grouped).sort((a, b) => a.baseName.localeCompare(b.baseName));
    };

    const pickAccessoryCandidate = (candidates, currentName = null) => {
        if (!candidates || candidates.length === 0) return null;
        const excludedBases = new Set([
            ...(excludeNames || []).map(name => extractBaseName(name).toLowerCase()),
            ...(accessoriesList || []).map(item => extractBaseName(item?.baseName || item).toLowerCase())
        ].filter(Boolean));

        const unused = candidates.filter(
            c => !excludedBases.has(extractBaseName(c.name).toLowerCase())
        );
        let pool = unused.length > 0 ? unused : candidates;
        if (unused.length === 0 && currentName && pool.length > 1) {
            const others = pool.filter(c => (c.name || '').toLowerCase() !== currentName.toLowerCase());
            if (others.length > 0) pool = others;
        }
        return pool[Math.floor(Math.random() * pool.length)];
    };

    const handleDirectSwap = (index, targetNameOrCustom, targetObj = null) => {
        const isCustom = typeof targetNameOrCustom === 'object';
        const targetName = isCustom ? targetNameOrCustom.name : targetNameOrCustom;

        let selectedEx = null;
        if (!isCustom) {
            const targetLower = (targetName || '').trim().toLowerCase();
            selectedEx = (exercises || []).find(e => (e.name || '').trim().toLowerCase() === targetLower)
                || (exercises || []).find(e => extractBaseName(e.name).toLowerCase() === targetLower)
                || targetObj;
        } else {
            selectedEx = {
                name: targetNameOrCustom.name,
                category: targetNameOrCustom.category,
                manufacturer: targetNameOrCustom.manufacturer,
                muscleGroups: targetNameOrCustom.muscle,
                baseExercise: targetNameOrCustom.baseExercise,
                timed: false, history: [], isCircuit: false
            };
        }

        if (selectedEx) {
            const group = {
                baseName: selectedEx.name,
                category: selectedEx.category || "Accessory",
                variations: { "Standard": selectedEx }
            };
            setLastAddedIdx(index);
            setAccessoriesList(prev => {
                const next = [...prev];
                next[index] = group;
                return next;
            });
        }
    };

    const handleAddAccessory = () => {
        const candidates = getCandidateAccessories();
        const selected = pickAccessoryCandidate(candidates);
        if (!selected) return;

        const group = {
            baseName: selected.name,
            category: selected.category,
            variations: { "Standard": selected }
        };
        setLastAddedIdx(accessoriesList.length);
        setAccessoriesList(prev => [...prev, group]);
    };

    const handleSwapAccessory = (index) => {
        const candidates = getCandidateAccessories();
        const currentName = accessoriesList[index]?.baseName || '';
        const selected = pickAccessoryCandidate(candidates, currentName);
        if (!selected) return;

        const group = {
            baseName: selected.name,
            category: selected.category,
            variations: { "Standard": selected }
        };
        setLastAddedIdx(index);
        setAccessoriesList(prev => {
            const next = [...prev];
            next[index] = group;
            return next;
        });
    };

    const accessoryAlternatives = getAccessoryAlternatives();

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
                    {accessoriesList.map((acc, idx) => {
                        const cardGroup = {
                            ...acc,
                            alternatives: accessoryAlternatives.filter(
                                a => a.baseName.toLowerCase() !== (acc.baseName || '').toLowerCase()
                            )
                        };
                        return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.8, paddingLeft: 2 }}>
                                Bonus Accessory #{idx + 1}
                            </div>
                            <ExerciseCard
                                key={`${acc.baseName}_${idx}`}
                                group={cardGroup}
                                defaultOpen={idx === lastAddedIdx}
                                onLogSet={onLogSet}
                                onSwap={(oldName, target, targetObj) => handleDirectSwap(idx, target, targetObj)}
                            />
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
                                🎲 REROLL BONUS
                            </button>
                        </div>
                        );
                    })}
                    
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
