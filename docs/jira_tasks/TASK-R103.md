# TASK-R103: Vercel Base Path Dynamic Routing

## Description
The application is currently deploying a blank white screen on Vercel. This is because vite.config.js is hardcoded with base: '/workout-program/' to support GitHub Pages. Vercel requires the base path to be /.

## Acceptance Criteria
1. [x] Update gymlog-react/vite.config.js.
2. [x] The base property MUST dynamically check for the Vercel environment.
3. [x] If process.env.VERCEL is true, use /. Otherwise, fallback to /workout-program/.
4. [x] Ensure the application still builds successfully (cd gymlog-react && npm run build).

## Developer Notes
- Updated `gymlog-react/vite.config.js` to configure `base: process.env.VERCEL ? '/' : '/workout-program/'`.
- In Vercel environments, `process.env.VERCEL` is truthy (`"1"`), ensuring base routing and asset links output as `/assets/*`, resolving the blank white screen deployment bug.
- When `process.env.VERCEL` is unset/falsy (local/GitHub Pages), builds correctly fallback to `/workout-program/`.
- Verified both build modes with clean exits (code 0) via `cmd /c npm run build` and `cmd /c "set VERCEL=1&& npm run build"`.
- Verified `dist/index.html` asset tags for both builds:
  - Standard/Fallback: `<script type="module" crossorigin src="/workout-program/assets/index-CTtYPnC2.js"></script>`
  - Vercel (`VERCEL=1`): `<script type="module" crossorigin src="/assets/index-D7kmQ92Y.js"></script>`
- Verified ESLint baseline passes with 0 errors (`cmd /c npx eslint .`).
