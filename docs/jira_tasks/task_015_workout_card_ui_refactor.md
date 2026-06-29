# TASK-015: WorkoutCard UI/UX Refactor & Image Button Merge
- **Required Model Tier**: Gemini 3.5 High / Claude Sonnet

## Objective:
Clean up the cluttered utility button section at the bottom of the WorkoutCard and merge the redundant Image viewing and uploading workflows into a single, cohesive UX.

## Brutal UI/UX Analysis:
1. The `UPLOAD IMAGE` button was tacked onto the bottom left like an afterthought. It breaks the grid and looks like a hack.
2. Having two separate buttons (`IMAGE` to view, `UPLOAD IMAGE` to add) is poor UX. It forces the user to think about the system's state rather than just interacting with the concept of an "Image."
3. The row of four buttons (`RENAME`, `CATEGORY`, `LOCATION`, `ADD TO CIRCUIT`) is cramped. The text is too small and fades into the background.

## Required Changes:
1. **Delete the standalone `UPLOAD IMAGE` button** from the bottom of the card.
2. **Refactor the `IMAGE` button logic:**
   - When clicked, open the `ImageModal`.
   - Inside the `ImageModal`, if no image exists, display the "Upload Image" input/workflow directly in the modal.
   - If an image *does* exist, display the image, but add a clear "Replace Image" or "Update Image" button within the modal.
3. **Clean up the grid:** Ensure all utility buttons in the admin section use a consistent CSS grid or flex layout so they don't look haphazardly stacked.

## Verification:
- Build the app (`npm run build`).
- Verify that clicking the "IMAGE" button allows a user to both view and upload an image depending on the state.
