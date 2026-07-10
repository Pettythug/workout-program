// =============================================================================
// Combined_AppScript_v2.gs
// Author: Brian Wance
//
// Version 3 of the GymLog backend.
//
// Changes from v2:
//   - Purged all legacy 'Workout Builder' (wb_) routes and functions.
//   - Backend is now strictly optimized for the GymLog Ultimate SPA.
//   - Security: Implemented sanitizeInput() regex to prevent Sheets formula injection.
//   - Security: Removed legacy '5050' fallback PIN. Backend now locks if property is missing.
//   - Performance: Increased waitLock timeout to 30s to prevent concurrent write crashes.
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
// SECURITY: Set the ADMIN_PIN Script Property in Apps Script Project Settings > Script Properties
// to complete security hardening.
const ADMIN_PIN   = PropertiesService.getScriptProperties().getProperty('ADMIN_PIN');
if (!ADMIN_PIN) {
  throw new Error("FATAL: ADMIN_PIN Script Property is not configured. Backend locked.");
}
const HISTORY_TAB = "GymLog_History";
const BEST_TAB    = "GymLog";          // same tab name as before, schema changes after migration
const PEOPLE_TAB  = "GymLog_People";   // new tab
const EXERCISES_TAB = "GymLog_Exercises"; // exercise metadata: timed flag + category

const HISTORY_HEADERS   = ["Date", "Person", "Exercise", "Reps", "Weight", "Rep Range", "Note", "Set #"];
const BEST_HEADERS      = ["Exercise", "Person", "r1_3", "r4_7", "r8_12", "r13_plus"];
const PEOPLE_HEADERS    = ["Name"];
const EXERCISES_HEADERS = ["Exercise", "Timed", "Category", "Location", "Note", "Manufacturer", "Model Series", "Base Exercise", "Muscle Groups", "File Reference", "Circuit Eligible"];
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

function withLock(handler, payload) {
  const lock = LockService.getScriptLock();
  
  // 1. Attempt to acquire lock
  try {
    lock.waitLock(30000); // Wait up to 30 seconds for the lock
  } catch (e) {
    return err("Server is busy due to concurrent writes. Please try again.");
  }

  // 2. Execute handler and release lock safely
  try {
    return handler(payload);
  } catch (e) {
    return err(e.message);
  } finally {
    lock.releaseLock();
  }
}

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
      if (payload.action === "logSet")         return withLock(gymlog_handleLogSet, payload);
      if (payload.action === "syncAll")        return withLock(gymlog_handleSyncAll, payload);
      if (payload.action === "syncMeta")       return withLock(gymlog_handleSyncMeta, payload);
      if (payload.action === "deleteHistory")  return withLock(gymlog_handleDeleteHistory, payload);
      if (payload.action === "deleteExercise") return withLock(gymlog_handleDeleteExercise, payload);
      if (payload.action === "savePeople")     return withLock(gymlog_handleSavePeople, payload);
      if (payload.action === "saveExercise")   return withLock(gymlog_handleSaveExercise, payload);
      if (payload.action === "getSettings")    return gymlog_handleGetSettings();
      if (payload.action === "saveSettings")   return withLock(gymlog_handleSaveSettings, payload);
      if (payload.action === "saveExerciseNote") return withLock(gymlog_handleSaveExerciseNote, payload);
      if (payload.action === "renameExercise") return withLock(gymlog_handleRenameExercise, payload);
      if (payload.action === "uploadImage")    return withLock(gymlog_handleUploadImage, payload);
      if (payload.action === "getImage")      return gymlog_handleGetImage(payload);
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
    if (payload.action === "logSet")         return withLock(gymlog_handleLogSet, payload);
    if (payload.action === "syncAll")        return withLock(gymlog_handleSyncAll, payload);
    if (payload.action === "syncMeta")       return withLock(gymlog_handleSyncMeta, payload);
    if (payload.action === "deleteHistory")  return withLock(gymlog_handleDeleteHistory, payload);
    if (payload.action === "deleteExercise") return withLock(gymlog_handleDeleteExercise, payload);
    if (payload.action === "savePeople")     return withLock(gymlog_handleSavePeople, payload);
    if (payload.action === "saveExercise")   return withLock(gymlog_handleSaveExercise, payload);
    if (payload.action === "saveSettings")   return withLock(gymlog_handleSaveSettings, payload);
    if (payload.action === "saveExerciseNote") return withLock(gymlog_handleSaveExerciseNote, payload);
    if (payload.action === "renameExercise") return withLock(gymlog_handleRenameExercise, payload);
    if (payload.action === "uploadImage")    return withLock(gymlog_handleUploadImage, payload);
    if (payload.action === "getImage")      return gymlog_handleGetImage(payload);
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
  if (headers && headers.length > sheet.getMaxColumns()) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
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
      date:     r[0] ? Utilities.formatDate(new Date(r[0]), Session.getScriptTimeZone(), "MMM d, yyyy, h:mm a") : "",
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
    const exercisesMeta = exRaw.map(r => {
      const name = String(r[0]).trim();
      const safeName = name.replace(/\//g, " ");
      let fileRef = String(r[9] || "").trim();
      const isDriveId = fileRef && !fileRef.includes('.') && fileRef.length > 10;
      if (fileRef && !isDriveId && !fileRef.includes('.jpg')) {
          fileRef = `${safeName}.jpg`;
      }
      return {
        name:         name,
        timed:        r[1] === true || String(r[1]).toLowerCase() === "true",
        category:     String(r[2] || "").trim(),
        location:     String(r[3] || "Anywhere").trim() || "Anywhere",
        note:         String(r[4] || "").trim(),
        manufacturer: String(r[5] || "").trim(),
        modelSeries:  String(r[6] || "").trim(),
        baseExercise: String(r[7] || "").trim(),
        muscleGroups: String(r[8] || "").trim(),
        fileReference: fileRef,
        isCircuit:    r[10] === true || String(r[10]).toLowerCase() === "true"
      };
    }).filter(e => e.name);

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

function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/^[=+\-@]/, '');
}

