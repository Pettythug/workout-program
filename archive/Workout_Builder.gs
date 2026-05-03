function generateWorkouts() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
      const exerciseSheet = ss.getSheetByName('Exercises');
        const workoutSheet = ss.getSheetByName('Workouts');

          // Get all exercises
            const exerciseData = exerciseSheet.getDataRange().getValues();
              
                // Organize exercises by category
                  const categories = {
                      'Explosive': [],
                          'Knee Dominant': [],
                              'Hip Dominant': [],
                                  'Horizontal Push': [],
                                      'Horizontal Pull': [],
                                          'Vertical Push': [],
                                              'Vertical Pull': [],
                                                  'Rotational Core': [],
                                                      'Plank Core': []
                                                        };

                                                          // Skip header row
                                                            for (let i = 1; i < exerciseData.length; i++) {
                                                                const exercise = exerciseData[i][0];
                                                                    const category = exerciseData[i][1];
                                                                        if (categories[category] !== undefined) {
                                                                              categories[category].push(exercise);
                                                                                  }
                                                                                    }

                                                                                      // Shuffle function
                                                                                        function shuffle(array) {
                                                                                            let arr = [...array];
                                                                                                for (let i = arr.length - 1; i > 0; i--) {
                                                                                                      const j = Math.floor(Math.random() * (i + 1));
                                                                                                            [arr[i], arr[j]] = [arr[j], arr[i]];
                                                                                                                }
                                                                                                                    return arr;
                                                                                                                      }

                                                                                                                        // Rep range assignment
                                                                                                                          function getRepRange(workoutNum) {
                                                                                                                              const position = ((workoutNum - 1) % 16);
                                                                                                                                  if (position < 4) return '8-12';
                                                                                                                                      if (position < 8) return '1-3';
                                                                                                                                          if (position < 12) return '15-20';
                                                                                                                                              return '4-7';
                                                                                                                                                }

                                                                                                                                                  // Generate shuffled pools for each category
                                                                                                                                                    // Each pool covers 48 workouts without repeating until exhausted
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

                                                                                                                                                                                          // Build workout rows
                                                                                                                                                                                            const rows = [];
                                                                                                                                                                                              for (let i = 1; i <= 48; i++) {
                                                                                                                                                                                                  const type = i % 2 === 1 ? 'Push' : 'Pull';
                                                                                                                                                                                                      const repRange = getRepRange(i);
                                                                                                                                                                                                          
                                                                                                                                                                                                              let kneehip, vertpushpull, horizpushpull, core;
                                                                                                                                                                                                                  
                                                                                                                                                                                                                      if (type === 'Push') {
                                                                                                                                                                                                                            kneehip = pools['Knee Dominant'][i-1];
                                                                                                                                                                                                                                  vertpushpull = pools['Vertical Push'][i-1];
                                                                                                                                                                                                                                        horizpushpull = pools['Horizontal Push'][i-1];
                                                                                                                                                                                                                                              core = pools['Rotational Core'][i-1];
                                                                                                                                                                                                                                                  } else {
                                                                                                                                                                                                                                                        kneehip = pools['Hip Dominant'][i-1];
                                                                                                                                                                                                                                                              vertpushpull = pools['Vertical Pull'][i-1];
                                                                                                                                                                                                                                                                    horizpushpull = pools['Horizontal Pull'][i-1];
                                                                                                                                                                                                                                                                          core = pools['Plank Core'][i-1];
                                                                                                                                                                                                                                                                              }

                                                                                                                                                                                                                                                                                  rows.push([
                                                                                                                                                                                                                                                                                        i,                          // Workout #
                                                                                                                                                                                                                                                                                              type,                       // Type
                                                                                                                                                                                                                                                                                                    pools['Explosive'][i-1],    // Explosive
                                                                                                                                                                                                                                                                                                          kneehip,                    // Knee/Hip Dominant
                                                                                                                                                                                                                                                                                                                vertpushpull,               // Vertical Push/Pull
                                                                                                                                                                                                                                                                                                                      horizpushpull,              // Horizontal Push/Pull
                                                                                                                                                                                                                                                                                                                            core,                       // Core
                                                                                                                                                                                                                                                                                                                                  repRange,                   // Rep Range
                                                                                                                                                                                                                                                                                                                                        ''                          // Date Completed
                                                                                                                                                                                                                                                                                                                                            ]);
                                                                                                                                                                                                                                                                                                                                              }

                                                                                                                                                                                                                                                                                                                                                // Write to Workouts sheet (starting at row 2)
                                                                                                                                                                                                                                                                                                                                                  workoutSheet.getRange(2, 1, 48, 9).setValues(rows);
                                                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                                                      Logger.log('48 workouts generated successfully!');
                                                                                                                                                                                                                                                                                                                                                      }
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getNextWorkout') return getNextWorkout();
  if (action === 'getMaxes') return getMaxes(e.parameter.exercises);
  if (action === 'logSet') return logSet(e);
  if (action === 'updateMax') return updateMax(e);
  if (action === 'completeWorkout') return completeWorkout(e.parameter.workoutNum);
  if (action === 'getAccessoryExercise') return getAccessoryExercise();

  
  return ContentService.createTextOutput(JSON.stringify({error: 'Unknown action'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function getNextWorkout() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Workouts');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][8] === '') {
      const workout = {
        workoutNum: data[i][0],
        type: data[i][1],
        explosive: data[i][2],
        kneeHip: data[i][3],
        vertPushPull: data[i][4],
        horizPushPull: data[i][5],
        core: data[i][6],
        repRange: data[i][7]
      };
      return ContentService.createTextOutput(JSON.stringify(workout))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({error: 'No pending workouts'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function getMaxes(exercisesParam) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Maxes');
  const data = sheet.getDataRange().getValues();
  const exercises = exercisesParam.split(',');
  
  const maxes = {};
  for (let i = 1; i < data.length; i++) {
    if (exercises.includes(data[i][0])) {
      maxes[data[i][0]] = {
        '1-3': data[i][1],
        '4-7': data[i][2],
        '8-12': data[i][3],
        '15-20': data[i][4]
      };
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(maxes))
    .setMimeType(ContentService.MimeType.JSON);
}

function logSet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Log');
  
  sheet.appendRow([
    new Date(),
    e.parameter.workoutNum,
    e.parameter.exercise,
    e.parameter.setNum,
    e.parameter.reps,
    e.parameter.weight,
    e.parameter.repRange
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}

function updateMax(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Maxes');
  const data = sheet.getDataRange().getValues();
  
  const exercise = e.parameter.exercise;
  const repRange = e.parameter.repRange;
  const newMax = e.parameter.newMax;
  
  const colMap = {'1-3': 1, '4-7': 2, '8-12': 3, '15-20': 4};
  const col = colMap[repRange];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === exercise) {
      sheet.getRange(i + 1, col + 1).setValue(newMax);
      return ContentService.createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // Exercise not found, add new row
  sheet.appendRow([exercise, '', '', '', '']);
  const newRow = sheet.getLastRow();
  sheet.getRange(newRow, col + 1).setValue(newMax);
  
  return ContentService.createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}

function completeWorkout(workoutNum) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Workouts');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == workoutNum) {
      sheet.getRange(i + 1, 9).setValue(new Date());
      return ContentService.createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({error: 'Workout not found'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function getAccessoryExercise() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const exerciseSheet = ss.getSheetByName('Exercises');
  const logSheet = ss.getSheetByName('Log');
  
  // Get all accessory exercises
  const exerciseData = exerciseSheet.getDataRange().getValues();
  const accessories = [];
  for (let i = 1; i < exerciseData.length; i++) {
    if (exerciseData[i][1] === 'Accessory') {
      accessories.push(exerciseData[i][0]);
    }
  }
  
  // Get recently used accessories from log
  const logData = logSheet.getDataRange().getValues();
  const used = new Set();
  for (let i = logData.length - 1; i >= 1; i--) {
    if (used.size >= accessories.length) break;
    used.add(logData[i][2]);
  }
  
  // Find unused accessories first
  const unused = accessories.filter(e => !used.has(e));
  const pool = unused.length > 0 ? unused : accessories;
  
  // Return random one
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return ContentService.createTextOutput(JSON.stringify({ exercise: pick }))
    .setMimeType(ContentService.MimeType.JSON);
}
function testAccessory() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const exerciseSheet = ss.getSheetByName('Exercises');
  const exerciseData = exerciseSheet.getDataRange().getValues();
  const accessories = [];
  
  for (let i = 1; i < exerciseData.length; i++) {
    if (exerciseData[i][1] === 'Accessory') {
      accessories.push(exerciseData[i][0]);
    }
  }
  
  Logger.log('Accessories found: ' + accessories.length);
  Logger.log(accessories);
}