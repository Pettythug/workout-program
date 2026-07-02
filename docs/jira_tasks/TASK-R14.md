# TASK-R14: Enforce Category Ordering in Circuits

> **For Human Readers:** This task enforces a strict, physiologically optimal exercise order (Explosive → Knee → Hip → Push → Pull → Core) when generating Full Body and Mimic circuits.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: SINGLE_FILE_FEATURE
    - REQUIRED_MODEL_TIER: LOW_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R14`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Sort dynamically generated circuits in `CircuitView.jsx` to enforce a strict category hierarchy.
  </OBJECTIVE>
  <RESOURCES>
    - Target File: `gymlog-react/src/components/CircuitView.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ: `gymlog-react/src/components/CircuitView.jsx`.
    2. MODIFY: Create an array constant at the top of the file (or outside the component) defining the exact category sort order:
       ```javascript
       const CATEGORY_ORDER = [
           "Explosive",
           "Knee Dominant",
           "Hip Dominant",
           "Vertical Push",
           "Horizontal Push",
           "Vertical Pull",
           "Horizontal Pull",
           "Rotational Core",
           "Plank Core",
           "Accessory"
       ];
       ```
       *(Note: Push and Pull can be in any internal order as long as Push comes before Pull, and Core is at the bottom).*
    3. MODIFY: Inside `startFullBodyCircuit` and `startMimicCircuit`, immediately after the `newCircuit` array is populated with `pickRandom`, sort the `newCircuit` array based on the `CATEGORY_ORDER` index of each exercise's category. If a category isn't in the list, it should default to the end (index 999).
    4. AUDIT: Generate `audit_log_R14.md` documenting the changes.
    5. EXECUTE: Run `git push origin TASK-R14` to push the branch to the remote repository.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
