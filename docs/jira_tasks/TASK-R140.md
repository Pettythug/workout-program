# TASK-R140: Core AI Vision Engine & Single Machine Scanner (SettingsModal.jsx)

- **Target Role:** `Sandbox_Developer` (`DENY(git checkout, git merge, git push)`)
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash (High)` / `Claude Sonnet 4.6 (Thinking)`) or `HIGH_TIER` (`Gemini 4 Argon (High)` / `Gemini 3.8 Pro` / `Claude Opus 4.6 (Thinking)`)
- **STRICT MODEL GATEKEEPER CHECK (MANDATORY ON TURN 1):**
  - If your active model is in `LOW_TIER` (`Gemini 4 Argon (Low)`, `Gemini 3.8 Flash (Low)`):
    - **HALT IMMEDIATELY.** Do NOT edit files or run commands.
    - Output: `Model Alignment Error: Request Switch -> Expected MEDIUM_TIER or HIGH_TIER for feature development. Please switch to Gemini 3.8 Flash (High), Claude Sonnet 4.6 (Thinking), or Gemini 4 Argon (High).`
- **Target Branch:** `feat/epic-10-ai-equipment-scanner` (Unified Epic 10 branch for continuous Vercel preview testing)

---

## 1. Objective & Scope (Phase 1 of Epic 10)

Implement **Phase 1 of Epic 10**: Embed a simple, clean **`📷 SCAN MACHINE WITH AI`** button directly inside **Settings ⚙️ → CREATE EXERCISE** in `SettingsModal.jsx` using the reusable AI vision service `gymlog-react/src/utils/aiEquipmentScanner.js`.

### Strict Boundaries:
- **NO new pages, NO separate cockpits, NO test queue dashboards.**
- **NO modification of existing workout card execution flows** (`PlanView.jsx`, `FullBodyView.jsx`, `CircuitView.jsx`, `LiftView.jsx`, `ExerciseCard.jsx`, `WarmUpCard.jsx`, `AppContext.jsx`).
- The AI prompt **MUST strictly map only to the app's real canonical categories**:
  `['Horizontal Push', 'Vertical Push', 'Horizontal Pull', 'Vertical Pull', 'Knee Dominant', 'Hip Dominant', 'Plank Core', 'Rotational Core', 'Explosive']` (plus any custom categories already present in `uniqueCategories`).
- Upon scanning, the AI simply **pre-fills the existing form fields** in `SettingsModal.jsx`:
  - `exName` (Base Name, e.g. `Hammer Strength Iso-Lateral High Row`)
  - `exCategory` (selected from `uniqueCategories`)
  - `exLocation` (defaults to current `activeLocation` or `exLocation`)
  - `variationOptions` (checks the detected handle/equipment boxes in `VariationGeneratorPanel`: `overhand`, `underhand`, `neutral`, `single`, `alt`, `cable`, `dumbbell`, `barbell`, `band`)
- The user can review the pre-filled fields and click the existing **`SAVE EXERCISE`** button.

---

## 2. Implementation Steps

### Step 1: Create `gymlog-react/src/utils/aiEquipmentScanner.js`
1. Export `CANONICAL_APP_CATEGORIES`:
   ```javascript
   export const CANONICAL_APP_CATEGORIES = [
       'Horizontal Push',
       'Vertical Push',
       'Horizontal Pull',
       'Vertical Pull',
       'Knee Dominant',
       'Hip Dominant',
       'Plank Core',
       'Rotational Core',
       'Explosive'
   ];
   ```
2. Implement `compressImageFileToDataUrl(file, maxDimension = 1024, quality = 0.72)`:
   - Reads image File or Blob.
   - Proportional canvas resize to at most `maxDimension` px.
   - Returns `{ dataUrl, base64Data, mimeType: 'image/jpeg', sizeKB }`.
3. Implement `analyzeMachinePhotoWithAI({ imageBase64, mimeType, apiKey, model = 'gemini-2.5-flash', availableCategories = [] })`:
   - Fallback/default model: `gemini-2.5-flash` with support for `gemini-3.8-flash` / `gemini-1.5-flash`.
   - Combines `CANONICAL_APP_CATEGORIES` with `availableCategories`.
   - Sends prompt instructing Gemini to inspect the gym machine frame, handles, and instructional placard:
     - Identify `baseName` (clean, title case, e.g. `Hammer Strength High Row`).
     - Map `category` strictly to the provided category list.
     - Detect `variationOptions`: boolean flags for `overhand`, `underhand`, `neutral`, `single`, `alt`, `cable`, `dumbbell`, `barbell`, `band`.
     - Output JSON with keys: `{ baseName, category, variationOptions, detectedFeatures, confidence }`.
   - Parses and safely normalizes the JSON response.
4. Export rich sample preset `SAMPLE_MACHINE_PRESET`:
   - For 1-click desktop localhost testing when no physical gym machine photo is handy.

### Step 2: Update `gymlog-react/src/components/SettingsModal.jsx`
1. **AI Key Configuration in Settings:**
   - In Settings (under an "AI Machine Scanner" section or directly inside the CREATE EXERCISE panel):
     - Password input for `Gemini API Key` saved to `localStorage.setItem('gymlog_gemini_api_key', key)`.
     - Helper link: `Get Free API Key (Google AI Studio)` linking to `https://aistudio.google.com/apikey` (`target="_blank"`).
2. **In `CREATE EXERCISE` Tab:**
   - Above the Exercise Name input:
     - Render a clean **`📷 SCAN MACHINE WITH AI`** button (`btn-accent`) with a subtle camera icon.
     - Hidden `<input type="file" accept="image/*" capture="environment" />` ref-triggered by the button.
     - A small **`🧪 Try Sample Photo`** test button for instant 1-click testing on desktop localhost.
   - When photo is selected:
     - Show loading state: `🔍 Analyzing machine placard & handles with AI...`
     - On completion:
       - Set `exName(result.baseName)`
       - Set `exCategory(result.category)`
       - Set `exLocation(activeLocation || 'Anywhere')`
       - Update `variationOptions(result.variationOptions)`
       - Show success toast/banner: `✓ Machine scanned! Review details and variations below.`
   - User reviews the auto-populated inputs and existing `VariationGeneratorPanel` checklist, and taps existing `SAVE EXERCISE`.

### Step 3: Automated Verification Suite (`gymlog-react/test_task_r140.cjs`)
1. Create `gymlog-react/test_task_r140.cjs` to test:
   - Canonical category mapping validation (rejects invalid categories like "Squat", "Hinge", "Biceps", "Triceps").
   - Variation option boolean mapping to `buildVariationNames`.
   - Canvas image compression helper.
   - `SettingsModal.jsx` integration and presence of `📷 SCAN MACHINE` button and API key setup.
2. Run `cd gymlog-react && node test_task_r140.cjs` and `cd gymlog-react && cmd /c npm run build` and verify `EXIT_CODE: 0`.

---

## 3. Submission Protocol for Sandbox Developer
Output your completion signal inside a fenced XML block:
```xml
<TASK_HANDOFF>
  <SIGNAL>DEVELOPMENT_TASK_COMPLETE</SIGNAL>
  <TASK_ID>TASK-R140</TASK_ID>
  <BRANCH>feat/epic-10-ai-equipment-scanner</BRANCH>
  <BUILD_VERIFICATION>PASS</BUILD_VERIFICATION>
  <TEST_VERIFICATION>PASS</TEST_VERIFICATION>
</TASK_HANDOFF>
```
