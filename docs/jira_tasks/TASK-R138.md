# TASK-R138: Standalone AI Equipment & Cardio Scanner Lab (`/#/scanner-lab`)

- **Target Role:** `Sandbox_Developer` (`DENY(git checkout, git merge, git push)`)
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash (High)` / `Claude Sonnet 4.6 (Thinking)`) or `HIGH_TIER` (`Gemini 4 Argon (High)` / `Gemini 3.8 Pro` / `Claude Opus 4.6 (Thinking)`)
- **STRICT MODEL GATEKEEPER CHECK (MANDATORY ON TURN 1):**
  - If your active model is in `LOW_TIER` (`Gemini 3.8 Flash (Low)`, `Gemini 3.5 Flash (Low)`):
    - **HALT IMMEDIATELY.** Do NOT edit files or run commands.
    - Output: `Model Alignment Error: Request Switch -> Expected MEDIUM_TIER or HIGH_TIER for feature development. Please switch to Gemini 3.8 Flash (High), Claude Sonnet 4.6 (Thinking), or Gemini 4 Argon (High).`
- **Target Branch:** `feat/TASK-R138-ai-scanner-lab-sandbox`

---

## 1. Objective & Strict Isolation Mandate

Build a **100% self-contained, isolated AI Equipment & Cardio Scanner Sandbox** mounted at `/#/scanner-lab` (`<Route path="/scanner-lab" element={<ScannerLabView />} />`) so the user can test scanning strength machines, dual-purpose machines, and cardio equipment on both **`localhost`** (`http://localhost:5173/workout-program/react/#/scanner-lab`) and **Vercel** (`/#/scanner-lab`) **without modifying any existing workout views, cards, timers, or context logic**.

### Strict File Scope (`ZERO RISK TO EXISTING WORKOUT FLOWS`)
- **NEW Files to Create:**
  1. `gymlog-react/src/utils/aiEquipmentScanner.js` (Core AI vision service, response normalizer, existing-library duplicate & location matcher, cardio warm-up formatter, and category coverage calculator).
  2. `gymlog-react/src/components/ScannerLabView.jsx` (Isolated `/#/scanner-lab` UI with Camera/File upload, 1-click Sample Presets for localhost testing, Dry-Run vs. Live Save toggle, `VariationGeneratorPanel` integration, Cardio Warm-Up preview, and New Gym Coverage Checklist).
  3. `gymlog-react/test_task_r138.cjs` (Automated Node.js verification suite testing all scanner utilities, duplicate detection, dual-machine splitting, cardio warm-up detection, and variation option mapping).
- **ONLY Existing File Allowed to Be Modified:**
  - `gymlog-react/src/App.jsx` (ONLY to import `ScannerLabView` and add `<Route path="/scanner-lab" element={<ScannerLabView />} />` inside `<Routes>`).
  - **DO NOT** modify `PlanView.jsx`, `FullBodyView.jsx`, `CircuitView.jsx`, `LiftView.jsx`, `ExerciseCard.jsx`, `CircuitCard.jsx`, `WarmUpCard.jsx`, `SettingsModal.jsx`, or `AppContext.jsx`.

---

## 2. Detailed Implementation Specification

### Step 1: Create `gymlog-react/src/utils/aiEquipmentScanner.js`

Implement and export the following pure helpers and multi-provider AI vision functions:

1. **`CORE_MOVEMENT_CATEGORIES`:**
   ```js
   export const CORE_MOVEMENT_CATEGORIES = [
       'Horizontal Push',
       'Vertical Push',
       'Horizontal Pull',
       'Vertical Pull',
       'Squat',
       'Hinge',
       'Biceps',
       'Triceps',
       'Core'
   ];
   ```

2. **`matchAgainstExerciseLibrary(candidateBaseName, existingExercises = [], targetLocation = '24 Hour Fitness')`:**
   - Uses `extractBaseName` from `./exerciseVariations` to normalize both `candidateBaseName` and every item in `existingExercises`.
   - Also checks normalized substring/token similarity (e.g., stripping punctuation and comparing lowercase base names).
   - Returns an object:
     ```js
     {
       status: 'new' | 'exists_same_location' | 'exists_other_location',
       matchedExercises: [...], // matching exercise objects from existingExercises
       existingLocations: [...], // unique locations where this base exercise already exists
       canonicalBaseName: matchedBaseName || candidateBaseName.trim()
     }
     ```
   - Rules:
     - If no match in `existingExercises`: `status: 'new'`.
     - If matched and at least one matched exercise has `location === targetLocation` or `location === 'Anywhere'`: `status: 'exists_same_location'`.
     - If matched but only at a different location (e.g., exists at `24 Hour Fitness` while scanning for `Planet Fitness`): `status: 'exists_other_location'`.

