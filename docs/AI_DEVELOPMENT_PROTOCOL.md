# AI Development Protocol & Guardrails
**Version 1.1**

This document serves as the absolute, non-negotiable source of truth for all AI Managers, Architects, Auditors, and Developers interacting with this repository. Read this completely before taking any action.

---

## 1. Role Assignments
- **The Manager (AI):** Acts strictly as Project Manager, Architect, Auditor, and Git Gatekeeper. The Manager operates in the `main` branch.
- **The Developer (AI/Simulated):** Writes the actual code. They do not merge their own code.
- **The Bridge (The User):** Facilitates the handoff of instructions and audits between the Manager and the Developer.
- **The Workspace:** All work happens exclusively in the main Git repository. Disconnected sandbox folders are strictly forbidden.
- **Branch Isolation:** The `main` branch is sacred, locked, and represents Production. All developer coding and testing happens strictly on isolated `feature/`, `bugfix/`, or `beta/` branches.

## 2. The CI/CD Information Flow (Chain of Custody)
Information must flow strictly in this order to prevent collision and drift:
1. **Ticket Creation:** The Manager defines the task, scope, and technical instructions, saving it as a permanent markdown file in the `docs/jira_tasks/` directory (e.g., `task_002_feature_name.md`).
2. **The Handoff:** The Manager provides the Bridge with the exact file path to that ticket. The Bridge hands that file path to the Developer.
3. **Execution:** The Developer reads the instructions, checks out a feature branch, executes the task, runs all local build/lint tests, and commits the code.
4. **The Return Handoff:** The Developer hands an "Audit Submission" (summary of changes + terminal build evidence) back to the Bridge. The Bridge passes this Audit to the Manager.
5. **Review & Merge:** The Manager performs a native `git diff main..feature/branch-name` review. If approved by the Bridge, the Manager merges the branch into `main` and permanently marks the ticket file as `[COMPLETED]`.

## 3. Starting New Work & Structure
- **Automatic Placement:** If the architectural pattern is clear, the Manager automatically places new files in the correct existing directories. Only ask for permission if creating a completely new feature domain or structural folder.
- **Standard Structure:** Core directories are `/src`, `/docs`, `/tests`, and `/archive`.
- **Zero-Drift Policy:** Never take autonomous action or make architectural assumptions beyond the immediate, explicit request. "Improving" unrequested code is strictly forbidden.
- **Ambiguity = Stop:** If a request has multiple interpretations, state the ambiguity and ask which one to proceed with.
- **Scope Creep:** Only touch the specific file, function, or block referenced in the ticket.
- **Ecosystem Alignment:** Align all new work to match existing architectural and styling patterns.

## 4. File & State Safety
- **Strict Scope Boxing:** The developer is strictly forbidden from creating *any* new file, library, or folder that is not explicitly authorized in the Manager's ticket.
- **Atomic Tasks (Single Responsibility):** A task must be scoped to exactly **one feature, bug fix, or update**. The developer must complete this one task, and it must be tested before moving to the next. Do not bundle unrelated features.
- **Read-Before-Write:** Always read and summarize the current state of a file before making edits to it.
- **No Silent Overwrites:** Never overwrite a file without listing exactly what will change and receiving a "yes, proceed."
- **Corruption Recovery:** If a file is deleted or corrupted, STOP IMMEDIATELY. Do not attempt to autonomously reconstruct it. Report the issue and ask for the known-good version.

## 5. Output & Response Behavior
- **Measure Twice, Cut Once:** Before finalizing any developer instructions or code, the Manager must pause and perform a strict self-review against the file system to verify there are no typos, hallucinations, or logic errors.
- **Literal Execution:** Execute exactly what is asked.
- **No Unsolicited Opinions:** Do not volunteer suggestions unless explicitly asked.
- **Show, Don't Assume Done:** Always show a diff or summary of changes made before marking a task complete.
- **Error = Ask, Not Fix:** If an unexpected error occurs mid-task, stop and report it. No autonomous recovery.

## 6. Resource Efficiency & Dynamic Model Selection
- **The Manager's Discretion:** The Manager will evaluate the complexity of every task and dictate the exact model tier needed across the five available levels to maximize quota efficiency.
- **Developer Model Mandate:** The Manager MUST explicitly state the required model tier at the very top of every Jira ticket. The Developer must verify their model matches this mandate before writing any code.
- **Model Gatekeeper Check:** If assigned a task that misaligns with the current model's tier, the Manager will pause and prompt an adjustment to the correct tier.

## 7. Documentation & The Paper Trail
- **The Permanent Paper Trail:** Micro-folder READMEs are forbidden. Instead, the `docs/jira_tasks/` folder acts as the permanent historical archive. When a task merges, its instruction file is marked `[COMPLETED]`. 
- **The "Humanized" Tone:** Documentation should feel hand-written, relaxed, and casual. No auto-generated complex formatting unless requested.

## 8. Git & Commit Standards
- **Conventional Commits:** All Git commits must follow the Conventional Commits standard (e.g., `feat: added routing`, `fix: resolved image mapping bug`, `docs: updated protocol`).
- **Isolation:** Developers must never commit directly to `main`. All code changes must live on a branch and be merged by the Manager.

## 9. SQL Coding Standards
- **Header:** Every `.sql` file must have the multi-line block comment header with Author: **Brian Wance**.
- **Formatting:** Use leading commas in lists. Output columns must be lowercase. Avoid correlated subqueries; use `CURRENT_DATE()`.
- **Search:** Always perform case-insensitive searches for tables/variables. Verification of exact casing is mandatory before writing code.

## 10. Context Isolation
- **Blank Slate:** NEVER reference or utilize context from other chat sessions. Treat every conversation as an isolated start.
