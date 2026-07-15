import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export default function StickyRestBanner() {
    const {
        timerIsRunning, timerIsCountdown, timerSeconds,
        formatTimerTime, toggleTimer, resetTimer, startRestTimer
    } = useAppContext();

    const [showStickyTimer, setShowStickyTimer] = useState(false);

    useEffect(() => {
        const handleScroll = () => setShowStickyTimer(window.scrollY > 220);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [headerHeight, setHeaderHeight] = useState(60);

    useEffect(() => {
        const header = document.querySelector('.header');
        if (!header) return;
        const update = () => setHeaderHeight(header.getBoundingClientRect().height);
        update();
        const ro = new ResizeObserver(update);
        ro.observe(header);
        return () => ro.disconnect();
    }, []);

    const isActive    = timerIsRunning && timerIsCountdown && timerSeconds > 0;
    const isCompleted = !timerIsRunning && timerIsCountdown && timerSeconds === 0;

    if (!showStickyTimer || (!isActive && !isCompleted)) return null;

    if (isCompleted) {
        return (
            <div style={{
                position: 'fixed',
                top: `${headerHeight + 12}px`,
                left: '16px',
                right: '16px',
                background: 'rgba(30, 10, 10, 0.95)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid #ef4444',
                borderRadius: 'var(--radius)',
                boxShadow: '0 0 12px rgba(239, 68, 68, 0.45)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 16px',
                zIndex: 99
            }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#ef4444', letterSpacing: '0.03em' }}>
                    🚨 REST COMPLETE (0:00)
                </div>
                <button
                    className="btn-ghost"
                    style={{ padding: '4px 12px', fontSize: '11px', border: '1px solid #ef4444', color: '#ef4444', fontWeight: '700' }}
                    onClick={resetTimer}
                >
                    DISMISS
                </button>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            top: `${headerHeight + 12}px`,
            left: '16px',
            right: '16px',
            background: 'rgba(17, 17, 17, 0.9)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 16px',
            zIndex: 99
        }}>
            <div style={{ fontSize: '24px', fontWeight: '600', color: 'white' }}>
                ⏳ {formatTimerTime(timerSeconds)}
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid var(--border)' }} onClick={toggleTimer}>
                    {timerIsRunning ? '⏸️ PAUSE' : '▶️ START'}
                </button>
                <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid var(--border)' }} onClick={() => startRestTimer(timerSeconds + 30)}>
                    +30S
                </button>
                <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid var(--border)' }} onClick={resetTimer}>
                    SKIP
                </button>
            </div>
        </div>
    );
}
