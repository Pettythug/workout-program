# TASK-R45: Implement Client-Side Image Compression in ImageModal

> **For Human Readers:** Modern phone photos are typically 8MB-15MB. Sending these directly to Google Drive is slow, causes network timeouts, and triggers the Apps Script 5MB memory limit guard. This task implements client-side downscaling and compression using HTML5 Canvas inside the React app, reducing image payloads to ~150KB before uploading them.

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
    - TARGET_BRANCH: `TASK-R45`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Implement client-side compression (max 1000px width/height, 0.8 JPEG quality) in `ImageModal.jsx` before calling the upload API.
  </OBJECTIVE>
  <RESOURCES>
    - Frontend: `gymlog-react/src/components/ImageModal.jsx`
  </RESOURCES>
  <SEQUENCE>
    1. READ `gymlog-react/src/components/ImageModal.jsx`.

    2. MODIFY `gymlog-react/src/components/ImageModal.jsx`:
       - Add a helper function `compressImage` above the `ImageModal` component definition:
         ```javascript
         const compressImage = (file, maxWidth = 1000, maxHeight = 1000, quality = 0.8) => {
             return new Promise((resolve, reject) => {
                 const reader = new FileReader();
                 reader.readAsDataURL(file);
                 reader.onload = (event) => {
                     const img = new Image();
                     img.src = event.target.result;
                     img.onload = () => {
                         const canvas = document.createElement('canvas');
                         let width = img.width;
                         let height = img.height;

                         if (width > height) {
                             if (width > maxWidth) {
                                 height = Math.round((height * maxWidth) / width);
                                 width = maxWidth;
                             }
                         } else {
                             if (height > maxHeight) {
                                 width = Math.round((width * maxHeight) / height);
                                 height = maxHeight;
                             }
                         }

                         canvas.width = width;
                         canvas.height = height;
                         const ctx = canvas.getContext('2d');
                         ctx.drawImage(img, 0, 0, width, height);

                         const dataUrl = canvas.toDataURL('image/jpeg', quality);
                         resolve(dataUrl);
                     };
                     img.onerror = (err) => reject(err);
                 };
                 reader.onerror = (err) => reject(err);
             });
         };
         ```
       - In `handleImageUpload`, replace the raw `FileReader` reader block with the new async compression call:
         ```javascript
         const handleImageUpload = async (e) => {
             const file = e.target.files[0];
             if (!file) return;

             const pin = window.prompt("Admin PIN required to upload image:");
             if (pin === null) return;

             setIsUploading(true);
             try {
                 const compressedBase64 = await compressImage(file);
                 await sheetsPost({
                     action: "uploadImage",
                     exercise: ex.name,
                     data: compressedBase64,
                     filename: file.name.replace(/\.[^/.]+$/, "") + ".jpg",
                     pin: pin
                 });
                 setToast("Image uploaded! Reloading...");
                 setTimeout(() => window.location.reload(), 1500);
             } catch (err) {
                 console.error(err);
                 setToast("Error uploading image");
                 setTimeout(() => setToast(""), 3000);
             } finally {
                 setIsUploading(false);
                 onClose();
             }
         };
         ```

    3. AUDIT: Generate `audit_log_R45.md` detailing the client-side compression logic.
    4. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to confirm compilation succeeds cleanly.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
