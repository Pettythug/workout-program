/* eslint-disable */
import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { createPortal } from 'react-dom';
import GuestUpgradeModal from './GuestUpgradeModal';

function formatDateClean(rawDate, fallbackTimestamp) {
    if (rawDate && String(rawDate).includes('1899')) {
        if (fallbackTimestamp) {
            const d = new Date(fallbackTimestamp);
            if (!isNaN(d.getTime()) && d.getFullYear() > 1900) {
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            }
        }
        return 'Recent Workout';
    }

    if (rawDate) {
        const str = String(rawDate).trim();
        const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (isoMatch) {
            const y = parseInt(isoMatch[1], 10);
            const m = parseInt(isoMatch[2], 10) - 1;
            const d = parseInt(isoMatch[3], 10);
            const dt = new Date(y, m, d);
            return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }

        const parsed = new Date(str);
        if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900) {
            return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    }

    if (fallbackTimestamp) {
        const d = new Date(fallbackTimestamp);
        if (!isNaN(d.getTime()) && d.getFullYear() > 1900) {
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    }

    return String(rawDate || 'Recent Workout');
}

function formatTimeClean(rawTime, fallbackTimestamp) {
    if (!rawTime && !fallbackTimestamp) return null;

    if (rawTime) {
        const str = String(rawTime).trim();
        if (str) {
            const amPmMatch = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
            if (amPmMatch) {
                const hours = parseInt(amPmMatch[1], 10);
                const mins = amPmMatch[2];
                const ampm = amPmMatch[3].toUpperCase();
                return `${hours}:${mins} ${ampm}`;
            }

            const match24 = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
            if (match24) {
                let h = parseInt(match24[1], 10);
                const m = match24[2];
                const ampm = h >= 12 ? 'PM' : 'AM';
                h = h % 12 || 12;
                return `${h}:${m} ${ampm}`;
            }

            const parsed = new Date(str);
            if (!isNaN(parsed.getTime())) {
                return parsed.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            }
        }
    }

    if (fallbackTimestamp) {
        const d = new Date(fallbackTimestamp);
        if (!isNaN(d.getTime())) {
            return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        }
    }

    return null;
}

function formatSessionDateTime(session) {
    const dateStr = formatDateClean(session.date, session.startTimestamp);
    const startStr = formatTimeClean(session.startTime, session.startTimestamp);
    const endStr = formatTimeClean(session.endTime, session.endTimestamp);

    if (startStr && endStr && startStr !== endStr) {
        return `${dateStr} • ${startStr} – ${endStr}`;
    }
    if (startStr) {
        return `${dateStr} • ${startStr}`;
    }
    if (endStr) {
        return `${dateStr} • ${endStr}`;
    }
    return dateStr;
}

export default function SessionStatsModal({ isOpen, onClose }) {
    const { sessionHistory, getRepRangeStats, deleteSession, sessionStartTime, startSession, resetSessionTime, deviceOwner } = useAppContext();
    const [selectedRepRange, setSelectedRepRange] = useState(null);
    const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setSelectedRepRange(null);
        }
    }, [isOpen]);

    const filteredSessions = useMemo(() => {
        if (!selectedRepRange) return sessionHistory;
        return sessionHistory.filter(session => {
            const range = (session.repRange || '').trim();
            if (selectedRepRange === '1-3') return range.includes('1-3');
            if (selectedRepRange === '4-7') return range.includes('4-7');
            if (selectedRepRange === '8-12') return range.includes('8-12');
            if (selectedRepRange === '13+') return range.includes('13') || range.includes('13+');
            return false;
        });
    }, [sessionHistory, selectedRepRange]);

    const stats = useMemo(() => {
        return getRepRangeStats ? getRepRangeStats(sessionHistory, 'ALL') : {
            brackets: {
                '1-3': { label: '1–3 Reps (Heavy)', count: 0, avgMinutes: 0 },
                '4-7': { label: '4–7 Reps (Strength)', count: 0, avgMinutes: 0 },
                '8-12': { label: '8–12 Reps (Hypertrophy)', count: 0, avgMinutes: 0 },
                '13+': { label: '13+ Reps (Endurance)', count: 0, avgMinutes: 0 }
            },
            totalSessions: 0,
            overallAvgMinutes: 0
        };
    }, [sessionHistory, getRepRangeStats]);

    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        if (!isOpen || !sessionStartTime) return;
        setNow(Date.now());
        const interval = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(interval);
    }, [isOpen, sessionStartTime]);

    if (!isOpen) return null;

    const bracketMeta = [
        {
            key: '1-3',
            title: '1–3 Reps',
            subtitle: 'Heavy Focus',
            color: '#ef4444',
            bg: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)'
        },
        {
            key: '4-7',
            title: '4–7 Reps',
            subtitle: 'Strength Focus',
            color: '#f97316',
            bg: 'rgba(249, 115, 22, 0.1)',
            borderColor: 'rgba(249, 115, 22, 0.3)'
        },
        {
            key: '8-12',
            title: '8–12 Reps',
            subtitle: 'Hypertrophy Focus',
            color: '#a855f7',
            bg: 'rgba(168, 85, 247, 0.1)',
            borderColor: 'rgba(168, 85, 247, 0.3)'
        },
        {
            key: '13+',
            title: '13+ Reps',
            subtitle: 'Endurance Focus',
            color: '#38bdf8',
            bg: 'rgba(56, 189, 248, 0.1)',
            borderColor: 'rgba(56, 189, 248, 0.3)'
        }
    ];

    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: 12,
            boxSizing: 'border-box'
        }}>
            <div style={{
                background: '#111',
                borderRadius: 16,
                width: '100%',
                maxWidth: 420,
                padding: 20,
                border: '1px solid var(--border)',
                maxHeight: '90vh',
                overflowY: 'auto',
                overflowX: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                boxSizing: 'border-box',
                boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 16, letterSpacing: 1, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            📊 WORKOUT TIME & AVERAGES
                        </h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                            Average completion time partitioned by rep range
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer', padding: '4px 8px' }}
                        aria-label="Close modal"
                    >
                        &#x2715;
                    </button>
                </div>

                {/* Guest Mode Cloud Upgrade Banner */}
                {(deviceOwner === 'Guest' || !deviceOwner) && (
                    <div style={{
                        background: 'linear-gradient(90deg, rgba(249, 115, 22, 0.15), rgba(56, 189, 248, 0.15))',
                        border: '1px solid rgba(249, 115, 22, 0.4)',
                        borderRadius: 10,
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10
                    }}>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>☁️ Guest Sandbox Mode</div>
                            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>Sessions saved locally. Upgrade to sync with Google Sheets.</div>
                        </div>
                        <button 
                            onClick={() => setIsUpgradeOpen(true)}
                            style={{
                                background: 'var(--accent)',
                                color: '#000',
                                border: 'none',
                                borderRadius: 6,
                                padding: '6px 12px',
                                fontSize: 11,
                                fontWeight: 800,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            UPGRADE
                        </button>
                    </div>
                )}

                {/* Active Session Card */}
                {sessionStartTime && (
                    <div style={{
                        background: 'rgba(249, 115, 22, 0.1)',
                        border: '1px solid var(--accent)',
                        borderRadius: 10,
                        padding: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>
                                ⏱️ ACTIVE SESSION
                            </div>
                            <div style={{ fontSize: 12, color: 'white', fontFamily: 'var(--mono)' }}>
                                {new Date(sessionStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({(Math.max(1, Math.round((now - sessionStartTime) / 60000)))}m elapsed)
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, width: '100%', boxSizing: 'border-box' }}>
                            <button 
                                className="btn-ghost" 
                                onClick={() => startSession(Date.now())}
                                style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', padding: '6px 10px', fontSize: 11, boxSizing: 'border-box', letterSpacing: 0, border: '1px solid var(--accent)', color: 'var(--accent)' }}
                            >
                                ⏱️ Reset to 0m
                            </button>
                            <button 
                                className="btn-ghost" 
                                onClick={() => resetSessionTime()}
                                style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', padding: '6px 10px', fontSize: 11, boxSizing: 'border-box', letterSpacing: 0, border: '1px solid #ef4444', color: '#ef4444' }}
                            >
                                🗑️ Clear Clock
                            </button>
                        </div>
                    </div>
                )}

                {/* Overall Summary Bar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '10px 14px'
                }}>
                    <div>
                        <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>Total Workouts Logged</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'white', fontFamily: 'var(--mono)' }}>{stats.totalSessions}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>Overall Avg Duration</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>
                            {stats.overallAvgMinutes > 0 ? `${stats.overallAvgMinutes} mins` : '--'}
                        </div>
                    </div>
                </div>

                {/* Rep Range Brackets Grid */}
                <div>
                    <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Rep Range Averages
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {bracketMeta.map(meta => {
                            const bracketData = stats.brackets[meta.key] || { count: 0, avgMinutes: 0 };
                            const isSelected = selectedRepRange === meta.key;
                            return (
                                <div 
                                    key={meta.key}
                                    onClick={() => setSelectedRepRange(prev => prev === meta.key ? null : meta.key)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setSelectedRepRange(prev => prev === meta.key ? null : meta.key);
                                        }
                                    }}
                                    title={isSelected ? `Filtering by ${meta.title} (tap to deselect)` : `Tap to filter workouts by ${meta.title}`}
                                    style={{
                                        background: isSelected ? meta.bg.replace('0.1', '0.22') : meta.bg,
                                        border: isSelected ? `2px solid ${meta.color}` : `1px solid ${meta.borderColor}`,
                                        borderRadius: 10,
                                        padding: isSelected ? 11 : 12,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 4,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: isSelected ? `0 0 12px ${meta.color}40` : 'none',
                                        boxSizing: 'border-box',
                                        userSelect: 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: meta.color, fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            {meta.title}
                                            {isSelected && <span style={{ fontSize: 9 }}>●</span>}
                                        </span>
                                        <span style={{
                                            fontSize: 9,
                                            color: isSelected ? meta.color : 'var(--muted)',
                                            fontFamily: 'var(--mono)',
                                            textTransform: 'uppercase',
                                            fontWeight: isSelected ? 700 : 400
                                        }}>
                                            {isSelected ? 'ACTIVE' : meta.subtitle.split(' ')[0]}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: 'white', fontFamily: 'var(--mono)', margin: '4px 0' }}>
                                        {bracketData.count > 0 ? `${bracketData.avgMinutes}m` : '--'}
                                    </div>
                                    <div style={{ fontSize: 10, color: isSelected ? 'white' : 'var(--muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>
                                            {bracketData.count > 0 
                                                ? `${bracketData.count} session${bracketData.count === 1 ? '' : 's'}`
                                                : 'No data yet'}
                                        </span>
                                        {isSelected && (
                                            <span style={{ fontSize: 9, color: meta.color, fontFamily: 'var(--mono)', fontWeight: 700 }}>
                                                FILTERED
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Session History List */}
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                            Recent Completed Workouts
                        </div>
                        {selectedRepRange && (
                            <button 
                                onClick={() => setSelectedRepRange(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--accent)',
                                    fontSize: 10,
                                    fontFamily: 'var(--mono)',
                                    cursor: 'pointer',
                                    padding: '2px 4px',
                                    textDecoration: 'underline'
                                }}
                            >
                                Clear Filter
                            </button>
                        )}
                    </div>

                    {selectedRepRange && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: `1px solid ${bracketMeta.find(m => m.key === selectedRepRange)?.borderColor || 'var(--border)'}`,
                            borderRadius: 6,
                            padding: '6px 10px',
                            marginBottom: 8,
                            fontSize: 11,
                            fontFamily: 'var(--mono)'
                        }}>
                            <span style={{ color: 'white' }}>
                                Showing <strong style={{ color: bracketMeta.find(m => m.key === selectedRepRange)?.color }}>{bracketMeta.find(m => m.key === selectedRepRange)?.title}</strong> ({filteredSessions.length} {filteredSessions.length === 1 ? 'session' : 'sessions'})
                            </span>
                            <button
                                onClick={() => setSelectedRepRange(null)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 4,
                                    color: 'var(--muted)',
                                    cursor: 'pointer',
                                    fontSize: 10,
                                    fontFamily: 'var(--mono)',
                                    padding: '2px 8px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = 'white';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = 'var(--muted)';
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                }}
                                aria-label="Clear rep range filter"
                            >
                                ✕ Clear
                            </button>
                        </div>
                    )}
                    
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        overscrollBehavior: 'contain',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        paddingRight: 4,
                        maxHeight: 380
                    }}>
                        {sessionHistory.length === 0 ? (
                            <div style={{
                                padding: '24px 16px',
                                textAlign: 'center',
                                background: '#161616',
                                borderRadius: 8,
                                border: '1px dashed var(--border)',
                                color: 'var(--muted)',
                                fontSize: 12
                            }}>
                                No completed workout sessions recorded yet. Finish a workout to track your duration and rep range stats!
                            </div>
                        ) : filteredSessions.length === 0 ? (
                            <div style={{
                                padding: '24px 16px',
                                textAlign: 'center',
                                background: '#161616',
                                borderRadius: 8,
                                border: '1px dashed var(--border)',
                                color: 'var(--muted)',
                                fontSize: 12
                            }}>
                                No sessions found for this rep range.
                            </div>
                        ) : (
                            filteredSessions.map(session => (
                                <div 
                                    key={session.id}
                                    style={{
                                        background: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 8,
                                        padding: '8px 12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 5
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: 'white', whiteSpace: 'nowrap' }}>
                                                {session.program || 'Workout'} #{session.workoutDay}
                                            </span>
                                            {session.repRange && (
                                                <span style={{
                                                    fontSize: 10,
                                                    padding: '1px 6px',
                                                    borderRadius: 4,
                                                    background: 'rgba(249, 115, 22, 0.15)',
                                                    color: 'var(--accent)',
                                                    fontWeight: 600,
                                                    fontFamily: 'var(--mono)',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {session.repRange.toLowerCase().includes('rep') ? session.repRange : `${session.repRange} Reps`}
                                                </span>
                                            )}
                                            {session.workoutType && (
                                                <span style={{
                                                    fontSize: 10,
                                                    padding: '1px 6px',
                                                    borderRadius: 4,
                                                    background: 'rgba(255,255,255,0.08)',
                                                    color: 'var(--muted)',
                                                    fontFamily: 'var(--mono)',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {session.workoutType}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                            <span style={{
                                                fontSize: 11,
                                                fontWeight: 700,
                                                color: 'var(--accent)',
                                                fontFamily: 'var(--mono)',
                                                whiteSpace: 'nowrap',
                                                background: 'rgba(249, 115, 22, 0.1)',
                                                border: '1px solid rgba(249, 115, 22, 0.25)',
                                                padding: '2px 6px',
                                                borderRadius: 5
                                            }}>
                                                ⏱️ {session.durationMinutes}m
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const label = `${session.program || 'Workout'} #${session.workoutDay || ''} (${formatDateClean(session.date, session.startTimestamp)})`;
                                                    if (window.confirm(`Delete historical session for ${label}?`)) {
                                                        if (deleteSession) deleteSession(session.id);
                                                    }
                                                }}
                                                title="Delete session record"
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'var(--muted)',
                                                    cursor: 'pointer',
                                                    fontSize: 12,
                                                    padding: '2px 4px',
                                                    borderRadius: 4,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    opacity: 0.7,
                                                    transition: 'opacity 0.2s, color 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.opacity = '1';
                                                    e.currentTarget.style.color = '#ef4444';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.opacity = '0.7';
                                                    e.currentTarget.style.color = 'var(--muted)';
                                                }}
                                                aria-label="Delete session"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                                        {formatSessionDateTime(session)}
                                        {session.people && session.people !== 'Solo' && (
                                            <span> • 👥 {session.people}</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer Action */}
                <div style={{ paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                    <button 
                        className="btn-ghost" 
                        onClick={onClose}
                        style={{ width: '100%', padding: 10, fontWeight: 600, fontSize: 13, border: '1px solid var(--border)', color: 'white' }}
                    >
                        CLOSE
                    </button>
                </div>
            </div>

            <GuestUpgradeModal
                isOpen={isUpgradeOpen}
                onClose={() => setIsUpgradeOpen(false)}
            />
        </div>,
        document.body
    );
}
