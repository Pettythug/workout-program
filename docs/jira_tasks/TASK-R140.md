# TASK-R140: Core AI Vision Engine & Single Machine Scanner (SettingsModal.jsx) — Phase 1 Tightening

- **Target Role:** `Sandbox_Developer` (`DENY(git checkout, git merge, git push)`)
- **Authorized Model Tier:** `MEDIUM_TIER` (`Gemini 3.8 Flash (High)` / `Claude Sonnet 4.6 (Thinking)`) or `HIGH_TIER` (`Gemini 4 Argon (High)` / `Gemini 3.8 Pro` / `Claude Opus 4.6 (Thinking)`)
- **STRICT MODEL GATEKEEPER CHECK (MANDATORY ON TURN 1):**
  - If your active model is in `LOW_TIER` (`Gemini 4 Argon (Low)`, `Gemini 3.8 Flash (Low)`):
    - **HALT IMMEDIATELY.** Do NOT edit files or run commands.
    - Output: `Model Alignment Error: Request Switch -> Expected MEDIUM_TIER or HIGH_TIER for feature development. Please switch to Gemini 3.8 Flash (High), Claude Sonnet 4.6 (Thinking), or Gemini 4 Argon (High).`
- **Target Branch:** `feat/epic-10-ai-equipment-scanner` (Unified Epic 10 branch for continuous Vercel preview testing)

---

## 1. Objective & Scope (Phase 1 Tightening)

Enhance and tighten the Phase 1 AI Equipment Scanner in `gymlog-react/src/utils/aiEquipmentScanner.js` and `gymlog-react/src/components/SettingsModal.jsx`:

1. **Auto-Detect `(Plate-Loaded)` Resistance Type:**
   - When plate horns/free weight plates are present on the machine, the AI must format the base name with **`(Plate-Loaded)`** (e.g. `Hammer Strength Iso-Lateral High Row (Plate-Loaded)`), matching the user's existing spreadsheet convention and preventing duplicate rows without the tag.
2. **Auto-Populate Columns F, G, H, I, J Metadata:**
   - Extract and populate:
     - **Column F (`manufacturer`):** e.g. `Hammer Strength`
     - **Column G (`modelSeries`):** e.g. `Iso-Lateral`
     - **Column H (`baseExercise`):** e.g. `High Row`
     - **Column I (`muscleGroups`):** e.g. `Latissimus Dorsi`
     - **Column J (`fileReference`):** photo filename or local reference
   - Pass all 5 metadata fields to `createExerciseMeta` in `SettingsModal.jsx` so Google Sheets columns F through J are filled automatically upon exercise creation.
3. **Layout & UI Tightening in `SettingsModal.jsx`:**
   - **Fix Button Clipping:** Wrap scanner action buttons (`📷 SCAN MACHINE WITH AI` and `🧪 Try Sample Photo`) using `flex-wrap: wrap` and fluid sizing so neither button overflows or clips on the right edge of the modal.
   - **Compact API Key Section:** Make the API key input collapsible by default (collapsed into a clean, subtle `⚙️ Configure Gemini API Key` toggle button) so it does not squish the drawer or consume excessive vertical height.
   - **Image Thumbnail Preview:** When an image (or sample preset) is loaded, display a neat thumbnail preview (48x48 rounded thumbnail) with a small `×` clear button so the user sees the photo being analyzed.
4. **Update `SAMPLE_MACHINE_PRESET`:**
   - Update `SAMPLE_MACHINE_PRESET` in `aiEquipmentScanner.js` to include `(Plate-Loaded)` in `baseName` along with `manufacturer: 'Hammer Strength'`, `modelSeries: 'Iso-Lateral'`, `baseExercise: 'High Row'`, `muscleGroups: 'Latissimus Dorsi'`, and `fileReference: '20260517_090721.jpg'`.

---

## 2. Implementation Steps

