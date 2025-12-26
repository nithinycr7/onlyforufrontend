'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button, Card } from '@/components/ui';
import { Mic, Video, Type, Upload, X } from 'lucide-react';
import { api } from '@/lib/api';
import { MediaRecorderComponent } from '@/components/creator/MediaRecorder';
import styles from './page.module.css';

export default function SubmitQuestionPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params.id as string; // Booking ID
    const serviceName = searchParams.get('serviceName') || 'Consultation';
    const creatorName = searchParams.get('creatorName') || 'Creator';

    const [activeTab, setActiveTab] = useState<'text' | 'audio' | 'video'>('text');
    const [textQuestion, setTextQuestion] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [recordedFilename, setRecordedFilename] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [useRecording, setUseRecording] = useState(true); // Toggle between record and upload

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setRecordedBlob(null); // Clear recording if uploading
        }
    };

    const handleRecordingComplete = (blob: Blob, filename: string) => {
        setRecordedBlob(blob);
        setRecordedFilename(filename);
        setFile(null); // Clear uploaded file if recording
    };

    const clearFile = () => setFile(null);
    const clearRecording = () => {
        setRecordedBlob(null);
        setRecordedFilename('');
    };

    const handleSubmit = async () => {
        if (activeTab === 'text' && !textQuestion.trim()) return;
        if ((activeTab === 'audio' || activeTab === 'video') && !file && !recordedBlob) return;

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('question_type', activeTab);

            // Allow question_text for all types if present
            if (textQuestion) {
                formData.append('question_text', textQuestion);
            }

            // Backend expects 'media' field for file
            if (activeTab !== 'text') {
                if (recordedBlob) {
                    formData.append('media', recordedBlob, recordedFilename);
                } else if (file) {
                    formData.append('media', file);
                }
            }

            const url = `/bookings/${id}/question`;

            await api.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            router.push('/fan/bookings');
        } catch (error: any) {
            console.error('Submission failed:', error);
            const msg = error.response?.data?.detail || 'Failed to submit question';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const isReadyToSubmit = () => {
        if (activeTab === 'text') return textQuestion.trim().length > 0;
        return !!(recordedBlob || file);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Ask your question</h1>
                <p>For {serviceName} with {creatorName}</p>
            </div>

            <Card className={styles.card}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'text' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('text')}
                    >
                        <Type size={18} /> Text
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'audio' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('audio')}
                    >
                        <Mic size={18} /> Audio
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'video' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('video')}
                    >
                        <Video size={18} /> Video
                    </button>
                </div>

                <div className={styles.content}>
                    {activeTab === 'text' && (
                        <textarea
                            className={styles.textarea}
                            placeholder="Type your question here... be as specific as possible so the creator can give a great answer!"
                            rows={8}
                            value={textQuestion}
                            onChange={(e) => setTextQuestion(e.target.value)}
                        />
                    )}

                    {(activeTab === 'audio' || activeTab === 'video') && (
                        <div className={styles.mediaArea}>
                            {/* Toggle between record and upload */}
                            <div className={styles.modeToggle}>
                                <button
                                    className={`${styles.modeBtn} ${useRecording ? styles.active : ''}`}
                                    onClick={() => setUseRecording(true)}
                                >
                                    {activeTab === 'audio' ? <Mic size={16} /> : <Video size={16} />}
                                    Record
                                </button>
                                <button
                                    className={`${styles.modeBtn} ${!useRecording ? styles.active : ''}`}
                                    onClick={() => setUseRecording(false)}
                                >
                                    <Upload size={16} />
                                    Upload
                                </button>
                            </div>

                            {useRecording ? (
                                <MediaRecorderComponent
                                    type={activeTab}
                                    onRecordingComplete={handleRecordingComplete}
                                />
                            ) : (
                                <div className={styles.uploadArea}>
                                    {!file ? (
                                        <label className={styles.uploadLabel}>
                                            <input
                                                type="file"
                                                hidden
                                                accept={activeTab === 'audio' ? "audio/*" : "video/*"}
                                                onChange={handleFileChange}
                                            />
                                            <div className={styles.uploadPlaceholder}>
                                                <div className={styles.iconCircle}>
                                                    <Upload size={24} />
                                                </div>
                                                <span>Click to upload {activeTab}</span>
                                                <span className={styles.formatHint}>
                                                    {activeTab === 'audio' ? 'MP3, M4A, WAV' : 'MP4, MOV'}
                                                </span>
                                            </div>
                                        </label>
                                    ) : (
                                        <div className={styles.filePreview}>
                                            <div className={styles.fileInfo}>
                                                {activeTab === 'audio' ? <Mic size={20} /> : <Video size={20} />}
                                                <div className={styles.fileName}>{file.name}</div>
                                                <div className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                                            </div>
                                            <button onClick={clearFile} className={styles.removeBtn}>
                                                <X size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Optional text note */}
                            <div className={styles.noteInput}>
                                <label>Add a note (optional)</label>
                                <input
                                    type="text"
                                    placeholder="Brief context..."
                                    value={textQuestion}
                                    onChange={(e) => setTextQuestion(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.actions}>
                    <Button
                        fullWidth
                        size="lg"
                        onClick={handleSubmit}
                        loading={submitting}
                        disabled={submitting || !isReadyToSubmit()}
                    >
                        Submit Question
                    </Button>
                </div>
            </Card>
        </div>
    );
}
