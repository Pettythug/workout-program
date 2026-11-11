# TASK-R130: Expandable Full-Screen Rest/Stopwatch Timer & Louder Gym Alert Audio

- **Target Role:** `Sandbox_Developer`
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash`, `Claude Sonnet 4.6 (Thinking)`, `Gemini 3.5 Flash (High)`) or `HIGH_TIER`
- **Model Gatekeeper Check:** Verify your active model is in the Authorized Model Tier above before executing any file edits. If misaligned, halt and output the `Model Alignment Error` override.

## Overview
1. **Expandable Full-Screen Rest / Stopwatch Timer:**
   - Currently, the Rest Countdown / Stopwatch readout inside `PlanView.jsx`, `FullBodyView.jsx`, `CircuitView.jsx`, and `StickyRestBanner.jsx` is small (`13px–24px`), making it hard to read from across a gym floor or rack.
   - Tapping either the inline Timer Widget readout or the `StickyRestBanner` timer readout should open a high-contrast, full-screen timer overlay (`FullScreenTimerModal.jsx`) with big readable digits, essential controls (`+30S`, `PAUSE/START`, `SKIP/RESET`, top-right `✕`), automatic Screen Wake Lock while open, and a ~2-second `"REST COMPLETE"` flash before automatically returning to the active exercise card when countdown reaches `0:00`.
   - Leave the top `Header.jsx` elapsed session pill (`⏱️ 12m`) opening `SessionStatsModal` unchanged.
   - Deduplicate the identical 32-line inline Timer Widget across `PlanView.jsx`, `FullBodyView.jsx`, and `CircuitView.jsx` into a single shared `TimerWidget.jsx` component.

2. **Louder Gym-Ready Timer Sound Presets & `AudioContext` Leak Fix (`AppContext.jsx`, `SettingsModal.jsx`):**
   - Currently, `playBeepSound()` in `AppContext.jsx` plays a quiet, single 0.15s tone (`gain = 0.15`, `800Hz`) and opens a brand-new `new AudioContext()` on every beep without reusing or closing it (causing mobile browsers to mute audio after ~6 sets).
   - Upgrade `playBeepSound` with a singleton/resumable `audioCtxRef`, unlock audio cleanly on user gestures (`toggleTimer`, `startRestTimer`, `openExpandedTimer`, Settings `TEST`), provide selectable louder synthesized alert presets (`gym-chime`, `boxing-bell`, `urgent-alarm`, `soft-beep`, `silent`), optional vibration toggle (`navigator.vibrate`), and prevent duplicate 500ms interval ticks from updating `timerSeconds` when the whole-second value has not changed.

---

## Technical Specifications & Requirements

### 1. Audio Engine, Expansion State & Tick Guard (`AppContext.jsx`)
In `gymlog-react/src/context/AppContext.jsx`:
1. **Full-Screen State:**
   - Add `const [isTimerExpanded, setIsTimerExpanded] = useState(false);`
   - Expose `isTimerExpanded`, `setIsTimerExpanded`, `openExpandedTimer = () => { unlockAudio(); setIsTimerExpanded(true); }`, and `closeExpandedTimer = () => setIsTimerExpanded(false)`.
2. **Timer Alert Preferences:**
   - Persist `timerSound` (`localStorage.getItem('gymlog_timer_sound') || 'gym-chime'`) and `timerVibrate` (`localStorage.getItem('gymlog_timer_vibrate') !== 'false'`).
   - Persist updates to `localStorage` automatically.
3. **Singleton Resumable `AudioContext` + Selectable Presets:**
   - Store `const audioCtxRef = useRef(null);` and create helpers `getAudioContext()` + `unlockAudio()` (called inside `toggleTimer`, `startRestTimer`, `openExpandedTimer`, and Settings preview so mobile Safari/Chrome allow scheduled audio playback). Never leak new `AudioContext` instances on every beep.
   - Update `playBeepSound(overrideSound = null)` to read `const mode = overrideSound || timerSound;` and synthesize distinct, clear Web Audio alerts (with smooth gain ramps to avoid clicks, higher audible gym gain ~`0.55–0.7`):
     - `'gym-chime'` *(default)*: 3 ascending bright chimes (`880Hz` -> `1108Hz` -> `1318Hz`)
     - `'boxing-bell'`: resonant multi-harmonic bell ring (`1046Hz` + `1568Hz` exponential decay)
     - `'urgent-alarm'`: 3 sharp dual-pulse alarm beeps (`988Hz` / `784Hz`)
     - `'soft-beep'`: classic single `800Hz` 0.15s tone
     - `'silent'`: plays nothing
   - When countdown hits `remaining <= 0`, call `playBeepSound()` and, if `timerVibrate` is enabled and `navigator?.vibrate` exists, call `navigator.vibrate([250, 100, 250])`.
4. **Whole-Second State Guard:**
   - Inside `updateFromTimestamp()` in the 500ms `setInterval`: use functional state updaters (`setTimerSeconds(prev => (prev === nextVal ? prev : nextVal))`) for both countdown and stopwatch modes so React does not unnecessarily re-render twice per second when the displayed whole second is unchanged.

### 2. Full-Screen Timer Overlay (`FullScreenTimerModal.jsx` + `App.jsx`)
Create `gymlog-react/src/components/FullScreenTimerModal.jsx` (rendered via `createPortal(..., document.body)` when `isTimerExpanded` is true, and mounted once in `App.jsx`):
1. **Screen Wake Lock:**
   - While `isTimerExpanded` is true, attempt `navigator.wakeLock?.request('screen')` inside a `useEffect` (wrapped safely in `try/catch`, re-requesting on `visibilitychange` when visible), and release the `WakeLockSentinel` cleanly on close/unmount.
2. **High-Contrast Gym Display:**
   - Dark backdrop (`rgba(12, 12, 12, 0.97)`, `zIndex: 3000`) matching the app's CSS tokens (`--accent`, `--mono`, `--surface`, `--border`). Tapping the empty backdrop (outside buttons) closes back to the workout.
   - Subtle top bar with mode label (`⏳ REST COUNTDOWN` or `⏱️ STOPWATCH`) and crisp top-right **`✕`** close button.
   - Huge clock display (`fontSize: 'clamp(68px, 22vw, 152px)'`, `fontFamily: 'var(--mono)'`, `fontWeight: 700`): turns `#ef4444` at `<= 10s` in countdown mode, `#38bdf8` in stopwatch mode, `var(--accent)` otherwise.
