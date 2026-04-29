# README Entry Log — GymLog Ecosystem (Brian Wance)

This is a quick reference for the current status of the Workout Tracker project files and folders.

| File | Status | Description |
| :--- | :--- | :--- |
| `gymlog-ultimate.html` | **PRODUCTION** | The gold standard. Fully refined with Undo, History Sync, and Planner Notes. |
| `workout-builder-pro.html` | **ACTIVE** | AI-powered workout generator and customization engine. |
| `index.html` | **PORTAL** | Unified hub for accessing all Pro applications. |
| `gym-core.js` | **CORE** | The Brain. Centralized logic for time parsing, ranges, and data mapping. |
| `Combined_AppScript_v2.gs` | **BACKEND** | Version 2 of the GAS backend supporting the "Best Record" schema. |
| `gym-log-pro.html` | **STABLE** | Previous standalone Pro logger. |

## Recent Refinements (v4.0 — Stabilization)
- **Smart Skip (Logging)**: "Skip" button now logs a 0/0 entry with reason to Sheets for history persistence.
- **Header Unification**: Standardized Orange 20px headers across LIFT and PLAN for a cohesive app feel.
- **Branding Sync**: Enforced "(Workout #X)" nomenclature across all logging functions and environments.
- **Production Rebase**: Hard-rebased Beta environment to Ultimate source of truth to eliminate drift.
- **Standalone Sync**: Updated `gym-log-pro.html` and `workout-builder-pro.html` with parity features.
- **Double-Jump Isolation**: (In Progress) Refactoring boot sequence to prevent workout jumping during sync.

## Workspace Structure
- `/src`: Active source files and development assets.
- `/docs`: Research, design notes, and project documentation.
- `/tests`: Validation logs and browser test results.
- `/archive`: Legacy versions (moved to keep root clean).

---
*Maintained with care by Brian Wance.*
