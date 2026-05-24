// =============================================================================
// Combined_AppScript_v3.gs
// Author: Brian Wance
//
// Version 3 of the GymLog backend.
//
// Changes from v2:
//   - Purged all legacy 'Workout Builder' (wb_) routes and functions.
//   - Backend is now strictly optimized for the GymLog Ultimate SPA.
//
// Changes from v1 (Combined_AppScript.gs):
//   - Rep range r15_20 → r13_plus (any reps >= 13, no upper limit)
//   - GymLog Best tab schema redesigned:
//       Old: Exercise | Brian_r1_3 | Brian_r4_7 | Brian_r8_12 | Brian_r15_20 | Dad_...
//       New: Exercise | Person | r1_3 | r4_7 | r8_12 | r13_plus
//       One row per exercise+person — supports dynamic roster
//   - Added GymLog_People tab for cross-device roster sync
//   - Added savePeople action handler
//   - gymlog_doGet() now returns people[] array
//   - Old r15_20 entries in history are transparently remapped to r13_plus on read/write
//   - migrateBestTab() one-time migration utility (run once from editor after deploy)
//
// Rollback: Re-paste Combined_AppScript_v2.gs content into the editor and redeploy.
// =============================================================================

// ── Constants ─────────────────────────────────────────────────────────────────

const SHEET_ID    = "1Y9xiUf-2w_Ko_YVIxj3KPIjFc8UDNg8U1wPc9fXSqx4";
const ADMIN_PIN   = "5050";
const HISTORY_TAB = "GymLog_History";
const BEST_TAB    = "GymLog";          // same tab name as before, schema changes after migration
const PEOPLE_TAB  = "GymLog_People";   // new tab
const EXERCISES_TAB = "GymLog_Exercises"; // exercise metadata: timed flag + category

const HISTORY_HEADERS   = ["Date", "Person", "Exercise", "Reps", "Weight", "Rep Range", "Note", "Set #"];
const BEST_HEADERS      = ["Exercise", "Person", "r1_3", "r4_7", "r8_12", "r13_plus"];
const PEOPLE_HEADERS    = ["Name"];
const EXERCISES_HEADERS = ["Exercise", "Timed", "Category", "Location", "Note"];
const SETTINGS_TAB      = "GymLog_Settings";
const SETTINGS_HEADERS  = ["Setting", "Value"];
const REP_RANGES        = ["r1_3", "r4_7", "r8_12", "r13_plus"];
const DEFAULT_PEOPLE  = ["Brian", "Dad"];

// Workout Builder tabs (unchanged)
const WB_WORKOUTS_TAB  = "Workouts";
const WB_EXERCISES_TAB = "Exercises";
const WB_MAXES_TAB     = "Maxes";
const WB_LOG_TAB       = "Log";

// =============================================================================
// ENTRY POINTS
// =============================================================================

/**
 * GET handler.
 * - If ?payload= is present → GymLog write op tunneled through GET.
 * - If ?action= matches a Workout Builder action → routes there.
 * - Otherwise → GymLog read (returns history + best + people).
 */
function doGet(e) {
  const action     = e?.parameter?.action;
  const payloadStr = e?.parameter?.payload;

  // GymLog write ops tunneled through GET (Apps Script POST workaround)
  if (payloadStr) {
    try {
      const payload = JSON.parse(payloadStr);
      if (payload.action === "logSet")         return gymlog_handleLogSet(payload);
      if (payload.action === "syncAll")        return gymlog_handleSyncAll(payload);
      if (payload.action === "syncMeta")       return gymlog_handleSyncMeta(payload);
      if (payload.action === "deleteHistory")  return gymlog_handleDeleteHistory(payload);
      if (payload.action === "deleteExercise") return gymlog_handleDeleteExercise(payload);
      if (payload.action === "savePeople")     return gymlog_handleSavePeople(payload);
      if (payload.action === "saveExercise")   return gymlog_handleSaveExercise(payload);
      if (payload.action === "getSettings")    return gymlog_handleGetSettings();
      if (payload.action === "saveSettings")   return gymlog_handleSaveSettings(payload);
      if (payload.action === "saveExerciseNote") return gymlog_handleSaveExerciseNote(payload);
      return err("Unknown payload action: " + payload.action);
    } catch (ex) {
      return err(ex.message);
    }
  }


  // Default: GymLog read
  return gymlog_doGet();
}

