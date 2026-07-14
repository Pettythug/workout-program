# TASK-R62: Persist Bonus Accessories Session State

This plan describes the implementation to lift and persist `accessoriesList` state in `PlanView.jsx` to prevent state loss on view toggles.

## Proposed Changes

### React Plan View

#### [MODIFY] [PlanView.jsx](file:///C:/Users/wance/Documents/Git/workout-program/gymlog-react/src/components/PlanView.jsx)

- Lift the state from `AccessoryBlock` and initialize it from/persist it to `localStorage`:
  ```javascript
  const [accessoriesList, setAccessoriesList] = useState(() => {
      try {
          const saved = localStorage.getItem('gymlog_session_accessories');
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          return [];
      }
  });

  useEffect(() => {
      localStorage.setItem('gymlog_session_accessories', JSON.stringify(accessoriesList));
  }, [accessoriesList]);
  ```
- Clear `gymlog_session_accessories` inside `completeWorkout()`:
  ```javascript
  localStorage.removeItem('gymlog_session_accessories');
  setAccessoriesList([]);
  ```
- Pass `accessoriesList`, `setAccessoriesList`, and `excludeNames={plannedExercises.map(e => e.baseName)}` props to all `<AccessoryBlock />` render elements.

---

## Verification Plan

### Automated Tests
- Run `npm run build` in `/gymlog-react` to verify there are no compilation errors.

### Manual Verification
- Verify that added accessories do not disappear when switching to "View List" and back.
