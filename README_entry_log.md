# README Entry Log — GymLog Ecosystem (Brian Wance)

This is a quick reference for the current status of the Workout Tracker project files and folders.

| File | Status | Description |
| :--- | :--- | :--- |
| `gymlog-ultimate.html` | **PRODUCTION** | ✅ Migrated 2026-05-03. Gear icon Exercise Settings, category dropdown, location filter fixes (LIFT + PLAN), openLog bug fixed, SKIP removed from LIFT. |
| `workout-builder-pro.html` | **ACTIVE** | AI-powered workout generator and customization engine. |
| `index.html` | **PORTAL** | Unified hub for accessing all Pro applications. |
| `gym-core.js` | **CORE** | The Brain. Centralized logic for time parsing, ranges, and data mapping. |
| `Combined_AppScript_v2.gs` | **BACKEND** | Version 2 of the GAS backend supporting the "Best Record" schema. |
| `gym-log-pro.html` | **STABLE** | Previous standalone Pro logger. |

## Recent Refinements (v4.0 — Stabilization)
- **Smart Skip (Logging)**: "Skip" button now logs a 0/0 entry with reason to Sheets for history persistence.
- **Header Unification**: Standardized Orange 20px headers across LIFT and PLAN for a cohesive app feel.
- **Branding Sync**: Enforced "(Workout #X)" nomenclature across all logging functions and environments.
- **Production Rebase**: Beta environment synced to Ultimate (Production) Master SPA to ensure parity.
- **Standalone Sync**: Updated `gym-log-pro.html` and `workout-builder-pro.html` with parity features.
- **Release Ready**: Workspace audited and prepared for management review.

## Workspace Structure
- `/src`: Active source files and development assets.
- `/docs`: Research, design notes, and project documentation.
- `/tests`: Validation logs and browser test results.
- `/archive`: Legacy versions (moved to keep root clean).

---
*Maintained with care by Brian Wance.*

## Audit Trail

| Date | Backup File | Reason / Audit Message |
| :--- | :--- | :--- |
| [2026-05-03 11:50 AM] | .\archive\gymlog-ultimate_20260503_1150.html | Baseline backup after completing Phase 1 (Bootloader Fix) and Phase 2 (State Persistence). |
| [2026-05-03 11:56 AM] | .\archive\gymlog-variation-beta_20260503_1156.html | Pre-sync backup of beta before unifying location dropdown typography. |
| [2026-05-03 12:06 PM] | .\archive\Combined_AppScript_v2_20260503_1206.gs | Pre-purge backup of GAS backend before deleting legacy wb_ routes. |
| [2026-05-03 12:42 PM] | .\archive\gymlog-variation-beta_20260503_1242.html | Pre-edit backup of beta before building the React Exercise Manager UI. |
| [2026-05-03 12:50 PM] | .\archive\gymlog-variation-beta_20260503_1250.html | Pre-edit backup of beta before moving Exercise Manager into the inline card UI. |
| [2026-05-03 12:55 PM] | .\archive\gymlog-variation-beta_20260503_1255.html | Pre-edit backup before building Card Settings Drawer UI. |
| [2026-05-03 01:00 PM] | .\archive\gymlog-variation-beta_20260503_1300.html | Pre-edit backup before LIFT/PLAN parity work and SKIP button removal. |
| [2026-05-03 03:25 PM] | .\archive\gymlog-variation-beta_20260503_1525.html | Pre-fix backup before resolving 3 bugs: openLog undefined, location filter, and category dropdown. |
| [2026-05-03 03:35 PM] | .\archive\_20260503_1535 | Pre-fix backup before fixing PLAN location filter and workout lock clearing. |
| [2026-05-03 03:45 PM] | .\archive\gymlog-ultimate_20260503_1545.html | Pre-migration backup of current production gymlog-ultimate.html before overwriting with beta. |
| [2026-05-03 04:07 PM] | .\archive\gymlog-ultimate_20260503_1607.html | Post-migration cleanup: Backup of production with latest Save Set UI fixes. |
| [2026-05-03 04:07 PM] | .\archive\gymlog-variation-beta_20260503_1607.html | Post-migration cleanup: Backup of beta with latest Save Set UI fixes. |
| [2026-05-03 04:08 PM] | .\archive\gymlog-ultimate_20260503_1608.html | Pre-edit backup: Syncing button text from 'Save Set' to 'Log Set'. |
| [2026-05-03 04:08 PM] | .\archive\gymlog-variation-beta_20260503_1608.html | Pre-edit backup: Syncing button text from 'Save Set' to 'Log Set' in beta. |
| [2026-05-03 04:13 PM] | .\archive\gymlog-ultimate_20260503_1613.html | Pre-edit backup: Implementing Person Filter in Log Set view. |
| [2026-05-03 04:13 PM] | .\archive\gymlog-variation-beta_20260503_1613.html | Pre-edit backup: Implementing Person Filter in Log Set view (Beta). |
