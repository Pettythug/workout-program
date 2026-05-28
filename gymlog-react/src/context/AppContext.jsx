import React, { createContext, useState, useEffect, useContext } from 'react';
import { useGymAPI } from '../hooks/useGymAPI';
import { mergeFromSheets } from './dataMerge';

const AppContext = createContext();

export function AppProvider({ children }) {
    const { syncAll } = useGymAPI();
    
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

    const contextValue = {
        workoutDay,
        people,
        activePeople,
        exercises,
        loading,
        updateWorkoutDay,
        togglePersonActive
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
