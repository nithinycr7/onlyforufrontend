'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button, Card } from '@/components/ui';
import { Mic, Video, Upload, X, FileAudio, FileVideo, Image as ImageIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { MediaRecorderComponent } from '@/components/creator/MediaRecorder';
import MultiFileUpload from '@/components/ui/MultiFileUpload';
import { DynamicContextForm } from '@/components/booking/DynamicContextForm';
import styles from './page.module.css';

function SubmitQuestionContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const serviceName = searchParams.get('serviceName') || 'Consultation';
    const creatorName = searchParams.get('creatorName') || 'Creator';

    const [textQuestion, setTextQuestion] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [extraFormData, setExtraFormData] = useState<Record<string, any>>({});
    const [bookingData, setBookingData] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [recordingMode, setRecordingMode] = useState<'none' | 'audio' | 'video'>('none');

    const loadBooking = async () => {
        try {
            const response = await api.get(`/bookings/${id}`);
            setBookingData(response.data || response);
        } catch (err) {
            console.error('Failed to load booking:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBooking();
    }, []);

    const handleExtraFormChange = (name: string, value: any) => {
        setExtraFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFilesChange = (newFiles: File[]) => {
        setFiles(newFiles);
    };

    const handleRecordingComplete = (blob: Blob, filename: string) => {
        const file = new File([blob], filename, { type: blob.type });
        setFiles([...files, file]);
        setRecordingMode('none');
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('audio/')) return <FileAudio size={20} />;
        if (file.type.startsWith('video/')) return <FileVideo size={20} />;
        if (file.type.startsWith('image/')) return <ImageIcon size={20} />;
        return <Upload size={20} />;
    };

    const handleSubmit = async () => {
        if (!textQuestion.trim() && files.length === 0) {
            alert('Please add a question or upload at least one file');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();

            let questionType = 'text';
            if (files.length > 0) {
                questionType = files.length === 1 ?
                    (files[0].type.startsWith('audio/') ? 'audio' :
                        files[0].type.startsWith('video/') ? 'video' :
                            files[0].type.startsWith('image/') ? 'image' : 'multi')
                    : 'multi';
            }

            formData.append('question_type', questionType);

            if (textQuestion.trim()) {
                formData.append('question_text', textQuestion);
            }

            files.forEach((file) => {
                if (file.type.startsWith('audio/')) {
                    formData.append('audio_files', file);
                } else if (file.type.startsWith('video/')) {
                    formData.append('video_files', file);
                } else if (file.type.startsWith('image/')) {
                    formData.append('image_files', file);
                }
            });

            if (Object.keys(extraFormData).length > 0) {
                formData.append('form_data', JSON.stringify(extraFormData));
            }

            const response = await api.post(`/bookings/${id}/question`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Only redirect if submission was successful
            if (response.status === 200 || response.status === 201) {
                router.push('/fan/bookings');
            }
        } catch (error: any) {
            console.error('Submission failed:', error);
            // Show more specific error message
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to submit question';
            alert(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Ask your question</h1>
                <p>For {serviceName} with {creatorName}</p>
                <div className={styles.headerHint}>
                    ✨ Combine text, audio, video, and images for a complete question
                </div>
            </div>

            <Card className={styles.card}>
                {/* Dynamic Context Form */}
                {bookingData?.question_form_template && (
                    <div className={styles.contextFormWrapper}>
                        <DynamicContextForm
                            template={bookingData.question_form_template}
                            formData={extraFormData}
                            onChange={handleExtraFormChange}
                        />
                        <div className={styles.contextDivider} />
                    </div>
                )}

                {/* Text Question */}
                <div className={styles.textSection}>
                    <label className={styles.label}>Your Question</label>
                    <textarea
                        className={styles.textarea}
                        placeholder="Type your question here... be as specific as possible!"
                        rows={6}
                        value={textQuestion}
                        onChange={(e) => setTextQuestion(e.target.value)}
                    />
                </div>

                {/* Recording Options */}
                <div className={styles.recordingSection}>
                    <label className={styles.label}>Record Live (Optional)</label>
                    <div className={styles.recordingButtons}>
                        <button
                            className={`${styles.recordBtn} ${recordingMode === 'audio' ? styles.active : ''}`}
                            onClick={() => setRecordingMode(recordingMode === 'audio' ? 'none' : 'audio')}
                            type="button"
                        >
                            <Mic size={20} />
                            {recordingMode === 'audio' ? 'Cancel Audio' : 'Record Audio'}
                        </button>
                        <button
                            className={`${styles.recordBtn} ${recordingMode === 'video' ? styles.active : ''}`}
                            onClick={() => setRecordingMode(recordingMode === 'video' ? 'none' : 'video')}
                            type="button"
                        >
                            <Video size={20} />
                            {recordingMode === 'video' ? 'Cancel Video' : 'Record Video'}
                        </button>
                    </div>

                    {recordingMode !== 'none' && (
                        <div className={styles.recorderContainer}>
                            <MediaRecorderComponent
                                type={recordingMode}
                                onRecordingComplete={handleRecordingComplete}
                            />
                        </div>
                    )}
                </div>

                {/* Multi-File Upload */}
                <div className={styles.uploadSection}>
                    <label className={styles.label}>
                        Upload Files (Optional)
                        <span className={styles.labelHint}>
                            Or upload pre-recorded audio, video, or images
                        </span>
                    </label>
                    <MultiFileUpload
                        onFilesChange={handleFilesChange}
                        maxAudioFiles={3}
                        maxVideoFiles={2}
                        maxImageFiles={5}
                    />
                </div>

                {/* Files Preview */}
                {files.length > 0 && (
                    <div className={styles.filesPreview}>
                        <label className={styles.label}>
                            Attached Files ({files.length})
                        </label>
                        <div className={styles.filesList}>
                            {files.map((file, index) => (
                                <div key={index} className={styles.fileItem}>
                                    <div className={styles.fileInfo}>
                                        <div className={styles.fileIcon}>
                                            {getFileIcon(file)}
                                        </div>
                                        <div className={styles.fileDetails}>
                                            <div className={styles.fileName}>{file.name}</div>
                                            <div className={styles.fileSize}>
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFile(index)}
                                        className={styles.removeBtn}
                                        type="button"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={styles.actions}>
                    <Button
                        fullWidth
                        size="lg"
                        onClick={handleSubmit}
                        loading={submitting}
                        disabled={submitting || (!textQuestion.trim() && files.length === 0)}
                    >
                        Submit Question {files.length > 0 && `(${files.length} file${files.length > 1 ? 's' : ''})`}
                    </Button>
                </div>
            </Card>
        </div>
    );
}

export default function SubmitQuestionPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SubmitQuestionContent />
        </Suspense>
    );
}
