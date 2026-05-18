# README Entry Log — GymLog Ecosystem (Brian Wance)

This is a quick reference for the current status of the Workout Tracker project files and folders.

| File | Status | Description |
| :--- | :--- | :--- |
| `gymlog-ultimate.html` | **PRODUCTION** | ✅ Migrated 2026-05-03 4:25 PM. Mobile header fix (PLAN), Person filtering (LIFT), orange button theme sync. |
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
| [2026-05-03 04:23 PM] | .\archive\gymlog-variation-beta_20260503_1623.html | Pre-edit backup: Fixing mobile layout for PLAN header (Push/Pull and Settings icon). |
| [2026-05-03 04:25 PM] | .\archive\gymlog-ultimate_20260503_1625.html | Pre-migration backup: Saving production before applying mobile header fix and person filter updates. |
| [2026-05-17 04:44 PM] | .\archive\gymlog-variation-beta_20260517_1644.html | Pre-N1 backup: About to execute Button Label and Affordance Cleanup across all views. |
| [2026-05-17 04:54 PM] | .\archive\gymlog-variation-beta_20260517_1654.html | Pre-edit: Fixing swap dropdown label, input placeholder, and select border visibility. |
| [2026-05-17 05:02 PM] | .\archive\gymlog-variation-beta_20260517_1702.html | Pre-edit: Restructuring swap UI � placeholder dropdown, location label, category inherited note. |
| [2026-05-17 05:13 PM] | .\archive\gymlog-variation-beta_20260517_1713.html | Pre-UX-unification backup: About to apply full button/label/style consistency pass across all views. |
| [2026-05-17 05:23 PM] | .\archive\gymlog-ultimate_20260517_1723.html | Pre-production migration backup: Preparing to migrate approved UX/UI button classes to Production. |
| [2026-05-17 05:32 PM] | .\archive\gymlog-variation-beta_20260517_1732.html | Pre-edit: Updating button color semantics (Green=Go, Orange=Cancel). |
| [2026-05-18 07:55 AM] | .\archive\gymlog-ultimate_20260518_0755.html | Pre-edit: Migrating Item 1 (Interactive Hints & Cleanups) from Beta. |
| [2026-05-18 08:24 AM] | .\archive\gymlog-ultimate_20260518_0824.html | Pre-edit: Migrating Item 1 (Interactive Hints & Cleanups) after user approval. |
| [2026-05-18 08:36 AM] | .\archive\gymlog-ultimate_20260518_0836.html | Pre-edit: Full migration of all Beta changes to Production. |
| [2026-05-18 08:58 AM] | .\archive\gymlog-ultimate_20260518_0858.html | Pre-edit: Migrating Item 7 (Complete Workout Confirmation) after user approval. |
