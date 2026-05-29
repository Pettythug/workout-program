import { useAppContext } from '../context/AppContext';

export function useTargetLock(ex, personKey) {
    const { workoutDay } = useAppContext();

    const day = ((workoutDay || 1) % 16) === 0 ? 16 : ((workoutDay || 1) % 16);
    
    let activeRangeKey = "";
    if (day >= 1 && day <= 4) activeRangeKey = "r8_12";
    else if (day >= 5 && day <= 8) activeRangeKey = "r1_3";
    else if (day >= 9 && day <= 12) activeRangeKey = "r13_plus";
    else if (day >= 13 && day <= 16) activeRangeKey = "r4_7";

    const ranges = [
        { key: "r1_3", label: "1-3" },
        { key: "r4_7", label: "4-7" },
        { key: "r8_12", label: "8-12" },
        { key: "r13_plus", label: "13+" }
    ];

    const targetRanges = ranges.map(r => {
        let bestValue = "-";
        if (ex && ex.best && ex.best[personKey] && ex.best[personKey][r.key]) {
            const b = ex.best[personKey][r.key];
            bestValue = ex.timed ? `${b.reps}` : `${b.reps}x${b.weight}`;
        }
        return {
            ...r,
            isActive: r.key === activeRangeKey,
            bestValue
        };
    });

    return { activeRangeKey, targetRanges };
}
