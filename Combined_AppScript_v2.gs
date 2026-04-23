// =============================================================================
// Combined_AppScript_v2.gs
// Author: Brian Wance
//
// Version 2 of the GymLog + Workout Builder combined backend.
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
// Rollback: re-paste Combined_AppScript.gs content into the editor and redeploy.
// =============================================================================

// ── Constants ─────────────────────────────────────────────────────────────────

const SHEET_ID    = "1Y9xiUf-2w_Ko_YVIxj3KPIjFc8UDNg8U1wPc9fXSqx4";
const HISTORY_TAB = "GymLog_History";
const BEST_TAB    = "GymLog";          // same tab name as before, schema changes after migration
const PEOPLE_TAB  = "GymLog_People";   // new tab
const EXERCISES_TAB = "GymLog_Exercises"; // exercise metadata: timed flag + category

const HISTORY_HEADERS = ["Date", "Person", "Exercise", "Reps", "Weight", "Rep Range", "Note", "Set #"];
const BEST_HEADERS    = ["Exercise", "Person", "r1_3", "r4_7", "r8_12", "r13_plus"];
const PEOPLE_HEADERS  = ["Name"];
const EXERCISES_HEADERS = ["Exercise", "Timed", "Category"];
const REP_RANGES      = ["r1_3", "r4_7", "r8_12", "r13_plus"];
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
      if (payload.action === "deleteHistory")  return gymlog_handleDeleteHistory(payload);
      if (payload.action === "deleteExercise") return gymlog_handleDeleteExercise(payload);
      if (payload.action === "savePeople")     return gymlog_handleSavePeople(payload);
      if (payload.action === "saveExercise")   return gymlog_handleSaveExercise(payload);
      return err("Unknown payload action: " + payload.action);
    } catch (ex) {
      return err(ex.message);
    }
  }

  // Workout Builder routes
  if (action === "getNextWorkout")       return wb_getNextWorkout();
  if (action === "getMaxes")             return wb_getMaxes(e.parameter.exercises);
  if (action === "logSet")               return wb_logSet(e);
  if (action === "updateMax")            return wb_updateMax(e);
  if (action === "completeWorkout")      return wb_completeWorkout(e.parameter.workoutNum);
  if (action === "getAccessoryExercise") return wb_getAccessoryExercise();

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
    if (payload.action === "deleteHistory")  return gymlog_handleDeleteHistory(payload);
    if (payload.action === "savePeople")     return gymlog_handleSavePeople(payload);
    if (payload.action === "saveExercise")   return gymlog_handleSaveExercise(payload);
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
    sheet.deleteRows(2, sheet.getLastRow() - 1);
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
    })).filter(e => e.name);

    return ok({
      history,
      best,
      people:    people.length > 0 ? people : DEFAULT_PEOPLE,
      exercises: exercisesMeta,
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
// GYMLOG — SYNC ALL
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
    exSheet.appendRow([ex.name, ex.timed ? true : false, ex.category || ""]);
  });

  return ok({ synced: exercises.length });
}


// =============================================================================
// GYMLOG — SAVE EXERCISE METADATA
// =============================================================================

