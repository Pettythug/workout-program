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

    if (!showStickyTimer || !timerIsRunning || !timerIsCountdown || timerSeconds <= 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '60px',
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
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>
                ⏳ Rest: {formatTimerTime(timerSeconds)}
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
