# TASK-R128: Optimize 470 MB Exercise Images (`public/images/`) to Prevent 1 GB Deployment Bloat

- **Target Role:** `Sandbox_Developer`
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash`, `Claude Sonnet 4.6 (Thinking)`, `Gemini 3.5 Flash (High)`) or `HIGH_TIER`
- **Model Gatekeeper Check:** Verify your active model is in the Authorized Model Tier above before executing any file edits. If misaligned, halt and output the `Model Alignment Error` override.

## Overview
`gymlog-react/public/images/` currently contains 131 uncompressed high-resolution `.jpg` camera photos totaling **470.66 MB** (averaging 3.6 MB–6.5 MB per image).
- Every time Vite runs `npm run build`, it copies all 470 MB into `gymlog-react/dist/images/`, making the repository working tree + build output **~941 MB** per deployment.
- On Vercel, every branch push (Preview deployment) and PR merge (Production deployment) stores a ~1 GB snapshot, which caused Vercel deployment storage to spike from 0 to 7.4 GB in a single morning.
- On mobile devices at the gym, loading 4–6 MB uncompressed images per exercise wastes cellular data and slows card rendering.

---

## Technical Specifications & Requirements

### 1. Compress & Resize Static Images in `gymlog-react/public/images/`
1. Resize all `.jpg` images in `gymlog-react/public/images/` to a maximum dimension of `800px` (since they are displayed inside compact mobile thumbnails and 300px modals) and compress at 75–80% quality (keeping the `.jpg` filenames intact so zero Google Sheets URLs or `exercises.js` paths break, or supporting `.webp` with fallback).
2. Add `loading="lazy"` and `decoding="async"` to `<img>` tags in `ExerciseCard.jsx` and `CircuitCard.jsx`.
3. Target total `gymlog-react/public/images/` directory size: **< 25 MB** (a >94% reduction from 470.66 MB).

---

## Target Files
- `gymlog-react/public/images/*`
- `gymlog-react/src/components/ExerciseCard.jsx`
- `gymlog-react/src/components/CircuitCard.jsx`

---

## Submission Protocol for Developer
1. Execute all edits and verify image references remain intact.
2. Verify production build with `cmd /c npm run build`.
3. Respond in chat with strictly the 4-line XML snippet below:
```xml
<TASK_HANDOFF>
  <TASK_ID>TASK-R128</TASK_ID>
  <ROLE>Sandbox_Developer</ROLE>
  <STATUS>DEVELOPMENT_TASK_COMPLETE</STATUS>
  <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
</TASK_HANDOFF>
```
