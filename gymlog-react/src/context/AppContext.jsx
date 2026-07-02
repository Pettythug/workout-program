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
        if (!cached) return [];
        const parsed = JSON.parse(cached);
        // Run through mergeFromSheets just to apply data fixes (like fileReference cleanup)
        const mergedData = mergeFromSheets(parsed, {}, [], []);
        return mergedData.exercises;
    });
    const [exerciseStatus, setExerciseStatus] = useState(() => {
        const cached = localStorage.getItem('gymlog_exerciseStatus');
        return cached ? JSON.parse(cached) : {};
    });
    const [dailySwaps, setDailySwaps] = useState(() => {
        const cached = localStorage.getItem('gymlog_dailySwaps');
        return cached ? JSON.parse(cached) : {};
    });
    const [locations, setLocations] = useState(() => {
        const cached = localStorage.getItem('gymlog_locations');
        return cached ? JSON.parse(cached) : ["Anywhere", "Home", "Gym"];
    });
    const [activeLocation, setActiveLocation] = useState(() => {
        return localStorage.getItem('gymlog_activeLocation') || "all";
    });
    const [deviceOwner, setDeviceOwner] = useState(() => {
        return localStorage.getItem('builder_primary_user') || "Brian";
    });
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(true);

    // Initial Load
    useEffect(() => {
        const controller = new AbortController();
        const loadInitialData = async () => {
            setIsSyncing(true);
            // Cache check
            const cachedExercises = localStorage.getItem('gymlog_exercises');
            const cachedPeople = localStorage.getItem('gymlog_people');
            const cachedLocations = localStorage.getItem('gymlog_locations');
            
            if (cachedExercises && cachedPeople) {
                setLoading(false); // Instant load UI from cache
            }

            try {
                if (!cachedExercises || !cachedPeople) {
                    setLoading(true);
                }
                const data = await syncAll(false, controller.signal);
                
                // Merge data
                const currentLocalExercises = cachedExercises ? JSON.parse(cachedExercises) : [];
                const currentLocalPeople = cachedPeople ? JSON.parse(cachedPeople) : [];
                const currentLocalLocations = cachedLocations ? JSON.parse(cachedLocations) : ["Anywhere", "Home", "Gym"];
                const mergedData = mergeFromSheets(currentLocalExercises, data, currentLocalPeople, currentLocalLocations);
                
                setExercises(mergedData.exercises);
                setPeople(mergedData.people);
                setLocations(mergedData.locations);

                // Update cache
                localStorage.setItem('gymlog_exercises', JSON.stringify(mergedData.exercises));
                localStorage.setItem('gymlog_people', JSON.stringify(mergedData.people));
                localStorage.setItem('gymlog_locations', JSON.stringify(mergedData.locations));

            } catch (error) {
                if (error.name === 'AbortError' || controller.signal.aborted) return;
                console.error("Error loading initial data:", error);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                    setIsSyncing(false);
                }
            }
        };

        loadInitialData();
        return () => controller.abort();
    }, [syncAll]);

    // State Modifiers
    const updateWorkoutDay = (day) => {
        setWorkoutDay(day);
        localStorage.setItem('gymlog_workoutDay', JSON.stringify(day));
    };

    const togglePersonActive = (person) => {
        if (person === deviceOwner && activePeople.includes(person)) {
            // Do not allow the device owner to be deactivated
            return;
        }
        setActivePeople(prev => {
            const next = prev.includes(person)
                ? prev.filter(p => p !== person)
                : [...prev, person];
            localStorage.setItem('gymlog_activePeople', JSON.stringify(next));
            return next;
        });
    };

    const updateDeviceOwner = (newOwner) => {
        setDeviceOwner(newOwner);
        localStorage.setItem('builder_primary_user', newOwner);
        // Force them into active roster if not already there
        setActivePeople(prev => {
            if (!prev.includes(newOwner)) {
                const next = [...prev, newOwner];
                localStorage.setItem('gymlog_activePeople', JSON.stringify(next));
                return next;
            }
            return prev;
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
            syncMeta(next, locations, []);
            return next;
        });
    };

    const removePersonFromRoster = (name) => {
        setPeople(prev => {
            const next = prev.filter(p => p !== name);
            localStorage.setItem('gymlog_people', JSON.stringify(next));
            syncMeta(next, locations, []);
            return next;
        });
        setActivePeople(prev => {
            const next = prev.filter(p => p !== name);
            localStorage.setItem('gymlog_activePeople', JSON.stringify(next));
            return next;
        });
    };

    const addLocationToRoster = (newLoc) => {
        setLocations(prev => {
            const next = [...prev, newLoc];
            localStorage.setItem('gymlog_locations', JSON.stringify(next));
            syncMeta(people, next, []);
            return next;
        });
    };

    const updateActiveLocation = (loc) => {
        setActiveLocation(loc);
        localStorage.setItem('gymlog_activeLocation', loc);
    };

    const createExerciseMeta = async (exerciseData) => {
        const { baseName, createSingle, createAlt, category, location, timed, isCircuit } = exerciseData;
        
        const variationsToCreate = [
            { name: baseName, category, location, timed, isCircuit }
        ];

        if (createSingle) variationsToCreate.push({ name: `${baseName} (Single)`, category, location, timed, isCircuit });
        if (createAlt) variationsToCreate.push({ name: `${baseName} (Alt)`, category, location, timed, isCircuit });

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
        activePeople: activePeople.filter(p => people.includes(p)),
        deviceOwner,
        updateDeviceOwner,
        exercises,
        exerciseStatus,
        dailySwaps,
        loading,
        isSyncing,
        locations,
        activeLocation,
        updateWorkoutDay,
        updateActiveLocation,
        togglePersonActive,
        setExerciseDone,
        setExerciseSkipped,
        resetExerciseStatus,
        addSetToLocalHistory,
        deleteSetFromLocalHistory,
        swapExercise,
        addPersonToRoster,
        removePersonFromRoster,
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