function gymlog_handleSaveExercise(payload) {
  const { exercise, timed, category } = payload;
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

  const row = [exercise, timed ? true : false, category || ""];
  if (rowIndex > 0) {
    exSheet.getRange(rowIndex, 1, 1, EXERCISES_HEADERS.length).setValues([row]);
  } else {
    exSheet.appendRow(row);
  }

  return ok({ saved: exercise });
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

function gymlog_handleDeleteHistory(payload) {
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
// GYMLOG — DELETE EXERCISE
// =============================================================================

function gymlog_handleDeleteExercise(payload) {
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


// =============================================================================
// WORKOUT BUILDER SECTION  (original_index.html)
// All functions prefixed wb_ — no changes from v1.
// =============================================================================

/**
 * Generates 48 workouts and writes them to the Workouts sheet.
 * Run manually from the Apps Script editor or a custom menu.
 */
function generateWorkouts() {
  const ss            = SpreadsheetApp.getActiveSpreadsheet();
  const exerciseSheet = ss.getSheetByName(WB_EXERCISES_TAB);
  const workoutSheet  = ss.getSheetByName(WB_WORKOUTS_TAB);
  const exerciseData  = exerciseSheet.getDataRange().getValues();

  const categories = {
    "Explosive":        [],
    "Knee Dominant":    [],
    "Hip Dominant":     [],
    "Horizontal Push":  [],
    "Horizontal Pull":  [],
    "Vertical Push":    [],
    "Vertical Pull":    [],
    "Rotational Core":  [],
    "Plank Core":       []
  };

  for (let i = 1; i < exerciseData.length; i++) {
    const exercise = exerciseData[i][0];
    const category = exerciseData[i][1];
    if (categories[category] !== undefined) categories[category].push(exercise);
  }

  function shuffle(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function getRepRange(workoutNum) {
    const position = ((workoutNum - 1) % 16);
    if (position < 4)  return "8-12";
    if (position < 8)  return "1-3";
    if (position < 12) return "15-20";
    return "4-7";
  }

  function generatePool(exerciseList, count) {
    let pool = [];
    while (pool.length < count) pool = pool.concat(shuffle(exerciseList));
    return pool.slice(0, count);
  }

  const pools = {};
  for (const category in categories) pools[category] = generatePool(categories[category], 48);

  const rows = [];
  for (let i = 1; i <= 48; i++) {
    const type     = i % 2 === 1 ? "Push" : "Pull";
    const repRange = getRepRange(i);
    let kneehip, vertpushpull, horizpushpull, core;
    if (type === "Push") {
      kneehip       = pools["Knee Dominant"][i - 1];
      vertpushpull  = pools["Vertical Push"][i - 1];
      horizpushpull = pools["Horizontal Push"][i - 1];
      core          = pools["Rotational Core"][i - 1];
    } else {
      kneehip       = pools["Hip Dominant"][i - 1];
      vertpushpull  = pools["Vertical Pull"][i - 1];
      horizpushpull = pools["Horizontal Pull"][i - 1];
      core          = pools["Plank Core"][i - 1];
    }
    rows.push([i, type, pools["Explosive"][i - 1], kneehip, vertpushpull, horizpushpull, core, repRange, ""]);
  }

  workoutSheet.getRange(2, 1, 48, 9).setValues(rows);
  Logger.log("48 workouts generated successfully!");
}

function wb_getNextWorkout() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(WB_WORKOUTS_TAB);
  const data  = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][8] === "") {
      return ContentService.createTextOutput(JSON.stringify({
        workoutNum:    data[i][0],
        type:          data[i][1],
        explosive:     data[i][2],
        kneeHip:       data[i][3],
        vertPushPull:  data[i][4],
        horizPushPull: data[i][5],
        core:          data[i][6],
        repRange:      data[i][7]
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ error: "No pending workouts" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function wb_getMaxes(exercisesParam) {
  const ss        = SpreadsheetApp.getActiveSpreadsheet();
  const sheet     = ss.getSheetByName(WB_MAXES_TAB);
  const data      = sheet.getDataRange().getValues();
  const exercises = exercisesParam.split(",");
  const maxes     = {};
  for (let i = 1; i < data.length; i++) {
    if (exercises.includes(data[i][0])) {
      maxes[data[i][0]] = {
        "1-3":   data[i][1],
        "4-7":   data[i][2],
        "8-12":  data[i][3],
        "15-20": data[i][4]
      };
    }
  }
  return ContentService.createTextOutput(JSON.stringify(maxes))
    .setMimeType(ContentService.MimeType.JSON);
}

function wb_logSet(e) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(WB_LOG_TAB);
  sheet.appendRow([
    new Date(),
    e.parameter.workoutNum,
    e.parameter.exercise,
    e.parameter.setNum,
    e.parameter.reps,
    e.parameter.weight,
    e.parameter.repRange
  ]);
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function wb_updateMax(e) {
  const ss       = SpreadsheetApp.getActiveSpreadsheet();
  const sheet    = ss.getSheetByName(WB_MAXES_TAB);
  const data     = sheet.getDataRange().getValues();
  const exercise = e.parameter.exercise;
  const repRange = e.parameter.repRange;
  const newMax   = e.parameter.newMax;
  const colMap   = { "1-3": 1, "4-7": 2, "8-12": 3, "15-20": 4 };
  const col      = colMap[repRange];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === exercise) {
      sheet.getRange(i + 1, col + 1).setValue(newMax);
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  sheet.appendRow([exercise, "", "", "", ""]);
  sheet.getRange(sheet.getLastRow(), col + 1).setValue(newMax);
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function wb_completeWorkout(workoutNum) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(WB_WORKOUTS_TAB);
  const data  = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == workoutNum) {
      sheet.getRange(i + 1, 9).setValue(new Date());
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ error: "Workout not found" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function wb_getAccessoryExercise() {
  const ss            = SpreadsheetApp.getActiveSpreadsheet();
  const exerciseSheet = ss.getSheetByName(WB_EXERCISES_TAB);
  const logSheet      = ss.getSheetByName(WB_LOG_TAB);
  const exerciseData  = exerciseSheet.getDataRange().getValues();
  const accessories   = [];
  for (let i = 1; i < exerciseData.length; i++) {
    if (exerciseData[i][1] === "Accessory") accessories.push(exerciseData[i][0]);
  }
  const logData = logSheet.getDataRange().getValues();
  const used    = new Set();
  for (let i = logData.length - 1; i >= 1; i--) {
    if (used.size >= accessories.length) break;
    used.add(logData[i][2]);
  }
  const unused = accessories.filter(e => !used.has(e));
  const pool   = unused.length > 0 ? unused : accessories;
  const pick   = pool[Math.floor(Math.random() * pool.length)];
  return ContentService.createTextOutput(JSON.stringify({ exercise: pick }))
    .setMimeType(ContentService.MimeType.JSON);
}

function testAccessory() {
  const ss            = SpreadsheetApp.getActiveSpreadsheet();
  const exerciseSheet = ss.getSheetByName(WB_EXERCISES_TAB);
  const exerciseData  = exerciseSheet.getDataRange().getValues();
  const accessories   = [];
  for (let i = 1; i < exerciseData.length; i++) {
    if (exerciseData[i][1] === "Accessory") accessories.push(exerciseData[i][0]);
  }
  Logger.log("Accessories found: " + accessories.length);
  Logger.log(accessories);
}
