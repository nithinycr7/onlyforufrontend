'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, FileAudio, FileVideo, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import styles from './MultiFileUpload.module.css';

interface UploadedFile {
    file: File;
    id: string;
    type: 'audio' | 'video' | 'image';
    preview?: string;
}

interface MultiFileUploadProps {
    onFilesChange: (files: File[]) => void;
    maxAudioFiles?: number;
    maxVideoFiles?: number;
    maxImageFiles?: number;
}

export default function MultiFileUpload({
    onFilesChange,
    maxAudioFiles = 3,
    maxVideoFiles = 2,
    maxImageFiles = 5,
}: MultiFileUploadProps) {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const getFileType = (file: File): 'audio' | 'video' | 'image' | null => {
        if (file.type.startsWith('audio/')) return 'audio';
        if (file.type.startsWith('video/')) return 'video';
        if (file.type.startsWith('image/')) return 'image';
        return null;
    };

    const canAddFile = (type: 'audio' | 'video' | 'image'): boolean => {
        const counts = uploadedFiles.reduce(
            (acc, f) => {
                acc[f.type]++;
                return acc;
            },
            { audio: 0, video: 0, image: 0 }
        );

        if (type === 'audio' && counts.audio >= maxAudioFiles) return false;
        if (type === 'video' && counts.video >= maxVideoFiles) return false;
        if (type === 'image' && counts.image >= maxImageFiles) return false;
        return true;
    };

    const handleFiles = useCallback(
        (files: FileList | File[]) => {
            const newFiles: UploadedFile[] = [];

            Array.from(files).forEach((file) => {
                const type = getFileType(file);
                if (!type) return;

                if (!canAddFile(type)) {
                    alert(`Maximum ${type} files reached`);
                    return;
                }

                const id = Math.random().toString(36).substr(2, 9);
                const uploadedFile: UploadedFile = { file, id, type };

                // Create preview for images
                if (type === 'image') {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        uploadedFile.preview = e.target?.result as string;
                        setUploadedFiles((prev) => [...prev, uploadedFile]);
                        onFilesChange([...uploadedFiles.map((f) => f.file), file]);
                    };
                    reader.readAsDataURL(file);
                } else {
                    newFiles.push(uploadedFile);
                }
            });

            if (newFiles.length > 0) {
                setUploadedFiles((prev) => [...prev, ...newFiles]);
                onFilesChange([...uploadedFiles.map((f) => f.file), ...newFiles.map((f) => f.file)]);
            }
        },
        [uploadedFiles, onFilesChange]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
        },
        [handleFiles]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
                handleFiles(e.target.files);
            }
        },
        [handleFiles]
    );

    const removeFile = (id: string) => {
        const newFiles = uploadedFiles.filter((f) => f.id !== id);
        setUploadedFiles(newFiles);
        onFilesChange(newFiles.map((f) => f.file));
    };

    const getFileIcon = (type: 'audio' | 'video' | 'image') => {
        switch (type) {
            case 'audio':
                return <FileAudio size={24} className={styles.fileIcon} />;
            case 'video':
                return <FileVideo size={24} className={styles.fileIcon} />;
            case 'image':
                return <ImageIcon size={24} className={styles.fileIcon} />;
            default:
                return <FileIcon size={24} className={styles.fileIcon} />;
        }
    };

    const counts = uploadedFiles.reduce(
        (acc, f) => {
            acc[f.type]++;
            return acc;
        },
        { audio: 0, video: 0, image: 0 }
    );

    return (
        <div className={styles.container}>
            {/* Upload Area */}
            <div
                className={`${styles.uploadArea} ${isDragging ? styles.dragging : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept="audio/*,video/*,image/*"
                    onChange={handleFileInput}
                    className={styles.fileInput}
                />
                <label htmlFor="file-upload" className={styles.uploadLabel}>
                    <Upload size={48} className={styles.uploadIcon} />
                    <h3 className={styles.uploadTitle}>
                        {isDragging ? 'Drop files here' : 'Drag & drop files or click to browse'}
                    </h3>
                    <p className={styles.uploadHint}>
                        Audio, video, or images • Max {maxAudioFiles} audio, {maxVideoFiles} video, {maxImageFiles} images
                    </p>
                </label>
            </div>

            {/* File Limits */}
            <div className={styles.limits}>
                <div className={`${styles.limitBadge} ${counts.audio >= maxAudioFiles ? styles.limitReached : ''}`}>
                    <FileAudio size={16} />
                    {counts.audio}/{maxAudioFiles} Audio
                </div>
                <div className={`${styles.limitBadge} ${counts.video >= maxVideoFiles ? styles.limitReached : ''}`}>
                    <FileVideo size={16} />
                    {counts.video}/{maxVideoFiles} Video
                </div>
                <div className={`${styles.limitBadge} ${counts.image >= maxImageFiles ? styles.limitReached : ''}`}>
                    <ImageIcon size={16} />
                    {counts.image}/{maxImageFiles} Images
                </div>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
                <div className={styles.fileList}>
                    <h4 className={styles.fileListTitle}>Uploaded Files ({uploadedFiles.length})</h4>
                    <div className={styles.files}>
                        {uploadedFiles.map((uploadedFile) => (
                            <div key={uploadedFile.id} className={styles.fileCard}>
                                {uploadedFile.type === 'image' && uploadedFile.preview ? (
                                    <div className={styles.imagePreview}>
                                        <img src={uploadedFile.preview} alt={uploadedFile.file.name} />
                                    </div>
                                ) : (
                                    <div className={styles.fileIconContainer}>{getFileIcon(uploadedFile.type)}</div>
                                )}
                                <div className={styles.fileInfo}>
                                    <div className={styles.fileName}>{uploadedFile.file.name}</div>
                                    <div className={styles.fileSize}>
                                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                                    </div>
                                </div>
                                <button onClick={() => removeFile(uploadedFile.id)} className={styles.removeBtn}>
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
