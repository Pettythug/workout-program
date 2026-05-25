# Standard Operating Procedure: Gym Log Architecture (Ultimate Edition)

## 1. Purpose and Scope
This document outlines the standard architecture, state management, and rendering pipelines for the Gym Log Ultimate application. It serves as a technical reference for developers, engineers, and maintainers interacting with the codebase. 

## 2. Architectural Overview
The Gym Log Ultimate application currently operates on a hybrid architecture within a single HTML file (gymlog-ultimate.html). This design choice minimizes external dependencies while allowing for complex, state-driven UI interactions.

The codebase is strictly divided into two distinct rendering zones:

### 2.1 Zone 1: Vanilla JavaScript (Plan Tab)
- Scope: Handles the daily workout "PLAN" tab, including exercise rendering, personal best calculations, and set logging interactions.
- Rendering Paradigm: Direct DOM manipulation. Instead of re-rendering the entire view on every state change, the application modifies specific DOM elements to update state without losing focus or scroll position on collapsible elements.
- State Management: Utilizes a global AppState object to track workout, people, maxes, setCounters, and UI states.

### 2.2 Zone 2: React + Babel (Lift Tab)
- Scope: Handles the "LIFT" tab, serving as the master database viewer for all configured exercises, variations, and history.
- Rendering Paradigm: React Virtual DOM. The UI is built using functional React components rendered in the browser via standalone Babel.
- State Management: Uses React's native useState and useEffect hooks for local state management, ensuring rapid filtering and dynamic updates across the comprehensive exercise catalog.

## 3. Core Developer Workflows

### 3.1 State Retention Protocol
When updating the "PLAN" tab UI, developers must never perform wholesale innerHTML overwrites on parent containers if user input fields are active. 
1. Use saveTempInputs() before partial re-renders to cache current user inputs.
2. Use restoreTempInputs() immediately after re-rendering to re-populate the inputs.
3. For simple toggles (e.g., expanding/collapsing a row), manipulate CSS properties directly.

### 3.2 Max Highlighting (Target Lock)
The application dynamically highlights the specific rep range targeting the user's current workout day.
- Implementation: The fullMaxString generator compares the rangeKey with the workout's activeRange. Matches are injected with an inline style for the application's accent color (var(--accent)).
- Maintenance: Any new rep ranges added to REP_RANGES must be strictly mapped inside fullMaxString and logSet() to ensure UI parity.

## 4. Promotion to Production Rules
As outlined in Global Rule 1, this file is the definitive production target. Any beta variations must be tested and fully approved before manually migrating code into gymlog-ultimate.html. Cross-pollination between beta architectures and production files without explicit approval is strictly prohibited.
