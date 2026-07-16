# Audit Log R69

## Task R69 - Single-user submit button layout clipping fix
- Modified `gymlog-react/src/components/ExerciseCard.jsx`
- Located the active submit button inside the `SingleUserLogSection` subcomponent.
- Reduced the button text from `"LOG SET [Num]"` to `"+ SET [Num]"`.
- Applied the following inline styles to the button to prevent container overflow and text wrapping on narrow mobile screens:
  - `fontSize: '13px'`
  - `padding: '10px 4px'`
  - `whiteSpace: 'nowrap'`
  - `overflow: 'hidden'`
  - `textOverflow: 'ellipsis'`
