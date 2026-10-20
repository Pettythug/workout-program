// Handoff Verification Test OK
/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect, no-unused-vars */
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { useGymAPI } from '../hooks/useGymAPI';
import { mergeFromSheets } from './dataMerge';

export function getDefaultRestForRepRange(repRange) {
    const r = (repRange || '').toString().toLowerCase().trim();
    if (r.includes('1-3') || r.includes('1_3') || r === '1-3') return '180';
    if (r.includes('4-7') || r.includes('4_7') || r === '4-7') return '120';
    if (r.includes('8-12') || r.includes('8_12') || r === '8-12') return '90';
    if (r.includes('13') || r.includes('13_plus') || r.includes('13+')) return '45';
    return '90';
}

export function getDayTargetRange(dayNum) {
    const day = ((dayNum || 1) % 16) === 0 ? 16 : ((dayNum || 1) % 16);
    if (day >= 1 && day <= 4) return "r8_12";
    if (day >= 5 && day <= 8) return "r1_3";
    if (day >= 9 && day <= 12) return "r13_plus";
    if (day >= 13 && day <= 16) return "r4_7";
    return "r8_12";
}

export function calculateBestForExercise(exercise) {
    if (!exercise || !exercise.history) return {};
    const REP_RANGES = ["r1_3", "r4_7", "r8_12", "r13_plus"];
    const byPerson = {};
    (exercise.history || []).forEach(entry => {
        const reps = parseInt(String(entry.reps || '').replace(/[^0-9]/g, ''), 10) || 0;
        if (reps <= 0) return; // Strictly exclude entries with reps <= 0 or duration <= 0

        const person = (entry.person || '').toLowerCase().trim();
        if (!person) return;
        let range = entry.range;
        if (range === '1-3' || range === '1_3') range = 'r1_3';
        else if (range === '4-7' || range === '4_7') range = 'r4_7';
        else if (range === '8-12' || range === '8_12') range = 'r8_12';
        else if (range === '13+' || range === '13_plus' || range === '13') range = 'r13_plus';
        if (!REP_RANGES.includes(range)) return;

        if (!byPerson[person]) {
            byPerson[person] = { r1_3: null, r4_7: null, r8_12: null, r13_plus: null };
        }

        const current = byPerson[person][range];
        const newW = parseFloat(String(entry.weight || '').replace(/[^0-9.-]/g, '')) || 0;
        const curW = current ? (parseFloat(String(current.weight || '').replace(/[^0-9.-]/g, '')) || 0) : 0;
        const curR = current ? (parseInt(String(current.reps || '').replace(/[^0-9]/g, ''), 10) || 0) : 0;

        if (!current || newW > curW || (newW === curW && reps > curR)) {
            byPerson[person][range] = { reps: entry.reps, weight: entry.weight };
        }
    });
    return byPerson;
}

export function getUrlParamUser() {
    try {
        const searchParams = new URLSearchParams(window.location.search);
        let u = searchParams.get('user') || searchParams.get('u');
        if (!u && window.location.hash.includes('?')) {
            const hashQuery = window.location.hash.split('?')[1];
            const hashParams = new URLSearchParams(hashQuery);
            u = hashParams.get('user') || hashParams.get('u');
        }
        return u ? u.trim() : null;
    } catch (e) {
        return null;
    }
}

const AppContext = createContext();

