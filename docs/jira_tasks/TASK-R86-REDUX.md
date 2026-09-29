# TASK-R86-REDUX: Native Single-Card Stepper Warm-Up Integration

> **For Human Readers:** This task cleanly integrates the Pre-Workout Warm-Up as Step #0 in the native single-card workout stepper flow for PlanView and FullBodyView. Only ONE active card is ever rendered on screen at a time. The Warm-Up card matches the exact frame, dimensions, perimeter orange border, and orange DONE / red SKIP action buttons of ExerciseCard.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: MULTI_FILE_Refactoring
    - REQUIRED_MODEL_TIER: ["MEDIUM_TIER", "Gemini 3.8 Flash (Medium)", "Gemini 3.8 Flash", "Gemini 3.8 Pro"]
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R86-REDUX`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    1. Update `gymlog-react/src/context/AppContext.jsx`:
       - Add `warmUpStatus` state (`'pending' | 'completed' | 'skipped'`, persisted in `gymlog_active_warmup_status`).
       - Add `selectedWarmUp` state (persisted in `gymlog_last_warmup`, defaults to `'500m Row'`).
       - Add `completeWarmUp(modality)`:
         - Updates `selectedWarmUp` and `warmUpStatus = 'completed'`.
         - If `!sessionStartTime`, automatically starts session timer (`sessionStartTime = Date.now()`).
       - Add `skipWarmUp()`: Sets `warmUpStatus = 'skipped'`.
       - Add `resetWarmUp()`: Sets `warmUpStatus = 'pending'`.
       - Wire `resetWarmUp()` into `resetSessionTime()` and midnight date rollover.
       - Expose `warmUpStatus`, `selectedWarmUp`, `completeWarmUp`, `skipWarmUp`, `resetWarmUp` via AppContext.

    2. Create `gymlog-react/src/components/WarmUpCard.jsx`:
       - Frame: Matches `ExerciseCard.jsx` with full perimeter orange border `border: '1px solid var(--accent)'`, `borderRadius: 12`, `background: 'var(--surface-card)'`, `padding: '16px'`, and `marginBottom: 16`.
       - Header:
         - Category: `🔥 PRE-WORKOUT WARM-UP` in orange mono font, with right-aligned `[RECOMMENDED]` badge.
         - Single subtitle: `"Prime nervous system & elevate heart rate before loading."`
       - Modality Selector:
         - Label: `MODALITY SELECTION` (mono uppercase).
         - Dropdown presets: `500m Row`, `25 Cal Assault Bike`, `Treadmill Incline Walk`, `500m SkiErg`, `5 min Jump Rope`, `Dynamic Stretches`, saved custom items, plus `+ Add Custom Modality...` at the bottom of the list.
         - Inline custom form appears when `+ Add Custom Modality...` is chosen.
       - Coaching Tip Box:
         - Dark box `#0d0d0d` with `💡` icon and dynamic coaching cues for the selected modality.
       - Action Buttons:
         - Left: **Orange `DONE`** (`className="btn-accent"`, `background: 'var(--accent)'`, `color: '#000'`, `fontWeight: 'bold'`, `padding: '12px'`, `borderRadius: '8px'`).
         - Right: **Red `SKIP`** (`className="btn-danger"`, `background: '#ef4444'`, `color: '#fff'`, `fontWeight: 'bold'`, `padding: '12px'`, `borderRadius: '8px'`).
         - Calling `DONE` or `SKIP` executes context handlers and triggers `onAdvance()` to advance the stepper.

    3. Update `gymlog-react/src/components/PlanView.jsx` and `gymlog-react/src/components/FullBodyView.jsx`:
       - **Single Card Stepper Architecture**:
         - Track active step index (e.g. `showWarmUp = (warmUpStatus === 'pending' && !manuallyViewingExercise)` or manage via `activeIdx` where index 0 is Warm-Up if pending).
         - When Warm-Up is active:
           - Top counter shows `ACTIVE EXERCISE: WARM-UP` (or `1 / 6`).
           - The single active card slot renders `<WarmUpCard onAdvance={() => setActiveIdx(0)} />`.
           - **NO OTHER exercise cards are rendered below it**.
         - When Warm-Up is completed or skipped:
           - The single active card slot renders the current `<ExerciseCard />` (`activeGroup`).
           - Top counter shows `5/5` (or `1/5` to `5/5` / `2/6` to `6/6`).
       - **FULL LIST Modal**:
         - Render Warm-Up at the top of the list with status badge (`✓ DONE`, `SKIPPED`, or `PENDING`).
         - Tapping the Warm-Up row in the modal sets the view back to the Warm-Up card.
       - **Workout Reset Lifecycle**:
         - `startNextWorkout()` explicitly invokes `resetWarmUp()`.

    4. Verification & Audit:
       - Generate `/audit_log_R86_REDUX.md`.
       - Run `npm run build` inside `gymlog-react` and verify 0 errors / 0 warnings.
  </OBJECTIVE>
  <RESOURCES>
    - Target: `gymlog-react/src/components/WarmUpCard.jsx`
    - Context: `gymlog-react/src/context/AppContext.jsx`
    - Plan View: `gymlog-react/src/components/PlanView.jsx`
    - Full Body View: `gymlog-react/src/components/FullBodyView.jsx`
    - Reference: `gymlog-react/src/components/ExerciseCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/context/AppContext.jsx`, `gymlog-react/src/components/PlanView.jsx`, `gymlog-react/src/components/FullBodyView.jsx`, and `gymlog-react/src/components/ExerciseCard.jsx`.
    2. MODIFY `gymlog-react/src/context/AppContext.jsx` to introduce warm-up state and auto-session start.
    3. CREATE `gymlog-react/src/components/WarmUpCard.jsx` with full perimeter border and orange DONE / red SKIP buttons.
    4. MODIFY `gymlog-react/src/components/PlanView.jsx` and `gymlog-react/src/components/FullBodyView.jsx` to implement the single-card stepper flow.
    5. CREATE `/audit_log_R86_REDUX.md`.
    6. RUN `npm run build` inside `gymlog-react` and verify clean build.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
