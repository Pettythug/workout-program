# Audit Log - TASK-R61: Lightweight Duplicate Filter for Bonus Accessories

## Overview of Changes

### 1. Component Props & State Persistence Setup
In `gymlog-react/src/components/AccessoryBlock.jsx`:
- Updated component signature to accept props `excludeNames = []`, `accessoriesList`, and `setAccessoriesList` from the parent.
- Removed local `useState` hook for `accessoriesList` to support parent-delegated state persistence.

### 2. Lightweight 10-Retry Duplicate Filter
In both `handleAddAccessory` and `handleSwapAccessory` methods:
- Implemented a 10-retry loop filtering out candidate exercises whose base name (with qualifiers like `(Single)`, `(Alt)`, `(DB)`, `(Cable)` stripped) matches any base name present in `excludeNames` (the planned workout exercises) or `accessoriesList` (the already generated bonus accessories).
- Added a fallback selection to pick any random candidate if no unique exercise is found after 10 attempts.
