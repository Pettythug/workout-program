import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';

export default function FullScreenTimerModal() {
    const {
        isTimerExpanded,
        closeExpandedTimer,
        timerSeconds,
        timerIsRunning,
        timerIsCountdown,
        formatTimerTime,
        toggleTimer,
        resetTimer,
        startRestTimer
    } = useAppContext();

    const [isCompleteFlash, setIsCompleteFlash] = useState(false);
    const prevSecondsRef = useRef(timerSeconds);
    const autoCloseTimeoutRef = useRef(null);

    const clearAutoClose = useCallback(() => {
        if (autoCloseTimeoutRef.current) {
            clearTimeout(autoCloseTimeoutRef.current);
            autoCloseTimeoutRef.current = null;
        }
    }, []);

    const handleClose = useCallback(() => {
        clearAutoClose();
        setIsCompleteFlash(false);
        closeExpandedTimer();
    }, [clearAutoClose, closeExpandedTimer]);

    useEffect(() => {
        return () => clearAutoClose();
    }, [clearAutoClose]);

    // Screen Wake Lock while expanded
    useEffect(() => {
        if (!isTimerExpanded) return;

        let isActive = true;
        let wakeLockSentinel = null;

        const requestWakeLock = async () => {
            try {
                if (typeof navigator === 'undefined' || !navigator.wakeLock?.request) return;
                if (document.visibilityState !== 'visible') return;
                if (wakeLockSentinel && !wakeLockSentinel.released) return;
                const sentinel = await navigator.wakeLock.request('screen');
                if (!isActive) {
                    sentinel.release().catch(() => {});
                    return;
                }
                wakeLockSentinel = sentinel;
                sentinel.addEventListener?.('release', () => {
                    if (wakeLockSentinel === sentinel) {
                        wakeLockSentinel = null;
                    }
                });
            } catch {
                // Wake Lock may be unavailable or denied
            }
        };

        requestWakeLock();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            isActive = false;
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (wakeLockSentinel) {
                wakeLockSentinel.release().catch(() => {});
                wakeLockSentinel = null;
            }
        };
    }, [isTimerExpanded]);

    // Escape key closes full-screen overlay
    useEffect(() => {
        if (!isTimerExpanded) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isTimerExpanded, handleClose]);

    // 0:00 Flash & auto-return guard on live countdown completion
    useEffect(() => {
        if (!isTimerExpanded) {
            clearAutoClose();
            prevSecondsRef.current = timerSeconds;
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsCompleteFlash(false);
            return;
        }

        if (
            prevSecondsRef.current > 0 &&
            timerSeconds === 0 &&
            !timerIsRunning &&
            timerIsCountdown
        ) {
            setIsCompleteFlash(true);
            clearAutoClose();
            autoCloseTimeoutRef.current = setTimeout(() => {
                autoCloseTimeoutRef.current = null;
                setIsCompleteFlash(false);
                closeExpandedTimer();
            }, 2000);
        }

        prevSecondsRef.current = timerSeconds;
    }, [isTimerExpanded, timerSeconds, timerIsRunning, timerIsCountdown, closeExpandedTimer, clearAutoClose]);

    if (!isTimerExpanded) return null;

    const handleToggle = (e) => {
        e.stopPropagation();
        clearAutoClose();
        setIsCompleteFlash(false);
        toggleTimer();
    };

    const handleAdd30 = (e) => {
        e.stopPropagation();
        clearAutoClose();
        setIsCompleteFlash(false);
        startRestTimer(timerSeconds + 30);
    };

    const handleSkipOrReset = (e) => {
        e.stopPropagation();
        clearAutoClose();
        setIsCompleteFlash(false);
        resetTimer();
        if (timerIsCountdown) {
            closeExpandedTimer();
        }
    };

    const clockColor = timerIsCountdown
        ? (timerSeconds <= 10 ? '#ef4444' : 'var(--accent)')
        : '#38bdf8';

    const isCountdownFinished = timerIsCountdown && timerSeconds === 0 && !timerIsRunning;

    return createPortal(
        <div
            onClick={handleClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: isCompleteFlash ? 'rgba(35, 10, 10, 0.98)' : 'rgba(12, 12, 12, 0.97)',
                zIndex: 3000,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'max(20px, env(safe-area-inset-top)) 20px max(28px, env(safe-area-inset-bottom))',
                boxSizing: 'border-box',
                transition: 'background 0.25s ease',
                userSelect: 'none'
            }}
        >
            {/* Top Bar */}
            <div style={{
                width: '100%',
                maxWidth: 520,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span style={{
                    fontSize: 12,
                    fontFamily: 'var(--mono)',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: isCompleteFlash ? '#ef4444' : 'var(--text)',
                    opacity: isCompleteFlash ? 1 : 0.65
                }}>
                    {timerIsCountdown ? '⏳ REST COUNTDOWN' : '⏱️ STOPWATCH'}
                </span>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleClose();
                    }}
                    aria-label="Close full-screen timer"
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                        fontSize: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    ✕
                </button>
            </div>

            {/* Huge Clock Readout */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: 16
            }}>
                {isCompleteFlash && (
                    <div style={{
                        background: '#ef4444',
                        color: '#ffffff',
                        padding: '10px 22px',
                        borderRadius: 999,
                        fontSize: 'clamp(16px, 4.5vw, 24px)',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        boxShadow: '0 0 32px rgba(239, 68, 68, 0.55)'
                    }}>
                        🚨 REST COMPLETE!
                    </div>
                )}
                <div style={{
                    fontSize: 'clamp(68px, 22vw, 152px)',
                    fontFamily: 'var(--mono)',
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    fontVariantNumeric: 'tabular-nums',
                    color: clockColor,
                    textShadow: isCompleteFlash ? '0 0 36px rgba(239, 68, 68, 0.45)' : 'none',
                    transition: 'color 0.25s ease'
                }}>
                    {formatTimerTime(timerSeconds)}
                </div>
                <div style={{
                    fontSize: 11,
                    fontFamily: 'var(--mono)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--text)',
                    opacity: 0.45
                }}>
                    {isCompleteFlash
                        ? 'Returning to workout...'
                        : (timerIsRunning ? 'Tap backdrop to minimize' : 'Paused • Tap backdrop to minimize')}
                </div>
            </div>

            {/* Essential Controls */}
            <div style={{
                width: '100%',
                maxWidth: 520,
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
                flexWrap: 'wrap'
            }}>
                <button
                    type="button"
                    className="btn-ghost"
                    disabled={isCountdownFinished}
                    onClick={handleToggle}
                    style={{
                        flex: '1 1 130px',
                        minHeight: 54,
                        fontSize: 15,
                        fontWeight: 700,
                        borderRadius: 12,
                        border: `1px solid ${timerIsRunning ? '#ef4444' : 'var(--accent)'}`,
                        background: timerIsRunning ? 'rgba(239, 68, 68, 0.14)' : 'var(--surface)',
                        color: timerIsRunning ? '#ef4444' : 'var(--accent)',
                        opacity: isCountdownFinished ? 0.4 : 1,
                        cursor: isCountdownFinished ? 'not-allowed' : 'pointer'
                    }}
                >
                    {timerIsRunning ? '⏸️ PAUSE' : '▶️ START'}
                </button>
                {timerIsCountdown && (
                    <button
                        type="button"
                        className="btn-ghost"
                        onClick={handleAdd30}
                        style={{
                            flex: '1 1 110px',
                            minHeight: 54,
                            fontSize: 15,
                            fontWeight: 700,
                            borderRadius: 12,
                            border: '1px solid var(--border)',
                            background: 'var(--surface)',
                            color: 'var(--text)'
                        }}
                    >
                        +30S
                    </button>
                )}
                <button
                    type="button"
                    className="btn-ghost"
                    onClick={handleSkipOrReset}
                    style={{
                        flex: '1 1 110px',
                        minHeight: 54,
                        fontSize: 15,
                        fontWeight: 700,
                        borderRadius: 12,
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        color: 'var(--text)'
                    }}
                >
                    {timerIsCountdown ? 'SKIP' : '🔄 RESET'}
                </button>
            </div>
        </div>,
        document.body
    );
}