### Step 1: Update `gymlog-react/src/utils/aiEquipmentScanner.js`
1. Update vision prompt and JSON schema in `analyzeMachinePhotoWithAI`:
   - Prompt instructions:
     - Check resistance mechanism: if machine uses weight plates loaded onto horns, ensure `(Plate-Loaded)` is appended to `baseName` (e.g. `${brand} ${series} ${movement} (Plate-Loaded)`).
     - Extract `manufacturer` (e.g. `Hammer Strength`, `Matrix`, `Precor`).
     - Extract `modelSeries` (e.g. `Iso-Lateral`, `Select`, `MTS`).
     - Extract `baseExercise` (e.g. `High Row`, `Chest Press`, `Leg Extension`).
     - Extract `muscleGroups` (e.g. `Latissimus Dorsi`, `Pectorals`, `Quadriceps`).
     - Output JSON with: `{ baseName, category, variationOptions, manufacturer, modelSeries, baseExercise, muscleGroups, fileReference, detectedFeatures, confidence }`.
2. Update `SAMPLE_MACHINE_PRESET`:
   ```javascript
   export const SAMPLE_MACHINE_PRESET = {
       baseName: 'Hammer Strength Iso-Lateral High Row (Plate-Loaded)',
       category: 'Vertical Pull',
       location: '24 Hour Fitness',
       manufacturer: 'Hammer Strength',
       modelSeries: 'Iso-Lateral',
       baseExercise: 'High Row',
       muscleGroups: 'Latissimus Dorsi',
       fileReference: '20260517_090721.jpg',
       variationOptions: {
           barbell: false,
           dumbbell: false,
           band: false,
           cable: false,
           single: true,
           alt: true,
           overhand: true,
           underhand: true,
           neutral: true
       },
       detectedFeatures: ['Plate-Loaded horns', 'Dual independent pivot arms', 'Multi-grip handles (Overhand, Neutral)']
   };
   ```

### Step 2: Update `gymlog-react/src/components/SettingsModal.jsx`
1. Add state for the metadata fields:
   - `const [exManufacturer, setExManufacturer] = useState('');`
   - `const [exModelSeries, setExModelSeries] = useState('');`
   - `const [exBaseExercise, setExBaseExercise] = useState('');`
   - `const [exMuscleGroups, setExMuscleGroups] = useState('');`
   - `const [exFileReference, setExFileReference] = useState('');`
   - `const [exPhotoPreview, setExPhotoPreview] = useState(null);`
2. In `applyScanResult(result)`:
   - Set all metadata states from `result.manufacturer`, `result.modelSeries`, `result.baseExercise`, `result.muscleGroups`, `result.fileReference`.
   - Set `exPhotoPreview(result.photoPreview || result.fileReference)`.
3. In `handleCreateExercise`:
   - Pass `manufacturer: exManufacturer`, `modelSeries: exModelSeries`, `baseExercise: exBaseExercise`, `muscleGroups: exMuscleGroups`, `fileReference: exFileReference` into `createExerciseMeta(...)`!
   - Reset metadata states upon successful creation.
4. Layout Refinements:
   - Ensure the API key box is hidden behind a clean toggle by default if a key exists (or subtle accordion).
   - Display buttons with `flex-wrap: wrap; gap: 8px; width: 100%;` so neither button overflows.
   - If `exPhotoPreview` exists, render a thumbnail badge showing the photo and a `✕` to clear.

### Step 3: Automated Verification Suite (`gymlog-react/test_task_r140.cjs`)
1. Update `test_task_r140.cjs` to verify:
   - `SAMPLE_MACHINE_PRESET` includes `(Plate-Loaded)` and all columns F-J metadata.
   - `SettingsModal.jsx` binds and passes `manufacturer`, `modelSeries`, `baseExercise`, `muscleGroups`, `fileReference` to `createExerciseMeta`.
   - Action buttons contain proper wrapping/no-overflow styles.
2. Run `cd gymlog-react && node test_task_r140.cjs` and `cd gymlog-react && cmd /c npm run build` and ensure both pass with `EXIT_CODE: 0`.

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
