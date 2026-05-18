# README Entry Log - GymLog Ecosystem (Brian Wance)

This is a quick reference for the current status of the Workout Tracker project files and folders.

| File | Status | Description |
| :--- | :--- | :--- |
| `gymlog-ultimate.html` | **PRODUCTION** | [DONE] Migrated 2026-05-03 4:25 PM. Mobile header fix (PLAN), Person filtering (LIFT), orange button theme sync. |
| `workout-builder-pro.html` | **ACTIVE** | AI-powered workout generator and customization engine. |
| `index.html` | **PORTAL** | Unified hub for accessing all Pro applications. |
| `gym-core.js` | **CORE** | The Brain. Centralized logic for time parsing, ranges, and data mapping. |
| `Combined_AppScript_v2.gs` | **BACKEND** | Version 2 of the GAS backend supporting the "Best Record" schema. |
| `gym-log-pro.html` | **STABLE** | Standalone Pro logger (Fully unified visually with neon orange borders and solid green buttons to match the Master SPA). |
| `gymlog-variation-beta.html` | **BETA** | Validated Beta Master environment with full premium UI/UX refinements. |

## Recent Refinements (v4.0 - Stabilization & Phase 2 Flash)
- **Visual Design Unification**: Refined `gym-log-pro.html` layout to align its design tokens, neon orange card borders, and solid green "+ LOG" buttons 100% with the master SPA.
- **Smart Skip (Logging)**: "Skip" button now logs a 0/0 entry with reason to Sheets for history persistence.
- **Header Unification**: Standardized Orange 20px headers across LIFT and PLAN for a cohesive app feel.
- **Branding Sync**: Enforced "(Workout #X)" nomenclature across all logging functions and environments.
- **Production Rebase**: Beta environment synced to Ultimate (Production) Master SPA to ensure parity.
- **Standalone Sync**: Updated `gym-log-pro.html` and `workout-builder-pro.html` with parity features.
- **Phase 2 UI/UX Upgrades**: Integrated a glassmorphic sliding help drawer (`ℹ️`) next to settings gear, built high-contrast guides, added premium scale/translate micro-animations and active scaling to all `.btn-*` buttons, and added inline categories "+ Add new" persistence prompts and visual loading states.
- **Release Ready**: Workspace audited and prepared for management review.

## Workspace Structure
- `/src`: Active source files and development assets.
- `/docs`: Research, design notes, and project documentation.
- `/tests`: Validation logs and browser test results.
- `/archive`: Legacy versions (moved to keep root clean).

---
Note on future layout unification: Gym Log Pro and Builder Pro exercise cards currently have different layout philosophies (tabular roster-grid versus vertical workflow block). We planned to unify them under a single card style across all Pro standalone apps and the master SPA in a future pass.

*Maintained with care by Brian Wance.*
