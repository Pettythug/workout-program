import React, { createContext, useState, useEffect, useContext } from 'react';
import { useGymAPI } from '../hooks/useGymAPI';
import { mergeFromSheets } from './dataMerge';

const AppContext = createContext();

export function AppProvider({ children }) {
    const { syncAll, syncMeta, saveExercise } = useGymAPI();
    
    // Core state variables
    const [workoutDay, setWorkoutDay] = useState(() => {
        const cached = localStorage.getItem('gymlog_workoutDay');
        return cached ? JSON.parse(cached) : 1;
    });
    const [people, setPeople] = useState(() => {
        const cached = localStorage.getItem('gymlog_people');
        return cached ? JSON.parse(cached) : [];
    });
    const [activePeople, setActivePeople] = useState(() => {
        const cached = localStorage.getItem('gymlog_activePeople');
        return cached ? JSON.parse(cached) : [];
    });
    const [exercises, setExercises] = useState(() => {
        const cached = localStorage.getItem('gymlog_exercises');
        return cached ? JSON.parse(cached) : [];
    });
    const [exerciseStatus, setExerciseStatus] = useState(() => {
        const cached = localStorage.getItem('gymlog_exerciseStatus');
        return cached ? JSON.parse(cached) : {};
    });
    const [dailySwaps, setDailySwaps] = useState(() => {
        const cached = localStorage.getItem('gymlog_dailySwaps');
        return cached ? JSON.parse(cached) : {};
    });
    const [loading, setLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        const loadInitialData = async () => {
            // Cache check
            const cachedExercises = localStorage.getItem('gymlog_exercises');
            const cachedPeople = localStorage.getItem('gymlog_people');
            
            if (cachedExercises && cachedPeople) {
                setLoading(false); // Instant load UI from cache
            }

            try {
                if (!cachedExercises || !cachedPeople) {
                    setLoading(true);
                }
                const data = await syncAll();
                
                // Merge data
                const currentLocalExercises = cachedExercises ? JSON.parse(cachedExercises) : [];
                const currentLocalPeople = cachedPeople ? JSON.parse(cachedPeople) : [];
                const mergedData = mergeFromSheets(currentLocalExercises, data, currentLocalPeople);
                
                setExercises(mergedData.exercises);
                setPeople(mergedData.people);

                // Update cache
                localStorage.setItem('gymlog_exercises', JSON.stringify(mergedData.exercises));
                localStorage.setItem('gymlog_people', JSON.stringify(mergedData.people));

            } catch (error) {
                console.error("Error loading initial data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [syncAll]);

    // State Modifiers
    const updateWorkoutDay = (day) => {
        setWorkoutDay(day);
        localStorage.setItem('gymlog_workoutDay', JSON.stringify(day));
    };

    const togglePersonActive = (person) => {
        setActivePeople(prevActive => {
            const isActive = prevActive.includes(person);
            const newActive = isActive 
                ? prevActive.filter(p => p !== person)
                : [...prevActive, person];
            localStorage.setItem('gymlog_activePeople', JSON.stringify(newActive));
            return newActive;
        });
    };

    const setExerciseDone = (exName) => {
        setExerciseStatus(prev => {
            const next = { ...prev, [exName]: 'done' };
            localStorage.setItem('gymlog_exerciseStatus', JSON.stringify(next));
            return next;
        });
    };

    const setExerciseSkipped = (exName) => {
        setExerciseStatus(prev => {
            const next = { ...prev, [exName]: 'skipped' };
            localStorage.setItem('gymlog_exerciseStatus', JSON.stringify(next));
            return next;
        });
    };

    const resetExerciseStatus = (exName) => {
        setExerciseStatus(prev => {
            const next = { ...prev };
            delete next[exName];
            localStorage.setItem('gymlog_exerciseStatus', JSON.stringify(next));
            return next;
        });
    };

    const addSetToLocalHistory = (exName, entries) => {
        setExercises(prev => {
            const next = prev.map(ex => {
                if (ex.name === exName) {
                    return { ...ex, history: [...entries, ...(ex.history || [])] };
                }
                return ex;
            });
            localStorage.setItem('gymlog_exercises', JSON.stringify(next));
            return next;
        });
    };

    const deleteSetFromLocalHistory = (exName, entryDetails) => {
        setExercises(prev => {
            const next = prev.map(ex => {
                if (ex.name === exName) {
                    const newHistory = (ex.history || []).filter(h => 
                        !(h.date === entryDetails.date && h.person === entryDetails.person && h.reps === entryDetails.reps && h.weight === entryDetails.weight)
                    );
                    return { ...ex, history: newHistory };
                }
                return ex;
            });
            localStorage.setItem('gymlog_exercises', JSON.stringify(next));
            return next;
        });
    };

    const swapExercise = (day, originalBaseKey, newName) => {
        setDailySwaps(prev => {
            const next = { ...prev };
            if (!next[day]) next[day] = {};
            next[day][originalBaseKey] = newName;
            localStorage.setItem('gymlog_dailySwaps', JSON.stringify(next));
            return next;
        });
    };

    const addPersonToRoster = (newName) => {
        setPeople(prev => {
            const next = [...prev, newName];
            localStorage.setItem('gymlog_people', JSON.stringify(next));
            const currentLocs = JSON.parse(localStorage.getItem('gymlog_locations') || '[]');
            syncMeta(next, currentLocs, []);
            return next;
        });
    };

    const addLocationToRoster = (newLoc) => {
        const currentLocs = JSON.parse(localStorage.getItem('gymlog_locations') || '[]');
        const updatedLocs = [...currentLocs, newLoc];
        localStorage.setItem('gymlog_locations', JSON.stringify(updatedLocs));
        syncMeta(people, updatedLocs, []);
    };

    const createExerciseMeta = async (exerciseData) => {
        const { baseName, createSingle, createAlt, category, location, timed } = exerciseData;
        
        const variationsToCreate = [
            { name: baseName, category, location, timed }
        ];

        if (createSingle) variationsToCreate.push({ name: `${baseName} (Single)`, category, location, timed });
        if (createAlt) variationsToCreate.push({ name: `${baseName} (Alt)`, category, location, timed });

        // Save each via API 
        for (const meta of variationsToCreate) {
            await saveExercise(meta);
        }

        // Append to local state
        setExercises(prev => {
            const next = [...prev];
            for (const meta of variationsToCreate) {
                if (!next.find(e => e.name === meta.name)) {
                    next.push({ ...meta, history: [], best: {} });
                }
            }
            localStorage.setItem('gymlog_exercises', JSON.stringify(next));
            return next;
        });
    };

    const removeExerciseFromLocalState = (name) => {
        setExercises(prev => {
            const next = prev.filter(ex => ex.name !== name);
            localStorage.setItem('gymlog_exercises', JSON.stringify(next));
            return next;
        });
        setExerciseStatus(prev => {
            const next = { ...prev };
            delete next[name];
            localStorage.setItem('gymlog_exerciseStatus', JSON.stringify(next));
            return next;
        });
    };

    const contextValue = {
        workoutDay,
        people,
        activePeople,
        exercises,
        exerciseStatus,
        dailySwaps,
        loading,
        updateWorkoutDay,
        togglePersonActive,
        setExerciseDone,
        setExerciseSkipped,
        resetExerciseStatus,
        addSetToLocalHistory,
        deleteSetFromLocalHistory,
        swapExercise,
        addPersonToRoster,
        addLocationToRoster,
        createExerciseMeta,
        removeExerciseFromLocalState
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}

// Custom hook to consume the context
export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
