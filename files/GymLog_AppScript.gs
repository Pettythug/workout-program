const SHEET_ID = "1Y9xiUf-2w_Ko_YVIxj3KPIjFc8UDNg8U1wPc9fXSqx4";
const HISTORY_TAB = "GymLog_History";
const BEST_TAB = "GymLog";

const HISTORY_HEADERS = ["Date", "Person", "Exercise", "Reps", "Weight", "Rep Range", "Note", "Set #"];
const BEST_HEADERS = [
  "Exercise",
  "Brian_r1_3", "Brian_r4_7", "Brian_r8_12", "Brian_r15_20",
  "Dad_r1_3",   "Dad_r4_7",   "Dad_r8_12",   "Dad_r15_20"
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  // Write headers if the sheet is empty
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

// ── GET handler — read all data ───────────────────────────────────────────────

function doGet(e) {
  try {
    const histSheet  = getOrCreateSheet(HISTORY_TAB, HISTORY_HEADERS);
    const bestSheet  = getOrCreateSheet(BEST_TAB,    BEST_HEADERS);

    // History rows (skip header)
    const histData = histSheet.getLastRow() > 1
      ? histSheet.getRange(2, 1, histSheet.getLastRow() - 1, HISTORY_HEADERS.length).getValues()
      : [];

    const history = histData.map(r => ({
      date:      r[0] ? Utilities.formatDate(new Date(r[0]), Session.getScriptTimeZone(), "MMM d, yyyy") : "",
      person:    r[1],
      exercise:  r[2],
      reps:      String(r[3]),
      weight:    String(r[4]),
      range:     r[5],
      note:      r[6],
      setNum:    r[7]
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

  } catch(e) {
    return err(e.message);
  }
}

// ── POST handler — write a set or sync all ───────────────────────────────────

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);

    if (payload.action === "logSet") {
      return handleLogSet(payload);
    }
    if (payload.action === "syncAll") {
      return handleSyncAll(payload);
    }
    if (payload.action === "deleteHistory") {
      return handleDeleteHistory(payload);
    }

    return err("Unknown action: " + payload.action);

  } catch(ex) {
    return err(ex.message);
  }
}

// Log a single set — appends to history, updates best
function handleLogSet(payload) {
  const { exercise, entries } = payload; // entries = array of {date,person,reps,weight,range,note,setNum}

  const histSheet = getOrCreateSheet(HISTORY_TAB, HISTORY_HEADERS);
  const bestSheet = getOrCreateSheet(BEST_TAB,    BEST_HEADERS);

  // Append history rows
  entries.forEach(entry => {
    histSheet.appendRow([
      entry.date,
      entry.person,
      exercise,
      entry.reps,
      entry.weight,
      entry.range,
      entry.note || "",
      entry.setNum || ""
    ]);
  });

  // Update best row for this exercise
  updateBestRow(bestSheet, exercise, entries);

  return ok({ logged: entries.length });
}

// Full sync — rewrites GymLog and GymLog_History from app state
function handleSyncAll(payload) {
  const { exercises } = payload;

  const histSheet = getOrCreateSheet(HISTORY_TAB, HISTORY_HEADERS);
  const bestSheet = getOrCreateSheet(BEST_TAB,    BEST_HEADERS);

  // Clear data rows (keep headers)
  clearDataRows(histSheet);
  clearDataRows(bestSheet);

  exercises.forEach(ex => {
    // Write all history rows
    (ex.history || []).forEach(h => {
      histSheet.appendRow([
        h.date,
        h.person,
        ex.name,
        h.reps,
        h.weight,
        h.range,
        h.note || "",
        h.setNum || ""
      ]);
    });

    // Write best row
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

// Delete a specific history entry by exercise + row index
function handleDeleteHistory(payload) {
  const { exercise, date, person, reps, weight, range } = payload;
  const histSheet = getOrCreateSheet(HISTORY_TAB, HISTORY_HEADERS);

  if (histSheet.getLastRow() <= 1) return ok({ deleted: 0 });

  const data = histSheet.getRange(2, 1, histSheet.getLastRow() - 1, HISTORY_HEADERS.length).getValues();
  // Find the first matching row and delete it
  for (let i = data.length - 1; i >= 0; i--) {
    if (
      data[i][1] === person &&
      data[i][2] === exercise &&
      String(data[i][3]) === String(reps) &&
      String(data[i][4]) === String(weight) &&
      data[i][5] === range
    ) {
      histSheet.deleteRow(i + 2); // +2 for header + 0-index offset
      break;
    }
  }

  return ok({ deleted: 1 });
}

// ── Utility functions ─────────────────────────────────────────────────────────

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

function updateBestRow(bestSheet, exerciseName, entries) {
  const lastRow = bestSheet.getLastRow();
  let rowIndex = -1;

  if (lastRow > 1) {
    const names = bestSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < names.length; i++) {
      if (names[i][0] === exerciseName) { rowIndex = i + 2; break; }
    }
  }

  // Read current best values
  let currentRow = ["", "", "", "", "", "", "", "", ""];
  if (rowIndex > 0) {
    currentRow = bestSheet.getRange(rowIndex, 1, 1, BEST_HEADERS.length).getValues()[0];
  }

  // Column map: person+range → column index (0-based)
  const colMap = {
    "brian_r1_3": 1, "brian_r4_7": 2, "brian_r8_12": 3, "brian_r15_20": 4,
    "dad_r1_3":   5, "dad_r4_7":   6, "dad_r8_12":   7, "dad_r15_20":   8
  };

  entries.forEach(entry => {
    const key = `${entry.person}_${entry.range}`;
    const col = colMap[key];
    if (col === undefined) return;

    const newWeight = parseFloat(String(entry.weight).replace(/[^0-9.\-]/g, "")) || 0;
    const existing  = String(currentRow[col] || "");
    const existingWeight = existing.includes("x")
      ? parseFloat(existing.split("x")[1]) || 0
      : 0;

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
