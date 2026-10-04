# TASK-R101-GUEST-FIX: Restore Logging Input Fields in Guest Sandbox Mode

## 1. Defect Summary
During QA verification of Test Case 4 (Guest Sandbox Mode), when `deviceOwner === 'Guest'`, `ExerciseCard.jsx` and `CircuitCard.jsx` rendered the card header and the green `LOG SET 1` button, but completely omitted the input fields (Reps, Weight, Notes) for logging sets.

## 2. Root Cause Analysis
In `ExerciseCard.jsx` and `CircuitCard.jsx`, the input fields are rendered by checking `activePeople.length === 1` or mapping over `activePeople`:
```jsx
{activePeople.length === 1 ? (
    <SingleUserLogSection person={activePeople[0]} ... />
) : (
    activePeople.map(person => (
        <MultiUserPersonLogSection key={person} person={person} ... />
    ))
)}
```
When `deviceOwner === 'Guest'`, `AppContext.jsx` set `activePeople` to `[]` (empty array) because `'Guest'` was not an item in the permanent registered user roster. This caused `activePeople.length === 1` to evaluate to `false`, and `activePeople.map(...)` mapped over an empty array, rendering 0 input rows.

## 3. Required Changes in `gymlog-react/src/context/AppContext.jsx`

1. **Initial State (`activePeople`)**:
   ```javascript
   const [activePeople, setActivePeople] = useState(() => {
       const cached = localStorage.getItem('gymlog_activePeople');
       const parsed = cached ? JSON.parse(cached) : [];
       if (parsed.length > 0) return [...new Set(parsed)];
       const owner = localStorage.getItem('builder_primary_user');
       return (owner && owner !== 'Guest') ? [owner] : (owner === 'Guest' ? ['Guest'] : []);
   });
   ```

2. **In `updateDeviceOwner(newOwner)`**:
   ```javascript
   const defaultActive = (newOwner && newOwner !== 'Guest') ? [newOwner] : (newOwner === 'Guest' ? ['Guest'] : []);
   setActivePeople(defaultActive);
   localStorage.setItem('gymlog_activePeople', JSON.stringify(defaultActive));
   ```

3. **In `completeWorkoutBatch` and Daily Reset Effect**:
   Ensure fallback to `['Guest']` if `deviceOwner === 'Guest'`:
   ```javascript
   const soloOwner = (deviceOwner && deviceOwner !== 'Guest') ? [deviceOwner] : (deviceOwner === 'Guest' ? ['Guest'] : []);
   setActivePeople(soloOwner);
   localStorage.setItem('gymlog_activePeople', JSON.stringify(soloOwner));
   ```

4. **In `contextValue`**:
   Compute `effectiveActivePeople`:
   ```javascript
   const effectiveActivePeople = (activePeople.length === 0 && deviceOwner === 'Guest')
       ? ['Guest']
       : [...new Set(activePeople)].filter(p => p === 'Guest' || people.includes(p));
   ```
   Provide `activePeople: effectiveActivePeople` in `contextValue`.

## 4. Verification Requirements
1. Run `npm.cmd run build` inside `gymlog-react/` to verify clean build (0 syntax errors).
2. Run `npx.cmd eslint src/` to ensure no lint regressions.
3. Test that entering Guest Mode displays the single-user logging input row with Reps, Weight, Notes, and the `LOG SET 1` button.
