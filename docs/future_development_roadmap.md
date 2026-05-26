Hey there,

Here is a quick look at where we stand with the GymLog ecosystem and what is left on the radar for future development.

Right now, we have successfully aligned all the standalone pro logging and builder apps with the main master SPA. The styling, settings modals, Done/Skip logic, settings gears, and recent history drawers are fully synced. Everything is currently sitting in the src folder as release candidates ready to overwrite the root production files when we want to do the final deployment.

## Prioritized Roadmap & Model Assignments

Below is the execution plan ordered from lowest to highest difficulty, indicating the recommended Gemini model to use for each step.

### Group 1: UI Polish & Formatting (Low Difficulty)
*Recommended Model: Gemini Flash or 3.1 Pro (Low)*
- [x] UI Alignments: Adjust the card history drawer layout to match the session log style.
- [x] UI Alignments: Clean up button labels and borders.
- [x] UI Alignments: Verify mobile layout headers.

### Group 2: Basic Persistence & Security (Low-Medium Difficulty)
*Recommended Model: Gemini 3.1 Pro (Low)*
- [x] Category Persistence: Make the "+ Add new category" UI write changes permanently to Google Sheets.
- [x] Admin Permissions: Admin PIN code locking for destructive actions (e.g., deleting history or editing categories).

### Group 3: Domain Logic Adjustments (Medium Difficulty)
*Recommended Model: Gemini 3.1 Pro (High)*
- [x] Explosive Category Overhaul: Alternate 1-3 power and 1-5 volume ranges, suppressing standard ranges.

### Group 4: Complex Data Management & Concurrency (High Difficulty)
*Recommended Model: Gemini 3.1 Pro (High)*
- [x] Global Exercise Rename/Merge: Atomic multi-tab renames with duplicate detection on the backend.
- [x] Sync Safety: Address concurrent device write conflicts.

### Group 5: Major Feature Development (High Difficulty)
*Recommended Model: Gemini 3.1 Pro (High)*
- [x] Circuit Training Mode: Develop the Custom sequential deck tracker.
- [x] Circuit Training Mode: Develop the Auto-Circuit planner.

### Group 5A: Circuit App Polish & Parity Sync (Medium Difficulty)
*Recommended Model: Gemini 3.1 Pro (High)*
- [x] Rep-Range Edge Visualization: Redesign the machine-max UI block to display all available historical maxes side-by-side (1-3 Max, 4-7 Max, 8-12 Max, 13+ Max) for complete edge progression visibility.
- [x] Code Cleanup: Audit `circuit-training-pro-beta.html` line-by-line, abstract inline styles to CSS, and consolidate redundant mapping.
- [x] Feature Parity: Standardize and sync the custom exercise creation, variation toggling/max recalculation, and inline history viewer back to the standard GymLog beta (`gymlog-variation-beta.html`).

### Group 6: End-to-End Verification & Optimization Audit (Low Difficulty)
*Recommended Model: Gemini Flash or 3.1 Pro (Low)*
- [x] Code Quality Audit: Review all code changes in `gymlog-variation-beta.html` and App Script to ensure no syntax errors or resource leaks.
- [x] Browser E2E Test: Run manual browser tests on both desktop and mobile viewports to verify UI alignment parity.
- [x] Admin PIN Validation: Verify that cancelling the Admin PIN prompt or entering an incorrect PIN properly blocks destructive actions on both frontend and backend.
- [x] Sheets Sync Verification: Verify that new categories and skipped/logged sets successfully write back to Google Sheets.
- [x] Explosive Category Test: Verify that changing the workout number correctly toggles the target range between "1-3" and "1-5" on Explosive exercises, and hides standard ranges.


### Group 7: Circuit Trainer Refinements & Fixes (Medium Difficulty)
*Recommended Model: Gemini 3.1 Pro (High) or Flash*
- [ ] Save Feedback: Add visual UI feedback confirming when a set has been successfully saved in the circuit trainer.
- [ ] Multi-Set Counter: Count up and display multiple logged sets (e.g., Log 1, Log 2, Log 3) on the same machine to support extra sets or series of circuits.
- [ ] Intermittent Log Failure Bug: Troubleshoot and fix the false failure message that claims logging failed when the set actually logged successfully.
- [ ] Shaded State Retention: Keep completed exercises in place and shade them green, rather than sorting them to the bottom, to preserve circuit order and readability.

Let me know if you need any other details on this.

