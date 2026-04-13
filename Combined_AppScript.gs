// =============================================================================
// Combined_AppScript.gs
// Author: Brian Wance
//
// Merges Workout_Builder.gs (original_index.html) and GymLog_AppScript.gs
// (index.html) into a single Apps Script file backed by one spreadsheet.
//
// Routing logic:
//   doGet  — if ?action= matches a Workout Builder action, routes there.
//            Otherwise falls through to GymLog reader (returns history + best).
//   doPost — reads payload.action and routes to GymLog handlers
//            (logSet, syncAll, deleteHistory).
// =============================================================================

// ── Sheet / tab name constants ────────────────────────────────────────────────

// GymLog tabs (index.html)
const SHEET_ID    = "1Y9xiUf-2w_Ko_YVIxj3KPIjFc8UDNg8U1wPc9fXSqx4";
const HISTORY_TAB = "GymLog_History";
const BEST_TAB    = "GymLog";

const HISTORY_HEADERS = ["Date", "Person", "Exercise", "Reps", "Weight", "Rep Range", "Note", "Set #"];
const BEST_HEADERS = [
  "Exercise",
  "Brian_r1_3", "Brian_r4_7", "Brian_r8_12", "Brian_r15_20",
  "Dad_r1_3",   "Dad_r4_7",   "Dad_r8_12",   "Dad_r15_20"
];

// Workout Builder tab names (original_index.html) — uses getActiveSpreadsheet()
const WB_WORKOUTS_TAB  = "Workouts";
const WB_EXERCISES_TAB = "Exercises";
const WB_MAXES_TAB     = "Maxes";
const WB_LOG_TAB       = "Log";

// Actions that belong to the Workout Builder (original_index.html)
const WORKOUT_BUILDER_ACTIONS = new Set([
  "getNextWorkout",
  "getMaxes",
  "logSet",        // Note: this action name is shared — WB uses GET, GymLog uses POST
  "updateMax",
  "completeWorkout",
  "getAccessoryExercise"
]);

// =============================================================================
// SHARED ENTRY POINTS
// =============================================================================

/**
 * GET handler.
 * - If ?action= matches a Workout Builder action → routes to WB handler.
 * - Otherwise → returns GymLog history + best data for index.html.
 */
function doGet(e) {
  const action = e.parameter.action;

  // ── Workout Builder routes (original_index.html) ──────────────────────────
  if (action === "getNextWorkout")       return wb_getNextWorkout();
  if (action === "getMaxes")             return wb_getMaxes(e.parameter.exercises);
  if (action === "logSet")               return wb_logSet(e);
  if (action === "updateMax")            return wb_updateMax(e);
  if (action === "completeWorkout")      return wb_completeWorkout(e.parameter.workoutNum);
  if (action === "getAccessoryExercise") return wb_getAccessoryExercise();

  // ── GymLog route (index.html) — no action param needed ───────────────────
  return gymlog_doGet();
}

