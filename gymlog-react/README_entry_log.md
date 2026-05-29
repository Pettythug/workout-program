Hey there! This log tracks the files and current status for the new React migration project.
Files & Current Status:
* package.json -> Core project dependencies and scripts.
* vite.config.js -> Vite bundler configuration.
* src/main.jsx -> React entrypoint.
* src/index.css -> Holds the global design tokens, root variables, and standard utility classes (buttons, cards) ported from the legacy app.
* src/App.jsx -> Main app component, now configured with React Router to provide navigation between Plan and Lift views, and wrapped in the AppProvider for global state.
* src/components/PlanView.jsx -> Fully implemented Plan screen component that renders the daily workout plan layout using legacy builder logic. Displays exercise planner cards, integrates the persistent history drawer, and consumes global states via AppContext for seamless interaction. Supports daily exercise swaps by resolving user overrides and passing category-specific alternatives down to exercise cards. Now renders the AccessoryBlock generator at the bottom of the list.
* src/components/AccessoryBlock.jsx -> Random bonus accessory exercise generator. Features a button to pick a random exercise from the 'Accessory' category when users want to do extra work, and allows swapping it for another random accessory.
* src/components/LiftView.jsx -> Main orchestrator component for the Lift screen. Manages global state consumption, filter logic (search, category, location), and renders sub-components.
* src/components/ExerciseCard.jsx -> Standalone component rendering individual exercise cards. Handles UI variations (Standard, Single, Alternating), set logging inputs, displays recent history, and supports swapping exercises via a dropdown or custom text input. Now consumes completion status and includes DONE/SKIP buttons to instantly shade cards.
* src/components/SettingsModal.jsx -> Modal component for global application settings (adding people/locations, editing the API sync URL).
* src/components/HelpDrawer.jsx -> Drawer component containing usage guidelines and instructions.
* react-router-dom -> Installed to handle client-side routing.
* src/hooks/useGymAPI.js -> React custom hook port of the core Google Apps Script API integration logic.
* src/context/AppContext.jsx -> React Context provider managing global application state (workout day, people roster, active people, exercises, loading status). Implements cache-first instant loading via localStorage and background sync on mount. Local state modifiers utilize write-through caching to persist updates. Includes exercise completion tracking (done/skipped), daily exercise swaps state management, and instant local history updates.
* src/context/dataMerge.js -> Helper function (ported from legacy gym-core.js mergeFromSheets) that combines locally cached config with the historical and personal record data fetched in the background from Google Sheets.
