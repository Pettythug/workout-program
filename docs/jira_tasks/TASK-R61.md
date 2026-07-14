# TASK-R61: Lightweight Duplicate Filter for Bonus Accessories

> **For Human Readers:** This task adds a lightweight random retry check to `AccessoryBlock.jsx` that prevents duplicate bonus recommendations by filtering out exercises already present in the planned workout or in the active session's bonus list.

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
    Prevent duplicate bonus recommendations using a lightweight, in-memory retry filter in AccessoryBlock.jsx.
  </OBJECTIVE>
  <RESOURCES>
    - Accessory Block: `gymlog-react/src/components/AccessoryBlock.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/AccessoryBlock.jsx`.

    2. MODIFY `gymlog-react/src/components/AccessoryBlock.jsx`:
       a. Update the component signature to accept the `excludeNames` prop (defaulting to an empty array `[]`):
          `export default function AccessoryBlock({ excludeNames = [], accessoriesList, setAccessoriesList }) {`
          *Note: accessoriesList and setAccessoriesList are now passed from the parent (to support state persistence).*
       b. Refactor the random selection logic in `handleAddAccessory` and `handleSwapAccessory` to filter out matching names:
          - Filter all available accessory exercises by location and category.
          - Implement a lightweight loop that attempts to pick a random exercise up to 10 times.
          - On each attempt, verify if the selected exercise name is already in `excludeNames` or `accessoriesList`:
            ```javascript
            let selected = null;
            let retries = 0;
            const getBaseName = (n) => n.replace(/\s*\((Single|Alt|DB|Cable)\)/i, "").trim();

            while (retries < 10) {
                const randomIdx = Math.floor(Math.random() * accessories.length);
                const candidate = accessories[randomIdx];
                const candidateBase = getBaseName(candidate.name).toLowerCase();

                const isPlanned = excludeNames.some(name => getBaseName(name).toLowerCase() === candidateBase);
                const isAlreadySelected = accessoriesList.some(item => getBaseName(item.baseName).toLowerCase() === candidateBase);

                if (!isPlanned && !isAlreadySelected) {
                    selected = candidate;
                    break;
                }
                retries++;
            }

            // Fallback: If no unique exercise is found after 10 retries, pick any random candidate
            if (!selected) {
                selected = accessories[Math.floor(Math.random() * accessories.length)];
            }
            ```
       c. Set the resolved `selected` exercise group object into the state array (handling additions and swaps at target indices).

    3. AUDIT: Generate `/audit_log_R61.md` in the workspace root detailing changes.
    4. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to verify compilation.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
