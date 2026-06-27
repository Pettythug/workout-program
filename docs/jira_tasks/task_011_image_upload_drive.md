# task_011: Image Upload & Google Drive Integration (Full Scope)
- **Required Model Tier**: Claude Sonnet 4.6 / Medium

## Pre-Flight Research Findings:
- `WorkoutCard.jsx` line 145-147: `imgSrc` currently builds a LOCAL file path:
  `${import.meta.env.BASE_URL}images/${ex.fileReference}`
  This only works if the image file physically exists on the device. No upload mechanism exists.
- `Combined_AppScript_v2.gs` has no Drive folder constant or upload handler.
- The `EXERCISES_HEADERS` array (line 40) already includes a `"File Reference"` column in the Google Sheet.
- `gymlog_handleSaveExercise()` already writes `payload.fileReference` to the Sheet row.
- `useGymAPI.js` has `saveExercise(metadata)` which can pass `fileReference` — no changes needed there IF the new URL is passed correctly.

## Objective:
Allow users to upload or photograph an exercise image from any device. The image uploads
to Google Drive, the public URL is saved in the Google Sheet `fileReference` column,
and the card immediately renders the live URL instead of a local path.

## Changes Required:

### 1. `Combined_AppScript_v2.gs`
Add below existing constants (after line 44):
```javascript
// Google Drive folder ID for exercise images.
// SECURITY: Store this as Script Property 'DRIVE_FOLDER_ID' and set it in Project Settings.
const DRIVE_FOLDER_ID = PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID') || '';
```

Add a new action route in both `doGet` and `doPost` payload routing blocks:
```javascript
if (payload.action === "uploadImage") return gymlog_handleUploadImage(payload);
```

Add new handler function `gymlog_handleUploadImage(payload)`:
```javascript
function gymlog_handleUploadImage(payload) {
  verifyAdminPin(payload);
  const { baseName, base64Data, mimeType, filename } = payload;
  if (!baseName || !base64Data) return err("Missing baseName or base64Data");

  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const decoded = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(decoded, mimeType || 'image/jpeg', filename || (baseName + '.jpg'));
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const fileUrl = 'https://drive.google.com/uc?export=view&id=' + file.getId();

  // Update the fileReference column in the Exercises sheet
  const exSheet = getOrCreateSheet(EXERCISES_TAB, EXERCISES_HEADERS);
  const lastRow = exSheet.getLastRow();
  if (lastRow > 1) {
    const names = exSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < names.length; i++) {
      if (String(names[i][0]).trim().toLowerCase() === String(baseName).trim().toLowerCase()) {
        const fileRefCol = EXERCISES_HEADERS.indexOf("File Reference") + 1;
        exSheet.getRange(i + 2, fileRefCol).setValue(fileUrl);
        break;
      }
    }
  }
  return ok({ url: fileUrl });
}
```

### 2. `gymlog-react/src/hooks/useGymAPI.js`
Add a new `uploadImage(baseName, base64Data, mimeType, filename, pin)` function:
```javascript
const uploadImage = useCallback((baseName, base64Data, mimeType, filename, pin) => {
    return sheetsPost({
        action: "uploadImage",
        baseName,
        base64Data,
        mimeType,
        filename,
        pin
    });
}, [sheetsPost]);
```
Add `uploadImage` to the return object.

### 3. `gymlog-react/src/components/WorkoutCard.jsx`
- Import `useGymAPI` and destructure `uploadImage` from it (it already imports `useGymAPI`).
- Add state: `const [uploadingImage, setUploadingImage] = useState(false);`
- Add a hidden file input ref using `React.useRef`.
- Update `imgSrc` (lines 145-147) to handle both local paths and full URLs:
  ```javascript
  const imgSrc = ex.fileReference
      ? (ex.fileReference.startsWith('http')
          ? ex.fileReference
          : `${import.meta.env.BASE_URL}images/${ex.fileReference}`)
      : `${import.meta.env.BASE_URL}images/placeholder.jpg`;
  ```
- Add an `handleImageUpload` async function:
  ```javascript
  const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const pin = window.prompt("Enter Admin PIN to upload image:");
      if (!pin) return;
      setUploadingImage(true);
      try {
          const reader = new FileReader();
          reader.onload = async (ev) => {
              const base64 = ev.target.result.split(',')[1];
              const result = await uploadImage(ex.name, base64, file.type, file.name, pin);
              // Update exercise fileReference in local state via saveExercise
              await saveExercise({ ...ex, fileReference: result.url });
              setToast("Image uploaded!");
              setTimeout(() => setToast(""), 3000);
              setUploadingImage(false);
          };
          reader.readAsDataURL(file);
      } catch (err) {
          alert("Upload failed: " + err.message);
          setUploadingImage(false);
      }
  };
  ```
- Add a hidden file input and an upload button in the admin features section of the card:
  ```jsx
  <input
      type="file"
      accept="image/*"
      capture="environment"
      ref={fileInputRef}
      style={{ display: 'none' }}
      onChange={handleImageUpload}
  />
  <button
      className="btn-ghost"
      onClick={() => fileInputRef.current?.click()}
      disabled={uploadingImage}
      style={{ fontSize: 11, padding: '4px 8px' }}
  >
      {uploadingImage ? "Uploading..." : "📷 Upload Image"}
  </button>
  ```
  Place this button inside the existing `showAdminFeatures` block so it only appears for admins.

## Verification:
1. `npm run build` in `gymlog-react/` — zero errors.
2. Commit with message: `feat(images): add Google Drive image upload to WorkoutCard admin panel`
3. Output detailed Audit Log.

## IMPORTANT Notes:
- Do NOT hardcode the Drive Folder ID. It must be read from Script Properties (`DRIVE_FOLDER_ID`).
- Do NOT modify any Google Sheets schema or spreadsheet data directly.
- Do NOT modify any files outside `/gymlog-react/src/` and `Combined_AppScript_v2.gs`.
- The upload button must ONLY appear when `showAdminFeatures === true`.

## Post-Deploy Action Required (by human):
Set `DRIVE_FOLDER_ID` in Google Apps Script Project Settings → Script Properties.
Value = the Google Drive folder ID where exercise images should be stored.
Then redeploy the Web App.
