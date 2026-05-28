import { useCallback } from 'react';

// Default URL if not in localStorage
const DEFAULT_URL = "https://script.google.com/macros/s/AKfycbwtpr_4LEVCXRyMv_v86796HIN0v36kdULk7DVSI2x3R2KIbjh9KGWFV0lXT7x8MZTo7g/exec";

export function useGymAPI() {
    const getApiUrl = () => {
        return localStorage.getItem('gym_api_url') || DEFAULT_URL;
    };

    /**
     * Core POST wrapper with 60-second timeout and robust redirect-parsing.
     * @param {Object} payload 
     * @returns {Promise<any>}
     */
    const sheetsPost = useCallback(async (payload) => {
        const url = getApiUrl();
        const payloadStr = JSON.stringify(payload);
        let res;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        try {
            if (payloadStr.length > 1500 || payload.action === "syncAll") {
                res = await fetch(url, {
                    method: "POST",
                    body: payloadStr,
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    signal: controller.signal
                });
            } else {
                const encoded = encodeURIComponent(payloadStr);
                res = await fetch(url + "?payload=" + encoded, { 
                    signal: controller.signal 
                });
            }
        } catch (fetchErr) {
            if (fetchErr.name === 'AbortError') {
                throw new Error("Request timed out after 60 seconds. The data may have been logged successfully on the server. Please check the history or refresh before re-submitting.");
            }
            throw fetchErr;
        } finally {
            clearTimeout(timeoutId);
        }

        const text = await res.text();
        let json;
        try {
            json = JSON.parse(text);
        } catch (e) {
            if (text.includes('"status":"ok"') || text.includes("'status':'ok'")) {
                const match = text.match(/\{"status"\s*:\s*"ok"[^\}]*\}/) || text.match(/\{'status'\s*:\s*'ok'[^\}]*\}/);
                if (match) {
                    try {
                        json = JSON.parse(match[0]);
                    } catch (innerErr) {}
                }
                if (!json) {
                    json = { status: "ok", data: {} };
                }
            } else {
                throw new Error("Failed to parse response: " + text.slice(0, 100));
            }
        }

        if (json.status !== "ok") throw new Error(json.message);
        return json.data;
    }, []);

    /**
     * Core GET wrapper to fetch the full database (history, bests, exercises, people, locations).
     * @param {boolean} forceRefresh 
     * @returns {Promise<any>}
     */
    const syncAll = useCallback(async (forceRefresh = false) => {
        const url = getApiUrl();
        const fetchUrl = url + (url.includes('?') ? '&' : '?') + 't=' + new Date().getTime();
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        try {
            const res = await fetch(fetchUrl, { 
                cache: "no-store",
                signal: controller.signal
            });
            const json = await res.json();
            if (json.status !== "ok") throw new Error(json.message);
            return json.data;
        } catch (fetchErr) {
            if (fetchErr.name === 'AbortError') {
                throw new Error("Request timed out after 60 seconds.");
            }
            throw fetchErr;
        } finally {
            clearTimeout(timeoutId);
        }
    }, []);

    /**
     * Log sets for an exercise.
     * @param {string} exName 
     * @param {Array} entries 
     * @returns {Promise<any>}
     */
    const logSet = useCallback((exName, entries) => {
        return sheetsPost({
            action: "logSet",
            exercise: exName,
            entries: entries,
            pin: "5050"
        });
    }, [sheetsPost]);

    /**
     * Delete a history entry.
     * @param {Object} entry 
     * @param {string} pin 
     * @returns {Promise<any>}
     */
    const deleteHistory = useCallback((entry, pin) => {
        return sheetsPost({
            action: "deleteHistory",
            ...entry,
            pin: pin
        });
    }, [sheetsPost]);

    /**
     * Save exercise metadata for cloned/swapped exercises.
     * @param {Object} metadata 
     * @returns {Promise<any>}
     */
    const saveExercise = useCallback((metadata) => {
        return sheetsPost({
            action: "saveExercise",
            exercise: metadata.name || metadata.exercise,
            ...metadata,
            pin: "5050"
        });
    }, [sheetsPost]);

    /**
     * Save people, locations, or bulk metadata.
     * @param {Array} people 
     * @param {Array} locations 
     * @param {Array} exercises 
     * @returns {Promise<any>}
     */
    const syncMeta = useCallback((people, locations, exercises) => {
        return sheetsPost({
            action: "syncMeta",
            people,
            locations,
            exercises
        });
    }, [sheetsPost]);

    return {
        syncAll,
        logSet,
        deleteHistory,
        saveExercise,
        syncMeta,
        sheetsPost
    };
}
