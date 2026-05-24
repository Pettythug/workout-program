/**
 * GYM LOG CORE ENGINE (v1.0.0)
 * Author: Brian Wance
 * 
 * Shared logic for Ultimate, Tracker Pro, and Builder Pro.
 * Provides unified constants, API communication, and roster management.
 */

// ── MASTER CONFIGURATION ──────────────────────────────────────────────────
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwtpr_4LEVCXRyMv_v86796HIN0v36kdULk7DVSI2x3R2KIbjh9KGWFV0lXT7x8MZTo7g/exec";

// ── SHARED STORAGE KEYS ───────────────────────────────────────────────────
const STORAGE_KEY         = "gym-tracker-v4";
const PEOPLE_KEY          = "gym-tracker-people-v1";
const LOCATIONS_KEY       = "gym-tracker-locations-v1";
const HIDDEN_PEOPLE_KEY   = "gym-tracker-hidden-people-v1";
const ACTIVE_PEOPLE_KEY   = "gym-active-people-v1";
const ACTIVE_LOCATION_KEY = "gym-active-location-v1";
const ACTIVE_TYPE_KEY     = "gym-active-type-v1";

// ── APP-SPECIFIC KEYS (Unified) ───────────────────────────────────────────
const NUM_KEY             = "builder_workout_num";
const TYPE_KEY            = "builder_last_workout_type";
const LOC_KEY             = "builder_location";
const PRIMARY_USER_KEY    = "builder_primary_user";
const PLANNER_NOTES_KEY   = "gym-planner-notes";
const API_URL_KEY         = "gym_api_url";

// ── DEFAULT DATA ──────────────────────────────────────────────────────────
const DEFAULT_PEOPLE    = ["Brian", "Dad"];
const DEFAULT_LOCATIONS = ["Anywhere", "Home", "24 Hour Fitness"];
const EXERCISE_CATEGORIES = [
    "Explosive", "Knee Dominant", "Hip Dominant", "Horizontal Push",
    "Horizontal Pull", "Vertical Push", "Vertical Pull", "Rotational Core",
    "Plank Core", "Accessory"
];
const REP_RANGES = [
    { key: "r1_3",     label: "1-3"  },
    { key: "r4_7",     label: "4-7"  },
    { key: "r8_12",    label: "8-12" },
    { key: "r13_plus", label: "13+"  }
];

// ── TIME & WEIGHT UTILITIES ───────────────────────────────────────────────
function parseTime(val) {
    const str = String(val || "").trim();
    if (!str) return 0;
    if (str.includes(":")) {
        const [m, s] = str.split(":");
        return (parseInt(m) || 0) * 60 + (parseInt(s) || 0);
    }
    return parseInt(str) || 0;
}