3. **`normalizeAIScanResult(rawJson, existingExercises = [], targetLocation = '24 Hour Fitness')`:**
   - Safely accepts raw parsed JSON from the AI (or sample preset) and normalizes it into a predictable structure:
     ```js
     {
       equipmentKind: 'strength' | 'dual_strength' | 'cardio',
       manufacturer: string,
       machineTitle: string,
       summary: string,
       items: [
         // For strength or dual_strength (1 or 2 items):
         {
           type: 'strength',
           baseName: string,
           category: string, // normalized to match CORE_MOVEMENT_CATEGORIES or existing category
           location: targetLocation,
           setupNote: string,
           variationOptions: {
             barbell: boolean,
             dumbbell: boolean,
             band: boolean,
             cable: boolean,
             single: boolean,
             alt: boolean,
             overhand: boolean,
             underhand: boolean,
             neutral: boolean
           },
           libraryMatch: matchAgainstExerciseLibrary(baseName, existingExercises, targetLocation)
         },
         // Or for cardio:
         {
           type: 'cardio',
           warmUpName: string, // e.g. "5 min StairMaster Gauntlet"
           machineName: string,
           coachingTip: string,
           location: targetLocation
         }
       ]
     }
     ```

4. **`computeLocationCategoryCoverage(existingExercises = [], queuedItems = [], targetLocation = '24 Hour Fitness')`:**
   - Computes how many exercises cover each category in `CORE_MOVEMENT_CATEGORIES` for `targetLocation` (counting exercises where `ex.location === targetLocation || ex.location === 'Anywhere'`, plus any `queuedItems` of `type === 'strength'` for `targetLocation`).
   - Returns an array of `{ category, existingCount, queuedCount, totalCount, isCovered: totalCount > 0 }`.

5. **`SAMPLE_SCAN_PRESETS` (For 1-Click Localhost & Offline Testing):**
   - Export 4 rich, realistic sample presets so the user can test every scenario on `localhost` in 1 click without needing an API key or a physical gym machine photo first:
     - `sample_row`: **New Strength Machine** (`Hammer Strength Iso-Lateral DY Row`, category `Horizontal Pull`, grips `underhand: true, overhand: true, neutral: true`, execution `single: true, alt: true`).
     - `sample_dual`: **Dual-Purpose Machine** (`Matrix Pec Fly / Rear Delt`, `equipmentKind: 'dual_strength'`, returns 2 items: `Machine Pec Fly` in `Horizontal Push` and `Machine Rear Delt Fly` in `Horizontal Pull`).
     - `sample_cardio`: **Cardio / Warm-Up Machine** (`StairMaster Gauntlet 8 Series`, `equipmentKind: 'cardio'`, `warmUpName: '5 min StairMaster Gauntlet'`, `coachingTip: 'Maintain upright posture without leaning on handrails; steady step cadence to elevate heart rate and warm up quads/glutes.'`).
     - `sample_duplicate`: **Existing Library Machine Check** (Uses the first exercise present in `existingExercises`—or `'Seated Cable Row'` fallback—to demonstrate `exists_same_location` / `exists_other_location` detection when walking through another gym branch).

6. **`compressImageFileToDataUrl(file, maxDimension = 1024, quality = 0.72)`:**
   - Browser helper that reads an image `File`/`Blob`, scales it down proportionally to at most `maxDimension` px on a `<canvas>`, and returns `{ dataUrl, mimeType: 'image/jpeg', base64Data, width, height, sizeKB }`.

