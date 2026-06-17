# Task 009: Fix ISO-Lateral Image Mapping Case-Sensitivity

**Recommended Model:** Gemini 3.5 Flash

## Git Setup (Mandatory)
Before writing any code, pull the latest state and isolate your changes on a new branch:
1. Ensure your local `main` is fresh:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Create and switch to a new task branch:
   ```bash
   git checkout -b task/009-fix-iso-lateral-images
   ```

## Problem Description
In the Google Sheet exercises database, the Hammer Strength plate-loaded machines are named using the casing **ISO-Lateral** (all uppercase `ISO`), e.g., `Hammer Strength ISO-Lateral Bench Press`. 
However, in our image mapping table (`gymlog-react/src/utils/imageMapping.js`), the keys use **Iso-Lateral** (capital `I`, lowercase `so`), e.g., `"Hammer Strength Iso-Lateral Bench Press"`.
Because Javascript lookups are case-sensitive, this casing mismatch returns `undefined` for the image lookup, causing images to display as "Image not found".

## Instructions for Developer
1. Open [dataMerge.js](file:///C:/Users/wance/Documents/Git/workout-program/gymlog-react/src/context/dataMerge.js).
2. Define a helper function `getImageFile(name)` at the top of the file:
   ```javascript
   function getImageFile(name) {
       if (!name) return null;
       if (MACHINE_IMAGE_MAP[name]) return MACHINE_IMAGE_MAP[name];
       const normalized = name.replace(/\bISO-Lateral\b/gi, "Iso-Lateral");
       return MACHINE_IMAGE_MAP[normalized] || null;
   }
   ```
3. Update line 24 (or where `fileReference` is resolved for local exercises) to use this helper:
   ```javascript
   let fileReference = getImageFile(ex.name) || getImageFile(sheetExInfo?.name);
   ```
4. Update line 52 (or where `fileReference` is resolved for sheets-only exercises) to use this helper:
   ```javascript
   let fileReference = getImageFile(sheetEx.name);
   ```
5. Run `npm run build` from `gymlog-react` to verify a successful production build.
6. Provide an Audit Submission with your exact Git Diff and build output.