function formatTime(totalSeconds) {
    const s = Math.max(0, parseInt(totalSeconds) || 0);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function normalizeTimeInput(val) {
    const str = String(val || "").trim();
    if (!str || /^\d+:\d+$/.test(str)) return str;
    if (/^\d+$/.test(str)) return formatTime(parseInt(str));
    return str;
}

function parseWeight(w) {
    const n = parseFloat(String(w).replace(/[^0-9.\-]/g, ""));
    return isNaN(n) ? 0 : n;
}

function todayStr() {
    return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function normalizeDuration(val) {
    if (!val || val.toString().includes(':')) return val;
    const seconds = parseInt(val);
    if (isNaN(seconds)) return val;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── LOGIC UTILITIES ───────────────────────────────────────────────────────
function getRange(reps) {
    const n = parseInt(reps);
    if (isNaN(n)) return null;
    if (n >= 1  && n <= 3)  return "r1_3";
    if (n >= 4  && n <= 7)  return "r4_7";
    if (n >= 8  && n <= 12) return "r8_12";
    if (n >= 13)            return "r13_plus";
    return null;
}

function getBaseName(name) {
    if (!name) return "";
    return name
        .replace(/^(One Arm |One Leg |Single-leg |Single Leg |Single )/i, '')
        .replace(/ \(Single\)$/i, '')
        .replace(/ \(Alt\)$/i, '')
        .replace(/ \(Alternating\)$/i, '')
        .trim();
}

function getMode(name) {
    if (!name) return "std";
    if (/single|one arm|one leg/i.test(name)) return 'single';
    if (/alt/i.test(name)) return 'alt';
    return 'std';
}

function getStandardizedName(name) {
    const base = getBaseName(name);
    const mode = getMode(name);
    if (mode === 'single') return `${base} (Single)`;
    if (mode === 'alt')    return `${base} (Alt)`;
    return base;
}

function isBetter(newEntry, oldEntry, timed) {
    if (timed) return parseTime(newEntry.reps) > parseTime(oldEntry?.reps || "0:00");
    return parseWeight(newEntry.weight) > parseWeight(oldEntry?.weight || 0);
}

function migrateRanges(exercises) {
    return exercises.map(ex => {
        const newBest = {};
        for (const person of Object.keys(ex.best || {})) {
            newBest[person] = {};
            for (const [key, val] of Object.entries(ex.best[person] || {})) {
                const nk = key === "r15_20" ? "r13_plus" : key;
                if (!newBest[person][nk] || parseWeight(val?.weight) > parseWeight(newBest[person][nk]?.weight)) {
                    newBest[person][nk] = val;
                }
            }
        }
        const newHistory = (ex.history || []).map(h => h.range === "r15_20" ? { ...h, range: "r13_plus" } : h);
        return { ...ex, best: newBest, history: newHistory };
    });
}

// ── API COMMUNICATION ─────────────────────────────────────────────────────
let globalDataPromise = null;
async function sheetsGet(forceRefresh = false) {
    if (!forceRefresh && globalDataPromise) {
        return globalDataPromise;
    }

    const url = localStorage.getItem('gym_api_url') || SCRIPT_URL;
    const fetchUrl = url + (url.includes('?') ? '&' : '?') + 't=' + new Date().getTime();
    
    globalDataPromise = fetch(fetchUrl, { cache: "no-store" }).then(async res => {
        const json = await res.json();
        if (json.status !== "ok") throw new Error(json.message);
        window.gymGlobalData = json.data;
        return json.data;
    }).catch(err => {
        globalDataPromise = null;
        throw err;
    });

    return globalDataPromise;
}

async function sheetsPost(payload) {
    const url = localStorage.getItem('gym_api_url') || SCRIPT_URL;
    const payloadStr = JSON.stringify(payload);
    let res;
    
    // If payload is massive (like syncAll), use true POST to avoid URL limits
    if (payloadStr.length > 1500 || payload.action === "syncAll") {
        res = await fetch(url, {
            method: "POST",
            body: payloadStr,
            // Using text/plain avoids CORS preflight OPTIONS request
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            keepalive: true
        });
    } else {
        // Fallback to GET tunneling for standard small ops
        const encoded = encodeURIComponent(payloadStr);
        res = await fetch(url + "?payload=" + encoded, { keepalive: true });
    }
    
    const json = await res.json();
    if (json.status !== "ok") throw new Error(json.message);
    return json.data;
}

function mergeFromSheets(localExercises, sheetsData, localPeople, localLocations) {
    const { history: allHistory, best: allBest, people: sheetPeople, exercises: sheetExercises, locations: sheetDerivedLocs } = sheetsData;
    const people = (sheetPeople && sheetPeople.length > 0) ? sheetPeople : localPeople;
    const mergedLocs = [...new Set([...localLocations, ...(sheetDerivedLocs || [])])];

    const makeBest = () => {
        const b = {};
        people.forEach(p => { b[p.toLowerCase()] = {}; });
        return b;
    };

    const merged = localExercises.map(ex => {
        const sheetHistory = allHistory.filter(h => h.exercise === ex.name);
        const sheetBest    = allBest[ex.name];
        const sheetExInfo  = (sheetExercises || []).find(e => e.name === ex.name);
        return {
            ...ex,
            timed:    sheetExInfo?.timed    ?? ex.timed    ?? false,
            category: sheetExInfo?.category ?? ex.category ?? "",
            location: sheetExInfo?.location ?? ex.location ?? "Anywhere",
            history:  sheetHistory,
            best:     sheetBest || makeBest(),
        };
    });

    return { exercises: merged, people, locations: mergedLocs };
}

// ── BROADCAST SYSTEM ──────────────────────────────────────────────────────
function notifySettingsUpdated() {
    window.dispatchEvent(new Event('gym-settings-updated'));
}

// ── UI UTILITIES ──────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.position = 'fixed';
        container.style.bottom = '80px';
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        container.style.zIndex = '9999';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '8px';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.background = type === 'error' ? '#ef4444' : '#22c55e';
    toast.style.color = '#fff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.fontFamily = "'DM Sans', sans-serif";
    toast.style.fontSize = '14px';
    toast.style.fontWeight = '600';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    
    container.appendChild(toast);
    
    // trigger reflow
    void toast.offsetWidth;
    toast.style.opacity = '1';
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2400);
}
