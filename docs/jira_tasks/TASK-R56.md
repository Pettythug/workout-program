# TASK-R56: Consolidate Exercise Card Metadata Controls

> **For Human Readers:** This task collapses the 5 exercise metadata buttons (Rename, Category, Location, Timed, In Circuit) into an inline panel toggled by a `⚙️ EDIT EXERCISE` footer button inside the expanded card view.

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
    - TARGET_BRANCH: `TASK-R56`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Unify the bottom action buttons side-by-side and hide the 5 metadata editing buttons behind a settings toggle panel in ExerciseCard.jsx.
  </OBJECTIVE>
  <RESOURCES>
    - Exercise Card: `gymlog-react/src/components/ExerciseCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/ExerciseCard.jsx`.

    2. MODIFY `gymlog-react/src/components/ExerciseCard.jsx`:
       a. Add a new boolean state hook `showEditPanel` (default `false`) inside `ExerciseCard`.
       b. Wrap the 5 metadata buttons container (around line 544) in a conditional render: `showEditPanel && ( ... )`.
       c. Combine the `🔄 SWAP` and `📸 IMAGE` buttons row. Place `🔄 SWAP` (conditional on `group.originalBaseKey`), `📸 IMAGE`, and the new `⚙️ EDIT EXERCISE` toggle button side-by-side inside a single flex-row at the bottom of the card:
          ```jsx
          <div style={{ display: 'flex', gap: 8, marginTop: 16, marginBottom: 16 }}>
              {group.originalBaseKey && (
                  <button onClick={() => setSwapMode(ex.name)} className="btn-ghost" style={{ flex: 1, fontSize: 11, padding: '10px 4px' }}>
                      🔄 SWAP
                  </button>
              )}
              <button onClick={() => setShowImage(true)} className="btn-ghost" style={{ flex: 1, fontSize: 11, padding: '10px 4px' }}>
                  📸 IMAGE
              </button>
              <button onClick={() => setShowEditPanel(!showEditPanel)} className={showEditPanel ? "btn-accent" : "btn-ghost"} style={{ flex: 1, fontSize: 11, padding: '10px 4px', color: showEditPanel ? '#000' : 'white' }}>
                  ⚙️ EDIT EXERCISE
              </button>
          </div>
          ```

    3. AUDIT: Generate `/audit_log_R56.md` in the workspace root detailing layout changes.
    4. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to verify compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
