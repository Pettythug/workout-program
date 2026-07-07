# TASK-R35: Switch Google Drive Image Resolver to docs.google.com/uc

> **For Human Readers:** This task updates the frontend image URL resolver in `ImageModal.jsx`, `ExerciseCard.jsx`, and `CircuitCard.jsx` to use the `docs.google.com/uc?export=view` endpoint. This bypasses client-side ad-blockers / privacy extensions that trigger `ERR_BLOCKED_BY_CLIENT` when accessing Google's `lh3.googleusercontent.com` CDN.

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
    - TARGET_BRANCH: `TASK-R35`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Bypass client-side ad-blockers by switching the Drive image URL template to docs.google.com/uc.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files:
      - `gymlog-react/src/components/ImageModal.jsx`
      - `gymlog-react/src/components/ExerciseCard.jsx`
      - `gymlog-react/src/components/CircuitCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Target files.

    2. MODIFY `gymlog-react/src/components/ImageModal.jsx`:
       - In `getImageUrl`, change:
         `return \`https://lh3.googleusercontent.com/d/\${fileRef}\`;`
         to:
         `return \`https://docs.google.com/uc?export=view&id=\${fileRef}\`;`

    3. MODIFY `gymlog-react/src/components/ExerciseCard.jsx`:
       - In `getImageUrl`, change:
         `return \`https://lh3.googleusercontent.com/d/\${fileRef}\`;`
         to:
         `return \`https://docs.google.com/uc?export=view&id=\${fileRef}\`;`

    4. MODIFY `gymlog-react/src/components/CircuitCard.jsx`:
       - In `getImageUrl`, change:
         `return \`https://lh3.googleusercontent.com/d/\${fileRef}\`;`
         to:
         `return \`https://docs.google.com/uc?export=view&id=\${fileRef}\`;`

    5. AUDIT: Generate `audit_log_R35.md` detailing the ad-blocker bypass implementation.
    6. VERIFY: Run `npm run build` (via cmd /c) to confirm compilation succeeds cleanly.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
