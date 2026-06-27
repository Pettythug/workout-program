# task_011: Image Upload & Google Drive Integration
- **Required Model Tier**: Gemini 3.5 High

## Objective:
Build a dynamic image upload component allowing users to upload or capture photos from their device, save them to Google Drive via the Apps Script backend, and map the URL to the exercise row.

## Details:
1. In the unified `<WorkoutCard />`, add an "Upload Image" file selector:
   `<input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} />`
2. Implement frontend logic to convert the selected file to a Base64-encoded string.
3. Add a new API endpoint in `useGymAPI.js` called `uploadImage(baseName, base64Data, filename)`.
4. Update the Google Apps Script backend Web App code to:
   - Accept the Base64 file content.
   - Save the file inside a designated Google Drive folder.
   - Set file permissions to public/webviewable.
   - Update the Google Sheet row corresponding to `baseName`'s `fileReference` with the new file URL.
   - Return the URL response.
5. In React, update the exercise card's active image source state to the new URL upon successful upload, removing fallback notices.
