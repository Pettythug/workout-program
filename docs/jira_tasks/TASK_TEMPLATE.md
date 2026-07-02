# TASK-[ID]: [Task Name]

> **For Human Readers:** [Brief 1-2 sentence plain-English summary of what this task accomplishes so humans don't have to parse the XML.]

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: [SINGLE_FILE_FEATURE | MULTI_FILE_ARCHITECTURE | SECURITY_AUDIT | DOCUMENTATION_TASKS]
    - REQUIRED_MODEL_TIER: [Tier Mapping from AGENTS.md]
    - ACTION_REQUIRED: If you are not running on a [Required Tier] model, immediately halt and prompt the user: "Please switch me to [Approved Model] to execute this task."
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. The `SOURCE_WRITE_LOCK` in `AGENTS.md` strictly applies to the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-[ID]`
    - ACTION_REQUIRED: Validate your working directory state before proceeding. (You are running in an Open IDE, so you natively inherit the user's active branch).
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    [Clear objective of the task]
  </OBJECTIVE>
  <RESOURCES>
    - [List of paths to specific patches, reference files, or documentation needed]
  </RESOURCES>
  <CONSTRAINTS>
    - [List any strict architectural constraints, e.g., "Do NOT use Tailwind," "WorkoutCard does not exist"]
  </CONSTRAINTS>
  <SEQUENCE>
    1. READ: [Required files] via local file tools.
    2. MODIFY: [Specific component/file modifications].
    3. VERIFY: Run `npm run build` in `gymlog-react/` -> EXPECT(0 syntax errors).
    4. AUDIT: Generate `audit_log_[ID].md` in project root mapping the changes made.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```

