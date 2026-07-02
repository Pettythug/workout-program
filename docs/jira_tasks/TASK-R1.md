<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: MULTI_FILE_ARCHITECTURE
    - REQUIRED_MODEL_TIER: HIGH_TIER ("Gemini 3.1 Pro (High)" OR "Claude Opus 4.6 (Thinking)")
    - ACTION_REQUIRED: If you are not running on a HIGH_TIER model, immediately halt and prompt the user: "Please switch me to Gemini 3.1 Pro (High) or Claude Opus 4.6 (Thinking) to execute this Multi-File Architecture task."
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. The `SOURCE_WRITE_LOCK` in `AGENTS.md` strictly applies to the Manager. You are explicitly authorized to write and modify source code in `/gymlog-react/src/*`.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R1`
    - ACTION_REQUIRED: Validate that `WorkoutCard.jsx` does NOT exist in the working directory before proceeding. (You are running in an Open IDE, so you natively inherit the user's active branch).
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Restore SHA-256 PIN hashing and App Script Properties backend integration (Target: TASK-R1).
  </OBJECTIVE>
  <RESOURCES>
    - Patch_1: `C:\Users\wance\Documents\Git\workout-program\.local_backups\0010-feat-security-secure-admin-PIN-check-via-SHA-256-has.patch`
    - Patch_2: `C:\Users\wance\Documents\Git\workout-program\.local_backups\0013-feat-security-remove-hardcoded-PIN-from-all-layers-r.patch`
  </RESOURCES>
  <CONSTRAINTS>
    - ARCHITECTURE_STATE: Rolled back. `WorkoutCard.jsx` DOES NOT EXIST. Use decoupled `ExerciseCard.jsx` and `CircuitCard.jsx`.
    - EXECUTION_METHOD: DO NOT `git apply`. Manually parse logic from patches and map to current decoupled architecture.
  </CONSTRAINTS>
  <SEQUENCE>
    1. READ: [Patch_1, Patch_2] via local file tools.
    2. MODIFY: Implement patch logic into `ExerciseCard.jsx`, `CircuitCard.jsx`, `PlanView.jsx`, `SettingsModal.jsx`, and `useGymAPI.js`.
    3. MODIFY: `Combined_AppScript_v2.gs` (Remove hardcoded "5050" fallback, read from PropertiesService).
    4. VERIFY: Run `npm run build` in `gymlog-react/` -> EXPECT(0 syntax errors).
    5. AUDIT: Generate `audit_log_R1.md` in project root mapping the adapted logic to decoupled components.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>

