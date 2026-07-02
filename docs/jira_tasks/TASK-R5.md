# TASK-R5: Google Drive Image Upload Integration

> **For Human Readers:** This task restores the ability to upload images directly to Google Drive via the frontend. It relies on the decoupled architecture (`ExerciseCard`, `CircuitView`) and integrates the `ImageModal`.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: MULTI_FILE_FEATURE
    - REQUIRED_MODEL_TIER: HIGH_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R5`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Restore the Google Drive Image Upload integration to the decoupled architecture.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files: `gymlog-react/src/components/ExerciseCard.jsx`, `gymlog-react/src/components/CircuitView.jsx`, `gymlog-react/src/components/ImageModal.jsx`, `Combined_AppScript_v2.gs`
  </RESOURCES>
  <CONSTRAINTS>
    - DO NOT introduce infinite rendering loops with the image component.
  </CONSTRAINTS>
  <SEQUENCE>
    1. READ: Target files.
    2. MODIFY: Update the frontend cards to include the `ImageModal` logic. 
    3. MODIFY: Connect the `uploadImage` API call to the backend.
    4. AUDIT: Generate `audit_log_R5.md` documenting the exact changes.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
