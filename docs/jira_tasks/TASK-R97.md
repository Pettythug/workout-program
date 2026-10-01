# TASK-R97: Mobile Sticky Header & Rest Countdown Timer Viewport Fix

## 1. Overview & Objectives
During mobile viewport testing (including Chrome DevTools device mode), when scrolling down through workout exercise cards, the top navigation header and the active rest countdown banner (`StickyRestBanner`) do not remain stuck to the top of the viewport and scroll out of view.

The objective of this task is to ensure that the header and active rest timer/stopwatch banner remain sticky (`position: sticky; top: 0`) and clearly visible across all screen sizes and mobile devices while scrolling.

---

## 2. Root Cause Analysis
1. **Ancestor Overflow Conflict in `gymlog-react/src/index.css`**:
   - `html, body` and `#root` currently declare `overflow-x: hidden;`.
   - In CSS standards and browser rendering engines (Chromium, WebKit, Gecko), setting `overflow-x: hidden` or `overflow: hidden` on any ancestor container of a `position: sticky` element disables sticky behavior relative to the window viewport.
   - Replacing `overflow-x: hidden` with `overflow-x: clip` prevents horizontal scrolling while preserving sticky positioning across all modern mobile browsers.

2. **Sticky Container Configuration in `gymlog-react/src/App.jsx` & `index.css`**:
   - Ensure `.sticky-header-container` has robust sticky positioning:
     ```css
     .sticky-header-container {
         position: sticky;
         top: 0;
         z-index: 999;
         background: var(--surface);
         border-bottom: 1px solid var(--border);
         width: 100%;
         transform: translate3d(0, 0, 0);
         -webkit-transform: translate3d(0, 0, 0);
         will-change: transform;
     }
     ```

3. **Mobile Layout Hardening in `gymlog-react/src/components/StickyRestBanner.jsx`**:
   - Ensure the rest timer text (e.g., `⏱️ REST 1:30`) and action buttons (`PAUSE`, `+30S`, `SKIP`, `RESET`) fit cleanly without wrapping or overflow on narrow mobile screens (320px–390px).
   - Use `flex-shrink: 0` for buttons and `min-width: 0` for label text.

---

## 3. Scope of File Modifications
- `gymlog-react/src/index.css`: Update `html, body, #root` overflow properties from `overflow-x: hidden` to `overflow-x: clip`, and verify `.sticky-header-container` rules.
- `gymlog-react/src/components/StickyRestBanner.jsx`: Ensure mobile-responsive flex spacing, button hitboxes, and text clamping.
- `gymlog-react/src/App.jsx`: Verify sticky container structure and ensure no conflicting wrappers.

---

## 4. Acceptance Criteria
1. [ ] **Sticky Behavior**: When scrolling down through exercises in PlanView, FullBodyView, LiftView, or CircuitView, the header and active countdown timer banner remain fixed/sticky at the top of the viewport.
2. [ ] **Zero Mobile Clipping**: On 375px width (iPhone SE) and 390px width (iPhone 14/15), all buttons (`PAUSE`, `+30S`, `SKIP`, `RESET`, `RESTART`, `DISMISS`) are fully visible, aligned, and tappable.
3. [ ] **Modal Stacking**: Settings, Session Stats, and Image Modals open with higher z-index (`z-index: 2000`) without being obscured by or obscuring the sticky header incorrectly.
4. [ ] **Build & Quality Check**: `npm run build` compiles with 0 errors, and `npx eslint src/` exits with 0 lint errors.
