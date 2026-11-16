# TASK-R140: Core AI Vision Engine & Single Machine Scanner (SettingsModal.jsx) — Fullscreen Photo Inspector

- **Target Role:** `Sandbox_Developer` (`DENY(git checkout, git merge, git push)`)
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash (High)` / `Claude Sonnet 4.6 (Thinking)`) or `HIGH_TIER` (`Gemini 4 Argon (High)` / `Gemini 3.8 Pro` / `Claude Opus 4.6 (Thinking)`)
- **STRICT MODEL GATEKEEPER CHECK (MANDATORY ON TURN 1):**
  - If your active model is in `LOW_TIER` (`Gemini 4 Argon (Low)`, `Gemini 3.8 Flash (Low)`):
    - **HALT IMMEDIATELY.** Do NOT edit files or run commands.
    - Output: `Model Alignment Error: Request Switch -> Expected MEDIUM_TIER or HIGH_TIER for feature development. Please switch to Gemini 3.8 Flash (High), Claude Sonnet 4.6 (Thinking), or Gemini 4 Argon (High).`
- **Target Branch:** `feat/epic-10-ai-equipment-scanner` (Unified Epic 10 branch for continuous Vercel preview testing)

---

## 1. Objective & Scope (Fullscreen Photo Inspector & Retake Flow)

Implement the Fullscreen Photo Inspector and Retake flow in `gymlog-react/src/components/SettingsModal.jsx`:

1. **Resolve Actual Photo Source (`getPhotoSrc`):**
   - When `exPhotoPreview` or `exFileReference` is a live camera photo (`data:...`), a URL (`http...`), or a filename (e.g. `20260517_090721.jpg` from `SAMPLE_MACHINE_PRESET`), correctly resolve the image source:
     ```javascript
     const getPhotoSrc = (ref) => {
         if (!ref) return null;
         if (typeof ref === 'string' && (ref.startsWith('data:') || ref.startsWith('http') || ref.startsWith('blob:'))) {
             return ref;
         }
         return `${import.meta.env.BASE_URL}images/${ref}`;
     };
     ```
   - This ensures sample photos and local image assets display immediately in the thumbnail rather than a generic icon.
2. **Interactive Fullscreen Photo Inspector Modal:**
   - Make the photo thumbnail clickable (`cursor: pointer`), adding a hover/tap cue (`🔍 Tap to view`).
   - Tapping the thumbnail opens a clean modal overlay:
     - Header: `📷 Machine Photo Preview` with a `✕` close button.
     - Body: Large, responsive image display (`maxHeight: '70vh'`, `objectFit: 'contain'`) allowing the user to clearly inspect:
       - Machine handles, grips, and plate horns.
       - Verify background privacy (making sure no bystanders or unwanted objects were captured).
     - Action Footer:
       - **`[ ✓ Keep Photo ]`** (closes modal).
       - **`[ 📸 Retake / Replace ]`** (triggers the file/camera input and closes modal).
       - **`[ 🗑️ Remove Photo ]`** (clears `exPhotoPreview` and `exFileReference`, then closes modal).
3. **Automated Test Updates (`gymlog-react/test_task_r140.cjs`):**
   - Test image resolution for `data:`, `http:`, and relative filename formats.
   - Verify modal inspector markup and retake/clear bindings.
   - Run `node test_task_r140.cjs` and `cmd /c npm run build`.

---

## 2. Submission Protocol for Sandbox Developer
Output your completion signal inside a fenced XML block:
```xml
<TASK_HANDOFF>
  <SIGNAL>DEVELOPMENT_TASK_COMPLETE</SIGNAL>
  <TASK_ID>TASK-R140</TASK_ID>
  <BRANCH>feat/epic-10-ai-equipment-scanner</BRANCH>
  <BUILD_VERIFICATION>PASS</BUILD_VERIFICATION>
  <TEST_VERIFICATION>PASS</TEST_VERIFICATION>
</TASK_HANDOFF>
```
