# Audit Log - TASK-R4b: PIN Caching (UX Fix)

## Objective
Cache validated User PINs in `localStorage` so the `window.prompt` only ever fires once per person per device.

## Changes Made
- Modified `gymlog-react/src/components/ExerciseCard.jsx`
- Modified `gymlog-react/src/components/CircuitView.jsx`

In both components, updated the PIN prompt logic during `handleLogSet`. Before prompting the user for their PIN, the application now checks `localStorage.getItem('gymlog_pin_' + personKey)`.
If a cached PIN is found, it is used silently. If no PIN is cached, the user is prompted, and the provided PIN is stored via `localStorage.setItem('gymlog_pin_' + personKey, pin)` for future use.

These changes eliminate the need for users to repeatedly enter their PIN on a trusted personal device.
