import React, { useState, useRef } from 'react';
import { useGymAPI } from '../hooks/useGymAPI';

export default function ImageModal({ ex, baseName, isOpen, onClose, setToast }) {
    const { sheetsPost } = useGymAPI();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const pin = window.prompt("Admin PIN required to upload image:");
        if (pin === null) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64data = reader.result;
            try {
                await sheetsPost({
                    action: "uploadImage",
                    exercise: ex.name,
                    data: base64data,
                    filename: file.name,
                    pin: pin
                });
                setToast("Image uploaded! Reloading...");
                setTimeout(() => window.location.reload(), 1500);
            } catch (err) {
                console.error(err);
                setToast("Error uploading image");
                setTimeout(() => setToast(""), 3000);
            } finally {
                setIsUploading(false);
                onClose();
            }
        };
        reader.readAsDataURL(file);
    };

    const getImageUrl = (fileRef) => {
        if (!fileRef) return `${import.meta.env.BASE_URL}images/placeholder.jpg`;
        if (!fileRef.includes('.') && fileRef.length > 10) {
            return `https://docs.google.com/uc?export=view&id=${fileRef}`;
        }
        return `${import.meta.env.BASE_URL}images/${fileRef}`;
    };
    const imgSrc = getImageUrl(ex.fileReference);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }} onClick={onClose}>
            <div style={{ background: '#111', padding: 16, borderRadius: 12, position: 'relative', width: '100%', maxWidth: '100%', maxHeight: '100%', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{baseName}</div>
                    <button className="btn-ghost" onClick={onClose} style={{ fontSize: 20, padding: 0, lineHeight: 1 }}>×</button>
                </div>
                
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                    {ex.fileReference ? (
                        <img 
                            src={imgSrc} 
                            alt={baseName} 
                            style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: 8 }}
                            onError={(e) => { 
                                if (!e.target.dataset.retried) {
                                    e.target.dataset.retried = true;
                                    const safeName = (ex.name || "").replace(/\s*\/\s*/g, " ");
                                    e.target.src = `${import.meta.env.BASE_URL}images/${safeName}.jpg`;
                                } else {
                                    e.target.style.display = 'none'; 
                                    e.target.insertAdjacentHTML('afterend', '<div style=\"color: var(--muted); padding: 32px; text-align: center; border: 1px dashed var(--border); border-radius: 8px;\">Image not found for this exercise.</div>'); 
                                }
                            }}
                        />
                    ) : (
                        <div style={{ color: 'var(--muted)', padding: 32, textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 8 }}>
                            No image available for this exercise.
                        </div>
                    )}
                </div>

                <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleImageUpload} 
                />

                <button 
                    className="btn-success" 
                    style={{ padding: 12, fontWeight: 'bold', width: '100%' }} 
                    onClick={() => fileInputRef.current.click()}
                    disabled={isUploading}
                >
                    {isUploading ? "UPLOADING TO DRIVE..." : "UPLOAD NEW IMAGE"}
                </button>
            </div>
        </div>
    );
}
