# Audit Log: TASK-R19 — Fix React StrictMode Double-Sync and Abort Cleanup

**Date:** 2026-07-02
**Branch:** TASK-R19
**Author:** Sandbox_Developer (Agent)

---

## Objective

Fix two bugs caused by React StrictMode double-invocation of effects:
1. Two concurrent `syncAll` GET requests fire on mount; the second fails with a 404 at Google's CDN redirect layer.
2. The sync indicator (red dot) can get stuck until the user navigates away and back.

## Files Modified

### 1. `gymlog-react/src/hooks/useGymAPI.js`

**Change:** Added optional `externalSignal` parameter to `syncAll`.

- **Before:** `const syncAll = useCallback(async (forceRefresh = false) => {`
- **After:** `const syncAll = useCallback(async (forceRefresh = false, externalSignal = null) => {`

**Added:** Abort listener that wires an external AbortSignal to the internal controller:
```javascript
if (externalSignal) {
    externalSignal.addEventListener('abort', () => controller.abort());
}
```

**Rationale:** Allows callers (e.g., useEffect cleanup) to cancel in-flight requests while preserving the existing 60-second timeout mechanism. Both cancellation vectors (timeout and external abort) now converge on the same internal controller.

### 2. `gymlog-react/src/context/AppContext.jsx`

**Changes (4 edits):**

1. **AbortController creation** at the top of the initial load `useEffect`:
   ```javascript
   const controller = new AbortController();
   ```

2. **Pass signal to syncAll:**
   ```javascript
   const data = await syncAll(false, controller.signal);
   ```

3. **Silent abort error handling** in the catch block:
   ```javascript
   if (error.name === 'AbortError' || controller.signal.aborted) return;
   ```

4. **Cleanup return** at the end of the effect:
   ```javascript
   return () => controller.abort();
   ```

**Rationale:** When StrictMode unmounts the first render, the cleanup function aborts the stale fetch. The second render starts fresh with its own controller. Abort errors are silently ignored since they are expected during development.

## Risk Assessment

- **Low risk:** Changes are additive. The `externalSignal` parameter defaults to `null`, so all existing call sites remain unaffected.
- **No breaking changes:** The cleanup return is standard React pattern for effect teardown.
- **Dev-only impact:** StrictMode double-fire only occurs in development; production builds fire effects once.
