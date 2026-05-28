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
- [x] Save Feedback: Add visual UI feedback confirming when a set has been successfully saved in the circuit trainer.
- [x] Multi-Set Counter & Done Button: Implement sequential set logging (Log 1, Log 2...) and a separate "DONE" button to mark the machine complete, matching the standard Plan/Lift card behavior.
- [x] Resolute UI State: Only shade cards green/skipped and collapse them after receiving a successful API response from Sheets (no optimistic UI state changes).
- [x] Intermittent Log Failure Bug: Troubleshoot and fix the false failure message that claims logging failed when the set actually logged successfully.
- [x] Shaded State Retention: Keep completed exercises in place and shade them green, rather than sorting them to the bottom, to preserve circuit order and readability.

### Group 8: Circuit Trainer History & Deletion (Medium Difficulty)
*Recommended Model: Gemini 3.1 Pro (High) or Flash*
- [x] Remove Card-Level Set Undo: Remove the local set-level "UNDO" button to prevent state mismatch with the spreadsheet database.
- [x] Instant History Update: Append newly logged sets to the local history state immediately upon successful sheetsPost resolution so they show up in the history list without reloading.
- [x] History Deletion UI & Integration: Add delete buttons to the card's history drawer entries, prompting for the Admin PIN and sending the deleteHistory API request.
- [x] Sync Session Sets on Delete: When a session set is deleted from the history list, automatically remove it from the card's completed sets array to keep the counts aligned.

### Group 9: Circuit Trainer Logging Pin Prompt Fix (Low Difficulty)
*Recommended Model: Gemini Flash or 3.1 Pro (Low)*
- [x] Fix Logging PIN Prompt: Remove the admin PIN prompt from the standard set logging action in the Circuit Trainer by removing the dynamic call to requireAdminPin for non-destructive actions.

### Group 10: Circuit Trainer Usability & Logging Polish (Medium Difficulty)
*Recommended Model: Gemini Flash or 3.1 Pro (Low)*
- [x] Fix False Failure on Set Log: Resolve the intermittent false failure alert that prevents the UI from updating/syncing and leads to double-logging or out-of-order set logging.
- [x] Category Tag Visibility: Adjust .category-tag text color to use ar(--accent) (orange) instead of ar(--muted) (gray) for better legibility.
- [x] Clear Notes After Logging: Automatically clear note input state after a set is successfully logged.
- [x] Single/Alternate Quick Toggles: Add "Single Leg" and "Alternating" checkbox toggles under the note input to quickly update the note text.
- [x] Show Notes in History List: Display the logged note under each entry in the card's history list.

Let me know if you need any other details on this.











