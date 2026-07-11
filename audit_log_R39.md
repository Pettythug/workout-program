# Audit Log - TASK-R39: Optimize Database Sync with Apps Script Cache Service

**Author:** Antigravity (AI Sandbox Developer)  
**Date:** 2026-07-11  

## Overview
Optimized the backend synchronization speeds by implementing a double-caching layer in the `gymlog_doGet` function. This cache matches the Google Drive file modification timestamp of the source Google Sheet to invalidate stale cache entries. Since Google Apps Script CacheService has a 100KB limit per entry, the serialized JSON response is split into 90KB chunks during cache write and reassembled during read.

## Avoided Regressions from JIRA Ticket Snag
The suggested replacement code in `docs/jira_tasks/TASK-R39.md` contained outdated logic. If copied verbatim, it would have introduced the following regressions:
1. **Settings Property Omission:** Completely omitted the `settings: gymlog_getSettingsInternal()` key, which would break settings sync.
2. **Google Drive File ID Overwrite Bug Reintroduction (from TASK-R34):** Reverted the fix that prevents valid Google Drive file IDs from being overwritten with `safeName.jpg` in exercise file references.
3. **Unparsed Best Performance Reductions:** Returned raw string representation (e.g. `"8x135"`) instead of parsed rep/weight objects mapping (`parseBest`).

**Action Taken:** Implemented the cache lookup and saving wrappers around the *existing* robust data mapping logic, ensuring zero regressions.

## Code Changes

### `Combined_AppScript_v2.gs`
Modified `gymlog_doGet` to check cache first using `DriveApp.getFileById(SHEET_ID).getLastUpdated().getTime().toString()` as the cache invalidation key:

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
...
```

And saved to the cache on cache miss:
```javascript
...
    const responseObj = {
      status: "ok",
      data: {
        history,
        best,
        people:    people.length > 0 ? people : DEFAULT_PEOPLE,
        exercises: exercisesMeta,
        locations: derivedLocations,
        settings:  gymlog_getSettingsInternal()
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
...
```

## Verification
1. Copied code to `temp_check.js` and verified syntax with `node -c`.
2. Executed a build of the React frontend (`npm run build`) in `/gymlog-react/` which compiled successfully.
