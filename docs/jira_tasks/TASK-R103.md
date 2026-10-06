# TASK-R103: Vercel Base Path Dynamic Routing

## Description
The application is currently deploying a blank white screen on Vercel. This is because ite.config.js is hardcoded with ase: '/workout-program/' to support GitHub Pages. Vercel requires the base path to be /.

## Acceptance Criteria
1. Update gymlog-react/vite.config.js.
2. The ase property MUST dynamically check for the Vercel environment.
3. If process.env.VERCEL is true, use /. Otherwise, fallback to /workout-program/.
4. Ensure the application still builds successfully (cd gymlog-react && npm run build).

## Developer Notes
(Developer to fill out upon completion)
