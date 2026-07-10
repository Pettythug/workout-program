# Audit Log: TASK-R41

## Auto-Reset Skipped/Done Statuses and Daily Swaps on New Day

1. **`gymlog-react/src/context/AppContext.jsx`**:
   - Added logic to `useEffect` initial load hook to retrieve `gymlog_lastActiveDate` from `localStorage` and compare it to today's date (`new Date().toDateString()`).
   - If `lastActiveDate` is present and does not match today's date, `localStorage` entries for `gymlog_exerciseStatus` and `gymlog_dailySwaps` are set to empty JSON objects.
   - Clears corresponding React state values `exerciseStatus` and `dailySwaps` to `{}`.
   - Updates `gymlog_lastActiveDate` in `localStorage` to today's date.
