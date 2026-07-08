# TASK-R39: Optimize Database Sync with Apps Script Cache Service

> **For Human Readers:** This task implements a split-chunk script cache in the Apps Script backend to speed up the database sync from 6+ seconds to under 300ms by caching the parsed JSON.

> **STATUS: BACKLOG — Not yet scheduled for execution.**

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: SINGLE_FILE_FEATURE
    - REQUIRED_MODEL_TIER: MEDIUM_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <OBJECTIVE>
    Optimize syncAll speeds using a double-cache layer.
  </OBJECTIVE>
  <RESOURCES>
    - Backend: `Combined_AppScript_v2.gs`
  </RESOURCES>
  <SEQUENCE>
    1. READ `Combined_AppScript_v2.gs`.

    2. MODIFY `Combined_AppScript_v2.gs`:
       - Locate the `gymlog_doGet` function.
       - Implement a caching mechanism using `CacheService.getScriptCache()` to cache the full JSON response.
       - Use the Spreadsheet file's `getLastUpdated().getTime()` as the cache invalidation key.
       - Because the database exceeds CacheService's 100KB limit, split the JSON string into 90KB chunks during write, and reassemble them during read.

       Replace the entire `gymlog_doGet` function:
       ```javascript
       function gymlog_doGet() {
         try {
           const file = DriveApp.getFileById(SHEET_ID);
           const lastUpdated = file.getLastUpdated().getTime().toString();

           const cache = CacheService.getScriptCache();
           const cachedKey = "gymlog_sync_key";
           const cachedVal = cache.get(cachedKey);

           // If cache matches the current file modification timestamp, reassemble and return
           if (cachedVal === lastUpdated) {
             const chunkCount = parseInt(cache.get("gymlog_sync_chunks") || "0", 10);
             let reassembled = "";
             for (let i = 0; i < chunkCount; i++) {
               const chunk = cache.get("gymlog_sync_chunk_" + i);
               if (chunk) reassembled += chunk;
             }
             if (reassembled.length > 0) {
               return cors(ContentService.createTextOutput(reassembled));
             }
           }

           // Cache miss or stale: Read sheets from scratch
           const historySheet = getOrCreateSheet(HISTORY_TAB, HISTORY_HEADERS);
           const bestSheet    = getOrCreateSheet(BEST_TAB, BEST_HEADERS);
           const peopleSheet  = getOrCreateSheet(PEOPLE_TAB, PEOPLE_HEADERS);
           const exSheet      = getOrCreateSheet(EXERCISES_TAB, EXERCISES_HEADERS);

           // Read History
           const historyData = historySheet.getLastRow() > 1 
             ? historySheet.getRange(2, 1, historySheet.getLastRow() - 1, historySheet.getLastColumn()).getValues()
             : [];
           const history = historyData.map(row => ({
             date:      row[0] ? Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), "MMM d, yyyy, h:mm a") : "",
             person:    row[1] ? String(row[1]).trim() : "",
             exercise:  row[2] ? String(row[2]).trim() : "",
             reps:      row[3] ? String(row[3]).trim() : "",
             weight:    row[4] ? String(row[4]).trim() : "",
             range:     row[5] ? normalizeRange(String(row[5]).trim()) : "",
             note:      row[6] ? String(row[6]).trim() : "",
             setNum:    row[7] ? String(row[7]).trim() : ""
           }));

           // Read Best (bests are indexed by exercise name in client)
           const bestRows = bestSheet.getLastRow() > 1
             ? bestSheet.getRange(2, 1, bestSheet.getLastRow() - 1, bestSheet.getLastColumn()).getValues()
             : [];
           const best = {};
           bestRows.forEach(row => {
             const ex = String(row[0]).trim();
             const person = String(row[1]).trim().toLowerCase();
             if (!best[ex]) best[ex] = {};
             best[ex][person] = {
               r1_3:     String(row[2] || "").trim(),
               r4_7:     String(row[3] || "").trim(),
               r8_12:    String(row[4] || "").trim(),
               r13_plus: String(row[5] || "").trim()
             };
           });

           // Read People
           const peopleRows = peopleSheet.getLastRow() > 1
             ? peopleSheet.getRange(2, 1, peopleSheet.getLastRow() - 1, 1).getValues()
             : [];
           const people = peopleRows.map(row => String(row[0]).trim()).filter(Boolean);

           // Read Exercise Metadata
           const exRows = exSheet.getLastRow() > 1
             ? exSheet.getRange(2, 1, exSheet.getLastRow() - 1, exSheet.getLastColumn()).getValues()
             : [];
           const exercises = exRows.map(row => {
             const fileRef = String(row[9] || "").trim();
             return {
               name:          String(row[0]).trim(),
               timed:         row[1] === true || String(row[1]).toLowerCase() === "true",
               category:      String(row[2] || "").trim(),
               location:      String(row[3] || "Anywhere").trim(),
               note:          String(row[4] || "").trim(),
               manufacturer:  String(row[5] || "").trim(),
               modelSeries:   String(row[6] || "").trim(),
               baseExercise:  String(row[7] || "").trim(),
               muscleGroups:  String(row[8] || "").trim(),
               fileReference: fileRef,
               isCircuit:     row[10] === true || String(row[10]).toLowerCase() === "true"
             };
           });

           // Derive unique locations
           const derivedLocs = [];
           exercises.forEach(ex => {
             if (ex.location && ex.location !== "Anywhere" && !derivedLocs.includes(ex.location)) {
               derivedLocs.push(ex.location);
             }
           });

           const responseObj = {
             status: "ok",
             data: {
               history: history,
               best: best,
               people: people.length > 0 ? people : DEFAULT_PEOPLE,
               exercises: exercises,
               locations: derivedLocs
             }
           };

           const responseString = JSON.stringify(responseObj);

           // Save to Cache (split into chunks of 90KB to bypass 100KB limit)
           const chunkSize = 90 * 1024;
           const chunkCount = Math.ceil(responseString.length / chunkSize);
           for (let i = 0; i < chunkCount; i++) {
             cache.put("gymlog_sync_chunk_" + i, responseString.substring(i * chunkSize, (i + 1) * chunkSize), 21600); // 6 hours
           }
           cache.put("gymlog_sync_chunks", chunkCount.toString(), 21600);
           cache.put(cachedKey, lastUpdated, 21600);

           return cors(ContentService.createTextOutput(responseString));
         } catch (ex) {
           return err(ex.message);
         }
       }
       ```

    3. AUDIT: Generate `audit_log_R39.md` detailing the backend cache implementation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
