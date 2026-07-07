# TASK-R36: Proxy Drive Images Through Apps Script Backend

> **For Human Readers:** All direct Google Drive image URLs (`lh3.googleusercontent.com`, `docs.google.com/uc`) are blocked by Chrome's ORB (Opaque Response Blocking) when loaded via `<img>` tags cross-origin. This task adds a backend image proxy so the Apps Script fetches the image server-side and returns it as base64 data, completely bypassing all browser security blocks.

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
    - TARGET_BRANCH: `TASK-R36`
  </ENVIRONMENT_SETUP>
  <OBJECTIVE>
    Add a server-side image proxy route to the Apps Script backend and update ImageModal.jsx to fetch images through it as base64 data URLs.
  </OBJECTIVE>
  <RESOURCES>
    - Backend: `Combined_AppScript_v2.gs`
    - Frontend: `gymlog-react/src/components/ImageModal.jsx`
    - Reference Files (READ ONLY):
      - `gymlog-react/src/components/ExerciseCard.jsx` (lines 168-174)
      - `gymlog-react/src/components/CircuitCard.jsx` (lines 242-248)
      - `gymlog-react/src/hooks/useGymAPI.js`
  </RESOURCES>
  <CONSTRAINTS>
    - DO NOT modify ExerciseCard.jsx or CircuitCard.jsx. Those components define `getImageUrl` but never render `<img>` tags — they delegate image display to ImageModal.
    - DO NOT add new route entries for `getImage` in the `doGet()` or `doPost()` routing tables. The route already handles `payload.action` matching via the existing if-chain. Just add the new if-statement for `getImage` in the same pattern.
    - DO NOT wrap `gymlog_handleGetImage` in `withLock()`. Image reads do not write to the spreadsheet and must not acquire the script lock.
    - The `getImage` route does NOT require a PIN. It is a read-only operation. Security is enforced via folder validation (see below).
  </CONSTRAINTS>
  <SEQUENCE>
    1. READ all target and reference files listed above.

    2. MODIFY `Combined_AppScript_v2.gs`:

       a. Add a new route in the `doGet()` function's payload if-chain (after the `uploadImage` line, before the `return err("Unknown payload action")` line):
          ```javascript
          if (payload.action === "getImage")      return gymlog_handleGetImage(payload);
          ```

       b. Add the same route in the `doPost()` function's if-chain (after the `uploadImage` line, before the `return err("Unknown action")` line):
          ```javascript
          if (payload.action === "getImage")      return gymlog_handleGetImage(payload);
          ```

       c. Add the handler function. Place it immediately after the `gymlog_handleUploadImage` function.
          SECURITY REQUIREMENTS — The handler MUST enforce all three of these checks:
          (1) Validate the fileId parameter is present.
          (2) Validate the file belongs to the images folder (ID: `1nOc1oLanQ99cpPyOH1bGHKHW3E1Faubc`). This prevents the endpoint from being used as an open proxy to exfiltrate arbitrary files from the owner's Google Drive.
          (3) Validate the file's MIME type starts with `image/`. This prevents serving non-image file types.

          ```javascript
          // ── Get Image (base64 proxy) ───────────────────────────────────────────
          // Security: Validates file belongs to the images folder and is an image MIME type.
          function gymlog_handleGetImage(payload) {
            const fileId = payload.fileId;
            if (!fileId) return err("Missing fileId");

            try {
              const file = DriveApp.getFileById(fileId);

              // Security: Verify file is inside the designated images folder
              const IMAGE_FOLDER_ID = "1nOc1oLanQ99cpPyOH1bGHKHW3E1Faubc";
              const parents = file.getParents();
              let inFolder = false;
              while (parents.hasNext()) {
                if (parents.next().getId() === IMAGE_FOLDER_ID) {
                  inFolder = true;
                  break;
                }
              }
              if (!inFolder) return err("Access denied: file is not in the images folder");

              // Security: Verify MIME type is an image
              const blob = file.getBlob();
              const mimeType = blob.getContentType() || "image/jpeg";
              if (!mimeType.startsWith("image/")) return err("Access denied: not an image file");

              // Size guard: reject files over 5MB to prevent Apps Script timeout
              if (blob.getBytes().length > 5 * 1024 * 1024) return err("Image too large (max 5MB)");

              const base64 = Utilities.base64Encode(blob.getBytes());
              return ok({ imageData: "data:" + mimeType + ";base64," + base64 });
            } catch (e) {
              return err("Image not found: " + e.message);
            }
          }
          ```

    3. MODIFY `gymlog-react/src/components/ImageModal.jsx`:

       a. Add `useEffect` to the React import on line 1:
          Change: `import React, { useState, useRef } from 'react';`
          To:     `import React, { useState, useRef, useEffect } from 'react';`

       b. Replace the entire `getImageUrl` function and `imgSrc` constant (lines 44-51) with a state-based async loader that includes sessionStorage caching:

          ```jsx
          const [proxiedSrc, setProxiedSrc] = useState(null);
          const [imageLoading, setImageLoading] = useState(false);
          const [imageError, setImageError] = useState(false);

          const isDriveId = (ref) => ref && !ref.includes('.') && ref.length > 10;

          useEffect(() => {
              if (!isOpen || !ex.fileReference) return;

              if (isDriveId(ex.fileReference)) {
                  // Check sessionStorage cache first
                  const cacheKey = 'gymlog_img_' + ex.fileReference;
                  const cached = sessionStorage.getItem(cacheKey);
                  if (cached) {
                      setProxiedSrc(cached);
                      setImageError(false);
                      return;
                  }

                  setImageLoading(true);
                  setImageError(false);
                  setProxiedSrc(null);
                  sheetsPost({ action: "getImage", fileId: ex.fileReference })
                      .then(res => {
                          if (res?.data?.imageData) {
                              setProxiedSrc(res.data.imageData);
                              // Cache in sessionStorage for this browser session
                              try { sessionStorage.setItem(cacheKey, res.data.imageData); } catch (e) { /* quota exceeded, skip cache */ }
                          } else {
                              setImageError(true);
                          }
                      })
                      .catch(() => setImageError(true))
                      .finally(() => setImageLoading(false));
              }
          }, [isOpen, ex.fileReference, sheetsPost]);

          const imgSrc = isDriveId(ex.fileReference)
              ? proxiedSrc
              : ex.fileReference
                  ? `${import.meta.env.BASE_URL}images/${ex.fileReference}`
                  : null;
          ```

       c. Replace the image rendering block (the `<div>` that contains the `<img>` tag, lines 61-82) with:

          ```jsx
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              {imageLoading ? (
                  <div style={{ color: 'var(--muted)', padding: 32, textAlign: 'center' }}>
                      Loading image...
                  </div>
              ) : imageError ? (
                  <div style={{ color: 'var(--muted)', padding: 32, textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 8 }}>
                      Image not found for this exercise.
                  </div>
              ) : imgSrc ? (
                  <img
                      src={imgSrc}
                      alt={baseName}
                      style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: 8 }}
                      onError={(e) => {
                          e.target.style.display = 'none';
                          setImageError(true);
                      }}
                  />
              ) : (
                  <div style={{ color: 'var(--muted)', padding: 32, textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 8 }}>
                      No image available for this exercise.
                  </div>
              )}
          </div>
          ```

    4. AUDIT: Generate `audit_log_R36.md` detailing the image proxy implementation and its security hardening.
    5. VERIFY: Run `npm run build` (via `cmd /c`) inside `gymlog-react` to confirm compilation succeeds cleanly.
  </SEQUENCE>
</TASK_EXECUTION_PROTOCOL>
```