/**
 * POST handler — all GymLog writes come through here (index.html).
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);

    if (payload.action === "logSet")         return gymlog_handleLogSet(payload);
    if (payload.action === "syncAll")        return gymlog_handleSyncAll(payload);
    if (payload.action === "deleteHistory")  return gymlog_handleDeleteHistory(payload);

    return err("Unknown action: " + payload.action);

  } catch (ex) {
    return err(ex.message);
  }
}


// =============================================================================
// GYMLOG SECTION  (index.html)
// =============================================================================

// ── GymLog Helpers ────────────────────────────────────────────────────────────

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
  return output
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function ok(data) {
  return cors(ContentService.createTextOutput(JSON.stringify({ status: "ok", data })));
}

function err(msg) {
  return cors(ContentService.createTextOutput(JSON.stringify({ status: "error", message: msg })));
}

// ── GymLog GET — read all data ────────────────────────────────────────────────

function gymlog_doGet() {
  try {
    const histSheet = getOrCreateSheet(HISTORY_TAB, HISTORY_HEADERS);
    const bestSheet = getOrCreateSheet(BEST_TAB,    BEST_HEADERS);

    // History rows (skip header)
    const histData = histSheet.getLastRow() > 1
      ? histSheet.getRange(2, 1, histSheet.getLastRow() - 1, HISTORY_HEADERS.length).getValues()
      : [];

    const history = histData.map(r => ({
      date:     r[0] ? Utilities.formatDate(new Date(r[0]), Session.getScriptTimeZone(), "MMM d, yyyy") : "",
      person:   r[1],
      exercise: r[2],
      reps:     String(r[3]),
      weight:   String(r[4]),
      range:    r[5],
      note:     r[6],
      setNum:   r[7]
    }));

    // Best rows (skip header)
    const bestData = bestSheet.getLastRow() > 1
      ? bestSheet.getRange(2, 1, bestSheet.getLastRow() - 1, BEST_HEADERS.length).getValues()
      : [];

    const best = {};
    bestData.forEach(r => {
      const name = r[0];
      if (!name) return;
      best[name] = {
        brian: {
          r1_3:   r[1] ? parseBest(r[1]) : null,
          r4_7:   r[2] ? parseBest(r[2]) : null,
          r8_12:  r[3] ? parseBest(r[3]) : null,
          r15_20: r[4] ? parseBest(r[4]) : null,
        },
        dad: {
          r1_3:   r[5] ? parseBest(r[5]) : null,
          r4_7:   r[6] ? parseBest(r[6]) : null,
          r8_12:  r[7] ? parseBest(r[7]) : null,
          r15_20: r[8] ? parseBest(r[8]) : null,
        }
      };
    });

    return ok({ history, best });

  } catch (e) {
    return err(e.message);
  }
}

// ── GymLog POST handlers ──────────────────────────────────────────────────────

function gymlog_handleLogSet(payload) {
  const { exercise, entries } = payload;

  const histSheet = getOrCreateSheet(HISTORY_TAB, HISTORY_HEADERS);
  const bestSheet = getOrCreateSheet(BEST_TAB,    BEST_HEADERS);

  entries.forEach(entry => {
    histSheet.appendRow([
      entry.date,
      entry.person,
      exercise,
      entry.reps,
      entry.weight,
      entry.range,
      entry.note   || "",
      entry.setNum || ""
    ]);
  });

  gymlog_updateBestRow(bestSheet, exercise, entries);

  return ok({ logged: entries.length });
}

function gymlog_handleSyncAll(payload) {
  const { exercises } = payload;

  const histSheet = getOrCreateSheet(HISTORY_TAB, HISTORY_HEADERS);
  const bestSheet = getOrCreateSheet(BEST_TAB,    BEST_HEADERS);

  clearDataRows(histSheet);
  clearDataRows(bestSheet);

  exercises.forEach(ex => {
    (ex.history || []).forEach(h => {
      histSheet.appendRow([
        h.date,
        h.person,
        ex.name,
        h.reps,
        h.weight,
        h.range,
        h.note   || "",
        h.setNum || ""
      ]);
    });

    const b = ex.best || {};
    bestSheet.appendRow([
      ex.name,
      formatBest(b.brian?.r1_3),
      formatBest(b.brian?.r4_7),
      formatBest(b.brian?.r8_12),
      formatBest(b.brian?.r15_20),
      formatBest(b.dad?.r1_3),
      formatBest(b.dad?.r4_7),
      formatBest(b.dad?.r8_12),
      formatBest(b.dad?.r15_20),
    ]);
  });

  return ok({ synced: exercises.length });
}

function gymlog_handleDeleteHistory(payload) {
  const { exercise, date, person, reps, weight, range } = payload;
  const histSheet = getOrCreateSheet(HISTORY_TAB, HISTORY_HEADERS);

  if (histSheet.getLastRow() <= 1) return ok({ deleted: 0 });

  const data = histSheet.getRange(2, 1, histSheet.getLastRow() - 1, HISTORY_HEADERS.length).getValues();
  for (let i = data.length - 1; i >= 0; i--) {
    if (
      data[i][1] === person   &&
      data[i][2] === exercise &&
      String(data[i][3]) === String(reps)   &&
      String(data[i][4]) === String(weight) &&
      data[i][5] === range
    ) {
      histSheet.deleteRow(i + 2);
      break;
    }
  }

  return ok({ deleted: 1 });
}

// ── GymLog Utilities ──────────────────────────────────────────────────────────

function formatBest(b) {
  if (!b) return "";
  return b.weight ? `${b.reps}x${b.weight}` : `${b.reps} reps`;
}

function parseBest(str) {
  if (!str) return null;
  const s = String(str);
  if (s.includes("x")) {
    const [reps, weight] = s.split("x");
    return { reps, weight };
  }
  return { reps: s.replace(" reps", ""), weight: "" };
}

function clearDataRows(sheet) {
  if (sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
  }
}

function gymlog_updateBestRow(bestSheet, exerciseName, entries) {
  const lastRow = bestSheet.getLastRow();
  let rowIndex  = -1;

  if (lastRow > 1) {
    const names = bestSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < names.length; i++) {
      if (names[i][0] === exerciseName) { rowIndex = i + 2; break; }
    }
  }

  let currentRow = ["", "", "", "", "", "", "", "", ""];
  if (rowIndex > 0) {
    currentRow = bestSheet.getRange(rowIndex, 1, 1, BEST_HEADERS.length).getValues()[0];
  }

  const colMap = {
    "brian_r1_3": 1, "brian_r4_7": 2, "brian_r8_12": 3, "brian_r15_20": 4,
    "dad_r1_3":   5, "dad_r4_7":   6, "dad_r8_12":   7, "dad_r15_20":   8
  };

  entries.forEach(entry => {
    const key = `${entry.person}_${entry.range}`;
    const col = colMap[key];
    if (col === undefined) return;

    const newWeight      = parseFloat(String(entry.weight).replace(/[^0-9.\-]/g, "")) || 0;
    const existing       = String(currentRow[col] || "");
    const existingWeight = existing.includes("x") ? parseFloat(existing.split("x")[1]) || 0 : 0;

    if (newWeight > existingWeight || !existing) {
      currentRow[col] = `${entry.reps}x${entry.weight}`;
    }
  });

  currentRow[0] = exerciseName;

  if (rowIndex > 0) {
    bestSheet.getRange(rowIndex, 1, 1, BEST_HEADERS.length).setValues([currentRow]);
  } else {
    bestSheet.appendRow(currentRow);
  }
}


// =============================================================================
// WORKOUT BUILDER SECTION  (original_index.html)
// All functions prefixed wb_ to avoid any name collisions.
// =============================================================================

/**
 * Generates 48 workouts and writes them to the Workouts sheet.
 * Run manually from the Apps Script editor or a custom menu.
 */
