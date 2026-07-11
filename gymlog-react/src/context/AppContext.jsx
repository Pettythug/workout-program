import React, { createContext, useState, useEffect, useContext } from 'react';
import { useGymAPI } from '../hooks/useGymAPI';
import { mergeFromSheets } from './dataMerge';

const AppContext = createContext();

export function AppProvider({ children }) {
    const { syncAll, syncMeta, saveExercise, logSet } = useGymAPI();
    
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
        const parsed = cached ? JSON.parse(cached) : [];
        return [...new Set(parsed)];
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

    // Global Timer State
    const [timerMode, setTimerMode] = useState(() => {
        return localStorage.getItem('gym-global-timer-mode') || 'stopwatch';
    });
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerIsRunning, setTimerIsRunning] = useState(false);
    const [timerIsCountdown, setTimerIsCountdown] = useState(false);

    // Sync timer mode to localStorage and set initial time
    useEffect(() => {
        localStorage.setItem('gym-global-timer-mode', timerMode);
        setTimerIsRunning(false);
        if (timerMode === 'stopwatch') {
            setTimerSeconds(0);
            setTimerIsCountdown(false);
        } else {
            setTimerSeconds(parseInt(timerMode, 10));
            setTimerIsCountdown(true);
        }
    }, [timerMode]);

    // Timer interval effect
    useEffect(() => {
        let interval = null;
        if (timerIsRunning) {
            interval = setInterval(() => {
                setTimerSeconds(prev => {
                    if (timerIsCountdown) {
                        if (prev <= 1) {
                            setTimerIsRunning(false);
                            // Visual and sound alert (native Web Audio API beep)
                            try {
                                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                                const osc = ctx.createOscillator();
                                const gain = ctx.createGain();
                                osc.connect(gain);
                                gain.connect(ctx.destination);
                                osc.frequency.value = 800; // 800Hz
                                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                                osc.start();
                                osc.stop(ctx.currentTime + 0.15);
                            } catch (e) {
                                console.error("Beep error:", e);
                            }
                            return 0;
                        }
                        return prev - 1;
                    } else {
                        return prev + 1;
                    }
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerIsRunning, timerIsCountdown]);

    const formatTimerTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => {
        setTimerIsRunning(prev => !prev);
    };

    const resetTimer = () => {
        setTimerIsRunning(false);
        if (timerMode === 'stopwatch') {
            setTimerSeconds(0);
        } else {
            setTimerSeconds(parseInt(timerMode, 10));
        }
    };

    const startRestTimer = (seconds) => {
        if (!isNaN(seconds) && seconds > 0) {
            setTimerSeconds(seconds);
            setTimerIsCountdown(true);
            setTimerIsRunning(true);
        }
    };


    // Initial Load
    useEffect(() => {
        // Auto-cleanup legacy custom URL overrides to ensure fallback to corrected built-in default
        if (localStorage.getItem('gym_api_url')) {
            localStorage.removeItem('gym_api_url');
        }

        const lastActiveDate = localStorage.getItem('gymlog_lastActiveDate');
        const today = new Date().toDateString();
        if (lastActiveDate && lastActiveDate !== today) {
            // New day detected: reset daily statuses and swaps
            localStorage.setItem('gymlog_exerciseStatus', JSON.stringify({}));
            localStorage.setItem('gymlog_dailySwaps', JSON.stringify({}));
            setExerciseStatus({});
            setDailySwaps({});
        }
        localStorage.setItem('gymlog_lastActiveDate', today);

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
            return;
        }
        setActivePeople(prev => {
            const next = prev.includes(person)
                ? prev.filter(p => p !== person)
                : [...prev, person];
            const uniqueNext = [...new Set(next)];
            localStorage.setItem('gymlog_activePeople', JSON.stringify(uniqueNext));
            return uniqueNext;
        });
    };

    const updateDeviceOwner = (newOwner) => {
        setDeviceOwner(newOwner);
        localStorage.setItem('builder_primary_user', newOwner);
        setActivePeople(prev => {
            if (!prev.includes(newOwner)) {
                const next = [...prev, newOwner];
                const uniqueNext = [...new Set(next)];
                localStorage.setItem('gymlog_activePeople', JSON.stringify(uniqueNext));
                return uniqueNext;
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

    const clearAllExerciseStatus = () => {
        setExerciseStatus({});
        localStorage.setItem('gymlog_exerciseStatus', JSON.stringify({}));
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

    const createExerciseMeta = async (exerciseData, pin) => {
        const { baseName, createSingle, createAlt, category, location, timed, isCircuit } = exerciseData;
        
        const variationsToCreate = [
            { name: baseName, category, location, timed, isCircuit }
        ];

        if (createSingle) variationsToCreate.push({ name: `${baseName} (Single)`, category, location, timed, isCircuit });
        if (createAlt) variationsToCreate.push({ name: `${baseName} (Alt)`, category, location, timed, isCircuit });

        // Save each via API 
        for (const meta of variationsToCreate) {
            await saveExercise(meta, pin);
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

    const updateExerciseInLocalState = (exName, updates) => {
        setExercises(prev => {
            const next = prev.map(ex => {
                if (ex.name === exName) {
                    return { ...ex, ...updates };
                }
                return ex;
            });
            localStorage.setItem('gymlog_exercises', JSON.stringify(next));
            return next;
        });
    };

    const logExerciseSet = async (ex, logs) => {
        console.log("logExerciseSet CALLED", { ex, logs });
        
        let nextSetNum = 1;
        if (ex.history && ex.history.length > 0) {
            const todaysEntries = ex.history.filter(h => h.date && new Date(h.date).toDateString() === new Date().toDateString());
            if (todaysEntries.length > 0) {
                const maxSetNum = todaysEntries.reduce((max, h) => {
                    const num = parseInt(h.setNum) || 0;
                    return num > max ? num : max;
                }, 0);
                nextSetNum = maxSetNum + 1;
            }
        }

        const entries = [];
        const seenKeys = new Set();
        for (const person of activePeople) {
            const key = person.toLowerCase();
            if (seenKeys.has(key)) continue;
            seenKeys.add(key);

            const input = logs[key];
            if (!input) continue;

            if (ex.timed) {
                if (input.duration) {
                    entries.push({
                        date: new Date().toLocaleString('en-US'),
                        person: key,
                        reps: input.duration,
                        weight: input.weight || "",
                        range: "r13_plus",
                        timed: true,
                        note: input.note || "",
                        setNum: nextSetNum
                    });
                }
            } else {
                if (input.reps) {
                    const r = parseInt(input.reps);
                    let range = "r13_plus";
                    if (r <= 3) range = "r1_3";
                    else if (r <= 7) range = "r4_7";
                    else if (r <= 12) range = "r8_12";

                    entries.push({
                        date: new Date().toLocaleString('en-US'),
                        person: key,
                        reps: r,
                        weight: input.weight || "",
                        range: range,
                        timed: false,
                        note: input.note || "",
                        setNum: nextSetNum
                    });
                }
            }
        }

        console.log("ENTRIES:", entries);

        if (entries.length > 0) {
            const userPins = {};
            let cancelled = false;
            const seenPinKeys = new Set();
            for (const person of activePeople) {
                const key = person.toLowerCase();
                if (seenPinKeys.has(key)) continue;
                seenPinKeys.add(key);

                const input = logs[key];
                if (!input) continue;

                if ((ex.timed && input.duration) || (!ex.timed && input.reps)) {
                    let pin = localStorage.getItem('gymlog_pin_' + key);
                    if (!pin) {
                        pin = window.prompt(`Enter PIN for ${person}:`);
                        if (pin === null) {
                            cancelled = true;
                            break;
                        }
                        localStorage.setItem('gymlog_pin_' + key, pin);
                    }
                    userPins[key] = pin;
                }
            }

            if (cancelled) return null;

            // API sync & local history update
            await logSet(ex.name, entries, userPins);
            addSetToLocalHistory(ex.name, entries);
            return entries;
        }
        return null;
    };

    const contextValue = {
        workoutDay,
        people,
        activePeople: [...new Set(activePeople)].filter(p => people.includes(p)),
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
        removeExerciseFromLocalState,
        updateExerciseInLocalState,
        logExerciseSet,
        clearAllExerciseStatus,
        timerMode,
        setTimerMode,
        timerSeconds,
        setTimerSeconds,
        timerIsRunning,
        setTimerIsRunning,
        timerIsCountdown,
        setTimerIsCountdown,
        formatTimerTime,
        toggleTimer,
        resetTimer,
        startRestTimer
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
