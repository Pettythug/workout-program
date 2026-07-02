import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function Header() {
    const { isSyncing } = useAppContext();

    return (
        <div className="header" style={{ gap: '16px', justifyContent: 'flex-start' }}>
            <h1 style={{ margin: 0, fontSize: '16px', marginRight: 'auto', display: 'flex', alignItems: 'center' }}>
                GymLog
                <span className={`sync-indicator ${isSyncing ? 'syncing' : 'synced'}`} />
            </h1>
            <NavLink to="/plan" className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}>PLAN</NavLink>
            <NavLink to="/lift" className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}>LIFT</NavLink>
            <NavLink to="/circuit" className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}>CIRCUIT</NavLink>
        </div>
    );
}
