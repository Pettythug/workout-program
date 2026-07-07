# TASK-R33: Resolve Google Drive Image Rendering and File Sharing

> **For Human Readers:** This task updates the frontend components to render Google Drive images using their file IDs. It also updates the backend image upload handler to make newly uploaded images viewable to anyone with the link, and purges the temporary auth trigger function.

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
    - TARGET_BRANCH: `TASK-R33`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Unblock Google Drive image rendering, make uploaded files public, and remove the triggerDriveAuth helper.
  </OBJECTIVE>
  <RESOURCES>
    - Target Files:
      - `Combined_AppScript_v2.gs`
      - `gymlog-react/src/components/ImageModal.jsx`
      - `gymlog-react/src/components/ExerciseCard.jsx`
      - `gymlog-react/src/components/CircuitCard.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ: Target files.

    2. MODIFY `Combined_AppScript_v2.gs`:
       - In `gymlog_handleUploadImage`, after `const file = folder.createFile(blob);`, set public viewing sharing permissions:
         `file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);`
       - Delete the temporary `triggerDriveAuth()` function from the very bottom of the file.

    3. MODIFY `gymlog-react/src/components/ImageModal.jsx`:
       - Update the image source resolver logic:
         ```javascript
         const getImageUrl = (fileRef) => {
             if (!fileRef) return `${import.meta.env.BASE_URL}images/placeholder.jpg`;
             if (!fileRef.includes('.') && fileRef.length > 10) {
                 return `https://lh3.googleusercontent.com/d/${fileRef}`;
             }
             return `${import.meta.env.BASE_URL}images/${fileRef}`;
         };
         const imgSrc = getImageUrl(ex.fileReference);
         ```

    4. MODIFY `gymlog-react/src/components/ExerciseCard.jsx`:
       - Replace the `imgSrc` logic around line 168 with the identical `getImageUrl` resolver:
         ```javascript
         const getImageUrl = (fileRef) => {
             if (!fileRef) return `${import.meta.env.BASE_URL}images/placeholder.jpg`;
             if (!fileRef.includes('.') && fileRef.length > 10) {
                 return `https://lh3.googleusercontent.com/d/${fileRef}`;
             }
             return `${import.meta.env.BASE_URL}images/${fileRef}`;
         };
         const imgSrc = getImageUrl(ex.fileReference);
         ```

    5. MODIFY `gymlog-react/src/components/CircuitCard.jsx`:
       - Replace the `imgSrc` logic around line 242 with the identical `getImageUrl` resolver:
         ```javascript
         const getImageUrl = (fileRef) => {
             if (!fileRef) return `${import.meta.env.BASE_URL}images/placeholder.jpg`;
             if (!fileRef.includes('.') && fileRef.length > 10) {
                 return `https://lh3.googleusercontent.com/d/${fileRef}`;
             }
             return `${import.meta.env.BASE_URL}images/${fileRef}`;
         };
         const imgSrc = getImageUrl(ex.fileReference);
         ```

    6. AUDIT: Generate `audit_log_R33.md` detailing the implemented Drive URL rendering and sharing upgrades.
    7. VERIFY: Run `npm run build` (via cmd /c) to confirm compilation succeeds cleanly.
    8. EXECUTE: Run `git push origin TASK-R33` to push the branch to the remote repository.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