function generateWorkouts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const exerciseSheet = ss.getSheetByName(WB_EXERCISES_TAB);
  const workoutSheet  = ss.getSheetByName(WB_WORKOUTS_TAB);

  const exerciseData = exerciseSheet.getDataRange().getValues();

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
    if (categories[category] !== undefined) {
      categories[category].push(exercise);
    }
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
    while (pool.length < count) {
      pool = pool.concat(shuffle(exerciseList));
    }
    return pool.slice(0, count);
  }

  const pools = {};
  for (const category in categories) {
    pools[category] = generatePool(categories[category], 48);
  }

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

    rows.push([
      i,                        // Workout #
      type,                     // Type
      pools["Explosive"][i - 1], // Explosive
      kneehip,                  // Knee/Hip Dominant
      vertpushpull,             // Vertical Push/Pull
      horizpushpull,            // Horizontal Push/Pull
      core,                     // Core
      repRange,                 // Rep Range
      ""                        // Date Completed
    ]);
  }

  workoutSheet.getRange(2, 1, 48, 9).setValues(rows);
  Logger.log("48 workouts generated successfully!");
}

// ── Workout Builder GET handlers ──────────────────────────────────────────────

function wb_getNextWorkout() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(WB_WORKOUTS_TAB);
  const data  = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][8] === "") {
      const workout = {
        workoutNum:   data[i][0],
        type:         data[i][1],
        explosive:    data[i][2],
        kneeHip:      data[i][3],
        vertPushPull: data[i][4],
        horizPushPull:data[i][5],
        core:         data[i][6],
        repRange:     data[i][7]
      };
      return ContentService.createTextOutput(JSON.stringify(workout))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ error: "No pending workouts" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function wb_getMaxes(exercisesParam) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(WB_MAXES_TAB);
  const data  = sheet.getDataRange().getValues();
  const exercises = exercisesParam.split(",");

  const maxes = {};
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
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(WB_MAXES_TAB);
  const data  = sheet.getDataRange().getValues();

  const exercise = e.parameter.exercise;
  const repRange = e.parameter.repRange;
  const newMax   = e.parameter.newMax;

  const colMap = { "1-3": 1, "4-7": 2, "8-12": 3, "15-20": 4 };
  const col    = colMap[repRange];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === exercise) {
      sheet.getRange(i + 1, col + 1).setValue(newMax);
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  sheet.appendRow([exercise, "", "", "", ""]);
  const newRow = sheet.getLastRow();
  sheet.getRange(newRow, col + 1).setValue(newMax);

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
  const ss           = SpreadsheetApp.getActiveSpreadsheet();
  const exerciseSheet = ss.getSheetByName(WB_EXERCISES_TAB);
  const logSheet     = ss.getSheetByName(WB_LOG_TAB);

  const exerciseData = exerciseSheet.getDataRange().getValues();
  const accessories  = [];
  for (let i = 1; i < exerciseData.length; i++) {
    if (exerciseData[i][1] === "Accessory") {
      accessories.push(exerciseData[i][0]);
    }
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

// ── Workout Builder debug/test utilities ──────────────────────────────────────

function testAccessory() {
  const ss           = SpreadsheetApp.getActiveSpreadsheet();
  const exerciseSheet = ss.getSheetByName(WB_EXERCISES_TAB);
  const exerciseData = exerciseSheet.getDataRange().getValues();
  const accessories  = [];

  for (let i = 1; i < exerciseData.length; i++) {
    if (exerciseData[i][1] === "Accessory") {
      accessories.push(exerciseData[i][0]);
    }
  }

  Logger.log("Accessories found: " + accessories.length);
  Logger.log(accessories);
}