function gymlog_handleLogSet(payload) {
  const { exercise, entries, userPins = {} } = payload;
  const histSheet = getOrCreateSheet(HISTORY_TAB, HISTORY_HEADERS);

  // Validate User PINs
  const scriptPinsStr = PropertiesService.getScriptProperties().getProperty('USER_PINS');
  const validPins = scriptPinsStr ? JSON.parse(scriptPinsStr) : {};

  for (const entry of entries) {
    const personKey = (entry.person || "").toLowerCase();
    if (!validPins[personKey]) {
      throw new Error(`Unauthorized: No PIN configured on the server for ${entry.person}`);
    }
    if (userPins[personKey] !== validPins[personKey]) {
      throw new Error(`Unauthorized: Invalid PIN for ${entry.person}`);
    }
  }

  entries.forEach(entry => {
    histSheet.appendRow([
      entry.date,
      entry.person,
      exercise,
      sanitizeInput(entry.reps),
      sanitizeInput(entry.weight),
      normalizeRange(entry.range),   // remap r15_20 → r13_plus on write
      sanitizeInput(entry.note || ""),
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
  const histSheet  = getOrCreateSheet(HISTORY_TAB, HISTORY_HEADERS);
  const bestSheet  = getOrCreateSheet(BEST_TAB,    BEST_HEADERS);
  const targetName = String(exerciseName).trim();
  // 1. Read all history rows for this exercise in a single batch read
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
  // 2. Build best-per-person-per-range from history in memory
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
  // 3. Batch read the entire Best sheet to modify it in memory
  const bestLastRow = bestSheet.getLastRow();
  let allBests = bestLastRow > 1
    ? bestSheet.getRange(2, 1, bestLastRow - 1, BEST_HEADERS.length).getValues()
    : [];
  // Filter out any existing rows for this exercise in memory (no slow deleteRow in a loop)
  allBests = allBests.filter(row => String(row[0]).trim() !== targetName);
  // Append new computed best rows in memory
  for (const person of Object.keys(byPerson)) {
    const b = byPerson[person];
    allBests.push([
      targetName, person,
      formatBest(b.r1_3),
      formatBest(b.r4_7),
      formatBest(b.r8_12),
      formatBest(b.r13_plus)
    ]);
  }
  // 4. Batch write back to the sheet
  if (bestLastRow > 1) {
    bestSheet.getRange(2, 1, bestLastRow - 1, BEST_HEADERS.length).clearContent();
  }
  if (allBests.length > 0) {
    bestSheet.getRange(2, 1, allBests.length, BEST_HEADERS.length).setValues(allBests);
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
  if (payload.pin !== ADMIN_PIN) {
    return err("syncAll requires Admin PIN. Legacy web clients are not authorized to overwrite history.");
  }
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
  const exercise = payload.exercise || payload.name;
  if (!exercise) return err("No exercise name provided");

  const exSheet = getOrCreateSheet(EXERCISES_TAB, EXERCISES_HEADERS);

  // Find existing row
  const lastRow = exSheet.getLastRow();
  let rowIndex  = -1;
  let existingRow = [];
  if (lastRow > 1) {
    const names = exSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < names.length; i++) {
      if (String(names[i][0]).trim().toLowerCase() === String(exercise).trim().toLowerCase()) {
        rowIndex = i + 2;
        existingRow = exSheet.getRange(rowIndex, 1, 1, EXERCISES_HEADERS.length).getValues()[0];
        break;
      }
    }
  }

  // Map properties falling back to existing row cells if undefined in payload
  const getVal = (payloadVal, existingIdx, defaultVal = "") => {
    if (payloadVal !== undefined && payloadVal !== null) return payloadVal;
    if (rowIndex > -1 && existingRow[existingIdx] !== undefined && existingRow[existingIdx] !== null) {
      return existingRow[existingIdx];
    }
    return defaultVal;
  };

  const finalTimed = getVal(payload.timed, 1, false);
  const finalIsCircuit = getVal(payload.isCircuit, 10, false);

  const newRow = [
    exercise,
    finalTimed === true || String(finalTimed).toLowerCase() === "true",
    getVal(payload.category, 2, ""),
    getVal(payload.location, 3, "Anywhere"),
    getVal(payload.note, 4, ""),
    getVal(payload.manufacturer, 5, ""),
    getVal(payload.modelSeries, 6, ""),
    getVal(payload.baseExercise, 7, ""),
    getVal(payload.muscleGroups, 8, ""),
    getVal(payload.fileReference, 9, ""),
    finalIsCircuit === true || String(finalIsCircuit).toLowerCase() === "true"
  ];

  if (rowIndex > -1) {
    exSheet.getRange(rowIndex, 1, 1, newRow.length).setValues([newRow]);
  } else {
    exSheet.appendRow(newRow);
  }

  gymlog_recalculateBestForExercise(exercise);
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
    exSheet.appendRow([exercise, false, "", "Anywhere", note || "", "", "", "", "", ""]);
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
  const exSheet   = getOrCreateSheet(EXERCISES_TAB, EXERCISES_HEADERS);
  const bestSheet = getOrCreateSheet(BEST_TAB,    BEST_HEADERS);
  const targetName = String(exercise).trim().toLowerCase();

  // Remove exercise metadata in bulk
  if (exSheet.getLastRow() > 1) {
    const range = exSheet.getRange(2, 1, exSheet.getLastRow() - 1, exSheet.getLastColumn());
    const data = range.getValues();
    const newData = data.filter(r => String(r[0]).trim().toLowerCase() !== targetName);
    if (newData.length !== data.length) {
      clearDataRows(exSheet);
      if (newData.length > 0) {
        exSheet.getRange(2, 1, newData.length, exSheet.getLastColumn()).setValues(newData);
      }
    }
  }

  // Remove all best rows for this exercise in bulk
  if (bestSheet.getLastRow() > 1) {
    const range = bestSheet.getRange(2, 1, bestSheet.getLastRow() - 1, bestSheet.getLastColumn());
    const data = range.getValues();
    const newData = data.filter(r => String(r[0]).trim().toLowerCase() !== targetName);
    if (newData.length !== data.length) {
      clearDataRows(bestSheet);
      if (newData.length > 0) {
        bestSheet.getRange(2, 1, newData.length, bestSheet.getLastColumn()).setValues(newData);
      }
    }
  }

  // NOTE: History is intentionally left intact for data integrity.
  return ok({ deletedExercise: exercise });
}


// =============================================================================
// ONE-TIME MIGRATION UTILITY
//

// =============================================================================
// GYMLOG — RENAME/MERGE EXERCISE
// =============================================================================

function gymlog_getBaseName(name) {
  if (!name) return "";
  return name
    .replace(/^(One Arm |One Leg |Single-leg |Single Leg |Single |Alt |Alternating )/gi, '')
    .replace(/ \(Single\)$/gi, '')
    .replace(/ \(Alt\)$/gi, '')
    .replace(/ \(Alternating\)$/gi, '')
    .trim();
}

function gymlog_escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function gymlog_handleRenameExercise(payload) {
  verifyAdminPin(payload);
  const { oldName, newName, mergeConfirmed } = payload;
  if (!oldName || !newName) return err("Missing oldName or newName");
  if (oldName.trim().toLowerCase() === newName.trim().toLowerCase()) return err("Names are identical");

  const exSheet = getOrCreateSheet(EXERCISES_TAB, EXERCISES_HEADERS);
  
  const oldBaseLower = gymlog_getBaseName(oldName).toLowerCase();
  const newBase = gymlog_getBaseName(newName); // Keep original casing for replacement
  
  // Collect all unique variations of oldName from Exercises tab
  const variationsToRename = [];
  let exData = [];
  if (exSheet.getLastRow() > 1) {
    exData = exSheet.getRange(2, 1, exSheet.getLastRow() - 1, exSheet.getLastColumn()).getValues();
    for (let i = 0; i < exData.length; i++) {
      const name = String(exData[i][0]).trim();
      if (gymlog_getBaseName(name).toLowerCase() === oldBaseLower) {
        if (!variationsToRename.some(v => v.old.toLowerCase() === name.toLowerCase())) {
          let calcNew = name;
          if (oldBaseLower.length > 0) {
            calcNew = name.replace(new RegExp(gymlog_escapeRegExp(oldBaseLower), 'i'), newBase);
          } else {
            calcNew = newName;
          }
          variationsToRename.push({ old: name, new: calcNew, oldLower: name.toLowerCase(), newLower: calcNew.toLowerCase() });
        }
      }
    }
  }
  
  // Also check History tab just in case an exercise has history but no metadata
  const histSheet = getOrCreateSheet(HISTORY_TAB, HISTORY_HEADERS);
  let hData = [];
  let hRange = null;
  if (histSheet.getLastRow() > 1) {
    hRange = histSheet.getRange(2, 3, histSheet.getLastRow() - 1, 1);
    hData = hRange.getValues();
    for (let i = 0; i < hData.length; i++) {
      const name = String(hData[i][0]).trim();
      if (gymlog_getBaseName(name).toLowerCase() === oldBaseLower) {
        if (!variationsToRename.some(v => v.old.toLowerCase() === name.toLowerCase())) {
          let calcNew = name;
          if (oldBaseLower.length > 0) {
            calcNew = name.replace(new RegExp(gymlog_escapeRegExp(oldBaseLower), 'i'), newBase);
          } else {
            calcNew = newName;
          }
          variationsToRename.push({ old: name, new: calcNew, oldLower: name.toLowerCase(), newLower: calcNew.toLowerCase() });
        }
      }
    }
  }

  // If we couldn't find anything matching the base (shouldn't happen), at least do the exact ones requested
  if (variationsToRename.length === 0) {
     variationsToRename.push({ old: oldName.trim(), new: newName.trim(), oldLower: oldName.trim().toLowerCase(), newLower: newName.trim().toLowerCase() });
  }

  // Check if ANY of the target new names already exist
  let requiresMerge = false;
  if (exData.length > 0) {
    for (const v of variationsToRename) {
      const exists = exData.some(r => String(r[0]).trim().toLowerCase() === v.newLower);
      // Wait, if it exists, and it's NOT just the same exact old name (e.g. changing casing)
      if (exists && v.oldLower !== v.newLower) {
        requiresMerge = true;
        break;
      }
    }
  }

  if (requiresMerge && !mergeConfirmed) {
    return cors(ContentService.createTextOutput(JSON.stringify({ status: "requiresMerge", message: "One or more target exercises already exist. Do you want to merge them?" })));
  }

  // Proceed with Rename or Merge for all variations
  // 1. Update metadata in EXERCISES_TAB
  if (exData.length > 0) {
    for (const v of variationsToRename) {
      let oldRowIndex = -1;
      let newNameExists = false;
      
      for (let i = 0; i < exData.length; i++) {
        const nameLower = String(exData[i][0]).trim().toLowerCase();
        if (nameLower === v.oldLower) oldRowIndex = i + 2;
        if (nameLower === v.newLower) newNameExists = true;
      }
      
      if (newNameExists && mergeConfirmed && v.oldLower !== v.newLower) {
        if (oldRowIndex > -1) {
          exSheet.deleteRow(oldRowIndex);
          // Need to refresh exData since we deleted a row to avoid index shifting issues on next loop
          exData = exSheet.getRange(2, 1, exSheet.getLastRow() - 1, exSheet.getLastColumn()).getValues();
        }
      } else {
        if (oldRowIndex > -1) {
          exSheet.getRange(oldRowIndex, 1).setValue(v.new);
          exData[oldRowIndex - 2][0] = v.new; // update local copy too
        }
      }
    }
  }

  // 2. Update HISTORY_TAB
  if (hData.length > 0) {
    let historyUpdated = false;
    for (let i = 0; i < hData.length; i++) {
      const hNameLower = String(hData[i][0]).trim().toLowerCase();
      const match = variationsToRename.find(v => v.oldLower === hNameLower);
      if (match) {
        hData[i][0] = match.new;
        historyUpdated = true;
      }
    }
    if (historyUpdated) {
      hRange.setValues(hData);
    }
  }

  // 3. Drop Best records
  const bestSheet = getOrCreateSheet(BEST_TAB, BEST_HEADERS);
  if (bestSheet.getLastRow() > 1) {
    const bNames = bestSheet.getRange(2, 1, bestSheet.getLastRow() - 1, 1).getValues();
    for (let i = bNames.length - 1; i >= 0; i--) {
      const bName = String(bNames[i][0]).trim().toLowerCase();
      if (variationsToRename.some(v => v.oldLower === bName || v.newLower === bName)) {
        bestSheet.deleteRow(i + 2);
      }
    }
  }

  // 4. Recalculate Bests for all new names
  for (const v of variationsToRename) {
    gymlog_recalculateBestForExercise(v.new);
  }

  return ok({ renamed: true, variations: variationsToRename });
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

// =============================================================================
// ONE-TIME MIGRATION UTILITY for Circuit Training Mode
//
// Reads from "testing exercises" tab and merges into "GymLog_Exercises"
// Creates a backup of GymLog_Exercises first.
// =============================================================================

function migrateTestingExercises() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  
  // 1. Get Testing Exercises tab
  const testingSheet = ss.getSheetByName("testing exercises");
  if (!testingSheet) {
    Logger.log("Error: 'testing exercises' tab not found!");
    return;
  }
  
  // 2. Get GymLog_Exercises tab and duplicate for backup
  let exSheet = ss.getSheetByName(EXERCISES_TAB);
  if (!exSheet) {
    exSheet = getOrCreateSheet(EXERCISES_TAB, EXERCISES_HEADERS);
  }
  
  // Create backup
  const backupName = EXERCISES_TAB + "_Backup_" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmmss");
  ss.insertSheet(backupName, {template: exSheet});
  Logger.log("Backup created: " + backupName);
  
  // 3. Update headers just in case they are missing the new ones
  exSheet.getRange(1, 1, 1, EXERCISES_HEADERS.length).setValues([EXERCISES_HEADERS]);
  
  // 4. Read existing GymLog_Exercises to find exact matches
  const exLastRow = exSheet.getLastRow();
  let exData = [];
  if (exLastRow > 1) {
    // Fill array so it matches full header length
    const rawData = exSheet.getRange(2, 1, exLastRow - 1, exSheet.getLastColumn()).getValues();
    exData = rawData.map(r => {
      while (r.length < EXERCISES_HEADERS.length) r.push("");
      return r;
    });
  }
  
  // 5. Read Testing Exercises tab
  // Format: Order, Machine Name (Manufacturer - Model - Exercise), Manufacturer, Model Series, Exercise Name, Primary Muscle Groups, Movement Pattern, File Reference
  const tLastRow = testingSheet.getLastRow();
  if (tLastRow <= 1) {
    Logger.log("No data found in 'testing exercises'.");
    return;
  }
  const tData = testingSheet.getRange(2, 1, tLastRow - 1, 8).getValues();
  
  // Helper to map categories to our standardized list
  function normalizeCategory(cat) {
    const c = String(cat).toLowerCase().trim();
    if (c.includes("knee dominant")) return "Knee Dominant";
    if (c.includes("hip dominant")) return "Hip Dominant";
    if (c.includes("horizontal pull")) return "Horizontal Pull";
    if (c.includes("vertical pull")) return "Vertical Pull";
    if (c.includes("horizontal push")) return "Horizontal Push";
    if (c.includes("vertical push")) return "Vertical Push";
    if (c.includes("rotational core")) return "Rotational Core";
    if (c.includes("plank core")) return "Plank Core";
    if (c.includes("explosive")) return "Explosive";
    if (c.includes("accessory")) return "Accessory";
    return String(cat).trim(); // fallback
  }

  let mergedCount = 0;
  let addedCount = 0;
  
  for (const tRow of tData) {
    const machineName   = String(tRow[1]).trim();
    if (!machineName) continue;
    
    const manufacturer  = String(tRow[2]).trim();
    const modelSeries   = String(tRow[3]).trim();
    const baseExercise  = String(tRow[4]).trim();
    const muscleGroups  = String(tRow[5]).trim();
    const movementRaw   = String(tRow[6]).trim();
    let fileReference = String(tRow[7]).trim();
    if (fileReference && !fileReference.includes('.jpg')) {
        const safeName = machineName.replace(/\//g, " ");
        fileReference = `${safeName}.jpg`;
    }
    
    const category = normalizeCategory(movementRaw);
    
    // Find if machine name already exists in GymLog_Exercises
    let foundIndex = -1;
    for (let i = 0; i < exData.length; i++) {
      if (String(exData[i][0]).toLowerCase().trim() === machineName.toLowerCase()) {
        foundIndex = i;
        break;
      }
    }
    
    if (foundIndex > -1) {
      // Update existing
      exData[foundIndex][2] = category; // update category
      exData[foundIndex][5] = manufacturer;
      exData[foundIndex][6] = modelSeries;
      exData[foundIndex][7] = baseExercise;
      exData[foundIndex][8] = muscleGroups;
      exData[foundIndex][9] = fileReference;
      mergedCount++;
    } else {
      // Add new
      // Headers: Exercise, Timed, Category, Location, Note, Manufacturer, Model Series, Base Exercise, Muscle Groups, File Reference
      const newRow = [
        machineName, 
        false, // Timed
        category,
        "Anywhere", // Default Location
        "", // Note
        manufacturer,
        modelSeries,
        baseExercise,
        muscleGroups,
        fileReference
      ];
      exData.push(newRow);
      addedCount++;
    }
  }
  
  // 6. Write back to GymLog_Exercises
  if (exData.length > 0) {
    exSheet.getRange(2, 1, exData.length, EXERCISES_HEADERS.length).setValues(exData);
  }
  
  Logger.log("Migration complete!");
  Logger.log("Merged (updated) existing items: " + mergedCount);
  Logger.log("Added new items: " + addedCount);
}

// =============================================================================
function gymlog_handleUploadImage(payload) {
  verifyAdminPin(payload);
  const { exercise, data, filename } = payload;
  
  if (!exercise || !data) return err("Missing exercise or image data");

  // Create file in Drive
  const folderId = "1nOc1oLanQ99cpPyOH1bGHKHW3E1Faubc";
  const folder = DriveApp.getFolderById(folderId);
  
  // The data is a data URL: "data:image/jpeg;base64,/9j/4AAQSkZJR..."
  const base64Data = data.split(",")[1];
  const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), MimeType.JPEG, String(exercise).trim().replace(/\//g, " ") + ".jpg");
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const fileId = file.getId();

  // Update GymLog_Exercises file reference column
  const exSheet = getOrCreateSheet(EXERCISES_TAB, EXERCISES_HEADERS);
  const lastRow = exSheet.getLastRow();
  let rowIndex = -1;
  if (lastRow > 1) {
    const names = exSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < names.length; i++) {
      if (String(names[i][0]).trim().toLowerCase() === String(exercise).trim().toLowerCase()) {
        rowIndex = i + 2;
        break;
      }
    }
  }

  if (rowIndex > -1) {
    exSheet.getRange(rowIndex, 10).setValue(fileId); // Column 10 is File Reference
  } else {
    return err("Exercise metadata not found to attach image");
  }

  return ok({ fileId: fileId });
}

// ── Get Image (base64 proxy) ───────────────────────────────────────────
// Security: Validates file belongs to the images folder and is an image MIME type.
function gymlog_handleGetImage(payload) {
  const fileId = payload.fileId;
  if (!fileId) return err("Missing fileId");

  try {
    const file = DriveApp.getFileById(fileId);

    // Security: Verify file is inside the designated images folder
    const IMAGE_FOLDER_ID = "1nOc1oLanQ99cpPyOH1bGHKHW3E1Faubc";
    const parents = file.getParents();
    let inFolder = false;
    while (parents.hasNext()) {
      if (parents.next().getId() === IMAGE_FOLDER_ID) {
        inFolder = true;
        break;
      }
    }
    if (!inFolder) return err("Access denied: file is not in the images folder");

    // Security: Verify MIME type is an image
    const blob = file.getBlob();
    const mimeType = blob.getContentType() || "image/jpeg";
    if (!mimeType.startsWith("image/")) return err("Access denied: not an image file");

    // Size guard: reject files over 5MB to prevent Apps Script timeout
    if (blob.getBytes().length > 5 * 1024 * 1024) return err("Image too large (max 5MB)");

    const base64 = Utilities.base64Encode(blob.getBytes());
    return ok({ imageData: "data:" + mimeType + ";base64," + base64 });
  } catch (e) {
    return err("Image not found: " + e.message);
  }
}

// ONE-TIME SCRIPT: Map Google Drive Images to File Reference Column
// =============================================================================
function mapDriveImagesToSheet() { 
  // TODO: Paste the Folder ID of your new "GymLog Images" folder here 
  const TARGET_FOLDER_ID = "1nOc1oLanQ99cpPyOH1bGHKHW3E1Faubc";  
   
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("GymLog_Exercises"); 
  if (!sheet) {
    Logger.log("Error: GymLog_Exercises tab not found!");
    return; 
  }
   
  Logger.log("Accessing Google Drive folder...");
  const folder = DriveApp.getFolderById(TARGET_FOLDER_ID); 
  const files = folder.getFiles(); 
  const driveFilesMap = {};  
   
  let fileCount = 0;
  while (files.hasNext()) { 
    const file = files.next(); 
    // Store in lowercase for case-insensitive matching
    driveFilesMap[file.getName().toLowerCase()] = file.getId(); 
    fileCount++;
  } 
  Logger.log(`Found ${fileCount} files in Google Drive folder.`);
   
  const lastRow = sheet.getLastRow(); 
  if (lastRow <= 1) return; 
   
  const data = sheet.getRange(2, 1, lastRow - 1, 10).getValues(); 
  let updatedCount = 0;
   
  for (let i = 0; i < data.length; i++) { 
    const exerciseName = data[i][0]; 
    if (!exerciseName) continue;
     
    // Windows forbids slashes, so the image in Drive won't have the slash. 
    // Replace all slashes with spaces to match the Drive filename correctly. 
    const sanitizedName = String(exerciseName).trim().replace(/\//g, " "); 
    const expectedFilename = (sanitizedName + ".jpg").toLowerCase(); 
     
    if (driveFilesMap[expectedFilename]) { 
      const existingValue = sheet.getRange(i + 2, 10).getValue();
      const newId = driveFilesMap[expectedFilename];
      if (existingValue !== newId) {
        sheet.getRange(i + 2, 10).setValue(newId);  
        updatedCount++;
        Logger.log(`Mapped ID for: ${exerciseName}`);
      }
    } 
  } 
  Logger.log(`SUCCESS: Updated ${updatedCount} rows in the spreadsheet!`);
}



