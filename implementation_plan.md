# TASK-R60: Post-Completion Access and Multi-Accessory Workflows

This plan describes the implementation to enable completion list navigation and multi-accessory list state logging.

## Proposed Changes

### React Plan View

#### [MODIFY] [PlanView.jsx](file:///C:/Users/wance/Documents/Git/workout-program/gymlog-react/src/components/PlanView.jsx)

- Locate the `activeIdx >= plannedExercises.length` completion block (around line 252).
- Render `<AccessoryBlock />` immediately below the completion container.
- Add a `📋 VIEW LIST` button next to `Complete Workout` inside the completion container that switches the view to `"full-list"` (`setView('full-list')`).

### React Accessory Block

#### [MODIFY] [AccessoryBlock.jsx](file:///C:/Users/wance/Documents/Git/workout-program/gymlog-react/src/components/AccessoryBlock.jsx)

- Replace the singular `selectedAccessory` state hook with an array state hook:
  `const [accessoriesList, setAccessoriesList] = useState([]);`
- Update `handleGenerate` to append the new group object to `accessoriesList`.
- Implement `handleSwapAccessory(index)` to generate a random replacement and swap the accessory at the specified index in the state array.
- Render UI:
  - If `accessoriesList.length === 0`, show the primary dashed button: `Got More in the Tank? +`.
  - If `accessoriesList.length > 0`, map through `accessoriesList` and render an `ExerciseCard` for each one with a `Swap Bonus` button.
  - Below the list, render a clean secondary button: `➕ Add Another Accessory` to append additional cards.

---

## Verification Plan

### Automated Tests
- Run `npm run build` in `/gymlog-react` to verify there are no compilation errors.

### Manual Verification
- Complete all exercises in the tracker.
- Verify the completion card displays the `📋 VIEW LIST` button and the `Got More in the Tank? +` accessory block below it.
- Click `📋 VIEW LIST` to navigate back to the exercise list, verify checkmarks can be reset, and return to tracker.
- Click `Got More in the Tank? +` on the completion card to generate a bonus exercise. Verify the card logs sets successfully.
- Verify a `➕ Add Another Accessory` button appears below the first card. Click it to add multiple sequential accessory exercises.
