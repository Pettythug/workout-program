# TASK-QA-R128: Pre-Merge QA Verification — Optimize Public Images & Add Lazy Loading

- **Target Role:** `QA_Engineer` (Read-Only Access; `DENY(Direct_Write_Code)`)
- **Authorized Model:** `Gemini 3.8 Flash (Low)` (Recommended) or `Gemini 3.8 Flash (High)`
- **STRICT MODEL GATEKEEPER CHECK (MANDATORY ON TURN 1):**
  - If your active model is in `HIGH_TIER` (e.g. `Gemini 4 Argon`, `Gemini 3.8 Pro`, `Claude Opus`):
    - **HALT IMMEDIATELY.** Do NOT run commands.
    - Output: `Model Alignment Error: Request Switch -> Model is too high for QA. Please switch to Gemini 3.8 Flash (Low) or (High) before proceeding.`
- **Target Branch:** `feat/TASK-R128-optimize-images-and-lazy-load`

---

## Verification Scope

Verify the implementation of `TASK-R128` across `gymlog-react/src/components/ImageModal.jsx` and `gymlog-react/public/images/`:
1. **Code Inspection (`gymlog-react/src/components/ImageModal.jsx`):**
   - Verify the `<img>` tag rendering `imgSrc` contains `loading="lazy"` and `decoding="async"`.
2. **Asset Directory Size Check:**
   - Verify the total size of `.jpg` files in `gymlog-react/public/images/` is under the 25 MB target (down from the original 470 MB; currently ~5.22 MB).
3. **Compile & Production Build Check:**
   - Run `cd gymlog-react && cmd /c npm run build` and verify clean build with exit code 0.

---

## Submission Protocol for QA Engineer
**MANDATORY:** Output your response inside a fenced code block (`xml`) so the user can click the "Copy" button:

```xml
<QA_HANDOFF>
  <TASK_ID>TASK-R128</TASK_ID>
  <ROLE>QA_Engineer</ROLE>
  <STATUS>QA_PREMERGE_PASS</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</QA_HANDOFF>
```
