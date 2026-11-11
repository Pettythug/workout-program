# TASK-QA-R130: Pre-Merge Quality Assurance for Full-Screen Timer & Gym Alert Audio

- **Target Role:** `QA_Engineer`
- **Authorized Model Tier:** `LOW_TIER` (`Gemini 3.8 Flash (Low)`, `Gemini 3.5 Flash (Medium)`, `Gemini 3.5 Flash (Low)`) or `MEDIUM_TIER` (`Gemini 3.8 Flash`, `Claude Sonnet 4.6 (Thinking)`)
- **Access Level:** `READ_ONLY_ACCESS` (No file modifications)

---

## 1. Scope & Verification Mandate
Verify the expandable full-screen Rest/Stopwatch Timer (`FullScreenTimerModal.jsx`, `TimerWidget.jsx`, `StickyRestBanner.jsx`, `App.jsx`), view deduplication (`PlanView.jsx`, `FullBodyView.jsx`, `CircuitView.jsx`), gym alert audio engine + `AudioContext` leak fix (`AppContext.jsx`), and Settings UI (`SettingsModal.jsx`).

---

## 2. Automated Build Verification
Execute the production build command inside the `gymlog-react` directory:
```powershell
cmd /c npm run build
```
- **Pass Criteria:** Process exits cleanly with exit code 0 without syntax, JSX, or bundling errors.

---

## 3. Code Inspection Checklist
1. **Audio Engine & Tick Deduplication (`AppContext.jsx`):**
   - Verify `audioCtxRef` singleton pattern is used (`getAudioContext`, `unlockAudio`) instead of allocating unclosed `new AudioContext()` instances per beep.
   - Verify `unlockAudio` is triggered inside `toggleTimer`, `startRestTimer`, and `openExpandedTimer`.
   - Verify selectable alert modes (`gym-chime`, `boxing-bell`, `urgent-alarm`, `soft-beep`, `silent`), `timerSound` / `timerVibrate` persistence in `localStorage`, and `navigator.vibrate` invocation on countdown completion.
   - Verify `updateFromTimestamp()` uses `prev === next ? prev : next` when calling `setTimerSeconds` so no redundant re-renders occur between whole seconds.
2. **Full-Screen Overlay (`FullScreenTimerModal.jsx` + `App.jsx`):**
   - Verify `<FullScreenTimerModal />` is mounted once in `App.jsx` and uses `createPortal(..., document.body)`.
   - Verify `navigator.wakeLock?.request('screen')` is acquired when expanded, re-acquired on `visibilitychange`, and cleanly released on close/unmount.
   - Verify `+30S` (Countdown only), `PAUSE/START`, `RESET` (Stopwatch mode ONLY — confirm NO `SKIP` button renders in `FullScreenTimerModal.jsx`), and top-right `✕` controls stop event propagation cleanly.
   - Verify `"REST COMPLETE!"` flash and 2000ms auto-return trigger ONLY on live transition (`prevSecondsRef.current > 0 && timerSeconds === 0 && !timerIsRunning && timerIsCountdown`), and tapping `+30S` or `✕` cancels the pending auto-close timeout.
   - Verify `Header.jsx` elapsed session duration pill (`⏱️ Xm`) remains untouched and opens `SessionStatsModal`.
3. **Shared `TimerWidget.jsx` & `StickyRestBanner.jsx`:**
   - Verify `PlanView.jsx`, `FullBodyView.jsx`, and `CircuitView.jsx` replace the inline duplicate Timer Widget with `<TimerWidget />`.
   - Verify tapping `TimerWidget` readout or `StickyRestBanner` calls `openExpandedTimer()`, while action buttons call `e.stopPropagation()`.
4. **Settings Controls (`SettingsModal.jsx`):**
   - Verify **REST TIMER ALERT** dropdown, **`🔊 TEST`** button (`playBeepSound(timerSound)`), and **`Vibrate on completion`** checkbox are wired cleanly.

---

## 4. Submission Protocol
Upon successful build and verification, output strictly the 4-line XML snippet below:
```xml
<AUDIT_SUBMISSION>
  <TASK_ID>TASK-QA-R130</TASK_ID>
  <ROLE>QA_Engineer</ROLE>
  <STATUS>QA_PREMERGE_PASS</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</AUDIT_SUBMISSION>
```
