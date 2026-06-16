# Roadmap: Adding New Machines & Images

With our new dataMerge.js auto-resolution logic, adding new machines in the future requires absolutely **ZERO code changes**. You will not need to touch imageMapping.js or ask an AI to update mappings.

Here is the exact 3-step roadmap to add a new machine and photo:

### Step 1: Add to Google Sheets
Add the new exercise as a dedicated row in your Google Sheet. 
*Example:* Prime Preacher Curl

### Step 2: Take the Photo
Take a clear, horizontal (landscape) photo of the machine.

### Step 3: Name the Photo Exactly
Before uploading the photo to the repository (public/images/), you MUST name the .jpg file to exactly match the Exercise Name from Step 1, replacing any slashes (/) with underscores (_).

*Example:* Prime Preacher Curl.jpg

### Auto-Mapping Complete!
The moment that photo drops into the public/images/ folder, the app will instantly find it and map it to the exercise. No code deployment or mapping dictionary updates are required.
