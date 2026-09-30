/* eslint-disable */
import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export default function SessionStatsModal({ isOpen, onClose }) {
    const { sessionHistory, getRepRangeStats, deleteSession, sessionStartTime, startSession, resetSessionTime } = useAppContext();
    const [activeFilter, setActiveFilter] = useState('ALL');

    const participantTabs = useMemo(() => {
        const tabs = new Set(['ALL']);
        sessionHistory.forEach(s => {
            if (s.people) tabs.add(s.people);
            else tabs.add('Solo');
        });
        return Array.from(tabs).sort();
    }, [sessionHistory]);

    useEffect(() => {
        if (!participantTabs.includes(activeFilter)) {
            setActiveFilter('ALL');
        }
    }, [participantTabs, activeFilter]);

    const stats = useMemo(() => {
        return getRepRangeStats ? getRepRangeStats(sessionHistory, activeFilter) : {
            brackets: {
                '1-3': { label: '1–3 Reps (Heavy)', count: 0, avgMinutes: 0 },
                '4-7': { label: '4–7 Reps (Strength)', count: 0, avgMinutes: 0 },
                '8-12': { label: '8–12 Reps (Hypertrophy)', count: 0, avgMinutes: 0 },
                '13+': { label: '13+ Reps (Endurance)', count: 0, avgMinutes: 0 }
            },
            totalSessions: 0,
            overallAvgMinutes: 0
        };
    }, [sessionHistory, getRepRangeStats, activeFilter]);

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

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: 16
        }}>
            <div style={{
                background: '#111',
                borderRadius: 16,
                width: '100%',
                maxWidth: 480,
                padding: 24,
                border: '1px solid var(--border)',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
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
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button 
                                className="btn-ghost" 
                                onClick={() => startSession(Date.now())}
                                style={{ flex: 1, padding: 8, fontSize: 11, border: '1px solid var(--accent)', color: 'var(--accent)' }}
                            >
                                ⏱️ Reset to 0m
                            </button>
                            <button 
                                className="btn-ghost" 
                                onClick={() => resetSessionTime()}
                                style={{ flex: 1, padding: 8, fontSize: 11, border: '1px solid #ef4444', color: '#ef4444' }}
                            >
                                🗑️ Clear Clock
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Participant Tabs */}
                {participantTabs.length > 1 && (
                    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                        {participantTabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveFilter(tab)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: 16,
                                    fontSize: 11,
                                    fontWeight: activeFilter === tab ? 700 : 500,
                                    fontFamily: 'var(--mono)',
                                    whiteSpace: 'nowrap',
                                    background: activeFilter === tab ? 'var(--accent)' : 'var(--surface)',
                                    color: activeFilter === tab ? '#000' : 'var(--muted)',
                                    border: `1px solid ${activeFilter === tab ? 'var(--accent)' : 'var(--border)'}`,
                                    cursor: 'pointer'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
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
                            return (
                                <div 
                                    key={meta.key}
                                    style={{
                                        background: meta.bg,
                                        border: `1px solid ${meta.borderColor}`,
                                        borderRadius: 10,
                                        padding: 12,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 4
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: meta.color, fontFamily: 'var(--mono)' }}>
                                            {meta.title}
                                        </span>
                                        <span style={{ fontSize: 9, color: 'var(--muted)', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
                                            {meta.subtitle.split(' ')[0]}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: 'white', fontFamily: 'var(--mono)', margin: '4px 0' }}>
                                        {bracketData.count > 0 ? `${bracketData.avgMinutes}m` : '--'}
                                    </div>
                                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                                        {bracketData.count > 0 
                                            ? `${bracketData.count} session${bracketData.count === 1 ? '' : 's'}`
                                            : 'No data yet'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Session History List */}
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Recent Completed Workouts
                    </div>
                    
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        paddingRight: 4,
                        maxHeight: 200
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
                        ) : (
                            sessionHistory.map(session => (
                                <div 
                                    key={session.id}
                                    style={{
                                        background: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 8,
                                        padding: '10px 12px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: 8
                                    }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>
                                                {session.program || 'Workout'} #{session.workoutDay}
                                            </span>
                                            {session.workoutType && (
                                                <span style={{
                                                    fontSize: 10,
                                                    padding: '1px 6px',
                                                    borderRadius: 4,
                                                    background: 'rgba(255,255,255,0.08)',
                                                    color: 'var(--muted)',
                                                    fontFamily: 'var(--mono)'
                                                }}>
                                                    {session.workoutType}
                                                </span>
                                            )}
                                            {session.repRange && (
                                                <span style={{
                                                    fontSize: 10,
                                                    padding: '1px 6px',
                                                    borderRadius: 4,
                                                    background: 'rgba(249, 115, 22, 0.15)',
                                                    color: 'var(--accent)',
                                                    fontWeight: 600,
                                                    fontFamily: 'var(--mono)'
                                                }}>
                                                    {session.repRange} reps
                                                </span>
                                            )}
                                            {session.people && (
                                                <span style={{
                                                    fontSize: 10,
                                                    padding: '1px 6px',
                                                    borderRadius: 4,
                                                    background: 'rgba(56, 189, 248, 0.15)',
                                                    color: '#38bdf8',
                                                    fontWeight: 600,
                                                    fontFamily: 'var(--mono)'
                                                }}>
                                                    👥 {session.people}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                                            {session.date}
                                            {session.startTime && session.endTime && (
                                                <span> • {session.startTime} – {session.endTime}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: 'var(--accent)',
                                            fontFamily: 'var(--mono)',
                                            whiteSpace: 'nowrap',
                                            background: 'rgba(249, 115, 22, 0.1)',
                                            border: '1px solid rgba(249, 115, 22, 0.25)',
                                            padding: '4px 8px',
                                            borderRadius: 6
                                        }}>
                                            ⏱️ {session.durationMinutes}m
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const label = `${session.program || 'Workout'} #${session.workoutDay || ''} (${session.date})`;
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
                                                fontSize: 13,
                                                padding: '4px 6px',
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
        </div>
    );
}
