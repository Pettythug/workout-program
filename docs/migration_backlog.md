Here is the backlog of Epics and stories we need to tackle to get the React app at 100% parity with our live production code.

Epic 1: Plan View Parity & Features
- [ ] Story 1.1: Standardize the header, info bar, and layout styling so it matches gymlog-ultimate.html perfectly.
- [ ] Story 1.2: Add location-based exercise filtering. Right now, both the main plan selection and the accessory generator suggest exercises regardless of location. We need to respect the active location.
- [ ] Story 1.3: Expand the exercise swapping mechanism. We need to support custom swaps and make sure swapping an exercise writes categories correctly back to sheets.
- [ ] Story 1.4: Port the "+ Add new category" UI and backend sheetsPost sync from the legacy codebase.
- [x] Story 1.5: Move the locations list and active location states to AppContext.jsx so they're globally accessible.
- [x] Story 1.6: Render the location select dropdown in the Plan header and filter planner exercise picks and accessory generation by the active location.
- [x] Story 1.7: Add the Settings (⚙️) and Help (❓) buttons to Plan and Circuit headers so modals/drawers can be opened from any view.

Epic 2: Circuit Trainer Alignment & Polish
- [x] Story 2.1: Complete the history drawer and inline deletion UI, ensuring it prompts for the Admin PIN (5050) and calls deleteHistory.
- [x] Story 2.2: Add set saving feedback to the UI (e.g. toast notifications or saving state indicators) and implement the Resolute UI state where cards only collapse/color-change after a successful sheet response.
- [x] Story 2.3: Port the single/alternate quick toggles and notes behavior (clear notes after saving, category tag accent color, and note inclusion in history list).
- [x] Story 2.4: Clean up double-logging risks and resolve false logging failure error alerts.

Epic 3: Quality Assurance & Production Prep
- [ ] Story 3.1: Audit React state across input rows to verify we have zero loss of active focus or typed values during background operations.
- [ ] Story 3.2: Verify final build compilation and run a manual device viewport sweep to ensure mobile parity.
- [x] Story 3.3: Implement checkboxes in SettingsModal to toggle active people, syncing to local storage keys and backend sheets.
- [x] Story 3.4: Implement the Device Owner selection dropdown in SettingsModal to set the builder_primary_user.

Epic 4: UI/UX Polish (Low-Hanging Fruit)
- [x] Story 4.1: Fix Exercise Card button alignment. The Swap Exercise and Image buttons are currently misaligned on mobile and sit slightly outside the card border.
- [ ] Story 4.2: Fix Circuit Generator filtering. The `startFullBodyCircuit` and `startMimicCircuit` functions in `CircuitView.jsx` are currently pulling from the global `exercises` array instead of using `getCircuitEligibleExercises()`, causing non-circuit machines to be suggested.

---

### Active Ticket: Epic 4 / Story 4.1: Fix Exercise Card Button Alignment

**Recommended Model:** Gemini 3.5 Flash (Low or Medium)

**Description**
The "Swap Exercise" and "Image" buttons on the Exercise Card are misaligned on mobile viewports. The image button sits slightly outside the exercise card border. We need to apply clean CSS fixes to ensure these action buttons are neatly contained and aligned within the card's bounding box.

**Tasks**
1. Audit the `ExerciseCard.jsx` and/or `index.css` files to locate the container holding these buttons.
2. Fix the flexbox, margin, or padding values so they do not overflow the card.
3. Verify the fix looks good on mobile viewports.

