const VARIATION_OPTION_GROUPS = [
    {
        label: 'Equipment',
        items: [
            { key: 'barbell', label: 'Barbell' },
            { key: 'dumbbell', label: 'Dumbbell' },
            { key: 'band', label: 'Band' },
            { key: 'cable', label: 'Cable' }
        ]
    },
    {
        label: 'Execution',
        items: [
            { key: 'single', label: 'Singles' },
            { key: 'alt', label: 'Alternating' }
        ]
    },
    {
        label: 'Grip',
        items: [
            { key: 'overhand', label: 'Overhand' },
            { key: 'underhand', label: 'Underhand' },
            { key: 'neutral', label: 'Neutral' }
        ]
    }
];

/**
 * Shared equipment, execution, and grip variation combinator with live preview checklist.
 */
export default function VariationGeneratorPanel({
    title = 'Generate Variations',
    subtitle = '',
    options = {},
    onToggleOption,
    generatedNames = [],
    excludedPreviewNames,
    onTogglePreviewName,
    existingExerciseNames,
    showPreview = false,
    disabled = false,
    children = null
}) {
    const hasSelectedOption = Object.values(options || {}).some(Boolean);
    const shouldShowPreview = generatedNames.length > 0 && (showPreview || hasSelectedOption);
    const selectedCount = generatedNames.filter(name => !excludedPreviewNames?.has(name)).length;

    return (
        <div
            style={{
                padding: 10,
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                width: '100%',
                boxSizing: 'border-box'
            }}
        >
            <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {title}
                {subtitle && (
                    <span style={{ fontWeight: 400, textTransform: 'none', marginLeft: 4 }}>
                        ({subtitle})
                    </span>
                )}
            </div>

            {VARIATION_OPTION_GROUPS.map(group => (
                <div key={group.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 9, color: 'var(--muted)', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
                        {group.label}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px' }}>
                        {group.items.map(opt => (
                            <label
                                key={opt.key}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    color: 'white',
                                    fontSize: 12,
                                    cursor: disabled ? 'not-allowed' : 'pointer',
                                    opacity: disabled ? 0.6 : 1
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={Boolean(options?.[opt.key])}
                                    disabled={disabled}
                                    onChange={e => onToggleOption(opt.key, e.target.checked)}
                                    style={{ cursor: disabled ? 'not-allowed' : 'pointer', accentColor: 'var(--accent)' }}
                                />
                                {opt.label}
                            </label>
                        ))}
                    </div>
                </div>
            ))}

            {shouldShowPreview && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 2 }}>
                    <div style={{ fontSize: 9, color: 'var(--accent)', fontFamily: 'var(--mono)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
                        Live Preview ({selectedCount} selected)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 160, overflowY: 'auto' }}>
                        {generatedNames.map(name => {
                            const isIncluded = !excludedPreviewNames?.has(name);
                            const alreadyExists = existingExerciseNames?.has(name.toLowerCase());
                            return (
                                <label
                                    key={name}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        padding: '4px 6px',
                                        borderRadius: 6,
                                        background: isIncluded ? 'var(--bg)' : 'transparent',
                                        color: isIncluded ? 'white' : 'var(--muted)',
                                        fontSize: 11,
                                        fontFamily: 'var(--mono)',
                                        cursor: disabled ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isIncluded}
                                        disabled={disabled}
                                        onChange={() => onTogglePreviewName(name)}
                                        style={{ cursor: disabled ? 'not-allowed' : 'pointer', accentColor: 'var(--accent)' }}
                                    />
                                    <span style={{ textDecoration: isIncluded ? 'none' : 'line-through', flex: 1 }}>
                                        {name}
                                    </span>
                                    {alreadyExists && (
                                        <span style={{ fontSize: 9, color: 'var(--muted)' }}>(exists)</span>
                                    )}
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}

            {children}
        </div>
    );
}
