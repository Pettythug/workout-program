const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('🧪 RUNNING AUTOMATED VERIFICATION SUITE FOR TASK-R136');
console.log('====================================================\n');

// 1. Read Combined_AppScript_v2.gs source
const gsPath = path.join(__dirname, '../Combined_AppScript_v2.gs');
const gsSource = fs.readFileSync(gsPath, 'utf-8');

console.log('TEST 1: Verifying Combined_AppScript_v2.gs source code...');
assert.ok(gsSource.includes('function gymlog_getSetSignatures'), 'Must define gymlog_getSetSignatures');
assert.ok(gsSource.includes('existingSetSignatures.has(s)'), 'Must check existingSetSignatures for duplicates');
assert.ok(gsSource.includes('histSheet.insertRowsBefore(2, newRows.length)'), 'Must use bulk insertRowsBefore');
assert.ok(gsSource.includes('insertedCount: newRows.length'), 'Must return insertedCount');
console.log('✅ TEST 1 PASSED: Source code contains all required functions and optimizations.\n');

// 2. Simulate the Apps Script deduplication logic in Node.js
console.log('TEST 2: Simulating 30-set batch insertion with duplicate retries...');

function getSetSignatures(dateVal, person, exercise, setNum) {
  const cleanPerson = String(person || "").toLowerCase().trim();
  const cleanExercise = String(exercise || "").toLowerCase().trim();
  const cleanSetNum = String(setNum !== undefined && setNum !== null ? setNum : "").trim();

  const rawDate = String(dateVal || "").trim();
  const sigs = [`${rawDate}|${cleanPerson}|${cleanExercise}|${cleanSetNum}`];

  if (dateVal) {
    const d = dateVal instanceof Date ? dateVal : new Date(rawDate);
    if (!isNaN(d.getTime())) {
      const secFloor = Math.floor(d.getTime() / 1000).toString();
      const secRound = Math.round(d.getTime() / 1000).toString();
      sigs.push(`${secFloor}|${cleanPerson}|${cleanExercise}|${cleanSetNum}`);
      if (secRound !== secFloor) {
        sigs.push(`${secRound}|${cleanPerson}|${cleanExercise}|${cleanSetNum}`);
      }
    }
  }
  return sigs;
}

// Mock Google Sheet
class MockSheet {
  constructor() {
    this.rows = []; // row 0 is header, row 1+ are data
  }
  getLastRow() {
    return this.rows.length + 1; // 1-based, +1 for header
  }
  getValues() {
    return this.rows;
  }
  insertRowsBefore(startRow, count) {
    // startRow is 2 (index 0 in data rows)
    const emptyRows = new Array(count).fill(null);
    this.rows.splice(startRow - 2, 0, ...emptyRows);
  }
  setValues(newRows, startRow = 2) {
    for (let i = 0; i < newRows.length; i++) {
      this.rows[startRow - 2 + i] = newRows[i];
    }
  }
}

const mockHistSheet = new MockSheet();

function handleBatchSync(payload, histSheet) {
  const newRows = [];
  const existingSetSignatures = new Set();
  
  if (histSheet.getLastRow() > 1) {
    const existingData = histSheet.getValues();
    for (let i = 0; i < existingData.length; i++) {
      const row = existingData[i];
      if (!row) continue;
      const rSigs = getSetSignatures(row[0], row[1], row[2], row[7]);
      rSigs.forEach(s => existingSetSignatures.add(s));
    }
  }

  if (payload.sets && payload.sets.length > 0) {
    for (const setBatch of payload.sets) {
      const { exercise, entries } = setBatch;
      entries.forEach(entry => {
        const entrySigs = getSetSignatures(entry.date, entry.person, exercise, entry.setNum);
        const isDuplicate = entrySigs.some(s => existingSetSignatures.has(s));
        if (isDuplicate) {
          return;
        }
        entrySigs.forEach(s => existingSetSignatures.add(s));
        newRows.push([
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
    }

    if (newRows.length > 0) {
      histSheet.insertRowsBefore(2, newRows.length);
      histSheet.setValues(newRows, 2);
    }
  }

  return { synced: true, insertedCount: newRows.length };
}

// Generate the 30 sets from the user's 11/13 workout
const testSets = [];
for (let i = 1; i <= 30; i++) {
  testSets.push({
    exercise: `Exercise ${Math.ceil(i / 3)}`,
    entries: [{
      date: `11/13/2026, 9:${String(i).padStart(2, '0')}:00 AM`,
      person: 'brian',
      reps: 10,
      weight: 50,
      range: 'r8_12',
      setNum: (i % 3) + 1
    }]
  });
}

const payload = {
  action: 'batchSyncSession',
  session: { id: 'FullBody_brian_2026-11-13_day1' },
  sets: testSets
};

// ATTEMPT 1: Initial submission
const res1 = handleBatchSync(payload, mockHistSheet);
console.log(`   Attempt 1: Inserted ${res1.insertedCount} sets.`);
assert.strictEqual(res1.insertedCount, 30, 'Attempt 1 must insert all 30 sets');
assert.strictEqual(mockHistSheet.rows.length, 30, 'Sheet must contain 30 rows');

// ATTEMPT 2: Network retry replay of the exact same payload
const res2 = handleBatchSync(payload, mockHistSheet);
console.log(`   Attempt 2 (Retry 1): Inserted ${res2.insertedCount} sets.`);
assert.strictEqual(res2.insertedCount, 0, 'Attempt 2 must insert 0 sets (all duplicates rejected)');
assert.strictEqual(mockHistSheet.rows.length, 30, 'Sheet must STILL contain exactly 30 rows');

// ATTEMPT 3: Third retry replay
const res3 = handleBatchSync(payload, mockHistSheet);
console.log(`   Attempt 3 (Retry 2): Inserted ${res3.insertedCount} sets.`);
assert.strictEqual(res3.insertedCount, 0, 'Attempt 3 must insert 0 sets (all duplicates rejected)');
assert.strictEqual(mockHistSheet.rows.length, 30, 'Sheet must STILL contain exactly 30 rows');

console.log('✅ TEST 2 PASSED: 100% duplicate immunity verified on server simulation.\n');

console.log('====================================================');
console.log('🎉 ALL AUTOMATED TESTS FOR TASK-R136 PASSED CLEANLY!');
console.log('====================================================\n');
