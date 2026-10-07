# TASK-R112: Fix Core Movement 4-Day Rotation Bug
**Status:** In Progress
**Assignee:** Sandbox_Developer
**Objective:** Fix the rotation logic in FullBodyView.jsx and PlanView.jsx so that Core exercises properly cycle through their entire arrays without skipping indices or repeating back-to-back.

## Analysis
- **FullBodyView.jsx**: The workout alternatingly selects Plank Core on odd days and Rotational Core on even days. However, the dayCycleIndex advances by 1 every single day. Because a category is only called every 2 days, its internal array index advances by 2 each time it is queried, skipping half the exercises and causing a 4-day loop (e.g., indices 0, 2, 0, 2).
- **PlanView.jsx**: Core exercises are queried *every day* (combined Plank Core and Rotational Core), but the isDailyCategory boolean only flags Explosive. Thus, the index advances at half speed (Math.floor((workoutDay - 1) / 2)), causing the exact same core exercise to be assigned two days in a row.

## Execution Instructions
1. Update pick inside FullBodyView.jsx to apply a half-speed index specifically to the alternating core categories:
   ``javascript
   const isAlternatingCategory = categories.includes('Plank Core') || categories.includes('Rotational Core');
   const dayCycleIndex = isAlternatingCategory
       ? Math.max(0, Math.floor((fullBodyWorkoutDay - 1) / 2))
       : Math.max(0, fullBodyWorkoutDay - 1);
   ``
2. Update pick inside PlanView.jsx to include Core inside the isDailyCategory check:
   ``javascript
   const isDailyCategory = categories.includes('Explosive') || categories.includes('Plank Core') || categories.includes('Rotational Core');
   const dayCycleIndex = isDailyCategory 
       ? Math.max(0, workoutDay - 1) 
       : Math.max(0, Math.floor((workoutDay - 1) / 2));
   ``
