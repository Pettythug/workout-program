# [COMPLETED] Task 001: Fix Missing Images for Split Combo Machines

**Model Mandate:** Gemini 3.5 Flash (High) is sufficient for this minor mapping update.

## Problem
The app is failing to load images for our newly split combo machines because their explicit names are missing from the mapping dictionary.

## Instructions
1. Open src/utils/imageMapping.js
2. Add the following lines to the MACHINE_IMAGE_MAP object:
   "Hammer Strength Select Pectoral Fly / Rear Deltoid": "20260513_085948.jpg",
   "Hoist ROC-IT Selectorized Chin Assist": "20260528_082305.jpg",
   "Hoist ROC-IT Selectorized Dip Assist": "20260528_082305.jpg",
3. Save the file.
4. Run 
pm run build to verify the syntax is correct.
5. Provide your Audit Submission to the Bridge.
