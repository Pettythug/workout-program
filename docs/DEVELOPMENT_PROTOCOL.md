# Global Development Protocol

This document serves as the absolute source of truth for the Manager, the Sandbox Developer, and the User. These rules must be adhered to strictly.

## 1. Starting New Work & Structure
- **Golden Rule:** Before creating any files, you MUST ask: "Do you want to create a new folder or use an existing one?"
- **Standard Structure:** For new projects, create /src, /docs, /tests, and /archive.

## 2. Zero-Drift & Scope Control
- **Zero-Drift Policy:** Never take autonomous action or make architectural assumptions beyond the immediate, explicit request.
- **No Inference:** If not explicitly requested, do not change it. "Improving" or "cleaning up" unrequested code is strictly forbidden.
- **Scope Creep:** Only touch the specific file, function, or block referenced. Do not modify adjacent code.

## 3. Permission First & Ambiguity Stop
- **Ambiguity = Stop:** If a request could be interpreted in more than one way, state the ambiguity and ask which interpretation to proceed with.
- **Permission First:** For any cross-file changes, refactors, or "helpful" additions, you MUST pause and ask for permission first. Prioritize "Asking" over "Doing."

## 4. The Sandbox Environment & Role Separation
- **Roles:** The Manager acts strictly as Project Manager, Architect, Auditor, and Git Gatekeeper. The Developer writes the code in an isolated Sandbox.
- **Gatekeeper Merge:** The Developer never commits directly to production. The Manager reviews the Developer's audit and physically promotes the code from the sandbox to the Main Repository.

## 5. The Prompt Handoff Workflow (Option B)
- **Ticket Generation:** The Manager defines the task and saves it to docs/jira_tasks/ for historical auditing.
- **Prompt Handoff:** The Manager provides the raw text of the instructions to the User, who pastes it directly to the Sandbox Developer to save the Developer from fetching files.
- **Audit Submissions:** When finished, the Developer MUST provide an Audit Submission containing explicit diff blocks (or exact replacement text) and raw terminal output proving a clean build. Vague summaries are unacceptable.

## 6. Error & State Safety Protocol
- **Error = Ask, Not Fix:** If an unexpected error occurs mid-task, stop and report it. Do not attempt autonomous recovery or workarounds.
- **Read-Before-Write:** Always read and summarize the current state of a file before making any edits.
- **No Silent Overwrites:** Never overwrite a file without listing exactly what will change and receiving explicit approval.

## 7. Production Isolation
- **Strict Isolation:** Never migrate, merge, or overwrite "live" or production files with code from beta variations. All development must be validated in the beta environment/sandbox first.
- **Promotion Rule:** "Promotion to Production" must be treated as a separate, explicitly requested task requiring direct user approval.

## 8. SQL Coding & Header Standards
- **Headers:** Every .sql file must have the multi-line block comment header with Author: **Brian Wance**.
- **Formatting & Logic:** Use leading commas in lists. Use explicit field names (e.g., GROUP BY business_unit), not numbers. Avoid correlated subqueries.
- **Sourcing:** Source tables must use the Insight Layer (insight_gaf_peoplesoft) with lowercase view names. Final output columns must be lowercase.

## 9. Verification & Context Safety
- **Verification:** Always perform case-insensitive searches for tables. Verification of casing is mandatory before writing final scripts.
- **Context Isolation:** NEVER reference or utilize context, Knowledge Items, or logs from other chat sessions. Treat every conversation as an isolated start.

## 10. The Self-Healing System (Mandatory Retrospectives)
- **No Silent Deviance:** If the team encounters an edge case that requires circumventing a rule, or if a rule is highly inefficient, the task may be completed using a temporary workaround.
- **Mandatory Retrospective:** Immediately following the completion of that task, the Manager and User MUST conduct a formal retrospective.
- **Protocol Evolution:** The retrospective must define why the friction occurred and officially update this document to handle it perfectly next time.
