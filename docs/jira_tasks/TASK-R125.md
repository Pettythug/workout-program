# TASK-R125: Rest Timer Battery & Typing Lag Optimization + Audio Fix

- **Target Role:** `Sandbox_Developer`
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash`, `Claude Sonnet 4.6 (Thinking)`, `Gemini 3.5 Flash (High)`) or `HIGH_TIER`
- **Model Gatekeeper Check:** Verify your active model is in the Authorized Model Tier above before executing any file edits. If misaligned, halt and output the `Model Alignment Error` override.

## Overview
1. **2 Hz Full-App Re-Render Storm:**
   - Currently, `AppContext.jsx` runs a `setInterval` every `500ms` while the rest timer is active, calling `setRestTimerState({ ... })` on the root context provider.
   - Because `AppContext` wraps the entire application (`PlanView`, `FullBodyView`, `CircuitView`, all `ExerciseCard`s, and modals), updating `restTimerRemaining` in `AppContext` twice per second forces the **entire component tree** to re-render 180–360 times per rest period, draining mobile battery and causing input typing lag while resting.
2. **`AudioContext` Resource Exhaustion:**
   - `playTimerBeep()` in `AppContext.jsx` instantiates a brand-new `new window.AudioContext()` on every completion beep without ever calling `audioCtx.close()` or reusing a singleton instance. Mobile browsers enforce a strict hardware limit (typically 6 concurrent `AudioContext` instances), causing the timer beep to silently stop working mid-workout.

---

## Technical Specifications & Requirements

### 1. Isolate Rest Timer Countdown Tick & Fix `AudioContext` Leak
1. **Singleton / Self-Closing `AudioContext`:**
   - In `playTimerBeep()`, either reuse a single persistent `AudioContext` reference (`audioCtxRef.current`) resuming it if suspended, or call `audioCtx.close()` inside `oscillator.onended` after the beep finishes so hardware audio channels are never leaked.
2. **Prevent Unnecessary Global State Updates:**
   - In `AppContext.jsx`, inside the 500ms timer interval, only call `setRestTimerState` when the displayed whole second (`Math.ceil((prev.endTime - now) / 1000)`) actually changes (1 Hz instead of 2 Hz when unchanged), OR isolate the live countdown tick inside `RestTimerBanner.jsx` using `restTimerEndTime` so `ExerciseCard`s do not re-render every 500ms.
   - Memoize the `AppContext.Provider` value with `useMemo` or split timer state so non-timer changes don't re-render unrelated consumers.

---

## Target Files
- `gymlog-react/src/context/AppContext.jsx`
- `gymlog-react/src/components/RestTimerBanner.jsx`

---

## Submission Protocol for Developer
1. Execute all edits strictly within `gymlog-react/src/*`.
2. Verify production build with `cmd /c npm run build`.
3. Respond in chat with strictly the 4-line XML snippet below:
```xml
<TASK_HANDOFF>
  <TASK_ID>TASK-R125</TASK_ID>
  <ROLE>Sandbox_Developer</ROLE>
  <STATUS>DEVELOPMENT_TASK_COMPLETE</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</TASK_HANDOFF>
```
