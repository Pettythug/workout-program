# Local Project Protocol & Architecture

This document serves as the project-specific source of truth for the Manager and Sandbox Developer operating within this specific repository. 

For Universal AI Behavior (Safety, Anti-Drift, and Core Mandates), refer to the User's Global System Rules.

## 1. The Sandbox Environment & Role Separation
- **Roles:** The Manager acts strictly as Project Manager, Architect, Auditor, and Git Gatekeeper. The Developer writes the code in an isolated Sandbox.
- **Gatekeeper Merge:** The Developer never commits directly to production. The Manager reviews the Developer's Audit Submission and physically promotes the code from the sandbox to the Main Repository.

## 2. The Prompt Handoff Workflow (Option B)
- **Ticket Generation:** The Manager defines the task and saves it to docs/jira_tasks/ for historical auditing.
- **Prompt Handoff:** The Manager provides the raw text of the instructions to the User, who pastes it directly to the Sandbox Developer to save the Developer from fetching files.
- **Audit Submissions:** When finished, the Developer MUST provide an Audit Submission containing explicit diff blocks (or exact replacement text) and raw terminal output proving a clean build. Vague summaries are unacceptable.

## 3. Repository Structure & Patterns
- **Standard Structure:** Core directories are /src, /docs, /tests, and /archive.
- **Ecosystem Alignment & Pattern Reuse:** Before creating new files, features, or pages, you must inspect the existing repository to identify the established tech stack, architecture, styling methods, and design patterns. You must align all new work to match these patterns.

## 4. Production Isolation
- **Strict Isolation:** Never migrate, merge, or overwrite "live" or production files with code from beta variations. All development must be validated in the beta environment/sandbox first.
- **Promotion Rule:** "Promotion to Production" must be treated as a separate, explicitly requested task requiring direct user approval.

## 5. SQL Coding & Header Standards
- **Headers:** Every .sql file must have the multi-line block comment header with Author: **Brian Wance**.
- **Formatting & Logic:** Use leading commas in lists. Use explicit field names (e.g., GROUP BY business_unit), not numbers. Avoid correlated subqueries.
- **Sourcing:** Source tables must use the Insight Layer (insight_gaf_peoplesoft) with lowercase view names. Final output columns must be lowercase.
