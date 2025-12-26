'use client';

import React, { useState, useRef } from 'react';
import { Camera, User, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import styles from './AvatarUpload.module.css';

interface AvatarUploadProps {
    initialImage?: string;
    onUploadComplete: (url: string) => void;
    placeholderName?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
    initialImage,
    onUploadComplete,
    placeholderName = 'C'
}) => {
    const [preview, setPreview] = useState<string | undefined>(initialImage);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        setError(null);
        setUploading(true);

        // Optimistic preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

            const response = await api.post('/creators/profile-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            onUploadComplete(response.data.profile_image_url);
        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.response?.data?.detail || 'Upload failed. Please try again.');
            // Revert preview on failure
            setPreview(initialImage);
        } finally {
            setUploading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={styles.container}>
            <div className={styles.uploadWrapper}>
                <div className={styles.avatarCircle} onClick={triggerFileInput}>
                    {preview ? (
                        <img src={preview} alt="Profile" className={styles.avatarImage} />
                    ) : (
                        <div className={styles.placeholder}>
                            <User size={40} />
                            <span>Add Photo</span>
                        </div>
                    )}

                    {uploading && (
                        <div className={styles.loadingOverlay}>
                            <div className={styles.spinner} />
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    className={styles.editBadge}
                    onClick={triggerFileInput}
                    disabled={uploading}
                >
                    <Camera size={18} />
                </button>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    hidden
                />
            </div>

            {error && <div className={styles.error}>{error}</div>}
            {!error && !uploading && <div className={styles.hint}>Recommended: Square JPG or PNG</div>}
        </div>
    );
};
