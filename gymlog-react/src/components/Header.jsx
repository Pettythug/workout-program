/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import SessionStatsModal from './SessionStatsModal';

export default function Header() {
    const { isSyncing, sessionStartTime } = useAppContext();
    const [elapsedMinutes, setElapsedMinutes] = useState(0);
    const [isStatsOpen, setIsStatsOpen] = useState(false);

    useEffect(() => {
        if (!sessionStartTime) {
            setElapsedMinutes(0);
            return;
        }

        const updateElapsed = () => {
            const mins = Math.max(0, Math.floor((Date.now() - sessionStartTime) / 60000));
            setElapsedMinutes(mins);
        };

        updateElapsed();
        const interval = setInterval(updateElapsed, 5000);
        return () => clearInterval(interval);
    }, [sessionStartTime]);

    return (
        <>
            <div className="header" style={{ gap: '16px', justifyContent: 'flex-start' }}>
                <h1 style={{ margin: 0, fontSize: '16px', marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    GymLog
                    <span className={`sync-indicator ${isSyncing ? 'syncing' : 'synced'}`} />
                    {sessionStartTime && (
                        <button
                            onClick={() => setIsStatsOpen(true)}
                            title={`Session started at ${new Date(sessionStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (click for stats)`}
                            style={{
                                fontSize: '11px',
                                fontFamily: 'var(--mono)',
                                color: 'var(--accent)',
                                background: 'rgba(249, 115, 22, 0.15)',
                                border: '1px solid rgba(249, 115, 22, 0.35)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: 600,
                                letterSpacing: '0.02em',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            ⏱️ {elapsedMinutes}m
                        </button>
                    )}
                </h1>
                <NavLink to="/plan" className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}>PLAN</NavLink>
                <NavLink to="/full-body" className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}>FULL BODY</NavLink>
                <NavLink to="/lift" className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}>LIFT</NavLink>
                <NavLink to="/circuit" className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}>CIRCUIT</NavLink>
            </div>

            <SessionStatsModal 
                isOpen={isStatsOpen} 
                onClose={() => setIsStatsOpen(false)} 
            />
        </>
    );
}
