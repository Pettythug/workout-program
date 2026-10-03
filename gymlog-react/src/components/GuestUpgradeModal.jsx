import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';

export default function GuestUpgradeModal({ isOpen, onClose, onStayGuest, isInline = false }) {
    const { upgradeGuestToCloudUser, people } = useAppContext();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [statusMsg, setStatusMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen && !isInline) return null;

    const handleUpgrade = async (e) => {
        if (e) e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
            setStatusMsg('Please enter a name.');
            return;
        }
        if (!pin || pin.length < 4) {
            setStatusMsg('A 4-digit PIN is required.');
            return;
        }

        setIsSubmitting(true);
        setStatusMsg('Registering profile & syncing workouts to cloud...');

        try {
            await upgradeGuestToCloudUser(trimmed, pin);
            setIsSuccess(true);
            setStatusMsg('Success! Your profile is claimed and workout history synced to Google Sheets.');
            setTimeout(() => {
                if (onClose) onClose();
            }, 1800);
        } catch (err) {
            setStatusMsg(err.message || 'Upgrade failed. Please try again.');
            setIsSubmitting(false);
        }
    };

    const benefits = [
        { icon: '🔄', title: 'Cross-Device Sync', desc: 'Seamlessly access your logs on phone, tablet, and computer.' },
        { icon: '🛡️', title: 'Permanent Cloud Backup', desc: 'Never lose your workouts if browser cache or phone storage is cleared.' },
        { icon: '🏆', title: 'Lifetime Personal Bests', desc: 'Track your PRs, rep records, and historical progression across years.' },
        { icon: '🔒', title: 'Secure PIN Access', desc: '4-digit PIN protects your logs while keeping logging frictionless.' }
    ];

    const cardContent = (
        <div style={{
            background: 'linear-gradient(180deg, #18181b 0%, #09090b 100%)',
            borderRadius: 20,
            width: '100%',
            maxWidth: 440,
            padding: '24px 20px',
            border: '1px solid rgba(249, 115, 22, 0.4)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 25px rgba(249, 115, 22, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            boxSizing: 'border-box',
            textAlign: 'left'
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>🎉 ☁️</div>
                <h3 style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 800,
                    letterSpacing: 1.5,
                    color: 'white',
                    textTransform: 'uppercase'
                }}>
                    Workout Complete!
                </h3>
                <p style={{
                    margin: '6px 0 0',
                    fontSize: 12,
                    color: 'var(--accent)',
                    fontWeight: 600,
                    fontFamily: 'var(--mono)'
                }}>
                    Upgrade to Cloud Backup & Sync
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                    Your session is currently saved in local sandbox memory.
                </p>
            </div>

            {/* Benefits List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {benefits.map((b, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 10,
                        padding: '10px 12px',
                        border: '1px solid rgba(255, 255, 255, 0.06)'
                    }}>
                        <span style={{ fontSize: 18, lineHeight: 1 }}>{b.icon}</span>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{b.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{b.desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Status Message */}
            {statusMsg && (
                <div style={{
                    background: isSuccess ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    border: `1px solid ${isSuccess ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: isSuccess ? '#4ade80' : '#f87171',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    <span>{isSuccess ? '✅' : '⚠️'}</span>
                    <span>{statusMsg}</span>
                </div>
            )}

            {/* Upgrade Form or Action Buttons */}
            {isFormOpen && !isSuccess ? (
                <form onSubmit={handleUpgrade} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--muted)', marginBottom: 4 }}>
                            PROFILE NAME (OR SELECT EXISTING)
                        </label>
                        <input
                            type="text"
                            autoFocus
                            list="existing-roster"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Dad, Brian, or New Name"
                            style={{
                                width: '100%',
                                background: '#0c0c0e',
                                border: '1px solid var(--border)',
                                borderRadius: 8,
                                padding: '10px 12px',
                                color: 'white',
                                fontSize: 13,
                                boxSizing: 'border-box'
                            }}
                        />
                        <datalist id="existing-roster">
                            {people.map(p => <option key={p} value={p} />)}
                        </datalist>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--muted)', marginBottom: 4 }}>
                            4-DIGIT PIN
                        </label>
                        <input
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            value={pin}
                            onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="••••"
                            style={{
                                width: '100%',
                                background: '#0c0c0e',
                                border: '1px solid var(--border)',
                                borderRadius: 8,
                                padding: '10px 12px',
                                color: 'white',
                                fontSize: 16,
                                textAlign: 'center',
                                letterSpacing: 6,
                                fontFamily: 'var(--mono)',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !name.trim() || pin.length < 4}
                        style={{
                            width: '100%',
                            background: 'var(--accent)',
                            color: '#000',
                            border: 'none',
                            borderRadius: 10,
                            padding: '12px',
                            fontWeight: 800,
                            fontSize: 12,
                            letterSpacing: 1,
                            cursor: (isSubmitting || !name.trim() || pin.length < 4) ? 'not-allowed' : 'pointer',
                            opacity: (isSubmitting || !name.trim() || pin.length < 4) ? 0.6 : 1
                        }}
                    >
                        {isSubmitting ? 'SYNCING TO CLOUD...' : 'CONFIRM & SYNC WORKOUT'}
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--muted)',
                            fontSize: 11,
                            cursor: 'pointer',
                            textAlign: 'center'
                        }}
                    >
                        Back to overview
                    </button>
                </form>
            ) : !isSuccess ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                    <button
                        type="button"
                        onClick={() => setIsFormOpen(true)}
                        style={{
                            width: '100%',
                            background: 'var(--accent)',
                            color: '#000',
                            border: 'none',
                            borderRadius: 10,
                            padding: '14px',
                            fontWeight: 800,
                            fontSize: 13,
                            letterSpacing: 1,
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)'
                        }}
                    >
                        ✨ CREATE PROFILE & SYNC TO CLOUD
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            if (onStayGuest) onStayGuest();
                            if (onClose) onClose();
                        }}
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: 10,
                            padding: '10px 14px',
                            color: 'var(--muted)',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        STAY IN GUEST MODE
                    </button>
                </div>
            ) : null}
        </div>
    );

    if (isInline) {
        return cardContent;
    }

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
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
            boxSizing: 'border-box'
        }}>
            {cardContent}
        </div>,
        document.body
    );
}
