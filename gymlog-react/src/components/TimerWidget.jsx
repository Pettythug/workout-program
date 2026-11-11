import { useAppContext } from '../context/AppContext';

export default function TimerWidget() {
    const {
        timerMode,
        setTimerMode,
        timerSeconds,
        timerIsRunning,
        timerIsCountdown,
        formatTimerTime,
        toggleTimer,
        resetTimer,
        openExpandedTimer
    } = useAppContext();

    return (
        <div
            style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                background: '#111',
                padding: 12,
                borderRadius: 12,
                border: '1px solid var(--border)',
                flexWrap: 'wrap'
            }}
        >
            <div
                role="button"
                tabIndex={0}
                onClick={openExpandedTimer}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openExpandedTimer();
                    }
                }}
                title="Tap to expand timer full-screen"
                style={{ flex: '1 1 120px', cursor: 'pointer' }}
            >
                <div
                    style={{
                        fontSize: 9,
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        flexWrap: 'wrap'
                    }}
                >
                    <span>{timerIsCountdown ? '⏳ REST COUNTDOWN' : '⏱️ STOPWATCH'}</span>
                    <span style={{ opacity: 0.75, fontFamily: 'var(--mono)' }}>⛶ TAP TO EXPAND</span>
                </div>
                <div
                    style={{
                        fontSize: 24,
                        fontWeight: 'bold',
                        fontFamily: 'var(--mono)',
                        color: timerIsCountdown && timerSeconds <= 10 && timerSeconds > 0 ? '#ef4444' : 'var(--accent)',
                        transition: 'color 0.3s'
                    }}
                >
                    {formatTimerTime(timerSeconds)}
                </div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                    className="btn-ghost"
                    style={{
                        padding: '6px 10px',
                        fontSize: 11,
                        border: '1px solid var(--border)',
                        background: timerIsRunning ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                        color: timerIsRunning ? '#ef4444' : 'white'
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleTimer();
                    }}
                >
                    {timerIsRunning ? '⏸️ PAUSE' : '▶️ START'}
                </button>
                <button
                    className="btn-ghost"
                    style={{ padding: '6px 10px', fontSize: 11, border: '1px solid var(--border)' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        resetTimer();
                    }}
                >
                    🔄 RESET
                </button>
                <select
                    value={timerMode}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                        e.stopPropagation();
                        setTimerMode(e.target.value);
                    }}
                    style={{
                        background: '#000',
                        border: '1px solid var(--border)',
                        color: 'white',
                        fontSize: 11,
                        padding: 6,
                        borderRadius: 4,
                        cursor: 'pointer'
                    }}
                >
                    <option value="stopwatch">⏱️ STOPWATCH</option>
                    <option value="30">⏳ 30S REST</option>
                    <option value="45">⏳ 45S REST</option>
                    <option value="60">⏳ 60S REST</option>
                    <option value="90">⏳ 90S REST</option>
                    <option value="120">⏳ 2M REST</option>
                    <option value="180">⏳ 3M REST</option>
                    <option value="240">⏳ 4M REST</option>
                    <option value="300">⏳ 5M REST</option>
                </select>
            </div>
        </div>
    );
}
