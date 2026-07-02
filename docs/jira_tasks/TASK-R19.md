# TASK-R19: Fix React StrictMode Double-Sync and Abort Cleanup

> **For Human Readers:** React StrictMode in development mode double-fires `useEffect`, causing two concurrent API calls to Google Apps Script. The second request's redirect token collides at Google's CDN layer, returning a 404. This fix adds proper abort cleanup so the first (stale) request is cancelled before the second starts.

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
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R19`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Fix two bugs caused by React StrictMode double-invocation of effects:
    1. Two concurrent `syncAll` GET requests fire on mount, where the second fails with a 404 at Google's CDN redirect layer.
    2. The sync indicator (red dot) can get stuck until the user navigates away and back.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files:
      - `gymlog-react/src/hooks/useGymAPI.js`
      - `gymlog-react/src/context/AppContext.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Both target files.

    2. MODIFY `gymlog-react/src/hooks/useGymAPI.js`:
       - Change the `syncAll` function signature to accept an optional `externalSignal` parameter:
         `const syncAll = useCallback(async (forceRefresh = false, externalSignal = null) => {`
       - Keep the existing internal AbortController for the 60-second timeout.
       - Add a NEW listener: if `externalSignal` is provided and it aborts, also abort the internal controller. Add this AFTER creating the internal controller:
         ```javascript
         if (externalSignal) {
             externalSignal.addEventListener('abort', () => controller.abort());
         }
         ```
       - This way, both the 60s timeout AND external cleanup can cancel the fetch.

    3. MODIFY `gymlog-react/src/context/AppContext.jsx`:
       - In the `useEffect` on line 53, create an `AbortController` at the top of the effect body:
         ```javascript
         const controller = new AbortController();
         ```
       - Pass `controller.signal` as the second argument to `syncAll`:
         ```javascript
         const data = await syncAll(false, controller.signal);
         ```
       - In the `catch` block (line 86), add an early return to silently ignore abort errors (do NOT log them):
         ```javascript
         } catch (error) {
             if (error.name === 'AbortError' || controller.signal.aborted) return;
             console.error("Error loading initial data:", error);
         }
         ```
       - Add a cleanup return at the END of the `useEffect` callback (after `loadInitialData();`):
         ```javascript
         loadInitialData();
         return () => controller.abort();
         ```
       - This ensures that when StrictMode unmounts the first render, the stale fetch is cancelled before the second render's fetch starts.

    4. AUDIT: Generate `audit_log_R19.md` documenting the changes.
    5. VERIFY: Run `npm run build` to ensure no syntax errors were introduced.
    6. EXECUTE: Run `git push origin TASK-R19` to push the branch to the remote repository.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
