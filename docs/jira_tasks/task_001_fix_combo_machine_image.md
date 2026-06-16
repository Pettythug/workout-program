# Task 001: Fix Missing Image for Combo Machine

**Model Mandate:** Gemini 3.5 Flash (High) is sufficient for this minor mapping update.

## Problem
The app is failing to load the image for Hammer Strength Select Pectoral Fly / Rear Deltoid because that exact combo string is missing from our image mapping dictionary.

## Instructions
1. Open src/utils/imageMapping.js
2. Add the following line to the MACHINE_IMAGE_MAP object:
   "Hammer Strength Select Pectoral Fly / Rear Deltoid": "20260513_085948.jpg",
3. Save the file.
4. Run 
pm run build to verify the syntax is correct.
5. Provide your Audit Submission to the Bridge.
