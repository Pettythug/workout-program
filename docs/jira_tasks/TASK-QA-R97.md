# TASK-QA-R97: QA Pre-Merge Verification Specification

## 1. Task Summary
- **Target App:** `gymlog-react`
- **Branch:** `TASK-R97`
- **Developer Commit:** `ca515ea`
- **Focus Area:** Mobile Sticky Header, StickyRestBanner Viewport Lock, and Modal Z-Index Alignment.

---

## 2. Changes Under Review
1. **`gymlog-react/src/index.css`**:
   - Replaced `overflow-x: hidden` with `overflow-x: clip` on `html, body, #root`.
   - Confirmed `.sticky-header-container` maintains `position: sticky; top: 0; z-index: 999;`.
2. **`gymlog-react/src/components/StickyRestBanner.jsx`**:
   - Hardened mobile flexbox layout with `flex-shrink: 0`, `white-space: nowrap`, responsive padding (`padding: '6px 12px'`), and `min-width: 0` on timer labels.
3. **Modal Z-Indices (`SessionStatsModal.jsx`, `SettingsModal.jsx`, `ImageModal.jsx`)**:
   - Backdrops updated to `zIndex: 2000` to sit strictly above the sticky header container (`z-index: 999`).

---

## 3. QA Pre-Merge Checklist
1. [ ] **Automated Build & Linting**:
   - Execute `npm.cmd run build` $\rightarrow$ Must exit with 0 errors.
   - Execute `npx.cmd eslint src/` $\rightarrow$ Must exit with 0 errors.
2. [ ] **Mobile Sticky Header Verification (DevTools Mobile Mode / F12)**:
   - Load http://localhost:5173/workout-program/react/ on a mobile viewport (e.g., iPhone SE / 375px or Pixel 7 / 393px).
   - Log a set or start a rest timer.
   - Scroll down to subsequent exercise cards (e.g. Exercise 2, 3, 4, 5).
   - **Verification:** The header and `StickyRestBanner` remain pinned to the top of the viewport and never scroll out of view.
3. [ ] **Mobile Action Buttons Alignment**:
   - Verify `PAUSE`, `+30S`, `SKIP`, `RESET` buttons are fully visible and not cut off or wrapped awkwardly on narrow viewports.
4. [ ] **Modal Overlay Stacking**:
   - Open Settings (`⚙️`), Session Stats (`⏱️`), and Image Modals.
   - **Verification:** Modals cleanly cover the sticky header without header controls leaking through.

---

## 4. Signal Requirement
When all tests pass, output `QA_PREMERGE_PASS`.
