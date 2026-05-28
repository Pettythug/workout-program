import React, { createContext, useState, useEffect, useContext } from 'react';
import { useGymAPI } from '../hooks/useGymAPI';

const AppContext = createContext();

export function AppProvider({ children }) {
    const { syncAll } = useGymAPI();
    
    // Core state variables
    const [workoutDay, setWorkoutDay] = useState(1);
    const [people, setPeople] = useState([]);
    const [activePeople, setActivePeople] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const data = await syncAll();
                
                // Populate state based on the fetched data
                if (data.people) {
                    setPeople(data.people);
                    // By default, maybe no active people, or maybe all active. We'll start empty.
                }
                if (data.exercises) {
                    setExercises(data.exercises);
                }
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
    };

    const togglePersonActive = (person) => {
        setActivePeople(prevActive => {
            const isActive = prevActive.includes(person);
            if (isActive) {
                return prevActive.filter(p => p !== person);
            } else {
                return [...prevActive, person];
            }
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
