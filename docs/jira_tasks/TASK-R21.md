# TASK-R21: Fix Premature Sync Indicator, Input Clearing, and Error Visibility

> **For Human Readers:** Three connected bugs: (1) the sync indicator turns green before data actually loads because `finally` runs even after an aborted request, (2) ExerciseCard inputs don't clear after logging a set, and (3) ExerciseCard errors are invisible compared to Circuit's alert dialogs.

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
    - TARGET_BRANCH: `TASK-R21`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Fix three bugs:
    1. Sync indicator (green dot) appears before data is actually loaded.
    2. ExerciseCard reps/weight inputs don't clear after a successful LOG SET.
    3. ExerciseCard errors are a 2-second toast instead of a visible alert like Circuit.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files:
      - `gymlog-react/src/context/AppContext.jsx`
      - `gymlog-react/src/components/ExerciseCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Both target files.

    2. MODIFY `gymlog-react/src/context/AppContext.jsx`:
       - In the `finally` block of the `loadInitialData` function (approximately line 90-93), guard the state updates so they ONLY run if the request was NOT aborted:
         **Before:**
         ```javascript
         } finally {
             setLoading(false);
             setIsSyncing(false);
         }
         ```
         **After:**
         ```javascript
         } finally {
             if (!controller.signal.aborted) {
                 setLoading(false);
                 setIsSyncing(false);
             }
         }
         ```
         **Rationale:** JavaScript `finally` blocks execute even after a `return` statement in `catch`. Without this guard, when StrictMode aborts the first sync, `finally` still fires `setIsSyncing(false)`, turning the dot green before the second (real) sync starts.

    3. MODIFY `gymlog-react/src/components/ExerciseCard.jsx`:

       **Fix A — Add a `clearLogInputs` function** right AFTER the existing `initLogInputs` function (approximately line 188):
       ```javascript
       const clearLogInputs = () => {
           const cleared = {};
           people.forEach(p => {
               cleared[p.toLowerCase()] = { reps: "", weight: "", duration: "", note: "" };
           });
           setLogInputs(cleared);
       };
       ```
       **Rationale:** `initLogInputs` uses non-destructive merge (`if (!next[key])`) from TASK-R15, which correctly preserves values during sync. But after a successful log, we need a destructive clear. This function force-resets all inputs.

       **Fix B — Call `clearLogInputs` instead of `initLogInputs` after a successful log.**
       Find the line that says `initLogInputs(); // Clear inputs on success` (approximately line 301) and replace it:
       **Before:**
       ```javascript
       initLogInputs(); // Clear inputs on success
       ```
       **After:**
       ```javascript
       clearLogInputs(); // Force-clear inputs after successful log
       ```

       **Fix C — Add console.log to `handleSaveSet` for debugging parity with Circuit.**
       At the very beginning of the `handleSaveSet` function (after `setIsSaving(true);` on approximately line 212), add:
       ```javascript
       console.log("handleSaveSet CALLED", { ex, logInputs });
       ```

       **Fix D — Make error messages visible.**
       Find the catch block in `handleSaveSet` (approximately line 303-306):
       **Before:**
       ```javascript
       } catch (e) {
           console.error(e);
           setToast("Error saving set");
           setTimeout(() => setToast(""), 2000);
       }
       ```
       **After:**
       ```javascript
       } catch (e) {
           console.error("Error in handleSaveSet:", e);
           alert("Failed to log set: " + e.message);
       }
       ```
       **Rationale:** Circuit uses `alert()` for errors, making them impossible to miss. ExerciseCard used a 2-second toast that disappeared before the user could read it.

    4. AUDIT: Generate `audit_log_R21.md` documenting all changes.
    5. VERIFY: Run `npm run build` to ensure no syntax errors were introduced.
    6. EXECUTE: Run `git push origin TASK-R21` to push the branch to the remote repository.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
