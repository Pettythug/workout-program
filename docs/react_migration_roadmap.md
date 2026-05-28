# Architecture Roadmap: React Migration

## The "Why" (Technical Debt)
- **Monolithic Architecture**: The large monolith file creates significant maintenance overhead and increases the risk of regressions.
- **Performance Drag**: Running Babel directly in the mobile browser to compile the Lift view creates noticeable load delays. 
- **State Complexity**: Utilizing DOM manipulation for state management (Plan view) causes edge cases requiring workarounds like saveTempInputs() and restoreTempInputs().

## The "How" (React vs Modular Vanilla)
- **Modular Vanilla**: Splits the app into ES6 modules. While solving file size, it fails to address the underlying state management complexity.
- **Full React SPA (Selected Path)**: Moving entirely to a Vite-based React SPA provides strict state management via hooks, fast build processes (no in-browser Babel), and modular component architecture.

## The "What" (Jira Breakdowns)

### Epic 1: Project Setup & Modernization
- [x] **Story 1.1**: Initialize Vite + React project in a new subfolder (gymlog-react) with standard folder structure (src/components, src/hooks, etc.).
- **Story 1.2**: Configure CSS Modules or global styles to port over the existing gym-core.css and custom UI tokens.
- **Story 1.3**: Set up React Router for navigation between the "PLAN" and "LIFT" tabs.

### Epic 2: Core Data & State Migration
- **Story 2.1**: Port Combined_AppScript_v2.gs integration logic into a dedicated React custom hook or context provider (useGymAPI).
- **Story 2.2**: Migrate global AppState (workout day, people, maxes, active person) into React Context or Zustand for global availability.
- **Story 2.3**: Implement caching and payload tunneling strategies in the new data layer to maintain the single source of truth.

### Epic 3: Lift View Migration (React to Vite/React)
- **Story 3.1**: Extract existing React components (from gymlog-ultimate.html Zone 2) into standalone .jsx files.
- **Story 3.2**: Remove in-browser Babel dependencies and replace with Vite build steps.
- **Story 3.3**: Refactor state props and inline functions to use the new global React Context data layer.

### Epic 4: Plan View Migration (Vanilla JS to React)
- **Story 4.1**: Rebuild the "PLAN" view layout and history drawer as React components.
- **Story 4.2**: Convert DOM-based inline editing and saveTempInputs() workaround into controlled React inputs.
- **Story 4.3**: Port the "Target Lock" max logic (fullMaxString) into a custom React hook that automatically highlights ranges.
- **Story 4.4**: Implement the "Add New Category" and multi-user sync features using the unified data layer.


