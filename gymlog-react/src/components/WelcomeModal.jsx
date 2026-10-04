import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';

export default function WelcomeModal({ isOpen: overrideIsOpen, onClose }) {
    const { 
        people, 
        urlParamUser, 
        updateDeviceOwner, 
        verifyUserPin, 
        registerNewUser 
    } = useAppContext();

    const [userSelection, setUserSelection] = useState(() => {
        if (urlParamUser && people && people.length > 0) {
            const matched = people.find(p => p.toLowerCase() === urlParamUser.toLowerCase());
            if (matched) return matched;
        }
        return urlParamUser || null;
    });

    // Derive selected user: manual selection takes precedence; if null, check URL parameter
    const selectedUser = userSelection !== null 
        ? userSelection 
        : (urlParamUser ? (people.find(p => p.toLowerCase() === urlParamUser.toLowerCase()) || urlParamUser) : '');

    const [pin, setPin] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPin, setNewPin] = useState('');
    const [internalDismissed, setInternalDismissed] = useState(false);

    // Check if modal should be shown:
    // 1. Explicit override via prop
    // 2. Or no device owner in localStorage and not internally dismissed
    // 3. Or URL param user specified that differs from currently stored owner
    const storedOwner = typeof window !== 'undefined' ? localStorage.getItem('builder_primary_user') : null;
    const hasStoredOwner = !!storedOwner;
    const isUrlParamSwitch = !!(urlParamUser && (!hasStoredOwner || urlParamUser.toLowerCase() !== (storedOwner || '').toLowerCase()));
    const shouldShow = overrideIsOpen !== undefined 
        ? overrideIsOpen 
        : ((!hasStoredOwner || isUrlParamSwitch) && !internalDismissed);

    if (!shouldShow) return null;

    const handleSelectPerson = (person) => {
        setUserSelection(person);
        setPin('');
        setErrorMsg('');
        setIsAddingNew(false);
    };

    const handleClaimDevice = async (e) => {
        if (e) e.preventDefault();
        if (!selectedUser) return;
        if (!pin || pin.length < 4) {
            setErrorMsg('Please enter your 4-digit PIN.');
            return;
        }

        setVerifying(true);
        setErrorMsg('');

        try {
            const res = await verifyUserPin(selectedUser, pin);
            if (res && res.success) {
                // Cache PIN locally for 0ms frictionless workouts
                const cachedPins = JSON.parse(localStorage.getItem('gymlog_user_pins') || '{}');
                cachedPins[selectedUser.toLowerCase()] = pin;
                localStorage.setItem('gymlog_user_pins', JSON.stringify(cachedPins));
                localStorage.setItem('gymlog_pin_' + selectedUser.toLowerCase(), pin);

                updateDeviceOwner(selectedUser);
                setInternalDismissed(true);
                if (onClose) onClose();
            } else if (res && res.error && res.error.includes('No PIN configured')) {
                // Initial PIN setup for existing roster member without server PIN
                try {
                    await registerNewUser(selectedUser, pin);
                    setInternalDismissed(true);
                    if (onClose) onClose();
                } catch (regErr) {
                    setErrorMsg(regErr.message || 'Failed to initialize PIN for user.');
                }
            } else {
                setErrorMsg(res?.error || 'Invalid PIN. Please check and try again.');
            }
        } catch (err) {
            setErrorMsg(err.message || 'Error verifying PIN.');
        } finally {
            setVerifying(false);
        }
    };

    const handleCreatePerson = async (e) => {
        if (e) e.preventDefault();
        const trimmed = newName.trim();
        if (!trimmed) {
            setErrorMsg('Please enter a name.');
            return;
        }
        if (!newPin || newPin.length < 4) {
            setErrorMsg('A 4-digit PIN is required.');
            return;
        }

        setVerifying(true);
        setErrorMsg('');

        try {
            await registerNewUser(trimmed, newPin);
            setInternalDismissed(true);
            if (onClose) onClose();
        } catch (err) {
            setErrorMsg(err.message || 'Failed to register profile.');
        } finally {
            setVerifying(false);
        }
    };

    const handleContinueGuest = () => {
        updateDeviceOwner('Guest');
        setInternalDismissed(true);
        if (onClose) onClose();
    };

    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
            boxSizing: 'border-box'
        }}>
            <div style={{
                background: 'linear-gradient(180deg, #18181b 0%, #09090b 100%)',
                borderRadius: 20,
                width: '100%',
                maxWidth: 420,
                padding: '28px 24px',
                border: '1px solid rgba(249, 115, 22, 0.35)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(249, 115, 22, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                boxSizing: 'border-box',
                position: 'relative'
            }}>
                {/* Brand Header */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: 'rgba(249, 115, 22, 0.15)',
                        border: '1px solid rgba(249, 115, 22, 0.4)',
                        fontSize: 24,
                        marginBottom: 12
                    }}>
                        🏋️
                    </div>
                    <h2 style={{
                        margin: 0,
                        fontSize: 20,
                        fontWeight: 800,
                        letterSpacing: 2,
                        color: 'white',
                        textTransform: 'uppercase'
                    }}>
                        Welcome to GymLog
                    </h2>
                    <p style={{
                        margin: '6px 0 0',
                        fontSize: 13,
                        color: 'var(--muted)',
                        letterSpacing: 0.5
                    }}>
                        Who is using this device?
                    </p>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: 10,
                        padding: '10px 14px',
                        color: '#f87171',
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}>
                        <span>⚠️</span>
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Flow 1: Claim Selected User PIN */}
                {selectedUser && !isAddingNew ? (
                    <form onSubmit={handleClaimDevice} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#1f1f23',
                            borderRadius: 12,
                            padding: '10px 14px',
                            border: '1px solid var(--border)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: '50%',
                                    background: 'var(--accent)',
                                    color: '#000',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 14
                                }}>
                                    {selectedUser.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{selectedUser}</div>
                                    <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>Enter 4-digit PIN to claim</div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setUserSelection(''); setPin(''); setErrorMsg(''); }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--muted)',
                                    fontSize: 11,
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                            >
                                Switch
                            </button>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', marginBottom: 8, letterSpacing: 1 }}>
                                ENTER 4-DIGIT PIN
                            </label>
                            <input
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                autoFocus
                                value={pin}
                                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                                placeholder="••••"
                                style={{
                                    width: '100%',
                                    background: '#0c0c0e',
                                    border: '1px solid var(--border)',
                                    borderRadius: 10,
                                    padding: '14px',
                                    color: 'white',
                                    fontSize: 20,
                                    textAlign: 'center',
                                    letterSpacing: 8,
                                    fontFamily: 'var(--mono)',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={verifying || pin.length < 4}
                            style={{
                                width: '100%',
                                background: 'var(--accent)',
                                color: '#000',
                                border: 'none',
                                borderRadius: 10,
                                padding: 14,
                                fontSize: 13,
                                fontWeight: 800,
                                letterSpacing: 1,
                                cursor: (verifying || pin.length < 4) ? 'not-allowed' : 'pointer',
                                opacity: (verifying || pin.length < 4) ? 0.6 : 1,
                                transition: 'all 0.15s ease'
                            }}
                        >
                            {verifying ? 'VERIFYING PIN...' : 'CLAIM THIS DEVICE'}
                        </button>
                    </form>
                ) : isAddingNew ? (
                    /* Flow 2: Add New Person */
                    <form onSubmit={handleCreatePerson} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>Create New Profile</span>
                            <button
                                type="button"
                                onClick={() => { setIsAddingNew(false); setErrorMsg(''); }}
                                style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: 11, cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', marginBottom: 6 }}>NAME</label>
                            <input
                                type="text"
                                autoFocus
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder="e.g. Alex"
                                style={{
                                    width: '100%',
                                    background: '#0c0c0e',
                                    border: '1px solid var(--border)',
                                    borderRadius: 10,
                                    padding: '10px 12px',
                                    color: 'white',
                                    fontSize: 14,
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', marginBottom: 6 }}>CREATE 4-DIGIT PIN</label>
                            <input
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={newPin}
                                onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                                placeholder="••••"
                                style={{
                                    width: '100%',
                                    background: '#0c0c0e',
                                    border: '1px solid var(--border)',
                                    borderRadius: 10,
                                    padding: '10px 12px',
                                    color: 'white',
                                    fontSize: 18,
                                    textAlign: 'center',
                                    letterSpacing: 6,
                                    fontFamily: 'var(--mono)',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={verifying || !newName.trim() || newPin.length < 4}
                            style={{
                                width: '100%',
                                background: 'var(--accent)',
                                color: '#000',
                                border: 'none',
                                borderRadius: 10,
                                padding: 12,
                                fontSize: 12,
                                fontWeight: 800,
                                letterSpacing: 1,
                                cursor: (verifying || !newName.trim() || newPin.length < 4) ? 'not-allowed' : 'pointer',
                                opacity: (verifying || !newName.trim() || newPin.length < 4) ? 0.6 : 1
                            }}
                        >
                            {verifying ? 'CREATING...' : 'CREATE & CLAIM PROFILE'}
                        </button>
                    </form>
                ) : (
                    /* Flow 3: Roster Member Selection */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                            gap: 10
                        }}>
                            {people.map(person => (
                                <button
                                    key={person}
                                    type="button"
                                    onClick={() => handleSelectPerson(person)}
                                    style={{
                                        background: '#18181b',
                                        border: '1px solid var(--border)',
                                        borderRadius: 12,
                                        padding: '14px 10px',
                                        color: 'white',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 8,
                                        cursor: 'pointer',
                                        transition: 'transform 0.1s ease, border-color 0.15s ease'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = 'var(--accent)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'var(--border)';
                                        e.currentTarget.style.transform = 'none';
                                    }}
                                >
                                    <div style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        background: 'rgba(249, 115, 22, 0.2)',
                                        border: '1px solid rgba(249, 115, 22, 0.4)',
                                        color: 'var(--accent)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        fontSize: 14
                                    }}>
                                        {person.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{person}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => { setIsAddingNew(true); setErrorMsg(''); }}
                            style={{
                                background: 'transparent',
                                border: '1px dashed var(--border)',
                                borderRadius: 10,
                                padding: 12,
                                color: 'var(--accent)',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6
                            }}
                        >
                            <span>+</span> Add New Person
                        </button>
                    </div>
                )}

                {/* Guest Sandbox Action */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, textAlign: 'center' }}>
                    <button
                        type="button"
                        onClick={handleContinueGuest}
                        style={{
                            width: '100%',
                            background: '#18181b',
                            border: '1px solid var(--border)',
                            borderRadius: 10,
                            padding: '12px 16px',
                            color: 'white',
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: 0.5,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4
                        }}
                    >
                        <span>CONTINUE AS GUEST</span>
                        <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 400 }}>
                            Local sandbox mode • 0 writes to Google Sheets
                        </span>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