/**
 * POST handler — GymLog writes.
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    if (payload.action === "logSet")         return gymlog_handleLogSet(payload);
    if (payload.action === "syncAll")        return gymlog_handleSyncAll(payload);
    if (payload.action === "syncMeta")       return gymlog_handleSyncMeta(payload);
    if (payload.action === "deleteHistory")  return gymlog_handleDeleteHistory(payload);
    if (payload.action === "savePeople")     return gymlog_handleSavePeople(payload);
    if (payload.action === "saveExercise")   return gymlog_handleSaveExercise(payload);
    if (payload.action === "saveSettings")   return gymlog_handleSaveSettings(payload);
    if (payload.action === "saveExerciseNote") return gymlog_handleSaveExerciseNote(payload);
    return err("Unknown action: " + payload.action);
  } catch (ex) {
    return err(ex.message);
  }
}


// =============================================================================
// GYMLOG — SHARED HELPERS
// =============================================================================

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#f3f3f3");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function cors(output) {
  return output.setMimeType(ContentService.MimeType.JSON);
}

function ok(data) {
  return cors(ContentService.createTextOutput(JSON.stringify({ status: "ok", data })));
}

function err(msg) {
  return cors(ContentService.createTextOutput(JSON.stringify({ status: "error", message: msg })));
}

function clearDataRows(sheet) {
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }
}

// Normalize old rep range key to new one
function normalizeRange(range) {
  return String(range).trim() === "r15_20" ? "r13_plus" : String(range).trim();
}

// Parse "8x135" → {reps:"8", weight:"135"} | "8 reps" → {reps:"8", weight:""}
function parseBest(str) {
  if (!str) return null;
  const s = String(str).trim();
  if (!s) return null;
  if (s.includes("x")) {
    const [reps, weight] = s.split("x");
    return { reps: reps.trim(), weight: weight.trim() };
  }
  return { reps: s.replace(" reps", "").trim(), weight: "" };
}

// Format {reps, weight} → "8x135" or "8 reps"
function formatBest(b) {
  if (!b) return "";
  return b.weight ? `${b.reps}x${b.weight}` : `${b.reps} reps`;
}


// =============================================================================
// GYMLOG — GET (read all data for the frontend)
// =============================================================================

function gymlog_doGet() {
  try {
    const histSheet   = getOrCreateSheet(HISTORY_TAB, HISTORY_HEADERS);
    const bestSheet   = getOrCreateSheet(BEST_TAB,    BEST_HEADERS);
    const peopleSheet = getOrCreateSheet(PEOPLE_TAB,  PEOPLE_HEADERS);

    // ── History ───────────────────────────────────────────────────────────────
    const histRaw = histSheet.getLastRow() > 1
      ? histSheet.getRange(2, 1, histSheet.getLastRow() - 1, HISTORY_HEADERS.length).getValues()
      : [];

    const history = histRaw.map(r => ({
      date:     r[0] ? Utilities.formatDate(new Date(r[0]), Session.getScriptTimeZone(), "MMM d, yyyy") : "",
      person:   String(r[1]),
      exercise: String(r[2]),
      reps:     String(r[3]),
      weight:   String(r[4]),
      range:    normalizeRange(r[5]),   // remap r15_20 → r13_plus on read
      note:     String(r[6] || ""),
      setNum:   r[7]
    }));

    // ── Best (row-per-person schema) ──────────────────────────────────────────
    // After migrateBestTab() the schema is: Exercise | Person | r1_3 | r4_7 | r8_12 | r13_plus
    const bestRaw = bestSheet.getLastRow() > 1
      ? bestSheet.getRange(2, 1, bestSheet.getLastRow() - 1, BEST_HEADERS.length).getValues()
      : [];

    const best = {};
    bestRaw.forEach(r => {
      const exerciseName = String(r[0]).trim();
      const person       = String(r[1]).toLowerCase().trim();
      if (!exerciseName || !person) return;
      if (!best[exerciseName]) best[exerciseName] = {};
      best[exerciseName][person] = {
        r1_3:     parseBest(r[2]),
        r4_7:     parseBest(r[3]),
        r8_12:    parseBest(r[4]),
        r13_plus: parseBest(r[5]),
      };
    });

    // ── People roster ─────────────────────────────────────────────────────────
    const peopleRaw = peopleSheet.getLastRow() > 1
      ? peopleSheet.getRange(2, 1, peopleSheet.getLastRow() - 1, 1).getValues()
      : [];
    const people = peopleRaw.map(r => String(r[0])).filter(n => n.trim());

    // ── Exercise metadata (timed flag + category) ─────────────────────────────
    const exSheet   = getOrCreateSheet(EXERCISES_TAB, EXERCISES_HEADERS);
    const exRaw     = exSheet.getLastRow() > 1
      ? exSheet.getRange(2, 1, exSheet.getLastRow() - 1, EXERCISES_HEADERS.length).getValues()
      : [];
    const exercisesMeta = exRaw.map(r => ({
      name:     String(r[0]).trim(),
      timed:    r[1] === true || String(r[1]).toLowerCase() === "true",
      category: String(r[2] || "").trim(),
      location: String(r[3] || "Anywhere").trim() || "Anywhere",
      note:     String(r[4] || "").trim(),
    })).filter(e => e.name);

    // Derive unique non-default locations from exercises for the frontend location picker
    const derivedLocations = [...new Set(
      exercisesMeta.map(e => e.location).filter(l => l && l !== "Anywhere")
    )];

    return ok({
      history,
      best,
      people:    people.length > 0 ? people : DEFAULT_PEOPLE,
      exercises: exercisesMeta,
      locations: derivedLocations,
      settings:  gymlog_getSettingsInternal()
    });

  } catch (e) {
    return err(e.message);
  }
}


// =============================================================================
// GYMLOG — LOG SET
// =============================================================================

function gymlog_handleLogSet(payload) {
  const { exercise, entries } = payload;
  const histSheet = getOrCreateSheet(HISTORY_TAB, HISTORY_HEADERS);

  entries.forEach(entry => {
    histSheet.appendRow([
      entry.date,
      entry.person,
      exercise,
      entry.reps,
      entry.weight,
      normalizeRange(entry.range),   // remap r15_20 → r13_plus on write
      entry.note   || "",
      entry.setNum || ""
    ]);
  });

  gymlog_recalculateBestForExercise(exercise);
  return ok({ logged: entries.length });
}


// =============================================================================
// GYMLOG — RECALCULATE BEST (row-per-person schema)
// =============================================================================

function gymlog_recalculateBestForExercise(exerciseName) {
  SpreadsheetApp.flush();

  const histSheet  = getOrCreateSheet(HISTORY_TAB, HISTORY_HEADERS);
  const bestSheet  = getOrCreateSheet(BEST_TAB,    BEST_HEADERS);
  const targetName = String(exerciseName).trim();

  // Read all history rows for this exercise
  const histRaw = histSheet.getLastRow() > 1
    ? histSheet.getRange(2, 1, histSheet.getLastRow() - 1, HISTORY_HEADERS.length).getValues()
    : [];

  const entries = histRaw
    .filter(r => String(r[2]).trim() === targetName)
    .map(r => ({
      person: String(r[1]).toLowerCase().trim(),
      reps:   String(r[3]),
      weight: String(r[4]),
      range:  normalizeRange(r[5])
    }));

  // Build best-per-person-per-range from history
  const byPerson = {};
  entries.forEach(entry => {
    if (!REP_RANGES.includes(entry.range)) return; // skip unknown
    if (!byPerson[entry.person]) {
      byPerson[entry.person] = { r1_3: null, r4_7: null, r8_12: null, r13_plus: null };
    }
    const current = byPerson[entry.person][entry.range];
    const newW    = parseFloat(entry.weight.replace(/[^0-9.\-]/g, "")) || 0;
    const newR    = parseInt(entry.reps.replace(/[^0-9]/g, ""))        || 0;
    const curW    = current ? (parseFloat(current.weight.replace(/[^0-9.\-]/g, "")) || 0) : 0;
    const curR    = current ? (parseInt(current.reps.replace(/[^0-9]/g, ""))        || 0) : 0;
    if (!current || newW > curW || (newW === curW && newR > curR)) {
      byPerson[entry.person][entry.range] = { reps: entry.reps, weight: entry.weight };
    }
  });

  // Delete existing best rows for this exercise
  SpreadsheetApp.flush();
  const lastRow = bestSheet.getLastRow();
  if (lastRow > 1) {
    const names = bestSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = names.length - 1; i >= 0; i--) {
      if (String(names[i][0]).trim() === targetName) bestSheet.deleteRow(i + 2);
    }
  }

  // Write new rows — one per person with data
  if (Object.keys(byPerson).length === 0) return;
  SpreadsheetApp.flush();
  for (const person of Object.keys(byPerson)) {
    const b = byPerson[person];
    bestSheet.appendRow([
      targetName, person,
      formatBest(b.r1_3),
      formatBest(b.r4_7),
      formatBest(b.r8_12),
      formatBest(b.r13_plus)
    ]);
  }
}


// =============================================================================
// GYMLOG — SYNC META (lightweight: people + exercise metadata only, no history)
// Used by the manual sync button in Settings. History is already in Sheets
// from individual logSet calls and does not need to be re-sent.
// =============================================================================

function gymlog_handleSyncMeta(payload) {
  const { people: payloadPeople, exercises: exMeta } = payload;

  // Save people roster
  if (payloadPeople && payloadPeople.length > 0) {
    const peopleSheet = getOrCreateSheet(PEOPLE_TAB, PEOPLE_HEADERS);
    clearDataRows(peopleSheet);
    payloadPeople.forEach(name => peopleSheet.appendRow([String(name)]));
  }

  // Save exercise metadata (clear + rewrite GymLog_Exercises tab)
  if (exMeta && exMeta.length > 0) {
    const exSheet = getOrCreateSheet(EXERCISES_TAB, EXERCISES_HEADERS);
    clearDataRows(exSheet);
    exMeta.forEach(ex => {
      exSheet.appendRow([ex.name, ex.timed ? true : false, ex.category || "", ex.location || "Anywhere", ex.note || ""]);
    });
  }

  return ok({ synced: exMeta?.length || 0 });
}


// =============================================================================
// GYMLOG — SYNC ALL (full overwrite — kept for data migration or emergencies)
// =============================================================================

function gymlog_handleSyncAll(payload) {
  const { exercises, people: payloadPeople } = payload;

  const histSheet   = getOrCreateSheet(HISTORY_TAB, HISTORY_HEADERS);
  const bestSheet   = getOrCreateSheet(BEST_TAB,    BEST_HEADERS);
  const peopleSheet = getOrCreateSheet(PEOPLE_TAB,  PEOPLE_HEADERS);

  clearDataRows(histSheet);
  clearDataRows(bestSheet);

  exercises.forEach(ex => {
    // Write history
    (ex.history || []).forEach(h => {
      histSheet.appendRow([
        h.date, h.person, ex.name, h.reps, h.weight,
        normalizeRange(h.range),
        h.note   || "",
        h.setNum || ""
      ]);
    });

    // Write best (row-per-person)
    const b = ex.best || {};
    for (const personKey of Object.keys(b)) {
      const pb = b[personKey];
      if (!pb || Object.keys(pb).length === 0) continue;
      bestSheet.appendRow([
        ex.name, personKey,
        formatBest(pb.r1_3),
        formatBest(pb.r4_7),
        formatBest(pb.r8_12),
        formatBest(pb.r13_plus || pb.r15_20)  // handle old key from stale localStorage
      ]);
    }
  });

  // Save people roster if provided
  if (payloadPeople && payloadPeople.length > 0) {
    clearDataRows(peopleSheet);
    payloadPeople.forEach(name => peopleSheet.appendRow([String(name)]));
  }

  // Save exercise metadata if provided
  const exSheet = getOrCreateSheet(EXERCISES_TAB, EXERCISES_HEADERS);
  clearDataRows(exSheet);
  exercises.forEach(ex => {
    exSheet.appendRow([ex.name, ex.timed ? true : false, ex.category || "", ex.location || "Anywhere", ex.note || ""]);
  });

  return ok({ synced: exercises.length });
}


// =============================================================================
// GYMLOG — SAVE EXERCISE METADATA
// =============================================================================

function gymlog_handleSaveExercise(payload) {
  verifyAdminPin(payload);
  const { exercise, timed, category, location } = payload;
  if (!exercise) return err("No exercise name provided");

  const exSheet = getOrCreateSheet(EXERCISES_TAB, EXERCISES_HEADERS);

  // Upsert: update existing row or append new one
  const lastRow = exSheet.getLastRow();
  let rowIndex  = -1;
  if (lastRow > 1) {
    const names = exSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < names.length; i++) {
      if (String(names[i][0]).trim().toLowerCase() === String(exercise).trim().toLowerCase()) {
        rowIndex = i + 2;
        break;
      }
    }
  }

  const row = [exercise, timed ? true : false, category || "", location || "Anywhere", payload.note || ""];
  if (rowIndex > 0) {
    exSheet.getRange(rowIndex, 1, 1, EXERCISES_HEADERS.length).setValues([row]);
  } else {
    exSheet.appendRow(row);
  }

  return ok({ saved: exercise });
}

function gymlog_handleSaveExerciseNote(payload) {
  const { exercise, note } = payload;
  if (!exercise) return err("No exercise name provided");

  const exSheet = getOrCreateSheet(EXERCISES_TAB, EXERCISES_HEADERS);
  const lastRow = exSheet.getLastRow();
  let rowIndex  = -1;
  if (lastRow > 1) {
    const names = exSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < names.length; i++) {
      if (String(names[i][0]).trim().toLowerCase() === String(exercise).trim().toLowerCase()) {
        rowIndex = i + 2;
        break;
      }
    }
  }

  if (rowIndex > 0) {
    // Update only the Note column (column 5)
    exSheet.getRange(rowIndex, 5).setValue(note || "");
    return ok({ savedNote: exercise });
  } else {
    // If exercise doesn't exist in metadata, create it with just the note
    exSheet.appendRow([exercise, false, "", "Anywhere", note || ""]);
    return ok({ createdMetadata: exercise });
  }
}


// =============================================================================
// GYMLOG — SAVE PEOPLE
// =============================================================================

function gymlog_handleSavePeople(payload) {
  const { people } = payload;
  if (!people || !Array.isArray(people)) return err("No people array provided");

  const peopleSheet = getOrCreateSheet(PEOPLE_TAB, PEOPLE_HEADERS);
  clearDataRows(peopleSheet);
  people.forEach(name => peopleSheet.appendRow([String(name)]));

  return ok({ saved: people.length });
}


// =============================================================================
// GYMLOG — DELETE HISTORY ENTRY
// =============================================================================

function verifyAdminPin(payload) {
  if (payload.pin !== ADMIN_PIN) {
    throw new Error("Unauthorized: Invalid Admin PIN");
  }
}
function gymlog_handleDeleteHistory(payload) {
  verifyAdminPin(payload);
  const { exercise, person, reps, weight, range } = payload;
  const histSheet = getOrCreateSheet(HISTORY_TAB, HISTORY_HEADERS);

  if (histSheet.getLastRow() <= 1) return ok({ deleted: 0 });

  const data = histSheet.getRange(2, 1, histSheet.getLastRow() - 1, HISTORY_HEADERS.length).getValues();
  for (let i = data.length - 1; i >= 0; i--) {
    if (
      data[i][1] === person   &&
      data[i][2] === exercise &&
      String(data[i][3]) === String(reps)   &&
      String(data[i][4]) === String(weight) &&
      normalizeRange(data[i][5]) === normalizeRange(range)
    ) {
      histSheet.deleteRow(i + 2);
      break;
    }
  }

  gymlog_recalculateBestForExercise(exercise);
  return ok({ deleted: 1 });
}


// =============================================================================
// GYMLOG — SETTINGS (Global sync for workout num, etc)
// =============================================================================

function gymlog_handleGetSettings() {
  return ok(gymlog_getSettingsInternal());
}

function gymlog_getSettingsInternal() {
  try {
    const sheet = getOrCreateSheet(SETTINGS_TAB, SETTINGS_HEADERS);
    const data = sheet.getLastRow() > 1 
      ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues()
      : [];
    const settings = {};
    data.forEach(r => { if(r[0]) settings[r[0]] = r[1]; });
    return settings;
  } catch(e) {
    return {};
  }
}

function gymlog_handleSaveSettings(payload) {
  const { settings } = payload; // Expecting { "builder_workout_num": 117, ... }
  if (!settings) return err("No settings provided");
  const sheet = getOrCreateSheet(SETTINGS_TAB, SETTINGS_HEADERS);
  
  for (const key in settings) {
    const val = settings[key];
    const lastRow = sheet.getLastRow();
    let rowIndex = -1;
    if (lastRow > 1) {
      const keys = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (let i = 0; i < keys.length; i++) {
        if (String(keys[i][0]).trim() === String(key).trim()) { rowIndex = i + 2; break; }
      }
    }
    
    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 2).setValue(val);
    } else {
      sheet.appendRow([key, val]);
    }
  }
  return ok({ saved: Object.keys(settings).length });
}


// =============================================================================
// GYMLOG — DELETE EXERCISE
// =============================================================================

function gymlog_handleDeleteExercise(payload) {
  verifyAdminPin(payload);
  const { exercise } = payload;
  const histSheet = getOrCreateSheet(HISTORY_TAB, HISTORY_HEADERS);
  const bestSheet = getOrCreateSheet(BEST_TAB,    BEST_HEADERS);

  // Remove all history rows for this exercise
  if (histSheet.getLastRow() > 1) {
    const data = histSheet.getRange(2, 3, histSheet.getLastRow() - 1, 1).getValues();
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i][0] === exercise) histSheet.deleteRow(i + 2);
    }
  }

  // Remove all best rows for this exercise
  if (bestSheet.getLastRow() > 1) {
    const data = bestSheet.getRange(2, 1, bestSheet.getLastRow() - 1, 1).getValues();
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i][0] === exercise) bestSheet.deleteRow(i + 2);
    }
  }

  return ok({ deletedExercise: exercise });
}


// =============================================================================
// ONE-TIME MIGRATION UTILITY
//
// Run this ONCE from the Apps Script editor AFTER pasting this v2 code.
// Steps: select migrateBestTab from the function dropdown → click ▶ Run
//
// What it does:
//   1. Clears the GymLog Best tab (headers + all data)
//   2. Writes new headers (row-per-person schema)
//   3. Reads ALL rows from GymLog_History (never touched)
//   4. Remaps r15_20 → r13_plus on the fly
//   5. Rebuilds Best tab with one row per exercise+person combo
//
// History tab: NEVER MODIFIED. It is read-only in this function.
// Safe to run again if anything goes wrong — it always rebuilds from History.
// =============================================================================

function migrateBestTab() {
  const histSheet = getOrCreateSheet(HISTORY_TAB, HISTORY_HEADERS);
  const bestSheet = getOrCreateSheet(BEST_TAB,    BEST_HEADERS);

  Logger.log("=== migrateBestTab: Starting ===");

  // Step 1: Clear old Best tab entirely and write new headers
  bestSheet.clearContents();
  bestSheet.getRange(1, 1, 1, BEST_HEADERS.length).setValues([BEST_HEADERS]);
  bestSheet.getRange(1, 1, 1, BEST_HEADERS.length)
    .setFontWeight("bold")
    .setBackground("#f3f3f3");
  bestSheet.setFrozenRows(1);
  Logger.log("Step 1 complete: Best tab cleared, new headers written.");

  // Step 2: Read all history
  if (histSheet.getLastRow() <= 1) {
    Logger.log("No history found — done.");
    return;
  }

  const histData = histSheet.getRange(2, 1, histSheet.getLastRow() - 1, HISTORY_HEADERS.length).getValues();
  Logger.log("Step 2 complete: Read " + histData.length + " history rows.");

  // Step 3: Build bests from history
  // Structure: bests[exercise][person][range] = {reps, weight}
  const bests = {};

  histData.forEach(r => {
    const exercise = String(r[2]).trim();
    const person   = String(r[1]).toLowerCase().trim();
    const reps     = String(r[3]);
    const weight   = String(r[4]);
    const range    = normalizeRange(r[5]);  // r15_20 → r13_plus

    if (!exercise || !person || !REP_RANGES.includes(range)) return;

    if (!bests[exercise]) bests[exercise] = {};
    if (!bests[exercise][person]) {
      bests[exercise][person] = { r1_3: null, r4_7: null, r8_12: null, r13_plus: null };
    }

    const current = bests[exercise][person][range];
    const newW    = parseFloat(weight.replace(/[^0-9.\-]/g, "")) || 0;
    const newR    = parseInt(reps.replace(/[^0-9]/g, ""))        || 0;
    const curW    = current ? (parseFloat(current.weight.replace(/[^0-9.\-]/g, "")) || 0) : 0;
    const curR    = current ? (parseInt(current.reps.replace(/[^0-9]/g, ""))        || 0) : 0;

    if (!current || newW > curW || (newW === curW && newR > curR)) {
      bests[exercise][person][range] = { reps, weight };
    }
  });

  Logger.log("Step 3 complete: Bests calculated for " + Object.keys(bests).length + " exercises.");

  // Step 4: Write rows — one per exercise+person combo, sorted alphabetically
  let rowsWritten = 0;
  for (const exercise of Object.keys(bests).sort()) {
    for (const person of Object.keys(bests[exercise])) {
      const b = bests[exercise][person];
      bestSheet.appendRow([
        exercise, person,
        formatBest(b.r1_3),
        formatBest(b.r4_7),
        formatBest(b.r8_12),
        formatBest(b.r13_plus)
      ]);
      rowsWritten++;
    }
  }

  Logger.log("Step 4 complete: Wrote " + rowsWritten + " best rows.");
  Logger.log("=== Migration complete. You can now redeploy. ===");
}



