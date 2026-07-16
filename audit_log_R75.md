# Audit Log – TASK-R75: Filter Deleted Exercises from Persisted Accessory List

**Date:** 2026-07-16  
**Branch:** `TASK-R75`  
**Role:** Sandbox Developer  
**Model Tier:** MEDIUM_TIER (Claude Sonnet 4.6 Thinking)

---

## Summary

Removed the stale-item fallback in the `resolvedAccessories` `useMemo` block inside
`gymlog-react/src/components/PlanView.jsx`.

## Root Cause

When an exercise is deleted from the Google Sheets exercise database, the old persisted
accessory entry (stored in `accessoriesList`) would still pass through the `.map()` unchanged
because of the `|| item` fallback on the lookup result. After a page refresh the exercise
no longer exists in `groupedExercises`, but the raw `item` object (or name string) was
returned anyway, causing a stale entry to appear in the accessory bonus section.

## Change Made

| File | Line | Before | After |
|---|---|---|---|
| `gymlog-react/src/components/PlanView.jsx` | 126 | `return groupedExercises[baseKey] \|\| item;` | `return groupedExercises[baseKey] \|\| null;` |

## Impact

- If `groupedExercises[baseKey]` is `undefined` (exercise deleted from sheet), the
  mapping now returns `null` instead of the stale item.
- The existing `.filter(Boolean)` call on line 127 strips `null` values, so the
  deleted exercise is silently removed from the rendered accessory list.
- No other code paths are affected; only the `resolvedAccessories` memo output changes.

## Risk Assessment

**Low.** The change is a one-character substitution with no new logic introduced.
The `.filter(Boolean)` guard already handled `null` returns from earlier in the same
`.map()` callback (see `if (!baseName) return null;` on line 124), confirming this
pattern was already in use and intentional.

## Build Verification

`npm run build` completed successfully in 1.64s with no errors or warnings.
- 40 modules transformed
- Output: `dist/assets/index-DX_oP_1p.js` (347.06 kB, gzip: 99.38 kB)