7. **`analyzeEquipmentPhotosWithAI({ images, provider, apiKey, model, existingExercises, targetLocation })`:**
   - Supports 3 live providers directly from the browser so the user can test immediately on `localhost` or Vercel using their own key:
     - **`gemini` (Default — Google Gemini Free Tier):**
       - Calls `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.5-flash'}:generateContent?key=${encodeURIComponent(apiKey)}`
       - Passes the system prompt + list of existing exercise base names & categories + inline `base64Data` images (`inline_data: { mime_type, data }`), requesting `response_mime_type: "application/json"`.
     - **`openai` (OpenAI GPT-4o-mini / GPT-4o):**
       - Calls `https://api.openai.com/v1/chat/completions` with `response_format: { type: 'json_object' }` and `image_url` data URLs.
     - **`anthropic` (Claude 3.5 Sonnet / Haiku):**
       - Calls `https://api.anthropic.com/v1/messages` with `anthropic-dangerous-direct-browser-access: true` header and base64 image blocks.
   - Parses the JSON response and returns `normalizeAIScanResult(parsed, existingExercises, targetLocation)`.

---

### Step 2: Create `gymlog-react/src/components/ScannerLabView.jsx`

Create a clean, dark-themed (`var(--surface)`, `var(--accent)`) standalone lab view at `/#/scanner-lab`:

1. **Top Lab Banner & Safety Mode Switch:**
   - Header: **`🧪 AI EQUIPMENT & CARDIO SCANNER LAB (ISOLATED SANDBOX)`** with a `← Back to App` button (`navigate('/lift')`).
   - Prominent **Mode Toggle**:
     - `🛡️ SANDBOX DRY-RUN MODE (Default — Zero writes to Google Sheets)`
     - `🚀 LIVE SAVE MODE (Saves approved items to Exercise Library / Warm-Ups)`
   - Explains clearly whether actions are currently simulated in the lab queue or will save to the live app.

2. **Section 1: AI Connection Setup ("Way B" Per-User Key Manager):**
   - Stores config in `localStorage` under `gymlog_ai_scanner_config_${deviceOwner || 'Guest'}` using `safeReadLocalJSON`.
   - Provider selector:
     - `Google Gemini (Free Tier - 1,500/day)` (Default, model `gemini-2.5-flash` with fallback option `gemini-1.5-flash`)
     - `OpenAI (GPT-4o-mini)`
     - `Anthropic (Claude 3.5 Sonnet)`
   - Password input for the user's personal API Key with a `Show/Hide` toggle, `Save Key to My Profile` button, and a direct helper link: **`🔑 Get Free Google Gemini Key (aistudio.google.com/apikey)`** (`target="_blank"`).

3. **Section 2: Target Gym Location & "Gym Walk-Through" Coverage Checklist:**
   - Dropdown to pick an existing location (`locations` from `useAppContext()`) OR a **`+ New Gym Location...`** toggle where the user can type a new gym name (e.g., `Planet Fitness`, `24 Hour Fitness - Downtown`, `Hotel Gym`).
   - Collapsible **📊 Gym Movement Coverage Checklist** for the active target location (powered by `computeLocationCategoryCoverage`):
     - Displays chips for all 9 core movement categories (`Horizontal Push`, `Vertical Push`, `Horizontal Pull`, `Vertical Pull`, `Squat`, `Hinge`, `Biceps`, `Triceps`, `Core`) with `✅ Covered (N)` or `⚠️ Needs Machine (0)`, updating live as items are scanned!

4. **Section 3: Photo Capture / Upload + 1-Click Localhost Sample Presets:**
   - **Camera / File Upload Button:** `<input type="file" accept="image/*" capture="environment" multiple />` so on mobile (Vercel) it opens the rear camera and on desktop (`localhost`) it opens the file picker (up to 3 photos per machine: e.g., machine frame + instructional placard).
   - Shows compressed photo thumbnails with size in KB (e.g. `58 KB`) and a `🔍 Analyze Photo(s) with AI` button.
   - **1-Click Localhost Test Bar (`🧪 No Photo Handy? Try a Instant Sample Scan:`):**
     - 4 buttons that immediately load a generated preview badge + run `normalizeAIScanResult` on `SAMPLE_SCAN_PRESETS`:
       1. `🦾 New Strength Machine (DY Row)`
       2. `🔄 Dual-Purpose Machine (Pec Fly / Rear Delt)`
       3. `🔥 Cardio Machine (StairMaster Warm-Up)`
       4. `📍 Existing Machine Duplicate Check`

