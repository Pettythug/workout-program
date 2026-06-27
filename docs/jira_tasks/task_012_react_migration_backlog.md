# task_012: Legacy Page React Migration
- **Required Model Tier**: Gemini 3.5 High

## Objective:
Identify and migrate the remaining legacy HTML/JS pages (such as spreadsheet table managers or raw logs dashboards) into clean React components inside the SPA.

## Details:
1. Examine the legacy files in the root folder (such as `gymlog-ultimate.html` or other data management HTMLs).
2. Cross-reference the features already migrated against the roadmap `/docs/react_migration_roadmap.md` and `/docs/migration_backlog.md`.
3. Build the missing UI views (such as the raw table database spreadsheet viewer or settings logs) as React components.
4. Mount the new views inside the React router structure to complete the full migration and allow deprecation of the remaining legacy HTML files.