export function AppProvider({ children }) {
    const { syncAll, syncMeta, saveExercise, logSet, sheetsPost, sheetsGet } = useGymAPI();
    
    // Core state variables
    const [workoutDay, setWorkoutDay] = useState(() => {
        const owner = localStorage.getItem('builder_primary_user');
        const key = (owner && owner !== 'Guest') ? owner : 'Guest';
        const cached = localStorage.getItem(`gymlog_workout_day_${key}`);
        return cached ? JSON.parse(cached) : 1;
    });
    const [people, setPeople] = useState(() => {
        const cached = localStorage.getItem('gymlog_people');
        return cached ? JSON.parse(cached) : [];
    });
    const [activePeople, setActivePeople] = useState(() => {
        const cached = localStorage.getItem('gymlog_activePeople');
        const parsed = cached ? JSON.parse(cached) : [];
        if (parsed.length > 0) return [...new Set(parsed)];
        const owner = localStorage.getItem('builder_primary_user');
        return (owner && owner !== 'Guest') ? [owner] : (owner === 'Guest' ? ['Guest'] : []);
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
    const [circuitWorkoutDay, setCircuitWorkoutDay] = useState(() => {
        const owner = localStorage.getItem('builder_primary_user');
        const key = (owner && owner !== 'Guest') ? owner : 'Guest';
        const cached = localStorage.getItem(`gymlog_circuit_workout_day_${key}`);
        return cached ? JSON.parse(cached) : 1;
    });
    const [fullBodyWorkoutDay, setFullBodyWorkoutDay] = useState(() => {
        const owner = localStorage.getItem('builder_primary_user');
        const key = (owner && owner !== 'Guest') ? owner : 'Guest';
        const cached = localStorage.getItem(`gymlog_fullBody_workout_day_${key}`);
        return cached ? JSON.parse(cached) : 1;
    });
    const [fullBodySwaps, setFullBodySwaps] = useState(() => {
        const cached = localStorage.getItem('gymlog_fullBody_swaps');
        return cached ? JSON.parse(cached) : {};
    });
    const [locations, setLocations] = useState(() => {
        const cached = localStorage.getItem('gymlog_locations');
        let parsed = cached ? JSON.parse(cached) : ["Anywhere", "Home", "24 Hour Fitness"];
        if (parsed.includes("Gym")) {
            parsed = parsed.filter(l => l !== "Gym");
            if (!parsed.includes("24 Hour Fitness")) parsed.push("24 Hour Fitness");
        }
        return parsed;
    });
    const [activeLocation, setActiveLocation] = useState(() => {
        let loc = localStorage.getItem('gymlog_activeLocation') || "24 Hour Fitness";
        if (loc === "Gym") loc = "24 Hour Fitness";
        return loc;
    });
    const [deviceOwner, setDeviceOwner] = useState(() => {
        return localStorage.getItem('builder_primary_user') || "";
    });
    const [urlParamUser] = useState(() => getUrlParamUser());
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(true);

    // Workout Session Duration & History State
    const [sessionStartTime, setSessionStartTime] = useState(() => {
        const cached = localStorage.getItem('gymlog_session_start_time') || localStorage.getItem('gymlog_session_start');
        return cached ? parseInt(cached, 10) : null;
    });
    const [sessionHistory, setSessionHistory] = useState(() => {
        const cached = localStorage.getItem('gymlog_session_history');
        return cached ? JSON.parse(cached) : [];
    });

    // Pre-Workout Warm-Up State
    const [warmUpStatus, setWarmUpStatus] = useState(() => {
        return localStorage.getItem('gymlog_active_warmup_status') || 'pending';
    });
    const [selectedWarmUp, setSelectedWarmUp] = useState(() => {
        return localStorage.getItem('gymlog_last_warmup') || '500m Row';
    });

    // Global Timer State
    const [timerMode, setTimerMode] = useState(() => {
        return localStorage.getItem('gym-global-timer-mode') || 'stopwatch';
    });
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerIsRunning, setTimerIsRunning] = useState(false);
    const [timerIsCountdown, setTimerIsCountdown] = useState(false);

    // Wall-clock timestamp refs for resilient timekeeping across lock screens and backgrounding
    const targetEndTimeRef = useRef(null);
    const startTimeRef = useRef(null);
    const completionSyncTokenRef = useRef(0);
    const inFlightBatchPromiseRef = useRef(null);

    const playBeepSound = () => {
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
    };

    // Sync timer mode to localStorage and set initial time
    useEffect(() => {
        localStorage.setItem('gym-global-timer-mode', timerMode);
        targetEndTimeRef.current = null;
        startTimeRef.current = null;
        localStorage.removeItem('gym_timer_target_end');
        localStorage.removeItem('gym_timer_start_time');
        setTimerIsRunning(false);
        if (timerMode === 'stopwatch') {
            setTimerSeconds(0);
            setTimerIsCountdown(false);
        } else {
            setTimerSeconds(parseInt(timerMode, 10));
            setTimerIsCountdown(true);
        }
    }, [timerMode]);

    // Timer interval effect with wall-clock timestamp synchronization & screen wake listener
    useEffect(() => {
        if (!timerIsRunning) return;

        const updateFromTimestamp = () => {
            if (timerIsCountdown && targetEndTimeRef.current) {
                const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));
                setTimerSeconds(remaining);
                if (remaining <= 0) {
                    setTimerIsRunning(false);
                    targetEndTimeRef.current = null;
                    localStorage.removeItem('gym_timer_target_end');
                    playBeepSound();
                }
            } else if (!timerIsCountdown && startTimeRef.current) {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                setTimerSeconds(elapsed);
            }
        };

        updateFromTimestamp();
        const interval = setInterval(updateFromTimestamp, 500);

        const handleVisibilityOrFocus = () => {
            updateFromTimestamp();
        };

        document.addEventListener('visibilitychange', handleVisibilityOrFocus);
        window.addEventListener('focus', handleVisibilityOrFocus);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
            window.removeEventListener('focus', handleVisibilityOrFocus);
        };
    }, [timerIsRunning, timerIsCountdown]);

    const formatTimerTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => {
        setTimerIsRunning(prev => {
            const next = !prev;
            if (next) {
                if (timerIsCountdown) {
                    const target = Date.now() + timerSeconds * 1000;
                    targetEndTimeRef.current = target;
                    startTimeRef.current = null;
                    localStorage.setItem('gym_timer_target_end', target.toString());
                    localStorage.removeItem('gym_timer_start_time');
                } else {
                    const start = Date.now() - timerSeconds * 1000;
                    startTimeRef.current = start;
                    targetEndTimeRef.current = null;
                    localStorage.setItem('gym_timer_start_time', start.toString());
                    localStorage.removeItem('gym_timer_target_end');
                }
            } else {
                targetEndTimeRef.current = null;
                startTimeRef.current = null;
                localStorage.removeItem('gym_timer_target_end');
                localStorage.removeItem('gym_timer_start_time');
            }
            return next;
        });
    };

    const resetTimer = () => {
        targetEndTimeRef.current = null;
        startTimeRef.current = null;
        localStorage.removeItem('gym_timer_target_end');
        localStorage.removeItem('gym_timer_start_time');
        setTimerIsRunning(false);
        if (timerMode === 'stopwatch') {
            setTimerSeconds(0);
            setTimerIsCountdown(false);
        } else {
            setTimerSeconds(parseInt(timerMode, 10));
            setTimerIsCountdown(true);
        }
    };

    const startRestTimer = (seconds) => {
        if (!isNaN(seconds) && seconds > 0) {
            const target = Date.now() + seconds * 1000;
            targetEndTimeRef.current = target;
            startTimeRef.current = null;
            localStorage.setItem('gym_timer_target_end', target.toString());
            localStorage.removeItem('gym_timer_start_time');
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
            localStorage.setItem('gymlog_fullBody_swaps', JSON.stringify({}));
            localStorage.setItem('gymlog_active_warmup_status', 'pending');
            localStorage.removeItem('gymlog_plan_complete');
            localStorage.removeItem('gymlog_fullBody_complete');
            localStorage.removeItem('gymlog_circuit_complete');
            localStorage.removeItem('gymlog_plan_last_summary');
            localStorage.removeItem('gymlog_fullBody_last_summary');
            localStorage.removeItem('gymlog_circuit_last_summary');
            const currentOwner = localStorage.getItem('builder_primary_user');
            const soloOwner = (currentOwner && currentOwner !== 'Guest') ? [currentOwner] : (currentOwner === 'Guest' ? ['Guest'] : []);
            localStorage.setItem('gymlog_activePeople', JSON.stringify(soloOwner));
            setActivePeople(soloOwner);
            setExerciseStatus({});
            setDailySwaps({});
            setFullBodySwaps({});
            setWarmUpStatus('pending');
        }
        localStorage.setItem('gymlog_lastActiveDate', today);

        const controller = new AbortController();
        const loadInitialData = async () => {
            setIsSyncing(true);
            // Cache check
            const cachedExercises = localStorage.getItem('gymlog_exercises');
            const cachedPeople = localStorage.getItem('gymlog_people');
            const cachedLocations = localStorage.getItem('gymlog_locations');
            const cachedVersion = localStorage.getItem('gymlog_library_version');
            
            if (cachedExercises && cachedPeople) {
                setLoading(false); // Instant load UI from cache
            }

            try {
                if (!cachedExercises || !cachedPeople) {
                    setLoading(true);
                }

                let shouldSyncAll = true;
                if (cachedExercises && cachedPeople && sheetsGet) {
                    try {
                        const versionData = await sheetsGet({ action: 'checkVersion' });
                        if (versionData && versionData.version !== undefined) {
                            if (cachedVersion && parseInt(cachedVersion, 10) === versionData.version) {
                                shouldSyncAll = false;
                            }
                            localStorage.setItem('gymlog_library_version', versionData.version.toString());
                        }
                    } catch (e) { console.warn("checkVersion failed", e); }
                }

                if (shouldSyncAll) {
                    const data = await syncAll(false, controller.signal);
                    
                    if (data && data.settings && data.settings.library_version) {
                        localStorage.setItem('gymlog_library_version', data.settings.library_version.toString());
                    }
                
                // Merge data
                const currentLocalExercises = cachedExercises ? JSON.parse(cachedExercises) : [];
                const currentLocalPeople = cachedPeople ? JSON.parse(cachedPeople) : [];
                let currentLocalLocations = cachedLocations ? JSON.parse(cachedLocations) : ["Anywhere", "Home", "24 Hour Fitness"];
                if (currentLocalLocations.includes("Gym")) {
                    currentLocalLocations = currentLocalLocations.filter(l => l !== "Gym");
                    if (!currentLocalLocations.includes("24 Hour Fitness")) currentLocalLocations.push("24 Hour Fitness");
                }
                const mergedData = mergeFromSheets(currentLocalExercises, data, currentLocalPeople, currentLocalLocations);
                
                setExercises(mergedData.exercises);
                setPeople(mergedData.people);
                setLocations(mergedData.locations);

                if (data && data.sessions !== undefined) {
                    const serverSessions = data.sessions || [];
                    setSessionHistory(serverSessions);
                    localStorage.setItem('gymlog_session_history', JSON.stringify(serverSessions));
                }

                // Update cache
                localStorage.setItem('gymlog_exercises', JSON.stringify(mergedData.exercises));
                localStorage.setItem('gymlog_people', JSON.stringify(mergedData.people));
                localStorage.setItem('gymlog_locations', JSON.stringify(mergedData.locations));

                if (data && data.settings) {
                    localStorage.setItem('gymlog_raw_settings', JSON.stringify(data.settings));
                    const owner = localStorage.getItem('builder_primary_user');
                    if (owner && owner !== 'Guest') {
                        const ownerLower = owner.toLowerCase();
                        
                        // Plan Day mapping
                        const planVal = data.settings[`builder_workout_num_${ownerLower}`] ?? data.settings[`${owner}_Plan_Day`] ?? data.settings['builder_workout_num'];
                        if (planVal !== undefined) {
                            const val = parseInt(planVal, 10) || 1;
                            setWorkoutDay(val);
                            localStorage.setItem(`gymlog_workout_day_${owner}`, JSON.stringify(val));
                        }

                        // Circuit Day mapping
                        const circVal = data.settings[`builder_circuit_num_${ownerLower}`] ?? data.settings[`${owner}_Circuit_Day`] ?? data.settings['builder_circuit_num'];
                        if (circVal !== undefined) {
                            const val = parseInt(circVal, 10) || 1;
                            setCircuitWorkoutDay(val);
                            localStorage.setItem(`gymlog_circuit_workout_day_${owner}`, JSON.stringify(val));
                        }

                        // Full Body Day mapping
                        const fbVal = data.settings[`builder_fullbody_num_${ownerLower}`] ?? data.settings[`${owner}_FullBody_Day`] ?? data.settings['builder_fullbody_num'];
                        if (fbVal !== undefined) {
                            const val = parseInt(fbVal, 10) || 1;
                            setFullBodyWorkoutDay(val);
                            localStorage.setItem(`gymlog_fullBody_workout_day_${owner}`, JSON.stringify(val));
                        }
                    }
                }
                }

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
    }, [syncAll, sheetsGet]);

    // State Modifiers
    const updateWorkoutDay = (day, skipSync = false) => {
        setWorkoutDay(day);
        const owner = (deviceOwner && deviceOwner !== 'Guest') ? deviceOwner : 'Guest';
        localStorage.setItem(`gymlog_workout_day_${owner}`, JSON.stringify(day));
        if (sheetsPost && !skipSync && owner !== 'Guest') {
            const ownerLower = owner.toLowerCase();
            const calcType = (day % 2 === 1) ? 'Push' : 'Pull';
            sheetsPost({ 
                action: 'saveSettings', 
                settings: {
                    [`builder_workout_num_${ownerLower}`]: day,
                    [`builder_workout_type_${ownerLower}`]: calcType,
                    'builder_workout_num': day,
                    'builder_workout_type': calcType,
                    [`${owner}_Plan_Day`]: day
                }
            }).catch(console.warn);
        }
    };

    const updateCircuitWorkoutDay = (day, skipSync = false) => {
        setCircuitWorkoutDay(day);
        const owner = (deviceOwner && deviceOwner !== 'Guest') ? deviceOwner : 'Guest';
        localStorage.setItem(`gymlog_circuit_workout_day_${owner}`, JSON.stringify(day));
        if (sheetsPost && !skipSync && owner !== 'Guest') {
            const ownerLower = owner.toLowerCase();
            sheetsPost({ 
                action: 'saveSettings', 
                settings: {
                    [`builder_circuit_num_${ownerLower}`]: day,
                    'builder_circuit_num': day,
                    [`${owner}_Circuit_Day`]: day
                }
            }).catch(console.warn);
        }
    };

    const updateFullBodyWorkoutDay = (day, skipSync = false) => {
        setFullBodyWorkoutDay(day);
        const owner = (deviceOwner && deviceOwner !== 'Guest') ? deviceOwner : 'Guest';
        localStorage.setItem(`gymlog_fullBody_workout_day_${owner}`, JSON.stringify(day));
        if (sheetsPost && !skipSync && owner !== 'Guest') {
            const ownerLower = owner.toLowerCase();
            sheetsPost({ 
                action: 'saveSettings', 
                settings: {
                    [`builder_fullbody_num_${ownerLower}`]: day,
                    'builder_fullbody_num': day,
                    [`${owner}_FullBody_Day`]: day
                }
            }).catch(console.warn);
        }
    };

    // Partner Workout 1-Time PIN Check-In
    const togglePersonActive = async (person) => {
        if (person === deviceOwner && activePeople.includes(person)) {
            return;
        }
        const key = (person || '').toLowerCase();
        const isActivating = !activePeople.includes(person);

        if (isActivating && person !== 'Guest') {
            const cachedPins = JSON.parse(localStorage.getItem('gymlog_user_pins') || '{}');
            const legacyPin = localStorage.getItem('gymlog_pin_' + key);
            let pin = cachedPins[key] || legacyPin;

            if (!pin) {
                pin = window.prompt(`Enter 4-digit PIN for partner check-in (${person}):`);
                if (!pin) return;

                const verifyRes = await verifyUserPin(person, pin);
                if (!verifyRes.success) {
                    alert(`Invalid PIN for ${person}: ${verifyRes.error || 'Verification failed'}`);
                    return;
                }

                cachedPins[key] = pin;
                localStorage.setItem('gymlog_user_pins', JSON.stringify(cachedPins));
                localStorage.setItem('gymlog_pin_' + key, pin);
            }
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
        const defaultActive = (newOwner && newOwner !== 'Guest') ? [newOwner] : (newOwner === 'Guest' ? ['Guest'] : []);
        setActivePeople(defaultActive);
        localStorage.setItem('gymlog_activePeople', JSON.stringify(defaultActive));

        if (newOwner === 'Guest' || !newOwner) {
            const planCached = localStorage.getItem('gymlog_workout_day_Guest');
            setWorkoutDay(planCached ? JSON.parse(planCached) : 1);
            const circCached = localStorage.getItem('gymlog_circuit_workout_day_Guest');
            setCircuitWorkoutDay(circCached ? JSON.parse(circCached) : 1);
            const fbCached = localStorage.getItem('gymlog_fullBody_workout_day_Guest');
            setFullBodyWorkoutDay(fbCached ? JSON.parse(fbCached) : 1);
            return;
        }

        let rawSettings = {};
        try {
            rawSettings = JSON.parse(localStorage.getItem('gymlog_raw_settings') || '{}');
        } catch (e) {
            console.warn('Failed to parse raw settings:', e);
        }

        const ownerLower = newOwner.toLowerCase();
        const planFromSettings = rawSettings[`builder_workout_num_${ownerLower}`] ?? rawSettings[`${newOwner}_Plan_Day`];
        const planCached = localStorage.getItem(`gymlog_workout_day_${newOwner}`);
        const resolvedPlanDay = (planFromSettings !== undefined && planFromSettings !== null && planFromSettings !== '')
            ? (parseInt(planFromSettings, 10) || 1)
            : (planCached ? JSON.parse(planCached) : 1);
        setWorkoutDay(resolvedPlanDay);
        localStorage.setItem(`gymlog_workout_day_${newOwner}`, JSON.stringify(resolvedPlanDay));

        const circFromSettings = rawSettings[`builder_circuit_num_${ownerLower}`] ?? rawSettings[`${newOwner}_Circuit_Day`];
        const circCached = localStorage.getItem(`gymlog_circuit_workout_day_${newOwner}`);
        const resolvedCircDay = (circFromSettings !== undefined && circFromSettings !== null && circFromSettings !== '')
            ? (parseInt(circFromSettings, 10) || 1)
            : (circCached ? JSON.parse(circCached) : 1);
        setCircuitWorkoutDay(resolvedCircDay);
        localStorage.setItem(`gymlog_circuit_workout_day_${newOwner}`, JSON.stringify(resolvedCircDay));

        const fbFromSettings = rawSettings[`builder_fullbody_num_${ownerLower}`] ?? rawSettings[`${newOwner}_FullBody_Day`];
        const fbCached = localStorage.getItem(`gymlog_fullBody_workout_day_${newOwner}`);
        const resolvedFbDay = (fbFromSettings !== undefined && fbFromSettings !== null && fbFromSettings !== '')
            ? (parseInt(fbFromSettings, 10) || 1)
            : (fbCached ? JSON.parse(fbCached) : 1);
        setFullBodyWorkoutDay(resolvedFbDay);
        localStorage.setItem(`gymlog_fullBody_workout_day_${newOwner}`, JSON.stringify(resolvedFbDay));
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
                    const updatedHistory = [...entries, ...(ex.history || [])];
                    const updatedBest = { ...(ex.best || {}) };
                    entries.forEach(entry => {
                        const reps = parseInt(String(entry.reps || '').replace(/[^0-9]/g, ''), 10) || 0;
                        if (reps <= 0) return; // Strictly exclude entries with reps <= 0 or duration <= 0

                        const person = (entry.person || '').toLowerCase().trim();
                        if (!person) return;
                        if (!updatedBest[person]) {
                            updatedBest[person] = { r1_3: null, r4_7: null, r8_12: null, r13_plus: null };
                        }
                        const range = entry.range;
                        if (['r1_3', 'r4_7', 'r8_12', 'r13_plus'].includes(range)) {
                            const current = updatedBest[person][range];
                            const newW = parseFloat(String(entry.weight || '').replace(/[^0-9.-]/g, '')) || 0;
                            const curW = current ? (parseFloat(String(current.weight || '').replace(/[^0-9.-]/g, '')) || 0) : 0;
                            const curR = current ? (parseInt(String(current.reps || '').replace(/[^0-9]/g, ''), 10) || 0) : 0;
                            if (!current || newW > curW || (newW === curW && reps > curR)) {
                                updatedBest[person][range] = { reps: entry.reps, weight: entry.weight };
                            }
                        }
                    });
                    return { ...ex, history: updatedHistory, best: updatedBest };
                }
                return ex;
            });
            localStorage.setItem('gymlog_exercises', JSON.stringify(next));
            return next;
        });
    };

    const deleteSetFromLocalHistory = (exName, entryDetails, targetIndex) => {
        if (!exName || !entryDetails) return;

        // 1. Check if the set was logged in today's active workout (in gymlog_pending_sets)
        const pendingSets = JSON.parse(localStorage.getItem('gymlog_pending_sets') || '[]');
        let removedFromPending = false;
        
        const updatedPendingSets = pendingSets.map(batch => {
            if (batch.exercise && batch.exercise.toLowerCase() === exName.toLowerCase()) {
                const matchIdx = (batch.entries || []).findIndex(e => 
                    e.person && entryDetails.person && e.person.toLowerCase() === entryDetails.person.toLowerCase() &&
                    String(e.reps) === String(entryDetails.reps) &&
                    String(e.weight) === String(entryDetails.weight) &&
                    (!entryDetails.date || !e.date || String(e.date) === String(entryDetails.date)) &&
                    (entryDetails.setNum === undefined || e.setNum === undefined || String(e.setNum) === String(entryDetails.setNum))
                );
                if (matchIdx !== -1) {
                    removedFromPending = true;
                    const newEntries = [...batch.entries];
                    newEntries.splice(matchIdx, 1);
                    return { ...batch, entries: newEntries };
                }
            }
            return batch;
        }).filter(batch => batch.entries && batch.entries.length > 0);

        if (removedFromPending) {
            localStorage.setItem('gymlog_pending_sets', JSON.stringify(updatedPendingSets));
        } else {
            // 2. Historical set (persisted in Google Sheets): Buffer into gymlog_pending_deletes!
            const pendingDeletes = JSON.parse(localStorage.getItem('gymlog_pending_deletes') || '[]');
            pendingDeletes.push({
                exercise: exName,
                person: entryDetails.person,
                reps: entryDetails.reps,
                weight: entryDetails.weight,
                range: entryDetails.range || entryDetails.repRange,
                date: entryDetails.date,
                setNum: entryDetails.setNum
            });
            localStorage.setItem('gymlog_pending_deletes', JSON.stringify(pendingDeletes));
        }

        // 3. Remove the set at targetIndex from local state ex.history
        setExercises(prev => {
            const next = prev.map(ex => {
                if (ex.name.toLowerCase() === exName.toLowerCase()) {
                    const hist = ex.history || [];
                    const removeIdx = (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex < hist.length)
                        ? targetIndex
                        : hist.findIndex(h => 
                            h.person && entryDetails.person && h.person.toLowerCase() === entryDetails.person.toLowerCase() &&
                            String(h.reps) === String(entryDetails.reps) &&
                            String(h.weight) === String(entryDetails.weight) &&
                            (!entryDetails.date || !h.date || String(h.date) === String(entryDetails.date)) &&
                            (entryDetails.setNum === undefined || h.setNum === undefined || String(h.setNum) === String(entryDetails.setNum))
                        );
                    if (removeIdx !== -1) {
                        const newHistory = [...hist];
                        newHistory.splice(removeIdx, 1);
                        const updatedBest = calculateBestForExercise({ ...ex, history: newHistory });
                        return { ...ex, history: newHistory, best: updatedBest };
                    }
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

    const swapFullBodyExercise = (day, originalBaseKey, newName) => {
        setFullBodySwaps(prev => {
            const next = { ...prev };
            if (!next[day]) next[day] = {};
            next[day][originalBaseKey] = newName;
            localStorage.setItem('gymlog_fullBody_swaps', JSON.stringify(next));
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

    const removeLocationFromRoster = (locName) => {
        if (locName === "Anywhere") return;
        setLocations(prev => {
            const next = prev.filter(l => l !== locName);
            localStorage.setItem('gymlog_locations', JSON.stringify(next));
            syncMeta(people, next, []);
            return next;
        });
        if (activeLocation === locName) {
            updateActiveLocation("24 Hour Fitness");
        }
    };

    const updateActiveLocation = (loc) => {
        setActiveLocation(loc);
        localStorage.setItem('gymlog_activeLocation', loc);
    };

    const createExerciseMeta = async (exerciseData, pin) => {
        const { baseName, createStandard, createSingle, createAlt, category, location, timed, isCircuit } = exerciseData;
        
        const variationsToCreate = [];

        if (createStandard) variationsToCreate.push({ name: baseName, category, location, timed, isCircuit });
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

    // Session Tracking Handlers
    const startSession = (time = null) => {
        const startTime = time || Date.now();
        setSessionStartTime(startTime);
        localStorage.setItem('gymlog_session_start_time', startTime.toString());
        localStorage.setItem('gymlog_session_start', startTime.toString());
        return startTime;
    };

    const resetWarmUp = () => {
        setWarmUpStatus('pending');
        localStorage.setItem('gymlog_active_warmup_status', 'pending');
    };

    const completeWarmUp = (modality) => {
        const mod = modality || selectedWarmUp || '500m Row';
        setSelectedWarmUp(mod);
        setWarmUpStatus('completed');
        localStorage.setItem('gymlog_last_warmup', mod);
        localStorage.setItem('gymlog_active_warmup_status', 'completed');

        if (!sessionStartTime) {
            const now = Date.now();
            setSessionStartTime(now);
            localStorage.setItem('gymlog_session_start_time', now.toString());
            localStorage.setItem('gymlog_session_start', now.toString());
        }
    };

    const skipWarmUp = () => {
        setWarmUpStatus('skipped');
        localStorage.setItem('gymlog_active_warmup_status', 'skipped');
    };

    const endSession = () => {
        setSessionStartTime(null);
        localStorage.removeItem('gymlog_session_start_time');
        localStorage.removeItem('gymlog_session_start');
    };

    const resetSessionTime = () => {
        endSession();
        resetWarmUp();
    };

    const clearSession = () => {
        endSession();
        resetTimer();
    };

    const formatDate = (ts) => {
        const d = new Date(ts);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const formatTime = (ts) => {
        const d = new Date(ts);
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');
        return `${hh}:${min}:${ss}`;
    };

    const saveCompletedSession = (sessionData, skipServerSync = false) => {
        const startTs = sessionData.startTimestamp || sessionStartTime || Date.now();
        const prog = (sessionData.program || 'Plan').trim().replace(/\s+/g, '');
        
        const activePeopleStr = (activePeople && activePeople.length > 0) ? activePeople.join('+') : 'Solo';
        const peopleText = (activePeople && activePeople.length > 0) ? activePeople.join(', ') : 'Solo';

        // Deterministic session ID: ${prog}_${cleanPerson}_${YYYY-MM-DD}_day${workoutDay} (no slashes)
        const dateObj = new Date(startTs);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const isoDate = `${yyyy}-${mm}-${dd}`;

        const rawPerson = sessionData.people || (activePeopleStr !== 'Solo' ? activePeopleStr : (deviceOwner || 'User'));
        const cleanPerson = String(rawPerson).replace(/\s*,\s*/g, '+').replace(/[/\\?%*:|"<>]/g, '_').trim();
        const currentWorkoutDay = (sessionData.workoutDay !== undefined && sessionData.workoutDay !== null && sessionData.workoutDay !== '')
            ? sessionData.workoutDay
            : (workoutDay || 1);

        const fallbackId = `${prog}_${cleanPerson}_${isoDate}_day${currentWorkoutDay}`;
        const id = (sessionData.id && !sessionData.id.startsWith('session_') && !sessionData.id.includes('/'))
            ? sessionData.id
            : fallbackId;

        const newSession = {
            id,
            date: isoDate,
            program: sessionData.program || 'Plan',
            workoutDay: sessionData.workoutDay !== undefined ? sessionData.workoutDay : '',
            workoutType: sessionData.workoutType || '',
            repRange: sessionData.repRange || '',
            startTime: sessionData.startTime || new Date(startTs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: sessionData.endTime || (sessionData.endTimestamp ? new Date(sessionData.endTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
            durationMinutes: typeof sessionData.durationMinutes === 'number' ? sessionData.durationMinutes : parseInt(sessionData.durationMinutes, 10) || 0,
            startTimestamp: startTs,
            endTimestamp: sessionData.endTimestamp || Date.now(),
            people: peopleText
        };

        setSessionHistory(prev => {
            const list = prev || [];
            const existingIdx = list.findIndex(s => s.id === newSession.id);
            let next;
            if (existingIdx !== -1) {
                // In-place upsert: update existing session record
                next = [...list];
                next[existingIdx] = { ...next[existingIdx], ...newSession };
            } else {
                // Prepend new session record
                next = [newSession, ...list];
            }
            localStorage.setItem('gymlog_session_history', JSON.stringify(next));
            return next;
        });

        if (!skipServerSync && deviceOwner && deviceOwner !== 'Guest') {
            // Background Google Sheets sync via sheetsPost({ action: 'logSession', ...sessionData })
            (async () => {
                try {
                    if (sheetsPost) {
                        await sheetsPost({
                            action: 'logSession',
                            ...newSession
                        });
                        console.log('[Sheets Sync] Session synced successfully:', newSession.id);
                    }
                } catch (err) {
                    console.warn('[Sheets Sync] Background session sync warning:', err.message || err);
                }
            })();
        }

        return newSession;
    };

    const completeWorkoutBatch = async (sessionData, updatedSettings = {}) => {
        setIsSyncing(true);
        let normalizedSession = sessionData;
        let normalizedSettings = updatedSettings;
        if (sessionData && !sessionData.id && !sessionData.startTimestamp && (sessionData.builder_workout_num !== undefined || sessionData.builder_fullbody_num !== undefined || sessionData.builder_circuit_num !== undefined || updatedSettings?.id || updatedSettings?.startTimestamp)) {
            normalizedSession = updatedSettings;
            normalizedSettings = sessionData;
        }
        const newSession = saveCompletedSession(normalizedSession, true); // skipServerSync = true

        // Guest Sandbox Isolation: Zero writes to Google Sheets
        if (!deviceOwner || deviceOwner === 'Guest') {
            localStorage.setItem('gymlog_pending_sets', '[]');
            localStorage.setItem('gymlog_pending_deletes', '[]');
            setIsSyncing(false);
            const soloOwner = (deviceOwner && deviceOwner !== 'Guest') ? [deviceOwner] : (deviceOwner === 'Guest' ? ['Guest'] : []);
            setActivePeople(soloOwner);
            localStorage.setItem('gymlog_activePeople', JSON.stringify(soloOwner));
            return newSession;
        }

        const pendingSets = JSON.parse(localStorage.getItem('gymlog_pending_sets') || '[]');
        const pendingDeletes = JSON.parse(localStorage.getItem('gymlog_pending_deletes') || '[]');
        
        const payload = {
            action: 'batchSyncSession',
            session: newSession,
            settings: normalizedSettings,
            sets: pendingSets,
            deletes: pendingDeletes
        };

        try {
            if (sheetsPost) {
                await sheetsPost(payload);
                localStorage.setItem('gymlog_pending_sets', '[]'); // clear only on success
                localStorage.setItem('gymlog_pending_deletes', '[]');
            }
        } catch (err) {
            console.warn("Network failed, storing payload in gymlog_pending_sync_queue", err);
            const queue = JSON.parse(localStorage.getItem('gymlog_pending_sync_queue') || '[]');
            queue.push(payload);
            localStorage.setItem('gymlog_pending_sync_queue', JSON.stringify(queue));
            localStorage.setItem('gymlog_pending_sets', '[]');
            localStorage.setItem('gymlog_pending_deletes', '[]');
        } finally {
            setIsSyncing(false);
            // Auto-reset active roster back to solo device owner for the next workout
            const soloOwner = (deviceOwner && deviceOwner !== 'Guest') ? [deviceOwner] : (deviceOwner === 'Guest' ? ['Guest'] : []);
            setActivePeople(soloOwner);
            localStorage.setItem('gymlog_activePeople', JSON.stringify(soloOwner));
        }
        return newSession;
    };

    const deleteSession = (sessionId) => {
        setSessionHistory(prev => {
            const next = (prev || []).filter(s => s.id !== sessionId);
            localStorage.setItem('gymlog_session_history', JSON.stringify(next));
            return next;
        });

        (async () => {
            try {
                if (sheetsPost) {
                    await sheetsPost({ action: 'deleteSession', id: sessionId });
                    console.log('[Sheets Sync] Session deleted successfully:', sessionId);
                }
            } catch (err) {
                console.warn('[Sheets Sync] Background session delete sync warning:', err.message || err);
            }
        })();
    };

    const completeWorkoutSession = (programKey, { currentDay, nextDay, nextType, exercisesList } = {}) => {
        // 1. Increment Sync Token
        const syncToken = ++completionSyncTokenRef.current;

        const normKey = (programKey || 'plan').toLowerCase();
        let storageKey = 'plan';
        let displayProgram = 'Plan';
        if (normKey.includes('circuit')) {
            storageKey = 'circuit';
            displayProgram = 'Circuit';
        } else if (normKey.includes('fullbody') || normKey.includes('full-body') || normKey.includes('full_body')) {
            storageKey = 'fullBody';
            displayProgram = 'Full Body';
        } else {
            storageKey = 'plan';
            displayProgram = 'Plan';
        }

        const activeDay = (currentDay !== undefined && currentDay !== null)
            ? currentDay
            : (storageKey === 'circuit' ? circuitWorkoutDay : (storageKey === 'fullBody' ? fullBodyWorkoutDay : workoutDay));

        // 2. Compute Session Duration & Summary Synchronously (0ms)
        const endTime = Date.now();
        const effectiveStartTime = sessionStartTime || (endTime - (storageKey === 'circuit' ? 30 : 45) * 60 * 1000);
        const rawDuration = Math.round((endTime - effectiveStartTime) / 60000);
        const durationMins = Math.min(300, Math.max(1, rawDuration));

        // Active participants
        const participants = (activePeople && activePeople.length > 0)
            ? activePeople.join(', ')
            : (deviceOwner || 'Solo');

        // Dominant repRange
        let dominantRange = null;
        if (Array.isArray(exercisesList) && exercisesList.length > 0) {
            const counts = {};
            exercisesList.forEach(item => {
                const r = item?.repRange || item?.range;
                if (r) counts[r] = (counts[r] || 0) + 1;
            });
            let maxC = 0;
            Object.entries(counts).forEach(([r, c]) => {
                if (c > maxC) {
                    maxC = c;
                    dominantRange = r;
                }
            });
        }
        if (!dominantRange) {
            const pos = (((activeDay || 1) - 1) % 16);
            if (pos < 4) dominantRange = '8-12';
            else if (pos < 8) dominantRange = '1-3';
            else if (pos < 12) dominantRange = '13+';
            else dominantRange = '4-7';
        }

        const cleanPerson = String(participants).replace(/\s*,\s*/g, '+').replace(/[/\\?%*:|"<>]/g, '_').trim();
        const dateObj = new Date(effectiveStartTime);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const isoDate = `${yyyy}-${mm}-${dd}`;

        const summaryData = {
            id: `${displayProgram.replace(/\s+/g, '')}_${cleanPerson}_${isoDate}_day${activeDay}`,
            date: new Date().toLocaleDateString('en-US'),
            startTimestamp: effectiveStartTime,
            endTimestamp: endTime,
            startTime: new Date(effectiveStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            durationMins,
            durationMinutes: durationMins,
            repRange: dominantRange,
            participants,
            people: participants,
            workoutDay: activeDay,
            workoutType: nextType || (storageKey === 'plan' ? (((activeDay || 1) % 2 === 1) ? 'Push' : 'Pull') : (storageKey === 'circuit' ? 'Circuit Training' : 'Full Body')),
            program: displayProgram
        };

        // 3. Lock In State Synchronously Before Network Call
        localStorage.setItem(`gymlog_${programKey}_last_summary`, JSON.stringify(summaryData));
        if (storageKey !== programKey) {
            localStorage.setItem(`gymlog_${storageKey}_last_summary`, JSON.stringify(summaryData));
        }
        localStorage.setItem(`gymlog_${programKey}_complete`, 'true');
        if (storageKey !== programKey) {
            localStorage.setItem(`gymlog_${storageKey}_complete`, 'true');
        }

        setSessionHistory(prev => {
            const list = prev || [];
            const next = [summaryData, ...list.filter(s => s.id !== summaryData.id)];
            localStorage.setItem('gymlog_session_history', JSON.stringify(next));
            return next;
        });

        // Advance active workout day
        const resolvedNextDay = (nextDay !== undefined && nextDay !== null)
            ? nextDay
            : (storageKey === 'circuit' ? (((activeDay || 1) % 16) + 1) : ((activeDay || 1) + 1));

        if (storageKey === 'plan') {
            updateWorkoutDay(resolvedNextDay, true);
        } else if (storageKey === 'fullBody') {
            updateFullBodyWorkoutDay(resolvedNextDay, true);
        } else if (storageKey === 'circuit') {
            updateCircuitWorkoutDay(resolvedNextDay, true);
        }

        // Clear active timer and clear warm-up storage key
        clearSession();
        localStorage.removeItem(`gymlog_warmup_${programKey}_day_${activeDay}`);
        if (storageKey !== programKey) {
            localStorage.removeItem(`gymlog_warmup_${storageKey}_day_${activeDay}`);
        }
        resetWarmUp();

        // Reset active roster to solo owner if not Guest
        if (deviceOwner && deviceOwner !== 'Guest') {
            const soloOwner = [deviceOwner];
            setActivePeople(soloOwner);
            localStorage.setItem('gymlog_activePeople', JSON.stringify(soloOwner));
        }

        // 4. Fire Background Cloud Sync with Race Guard
        const owner = (deviceOwner && deviceOwner !== 'Guest') ? deviceOwner : 'Brian';
        const ownerLower = owner.toLowerCase();
        let settingsPayload = {};

        if (storageKey === 'plan') {
            const calcType = nextType || ((resolvedNextDay % 2 === 1) ? 'Push' : 'Pull');
            settingsPayload = {
                [`builder_workout_num_${ownerLower}`]: resolvedNextDay,
                [`builder_workout_type_${ownerLower}`]: calcType,
                'builder_workout_num': resolvedNextDay,
                'builder_workout_type': calcType,
                [`${owner}_Plan_Day`]: resolvedNextDay
            };
        } else if (storageKey === 'fullBody') {
            settingsPayload = {
                [`builder_fullbody_num_${ownerLower}`]: resolvedNextDay,
                'builder_fullbody_num': resolvedNextDay,
                [`${owner}_FullBody_Day`]: resolvedNextDay
            };
        } else if (storageKey === 'circuit') {
            settingsPayload = {
                [`builder_circuit_num_${ownerLower}`]: resolvedNextDay,
                'builder_circuit_num': resolvedNextDay,
                [`${owner}_Circuit_Day`]: resolvedNextDay
            };
        }

        const batchPromise = completeWorkoutBatch(settingsPayload, summaryData)
            .then(saved => {
                if (completionSyncTokenRef.current !== syncToken) {
                    console.log('[completeWorkoutSession] Completion sync response discarded due to newer syncToken:', syncToken, 'current:', completionSyncTokenRef.current);
                    return;
                }
                if (saved) {
                    localStorage.setItem(`gymlog_${programKey}_last_summary`, JSON.stringify(saved));
                    if (storageKey !== programKey) {
                        localStorage.setItem(`gymlog_${storageKey}_last_summary`, JSON.stringify(saved));
                    }
                }
            })
            .catch(err => {
                console.warn('[completeWorkoutSession] completeWorkoutBatch error:', err);
            })
            .finally(() => {
                if (inFlightBatchPromiseRef.current === batchPromise) {
                    inFlightBatchPromiseRef.current = null;
                }
            });

        inFlightBatchPromiseRef.current = batchPromise;

        // 5. Return summaryData synchronously
        return summaryData;
    };

    const undoWorkoutSession = (programKey, { currentDay } = {}) => {
        // 1. Invalidate Any In-Flight Completion Sync
        ++completionSyncTokenRef.current;

        const normKey = (programKey || 'plan').toLowerCase();
        let storageKey = 'plan';
        if (normKey.includes('circuit')) storageKey = 'circuit';
        else if (normKey.includes('fullbody') || normKey.includes('full-body') || normKey.includes('full_body')) storageKey = 'fullBody';

        // 2. Read Saved Summary & Restore Active Workout Clock
        let summary = null;
        try {
            const raw = localStorage.getItem(`gymlog_${programKey}_last_summary`) || localStorage.getItem(`gymlog_${storageKey}_last_summary`);
            if (raw) summary = JSON.parse(raw);
        } catch (e) {
            console.warn('[undoWorkoutSession] Failed to parse summary:', e);
        }

        // Restore Timer: If summary?.startTimestamp exists, call startSession(summary.startTimestamp)
        if (summary?.startTimestamp) {
            startSession(summary.startTimestamp);
        }

        // Delete Session Log with In-Flight Guard: If summary?.id exists:
        if (summary?.id) {
            if (inFlightBatchPromiseRef.current) {
                inFlightBatchPromiseRef.current.finally(() => {
                    deleteSession(summary.id);
                });
            } else {
                deleteSession(summary.id);
            }
        }

        // 3. Clear Completion Flags & Roll Back Day
        localStorage.removeItem(`gymlog_${programKey}_last_summary`);
        localStorage.removeItem(`gymlog_${storageKey}_last_summary`);
        localStorage.setItem(`gymlog_${programKey}_complete`, 'false');
        localStorage.setItem(`gymlog_${storageKey}_complete`, 'false');

        // Restore Warm-Up Status
        setWarmUpStatus('completed');
        localStorage.setItem('gymlog_active_warmup_status', 'completed');

        const activeDay = (currentDay !== undefined && currentDay !== null)
            ? currentDay
            : (storageKey === 'circuit' ? circuitWorkoutDay : (storageKey === 'fullBody' ? fullBodyWorkoutDay : workoutDay));

        let prevDay;
        if (summary && typeof summary.workoutDay === 'number') {
            prevDay = summary.workoutDay;
        } else if (storageKey === 'circuit') {
            prevDay = ((activeDay - 2 + 16) % 16) + 1;
        } else {
            prevDay = Math.max(1, (activeDay || 2) - 1);
        }

        if (storageKey === 'plan') {
            updateWorkoutDay(prevDay, true);
        } else if (storageKey === 'fullBody') {
            updateFullBodyWorkoutDay(prevDay, true);
        } else if (storageKey === 'circuit') {
            updateCircuitWorkoutDay(prevDay, true);
        }

        // 4. Sync Rolled-Back Day Settings to Google Sheets
        const owner = (deviceOwner && deviceOwner !== 'Guest') ? deviceOwner : 'Brian';
        const ownerLower = owner.toLowerCase();
        let rollbackSettings = {};

        if (storageKey === 'plan') {
            const calcType = (prevDay % 2 === 1) ? 'Push' : 'Pull';
            rollbackSettings = {
                [`builder_workout_num_${ownerLower}`]: prevDay,
                [`builder_workout_type_${ownerLower}`]: calcType,
                'builder_workout_num': prevDay,
                'builder_workout_type': calcType,
                [`${owner}_Plan_Day`]: prevDay
            };
        } else if (storageKey === 'fullBody') {
            rollbackSettings = {
                [`builder_fullbody_num_${ownerLower}`]: prevDay,
                'builder_fullbody_num': prevDay,
                [`${owner}_FullBody_Day`]: prevDay
            };
        } else if (storageKey === 'circuit') {
            rollbackSettings = {
                [`builder_circuit_num_${ownerLower}`]: prevDay,
                'builder_circuit_num': prevDay,
                [`${owner}_Circuit_Day`]: prevDay
            };
        }

        if (sheetsPost && deviceOwner && deviceOwner !== 'Guest') {
            sheetsPost({ action: 'saveSettings', settings: rollbackSettings }).catch(console.warn);
        }

        return { prevDay, summary };
    };

    const getRepRangeStats = (customHistory = null, filterPerson = 'ALL') => {
        const history = customHistory || sessionHistory || [];
        const brackets = {
            '1-3': { label: '1–3 Reps (Heavy)', key: '1-3', count: 0, totalMinutes: 0, avgMinutes: 0 },
            '4-7': { label: '4–7 Reps (Strength)', key: '4-7', count: 0, totalMinutes: 0, avgMinutes: 0 },
            '8-12': { label: '8–12 Reps (Hypertrophy)', key: '8-12', count: 0, totalMinutes: 0, avgMinutes: 0 },
            '13+': { label: '13+ Reps (Endurance)', key: '13+', count: 0, totalMinutes: 0, avgMinutes: 0 }
        };

        const filteredHistory = filterPerson === 'ALL' 
            ? history 
            : history.filter(s => (s.people || 'Solo') === filterPerson);

        filteredHistory.forEach(session => {
            const range = (session.repRange || '').trim();
            const duration = parseInt(session.durationMinutes, 10) || 0;
            if (duration <= 0) return;

            let targetKey = null;
            if (range === '1-3' || range.includes('1-3')) targetKey = '1-3';
            else if (range === '4-7' || range.includes('4-7')) targetKey = '4-7';
            else if (range === '8-12' || range.includes('8-12')) targetKey = '8-12';
            else if (range === '13+' || range.includes('13')) targetKey = '13+';

            if (targetKey && brackets[targetKey]) {
                brackets[targetKey].count += 1;
                brackets[targetKey].totalMinutes += duration;
            }
        });

        Object.keys(brackets).forEach(k => {
            if (brackets[k].count > 0) {
                brackets[k].avgMinutes = Math.round(brackets[k].totalMinutes / brackets[k].count);
            }
        });

        const totalCount = filteredHistory.filter(s => (parseInt(s.durationMinutes, 10) || 0) > 0).length;
        const totalMinutes = filteredHistory.reduce((sum, s) => sum + (parseInt(s.durationMinutes, 10) || 0), 0);
        const overallAvgMinutes = totalCount > 0 ? Math.round(totalMinutes / totalCount) : 0;

        return {
            brackets,
            totalSessions: totalCount,
            overallAvgMinutes
        };
    };

    const logExerciseSet = async (ex, logs) => {
        console.log("logExerciseSet CALLED", { ex, logs });
        
        const getBaseName = (n) => n.replace(/\s*\((Single|Alt|DB|Cable)\)/i, "").trim();
        const baseName = getBaseName(ex.name);
        
        const allVariations = exercises.filter(e => getBaseName(e.name) === baseName);
        const allTodaysEntries = allVariations.flatMap(v => v.history || [])
            .filter(h => h.date && new Date(h.date).toDateString() === new Date().toDateString());
        
        let nextSetNum = 1;
        if (allTodaysEntries.length > 0) {
            const maxSetNum = allTodaysEntries.reduce((max, h) => {
                const num = parseInt(h.setNum) || 0;
                return num > max ? num : max;
            }, 0);
            nextSetNum = maxSetNum + 1;
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
                if (input.duration !== undefined && input.duration !== null && String(input.duration).trim() !== "") {
                    const dur = parseInt(input.duration, 10);
                    if (!isNaN(dur)) {
                        const isZero = dur === 0;
                        const assignedRange = isZero
                            ? getDayTargetRange(ex.isCircuit ? circuitWorkoutDay : workoutDay)
                            : "r13_plus";
                        entries.push({
                            date: new Date().toLocaleString('en-US'),
                            person: key,
                            reps: dur,
                            weight: input.weight || "",
                            range: assignedRange,
                            timed: true,
                            note: input.note || "",
                            setNum: nextSetNum
                        });
                    }
                }
            } else {
                if (input.reps !== undefined && input.reps !== null && String(input.reps).trim() !== "") {
                    const r = parseInt(input.reps, 10);
                    if (!isNaN(r)) {
                        let range = "r13_plus";
                        if (r === 0) {
                            range = getDayTargetRange(ex.isCircuit ? circuitWorkoutDay : workoutDay);
                        } else if (r <= 3) {
                            range = "r1_3";
                        } else if (r <= 7) {
                            range = "r4_7";
                        } else if (r <= 12) {
                            range = "r8_12";
                        }

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
        }

        console.log("ENTRIES:", entries);

        if (entries.length > 0) {
            if (!sessionStartTime) {
                const now = Date.now();
                setSessionStartTime(now);
                localStorage.setItem('gymlog_session_start_time', now.toString());
            }

            // Trigger the automatic rest countdown timer when logging a 0-rep / 0-sec attempt
            const hasZeroAttempt = entries.some(e => Number(e.reps) === 0);
            if (hasZeroAttempt) {
                let restSecs = 90;
                if (timerMode && timerMode !== 'off' && !isNaN(parseInt(timerMode, 10))) {
                    restSecs = parseInt(timerMode, 10);
                } else {
                    const targetRange = getDayTargetRange(ex.isCircuit ? circuitWorkoutDay : workoutDay);
                    restSecs = parseInt(getDefaultRestForRepRange(targetRange), 10) || 90;
                }
                startRestTimer(restSecs);
            }

            const userPins = {};
            let cancelled = false;
            const seenPinKeys = new Set();
            for (const person of activePeople) {
                const key = person.toLowerCase();
                if (seenPinKeys.has(key)) continue;
                seenPinKeys.add(key);

                const input = logs[key];
                if (!input) continue;

                const hasTimed = ex.timed && input.duration !== undefined && input.duration !== null && String(input.duration).trim() !== "";
                const hasReps = !ex.timed && input.reps !== undefined && input.reps !== null && String(input.reps).trim() !== "";

                if (hasTimed || hasReps) {
                    if (person === 'Guest') {
                        userPins[key] = "guest";
                    } else {
                        const cachedPins = JSON.parse(localStorage.getItem('gymlog_user_pins') || '{}');
                        let pin = cachedPins[key] || localStorage.getItem('gymlog_pin_' + key);
                        if (!pin) {
                            pin = window.prompt(`Enter PIN for ${person}:`);
                            if (pin === null) {
                                cancelled = true;
                                break;
                            }
                            cachedPins[key] = pin;
                            localStorage.setItem('gymlog_user_pins', JSON.stringify(cachedPins));
                            localStorage.setItem('gymlog_pin_' + key, pin);
                        }
                        userPins[key] = pin;
                    }
                }
            }

            if (cancelled) return null;

            // Zero-latency local update
            const pendingSets = JSON.parse(localStorage.getItem('gymlog_pending_sets') || '[]');
            pendingSets.push({
                exercise: ex.name,
                entries: entries,
                userPins: userPins
            });
            localStorage.setItem('gymlog_pending_sets', JSON.stringify(pendingSets));

            addSetToLocalHistory(ex.name, entries);
            return entries;
        }
        return null;
    };

    // PIN Management & Dynamic Authentication (TASK-R101)
    const verifyUserPin = async (name, pin) => {
        if (!pin) return { success: false, error: 'PIN is required' };
        try {
            if (sheetsPost) {
                const res = await sheetsPost({ action: 'verifyPin', person: name, pin: String(pin) });
                if (res && res.valid) {
                    return { success: true, isAdmin: res.isAdmin, person: res.person || name };
                }
            }
        } catch (err) {
            const errMsg = err.message || '';
            if (errMsg.includes('Invalid PIN') || errMsg.includes('Unauthorized') || errMsg.includes('No PIN configured')) {
                return { success: false, error: errMsg };
            }
            // Offline fallback to locally cached PIN
            const cachedPins = JSON.parse(localStorage.getItem('gymlog_user_pins') || '{}');
            const localPin = cachedPins[(name || '').toLowerCase()] || localStorage.getItem('gymlog_pin_' + (name || '').toLowerCase());
            if (localPin && String(localPin) === String(pin)) {
                return { success: true, offline: true };
            }
            return { success: false, error: errMsg || 'Verification error' };
        }
        return { success: false, error: 'Verification failed' };
    };

    const registerNewUser = async (name, pin) => {
        const trimmedName = (name || '').trim();
        if (!trimmedName) throw new Error('Name cannot be empty');
        if (!pin || String(pin).length < 4) throw new Error('A 4-digit PIN is required');

        // 1. Save user PIN to backend
        if (sheetsPost) {
            await sheetsPost({ action: 'saveUserPin', person: trimmedName, pin: String(pin) });
        }

        // 2. Add to people roster if not already present
        if (!people.includes(trimmedName)) {
            const updatedPeople = [...people, trimmedName];
            setPeople(updatedPeople);
            localStorage.setItem('gymlog_people', JSON.stringify(updatedPeople));
            if (sheetsPost) {
                sheetsPost({ action: 'savePeople', people: updatedPeople }).catch(console.warn);
            }
        }

        // 3. Cache PIN locally
        const cachedPins = JSON.parse(localStorage.getItem('gymlog_user_pins') || '{}');
        cachedPins[trimmedName.toLowerCase()] = String(pin);
        localStorage.setItem('gymlog_user_pins', JSON.stringify(cachedPins));
        localStorage.setItem('gymlog_pin_' + trimmedName.toLowerCase(), String(pin));

        // 4. Set as device owner
        updateDeviceOwner(trimmedName);
        return { success: true };
    };

    const resetUserPinWithAdmin = async (targetUser, newPin, adminPin) => {
        if (!targetUser) throw new Error('Target user is required');
        if (!newPin || String(newPin).length < 4) throw new Error('A 4-digit PIN is required');
        if (!adminPin) throw new Error('Master Admin PIN is required');

        if (sheetsPost) {
            await sheetsPost({
                action: 'saveUserPin',
                person: targetUser,
                pin: String(newPin),
                adminPin: String(adminPin)
            });
        }

        const cachedPins = JSON.parse(localStorage.getItem('gymlog_user_pins') || '{}');
        cachedPins[targetUser.toLowerCase()] = String(newPin);
        localStorage.setItem('gymlog_user_pins', JSON.stringify(cachedPins));
        localStorage.setItem('gymlog_pin_' + targetUser.toLowerCase(), String(newPin));

        return { success: true };
    };

    const upgradeGuestToCloudUser = async (name, pin) => {
        const trimmedName = (name || '').trim();
        if (!trimmedName) throw new Error('Name is required');
        if (!pin || String(pin).length < 4) throw new Error('A 4-digit PIN is required');

        const isExisting = people.some(p => p.toLowerCase() === trimmedName.toLowerCase());
        if (isExisting) {
            const verify = await verifyUserPin(trimmedName, pin);
            if (!verify.success) {
                throw new Error(verify.error || 'Invalid PIN for profile');
            }
        } else {
            await registerNewUser(trimmedName, pin);
        }

        const cachedPins = JSON.parse(localStorage.getItem('gymlog_user_pins') || '{}');
        cachedPins[trimmedName.toLowerCase()] = String(pin);
        localStorage.setItem('gymlog_user_pins', JSON.stringify(cachedPins));
        localStorage.setItem('gymlog_pin_' + trimmedName.toLowerCase(), String(pin));

        updateDeviceOwner(trimmedName);

        // Migrate guest session history to Sheets
        const guestHistory = JSON.parse(localStorage.getItem('gymlog_session_history') || '[]');
        if (guestHistory.length > 0 && sheetsPost) {
            for (const s of guestHistory) {
                try {
                    await sheetsPost({
                        action: 'logSession',
                        ...s,
                        people: trimmedName
                    });
                } catch (e) {
                    console.warn('Failed to sync guest session to cloud:', e);
                }
            }
        }

        return { success: true };
    };

    const effectiveActivePeople = (activePeople.length === 0 && deviceOwner === 'Guest')
        ? ['Guest']
        : [...new Set(activePeople)].filter(p => p === 'Guest' || people.includes(p));

    const contextValue = {
        sheetsPost,
        workoutDay,
        fullBodyWorkoutDay,
        circuitWorkoutDay,
        people,
        activePeople: effectiveActivePeople,
        deviceOwner,
        urlParamUser,
        updateDeviceOwner,
        verifyUserPin,
        registerNewUser,
        resetUserPinWithAdmin,
        upgradeGuestToCloudUser,
        exercises,
        exerciseStatus,
        dailySwaps,
        fullBodySwaps,
        loading,
        isSyncing,
        locations,
        activeLocation,
        sessionStartTime,
        sessionHistory,
        warmUpStatus,
        setWarmUpStatus,
        selectedWarmUp,
        setSelectedWarmUp,
        completeWarmUp,
        skipWarmUp,
        resetWarmUp,
        startSession,
        endSession,
        clearSession,
        resetSessionTime,
        saveCompletedSession,
        completeWorkoutBatch,
        completeWorkoutSession,
        undoWorkoutSession,
        deleteSession,
        getRepRangeStats,
        updateWorkoutDay,
        updateCircuitWorkoutDay,
        updateFullBodyWorkoutDay,
        updateActiveLocation,
        togglePersonActive,
        setExerciseDone,
        setExerciseSkipped,
        resetExerciseStatus,
        addSetToLocalHistory,
        deleteSetFromLocalHistory,
        swapExercise,
        swapFullBodyExercise,
        addPersonToRoster,
        removePersonFromRoster,
        addLocationToRoster,
        removeLocationFromRoster,
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
        startRestTimer,
        getDefaultRestForRepRange,
        getDayTargetRange,
        calculateBestForExercise
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
