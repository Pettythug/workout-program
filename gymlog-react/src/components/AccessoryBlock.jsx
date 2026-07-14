import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ExerciseCard from './ExerciseCard';

export default function AccessoryBlock() {
    const { exercises, activeLocation } = useAppContext();
    const [accessoriesList, setAccessoriesList] = useState([]);
 
    const handleAddAccessory = () => {
        if (!exercises) return;
        const accessories = exercises.filter(ex => {
            const isAcc = ex.category && ex.category.toLowerCase().includes('accessory');
            const locMatch = activeLocation === "all" || ex.location === "Anywhere" || !ex.location || ex.location === activeLocation;
            return isAcc && locMatch;
        });
        if (accessories.length === 0) return;
 
        const randomIdx = Math.floor(Math.random() * accessories.length);
        const accessory = accessories[randomIdx];
        const group = {
            baseName: accessory.name,
            category: accessory.category,
            variations: { "Standard": accessory }
        };
        setAccessoriesList(prev => [...prev, group]);
    };

    const handleSwapAccessory = (index) => {
        if (!exercises) return;
        const accessories = exercises.filter(ex => {
            const isAcc = ex.category && ex.category.toLowerCase().includes('accessory');
            const locMatch = activeLocation === "all" || ex.location === "Anywhere" || !ex.location || ex.location === activeLocation;
            return isAcc && locMatch;
        });
        if (accessories.length === 0) return;

        const randomIdx = Math.floor(Math.random() * accessories.length);
        const accessory = accessories[randomIdx];
        const group = {
            baseName: accessory.name,
            category: accessory.category,
            variations: { "Standard": accessory }
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
                            <ExerciseCard group={acc} />
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