3. **Minimal Essential Controls (stopPropagation on buttons):**
   - **`PAUSE` / `START`** button (`toggleTimer`)
   - **`+30S`** button (shown when `timerIsCountdown` is true; calling `startRestTimer(timerSeconds + 30)`)
   - **`SKIP`** (when `timerIsCountdown`, calls `resetTimer()` and closes full-screen) or **`RESET`** (when stopwatch mode, calls `resetTimer()`)
4. **`0:00` Flash & Auto-Return Guard:**
   - Track `prevSecondsRef` and an `isCompleteFlash` state + `autoCloseTimeoutRef`.
   - Trigger `"🚨 REST COMPLETE!"` flash ONLY on the live transition `prevSecondsRef.current > 0 && timerSeconds === 0 && !timerIsRunning && timerIsCountdown` (never falsely triggering when opening Stopwatch at `0:00`).
   - Automatically call `closeExpandedTimer()` after `2000ms` so the user clearly sees the flash and returns directly to their exercise card.
   - If the user taps **`+30S`** (or **`✕`**) during that 2-second flash window, cancel the pending `autoCloseTimeoutRef` and clear `isCompleteFlash`.

### 3. Shared `TimerWidget.jsx` & Clickable `StickyRestBanner.jsx`
1. Create `gymlog-react/src/components/TimerWidget.jsx` replacing the identical inline Timer Widget blocks in `PlanView.jsx`, `FullBodyView.jsx`, and `CircuitView.jsx`.
   - Clicking the clock/time readout area opens the expanded full-screen timer (`openExpandedTimer()`), with a subtle `"⛶ TAP TO EXPAND"` micro-hint (`cursor: 'pointer'`).
   - Action buttons (`PAUSE/START`, `RESET`, mode `<select>`) continue calling `e.stopPropagation()` so they work directly without forcing full-screen.
2. In `gymlog-react/src/components/StickyRestBanner.jsx`:
   - Make the left timer readout text (`⏳ REST 1:15` / `⏱️ STOPWATCH 0:45`) clickable (`onClick={openExpandedTimer}`, `cursor: 'pointer'`, with subtle `⛶` expand icon) so tapping the sticky bar anywhere while scrolling also pops open the full-screen timer, while `PAUSE`, `+30S`, and `SKIP/RESET` buttons stay independent.

### 4. Alert Sound Controls in Settings (`SettingsModal.jsx`)
In `gymlog-react/src/components/SettingsModal.jsx`:
- Add a **"REST TIMER ALERT"** section featuring:
  - Sound preset `<select>` bound to `timerSound` / `setTimerSound`:
    - `gym-chime`: `🔔 Gym Chime (Default)`
    - `boxing-bell`: `🥊 Boxing Bell`
    - `urgent-alarm`: `🚨 Urgent Alarm`
    - `soft-beep`: `🔈 Soft Beep`
    - `silent`: `🔇 Silent`
  - **`🔊 TEST`** button next to the dropdown that calls `playBeepSound(timerSound)`.
  - **`Vibrate on completion`** checkbox bound to `timerVibrate` / `setTimerVibrate`.

---

## Target Files
- `gymlog-react/src/context/AppContext.jsx`
- `gymlog-react/src/App.jsx`
- `gymlog-react/src/components/FullScreenTimerModal.jsx` *(New)*
- `gymlog-react/src/components/TimerWidget.jsx` *(New)*
- `gymlog-react/src/components/StickyRestBanner.jsx`
- `gymlog-react/src/components/PlanView.jsx`
- `gymlog-react/src/components/FullBodyView.jsx`
- `gymlog-react/src/components/CircuitView.jsx`
- `gymlog-react/src/components/SettingsModal.jsx`

---

## Submission Protocol for Developer
1. Execute all edits strictly within `gymlog-react/src/*`.
2. Verify production build with `cmd /c npm run build`.
3. Respond in chat with strictly the 4-line XML snippet below:
```xml
<TASK_HANDOFF>
  <TASK_ID>TASK-R130</TASK_ID>
  <ROLE>Sandbox_Developer</ROLE>
  <STATUS>DEVELOPMENT_TASK_COMPLETE</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</TASK_HANDOFF>
```
