# README: TASK-R1 (Secure Admin PIN Check & App Script Properties)

**Status:** Ready for Agent Execution

**Summary:**
This task re-applies the critical security patches to our application. It replaces the hardcoded plain-text PIN checks with secure SHA-256 hashing on the frontend (`ExerciseCard`, `CircuitCard`, `PlanView`, `SettingsModal`). It also updates the Google Apps Script backend to read the actual PIN securely from the `PropertiesService`, ensuring the admin PIN is never exposed anywhere in the source code.

**Execution:**
The exact execution instructions for the IDE agent are located in `TASK-R1.md`. Do not modify `TASK-R1.md`, as it is formatted strictly in pseudo-code for AI determinism.
