# TASK-R61: Sequential Bonus Accessory Rotation

> **For Human Readers:** This task refactors the random bonus accessory generation in `AccessoryBlock.jsx` to use a sequential rotation index stored in `localStorage`, ensuring users cycle through all available accessory exercises in order without duplicates or repetitions during swaps.

```text
<TASK_EXECUTION_PROTOCOL>
  <GATEKEEPER>
    - TASK_CLASS: SINGLE_FILE_FEATURE
    - REQUIRED_MODEL_TIER: MEDIUM_TIER
  </GATEKEEPER>
  <ROLE_DEFINITION>
    - ASSIGNED_ROLE: Sandbox_Developer
    - SYSTEM_OVERRIDE: You are explicitly NOT the Manager. You are explicitly authorized to write and modify source code.
  </ROLE_DEFINITION>
  <ENVIRONMENT_SETUP>
    - TARGET_BRANCH: `TASK-R61`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Replace random accessory selection with sequential rotation based on a persistent index in AccessoryBlock.jsx.
  </OBJECTIVE>
  <RESOURCES>
    - Accessory Block: `gymlog-react/src/components/AccessoryBlock.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/AccessoryBlock.jsx`.

    2. MODIFY `gymlog-react/src/components/AccessoryBlock.jsx`:
       a. Locate the selection logic inside `handleAddAccessory` and `handleSwapAccessory`.
       b. Query and filter the available accessories list (by location and 'accessory' category).
       c. Sort the filtered accessories list alphabetically by name to ensure a stable, predictable sequential order:
          `accessories.sort((a, b) => a.name.localeCompare(b.name));`
       d. Replace random index selection with a sequential index read/write from `localStorage`:
          - Retrieve index:
            `let rotationIdx = parseInt(localStorage.getItem('gymlog_accessory_rotation_index') || '0', 10);`
          - Select exercise:
            `const accessory = accessories[rotationIdx % accessories.length];`
          - Increment and persist index:
            `localStorage.setItem('gymlog_accessory_rotation_index', (rotationIdx + 1).toString());`
       e. In `handleSwapAccessory(index)`, use the same sequential rotation logic to replace the card at the given index, ensuring swaps pull the next sequential item in the list.

    3. AUDIT: Generate `/audit_log_R61.md` in the workspace root detailing sequential rotation updates.
    4. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to verify compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
