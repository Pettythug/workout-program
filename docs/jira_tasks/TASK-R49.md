# TASK-R49: Add Inline Timed Toggle and Persist Metadata Toasts

> **For Human Readers:** (1) If an exercise like "Dynamic Plank" was mistakenly created without checking the "Timed" box, there is currently no way to change it to a timed exercise in the UI. This task adds a "TIMED" toggle button in `ExerciseCard` so users can switch exercises between reps and timed tracking. (2) We will also clean up remaining 3-second `setTimeout` timers on metadata and note edit toasts to make them persistent.

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
    - TARGET_BRANCH: `TASK-R49`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Add an inline TIMED / REPS toggle button in `ExerciseCard.jsx` metadata settings.
    2. Convert all remaining metadata, note, and history deletion toasts to be persistent, clearing immediately on log input change.
  </OBJECTIVE>
  <RESOURCES>
    - Card Component: `gymlog-react/src/components/ExerciseCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/ExerciseCard.jsx`.

    2. MODIFY `gymlog-react/src/components/ExerciseCard.jsx`:
       
       a. Add `updateExerciseInLocalState` to destructuring imports from `useAppContext()` (around line 108).
       
       b. Inside `handleOpenEdit` (around line 283), add support for 'timed' edits:
          ```javascript
          if (type === 'timed') {
              handleSaveInlineEdit('timed');
              return;
          }
          ```

       c. Inside `handleSaveInlineEdit` (around line 294):
          - Support toggling `timed` status in the payload:
            ```javascript
            if (typeToSave === 'timed') {
                const confirmMsg = ex.timed 
                    ? `Convert '${ex.name}' to Reps-based tracking?`
                    : `Convert '${ex.name}' to Timed tracking?`;
                if (!window.confirm(confirmMsg)) return;
                payload.timed = !ex.timed;
            }
            ```
          - Inside the `try` block, if the API call succeeds:
            - Update the local state configuration so changes apply immediately without reloading:
              ```javascript
              updateExerciseInLocalState(ex.name, { timed: payload.timed });
              ```
            - Remove the `setTimeout(() => setToast(""), 3000)` triggers. Set the toast description to a static message (e.g., `"Updated!"`).

       d. Inside `handleDeleteHistory` (around line 339) and `updateExerciseNote` (if it exists):
          - Remove any automatic `setTimeout` timers that clear the success toasts. Set the toast text statically.

       e. Add a `⏱️ TIMED` / `🏋️ REPS` toggle button next to the other metadata options in the footer (around line 555):
          ```jsx
          <button className={ex.timed ? "btn-accent btn-no-translate" : "btn-ghost btn-no-translate"} style={{ flex: 1, fontSize: 10, padding: '6px 8px', color: ex.timed ? '#000' : 'var(--muted)' }} onClick={() => handleOpenEdit('timed')}>
              {ex.timed ? "⏱️ TIMED" : "🏋️ REPS"}
          </button>
          ```

    3. AUDIT: Generate `audit_log_R49.md` detailing the timed toggle addition and persistent toast changes.
    4. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to confirm compilation succeeds cleanly.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