5. **Section 4: Interactive Scan Result & Review Editor:**
   - For each item returned in `scanResult.items`:
     - **If `item.type === 'strength'`:**
       - Displays the **Library Match Status Badge**:
         - `🆕 BRAND-NEW MACHINE` (Green/Orange badge)
         - `✅ ALREADY IN LIBRARY AT THIS LOCATION` (Blue badge — warns against duplicate creation)
         - `📍 EXISTS AT ANOTHER GYM (${existingLocations.join(', ')})` (Purple badge — offers to register for this location)
       - Editable **Base Exercise Name** input, **Category** `<select>` (populated with `CORE_MOVEMENT_CATEGORIES` and existing `allCategories`), **Location** badge, and **Setup / Placard Note** input.
       - Embeds `<VariationGeneratorPanel />` (`buildVariationNames` from `../utils/exerciseVariations`) with the AI-detected `variationOptions` (`barbell`, `dumbbell`, `band`, `cable`, `single`, `alt`, `overhand`, `underhand`, `neutral`) **automatically pre-checked** so the user sees the Live Preview of all generated variation names and can check/uncheck any box!
       - Action button:
         - In **Sandbox Dry-Run Mode**: `➕ Add to Walk-Through Test Queue (Dry Run)` (adds to local lab session list & updates the Coverage Checklist without touching the live app).
         - In **Live Save Mode**: `💾 Save ${selectedCount} Variation(s) to Live Library` (calls `createExerciseMeta` + `addExerciseToLocalState`, and saves the compressed photo thumbnail to `localStorage` under `gymlog_custom_photos` keyed by exercise name).
     - **If `item.type === 'cardio'`:**
       - Displays **`🔥 CARDIO / WARM-UP EQUIPMENT DETECTED`**.
       - Editable **Warm-Up Preset Name** (e.g. `5 min StairMaster Gauntlet`) and **Coaching Tip**.
       - Action button:
         - In **Sandbox Dry-Run Mode**: `➕ Add Warm-Up to Walk-Through Test Queue (Dry Run)`
         - In **Live Save Mode**: `💾 Save to Warm-Up Modalities` (appends to `gymlog_custom_warmups` in `localStorage` so `WarmUpCard.jsx` immediately includes it!).

6. **Section 5: Lab Walk-Through Queue Summary:**
   - Shows all machines/cardio scanned during the current session with a `Clear Queue` button.

---

### Step 3: Register `/scanner-lab` Route in `gymlog-react/src/App.jsx`
- Import `ScannerLabView` from `./components/ScannerLabView` and add:
  ```jsx
  <Route path="/scanner-lab" element={<ScannerLabView />} />
  ```
  right above `<Route path="/" element={<Navigate to="/lift" replace />} />`.

---

### Step 4: Create & Run Automated Verification Suite (`gymlog-react/test_task_r138.cjs`)
- Create `gymlog-react/test_task_r138.cjs` to test:
  1. `matchAgainstExerciseLibrary` accurately distinguishes `'new'`, `'exists_same_location'`, and `'exists_other_location'`.
  2. `normalizeAIScanResult` properly normalizes single strength machines, dual-purpose machines (`dual_strength` -> 2 items), and cardio machines (`cardio` -> warm-up preset), and maps `variationOptions` to `buildVariationNames`.
  3. `computeLocationCategoryCoverage` accurately counts covered vs. missing movement categories for both existing and newly scanned exercises at a new gym (like `Planet Fitness`).
  4. `App.jsx` mounts `/scanner-lab` without modifying any existing workout component files.
- Execute `cd gymlog-react && node test_task_r138.cjs` and `cd gymlog-react && cmd /c npm run build` and verify both pass with `EXIT_CODE: 0`.

---

## 3. Submission Protocol for Sandbox Developer
Output your completion signal inside a fenced XML block:
```xml
<TASK_HANDOFF>
  <SIGNAL>DEVELOPMENT_TASK_COMPLETE</SIGNAL>
  <TASK_ID>TASK-R138</TASK_ID>
  <BRANCH>feat/TASK-R138-ai-scanner-lab-sandbox</BRANCH>
  <BUILD_VERIFICATION>PASS</BUILD_VERIFICATION>
  <TEST_VERIFICATION>PASS</TEST_VERIFICATION>
</TASK_HANDOFF>
```
