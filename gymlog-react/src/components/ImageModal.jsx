import React, { useState, useRef, useEffect } from 'react';
import { useGymAPI } from '../hooks/useGymAPI';

const compressImage = (file, maxWidth = 1000, maxHeight = 1000, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

export default function ImageModal({ ex, baseName, isOpen, onClose, setToast }) {
    const { sheetsPost } = useGymAPI();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const pin = window.prompt("Admin PIN required to upload image:");
        if (pin === null) return;

        setIsUploading(true);
        try {
            const compressedBase64 = await compressImage(file);
            await sheetsPost({
                action: "uploadImage",
                exercise: ex.name,
                data: compressedBase64,
                filename: file.name.replace(/\.[^/.]+$/, "") + ".jpg",
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

    const [proxiedSrc, setProxiedSrc] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);

    const isDriveId = (ref) => ref && !ref.includes('.') && ref.length > 10;

    useEffect(() => {
        if (!isOpen || !ex.fileReference) return;

        if (isDriveId(ex.fileReference)) {
            // Check sessionStorage cache first
            const cacheKey = 'gymlog_img_' + ex.fileReference;
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                setProxiedSrc(cached);
                setImageError(false);
                return;
            }

            setImageLoading(true);
            setImageError(false);
            setProxiedSrc(null);
            sheetsPost({ action: "getImage", fileId: ex.fileReference })
                .then(res => {
                    if (res?.imageData) {
                        setProxiedSrc(res.imageData);
                        // Cache in sessionStorage for this browser session
                        try { sessionStorage.setItem(cacheKey, res.imageData); } catch (e) { /* quota exceeded, skip cache */ }
                    } else {
                        setImageError(true);
                    }
                })
                .catch(() => setImageError(true))
                .finally(() => setImageLoading(false));
        }
    }, [isOpen, ex.fileReference, sheetsPost]);

    const imgSrc = isDriveId(ex.fileReference)
        ? proxiedSrc
        : ex.fileReference
            ? `${import.meta.env.BASE_URL}images/${ex.fileReference}`
            : null;

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }} onClick={onClose}>
            <div style={{ background: '#111', padding: 16, borderRadius: 12, position: 'relative', width: '100%', maxWidth: '100%', maxHeight: '100%', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{baseName}</div>
                    <button className="btn-ghost" onClick={onClose} style={{ fontSize: 20, padding: 0, lineHeight: 1 }}>×</button>
                </div>
                
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                    {imageLoading ? (
                        <div style={{ color: 'var(--muted)', padding: 32, textAlign: 'center' }}>
                            Loading image...
                        </div>
                    ) : imageError ? (
                        <div style={{ color: 'var(--muted)', padding: 32, textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 8 }}>
                            Image not found for this exercise.
                        </div>
                    ) : imgSrc ? (
                        <img
                            src={imgSrc}
                            alt={baseName}
                            style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: 8 }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                setImageError(true);
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
