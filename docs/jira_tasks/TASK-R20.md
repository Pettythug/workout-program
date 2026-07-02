# TASK-R20: Separate IMAGE Button from SWAP Guard in ExerciseCard

> **For Human Readers:** The IMAGE button is currently hidden inside a `{group.originalBaseKey && (...)}` conditional that only renders in Plan view. The Lift view never sets `originalBaseKey`, so the IMAGE button is completely missing there. This task separates the IMAGE button from the SWAP-specific guard so it renders in both Plan and Lift views.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: SINGLE_FILE_FEATURE
    - REQUIRED_MODEL_TIER: LOW_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R20`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Extract the 📸 IMAGE button out of the `{group.originalBaseKey && (...)}` block in `ExerciseCard.jsx` so it always renders at the bottom of the card in both Plan and Lift views. Keep the 🔄 SWAP button and its associated `swapMode` logic inside the `originalBaseKey` guard (since swapping is Plan-only functionality).
  </OBJECTIVE>
  <RESOURCES>
    - Target File: `gymlog-react/src/components/ExerciseCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ: `gymlog-react/src/components/ExerciseCard.jsx`

    2. LOCATE: The block starting at approximately line 671:
       ```jsx
       {group.originalBaseKey && (
           <div style={{ marginTop: 16, marginBottom: 16, ... }}>
               {swapMode === ex.name ? (
                   // ... swap UI ...
               ) : (
                   <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                       <button>🔄 SWAP</button>
                       <button>📸 IMAGE</button>
                   </div>
               )}
           </div>
       )}
       ```

    3. RESTRUCTURE the block into TWO separate blocks:

       **Block A (SWAP — Plan-only, keep the originalBaseKey guard):**
       ```jsx
       {group.originalBaseKey && (
           <div style={{ marginTop: 16, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
               {swapMode === ex.name ? (
                   // ... entire swap UI unchanged ...
               ) : (
                   <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                       <button onClick={() => setSwapMode(ex.name)} className="btn-ghost" style={{ flex: 1, minWidth: '75px', textAlign: 'center', fontSize: 11, padding: '10px 4px' }}>
                           🔄 SWAP
                       </button>
                   </div>
               )}
           </div>
       )}
       ```

       **Block B (IMAGE — always visible, NO guard):**
       Place this immediately AFTER Block A, before the closing `</div>` of the card body:
       ```jsx
       <div style={{ marginTop: group.originalBaseKey ? 0 : 16, marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
           <button onClick={() => setShowImage(true)} className="btn-ghost" style={{ flex: 1, minWidth: '75px', textAlign: 'center', fontSize: 11, padding: '10px 4px' }}>
               📸 IMAGE
           </button>
       </div>
       ```
       Note: `marginTop` is conditional — if the SWAP block already rendered above (Plan view), use `0` to avoid double spacing; if not (Lift view), use `16` for proper spacing.

    4. AUDIT: Generate `audit_log_R20.md` documenting the change.
    5. VERIFY: Run `npm run build` to ensure no syntax errors were introduced.
    6. EXECUTE: Run `git push origin TASK-R20` to push the branch to the remote repository.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
