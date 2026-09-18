import { useAppContext } from '../context/AppContext';

export default function StickyRestBanner() {
    const {
        timerIsRunning, timerIsCountdown, timerSeconds,
        formatTimerTime, toggleTimer, resetTimer, startRestTimer,
        timerMode
    } = useAppContext();

    const isCountdownActive = timerIsCountdown && (timerSeconds > 0 || timerIsRunning);
    const isStopwatchActive = !timerIsCountdown && (timerSeconds > 0 || timerIsRunning);
    const isActive = isCountdownActive || isStopwatchActive;
    const isCompleted = !timerIsRunning && timerIsCountdown && timerSeconds === 0;

    const restDuration = parseInt(timerMode, 10);
    const canRestart = !isNaN(restDuration) && restDuration > 0;

    const shouldRender = timerIsRunning || timerSeconds > 0 || isCompleted;

    if (!shouldRender) return null;

    if (isCompleted) {
        return (
            <div style={{
                width: '100%',
                padding: '6px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--border)',
                background: '#ef4444',
                boxSizing: 'border-box',
                transform: 'translateZ(0)',
                willChange: 'transform'
            }}>
                <div style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#ffffff',
                    letterSpacing: '0.03em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    🚨 REST COMPLETE (0:00)
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                    {canRestart && (
                        <button
                            className="btn-ghost"
                            style={{
                                padding: '4px 10px',
                                fontSize: '11px',
                                fontWeight: '700',
                                border: '1px solid rgba(255, 255, 255, 0.4)',
                                color: '#ffffff',
                                background: 'rgba(0, 0, 0, 0.25)',
                                cursor: 'pointer'
                            }}
                            onClick={() => startRestTimer(restDuration)}
                        >
                            RESTART
                        </button>
                    )}
                    <button
                        className="btn-ghost"
                        style={{
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: '700',
                            border: '1px solid #ffffff',
                            color: '#ef4444',
                            background: '#ffffff',
                            cursor: 'pointer'
                        }}
                        onClick={resetTimer}
                    >
                        DISMISS
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            width: '100%',
            padding: '6px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--border)',
            background: 'var(--surface)',
            boxSizing: 'border-box',
            transform: 'translateZ(0)',
            willChange: 'transform'
        }}>
            <div style={{
                fontSize: '14px',
                fontWeight: '700',
                fontFamily: 'var(--mono)',
                color: timerIsCountdown 
                    ? (timerSeconds <= 10 && timerSeconds > 0 ? '#ef4444' : 'var(--accent)')
                    : '#38bdf8',
                letterSpacing: '0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
            }}>
                {timerIsCountdown 
                    ? `⏳ REST ${formatTimerTime(timerSeconds)}` 
                    : `⏱️ STOPWATCH ${formatTimerTime(timerSeconds)}`}
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                <button
                    className="btn-ghost"
                    style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid var(--border)', cursor: 'pointer' }}
                    onClick={toggleTimer}
                >
                    {timerIsRunning ? '⏸️ PAUSE' : '▶️ START'}
                </button>
                {timerIsCountdown ? (
                    <>
                        <button
                            className="btn-ghost"
                            style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid var(--border)', cursor: 'pointer' }}
                            onClick={() => startRestTimer(timerSeconds + 30)}
                        >
                            +30S
                        </button>
                        <button
                            className="btn-ghost"
                            style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid var(--border)', cursor: 'pointer' }}
                            onClick={resetTimer}
                        >
                            SKIP
                        </button>
                    </>
                ) : (
                    <button
                        className="btn-ghost"
                        style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid var(--border)', cursor: 'pointer' }}
                        onClick={resetTimer}
                    >
                        RESET
                    </button>
                )}
            </div>
        </div>
    );
}
