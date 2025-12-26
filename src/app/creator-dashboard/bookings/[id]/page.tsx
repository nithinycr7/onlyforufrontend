'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Upload, X, Mic, Video } from 'lucide-react';
import { api } from '@/lib/api';
import { MediaRecorderComponent } from '@/components/creator/MediaRecorder';
import styles from './page.module.css';

interface Booking {
    id: string;
    fan_name: string;
    fan_email: string;
    fan_profile_image_url?: string;
    service_title?: string;
    question_type?: string;
    question_text?: string;
    question_audio_url?: string;
    question_video_url?: string;
    status: string;
    created_at: string;
}

export default function BookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params.id as string;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [responseType, setResponseType] = useState<'voice' | 'video'>('voice');
    const [inputMode, setInputMode] = useState<'upload' | 'record'>('record'); // Default to record
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        fetchBookingDetails();
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        try {
            const response = await api.get(`/creator/bookings`);
            const allBookings = response.data;
            const currentBooking = allBookings.find((b: Booking) => b.id === bookingId);
            setBooking(currentBooking || null);
        } catch (error) {
            console.error('Failed to fetch booking:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleRecordingComplete = (blob: Blob, filename: string) => {
        // Convert blob to File object
        const file = new File([blob], filename, { type: blob.type });
        setFile(file);
    };

    const handleSubmitResponse = async () => {
        if (!file) return;

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('response_type', responseType);
            formData.append('media', file);

            await api.post(`/bookings/${bookingId}/response`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('Response submitted successfully!');
            router.push('/creator-dashboard/bookings');
        } catch (error: any) {
            console.error('Failed to submit response:', error);
            const msg = error.response?.data?.detail || 'Failed to submit response';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>Booking not found</div>
            </div>
        );
    }

    const canRespond = booking.status === 'awaiting_response';

    return (
        <div className={styles.container}>
            <button className={styles.backBtn} onClick={() => router.back()}>
                <ArrowLeft size={20} />
                Back to Bookings
            </button>

            <div className={styles.content}>
                {/* Fan Info */}
                <div className={styles.fanSection}>
                    <div className={styles.fanAvatar}>
                        {booking.fan_profile_image_url ? (
                            <img src={booking.fan_profile_image_url} alt={booking.fan_name} />
                        ) : (
                            <User size={32} />
                        )}
                    </div>
                    <div>
                        <h2>{booking.fan_name}</h2>
                        <p>{booking.fan_email}</p>
                        <span className={styles.serviceTag}>{booking.service_title || 'Consultation'}</span>
                    </div>
                </div>

                {/* Question Section */}
                <div className={styles.questionSection}>
                    <h3>Fan's Question</h3>

                    {booking.question_type === 'text' && booking.question_text && (
                        <div className={styles.textQuestion}>
                            <p>{booking.question_text}</p>
                        </div>
                    )}

                    {booking.question_type === 'audio' && booking.question_audio_url && (
                        <div className={styles.mediaQuestion}>
                            <div className={styles.mediaLabel}>
                                <Mic size={20} />
                                Audio Question
                            </div>
                            <audio controls src={booking.question_audio_url} className={styles.audioPlayer} />
                            {booking.question_text && (
                                <div className={styles.additionalNote}>
                                    <strong>Note:</strong> {booking.question_text}
                                </div>
                            )}
                        </div>
                    )}

                    {booking.question_type === 'video' && booking.question_video_url && (
                        <div className={styles.mediaQuestion}>
                            <div className={styles.mediaLabel}>
                                <Video size={20} />
                                Video Question
                            </div>
                            <video controls src={booking.question_video_url} className={styles.videoPlayer} />
                            {booking.question_text && (
                                <div className={styles.additionalNote}>
                                    <strong>Note:</strong> {booking.question_text}
                                </div>
                            )}
                        </div>
                    )}

                    {!booking.question_type && (
                        <div className={styles.noQuestion}>
                            <p>Fan hasn't submitted their question yet.</p>
                        </div>
                    )}
                </div>

                {/* Response Section */}
                {canRespond && (
                    <div className={styles.responseSection}>
                        <h3>Submit Your Response</h3>

                        <div className={styles.responseTypeTabs}>
                            <button
                                className={`${styles.typeTab} ${responseType === 'voice' ? styles.activeTypeTab : ''}`}
                                onClick={() => setResponseType('voice')}
                            >
                                <Mic size={18} />
                                Audio
                            </button>
                            <button
                                className={`${styles.typeTab} ${responseType === 'video' ? styles.activeTypeTab : ''}`}
                                onClick={() => setResponseType('video')}
                            >
                                <Video size={18} />
                                Video
                            </button>
                        </div>

                        {/* Mode Toggle */}
                        <div className={styles.modeToggle}>
                            <button
                                className={`${styles.modeBtn} ${inputMode === 'record' ? styles.activeModeBtn : ''}`}
                                onClick={() => {
                                    setInputMode('record');
                                    setFile(null);
                                }}
                            >
                                🎙️ Record
                            </button>
                            <button
                                className={`${styles.modeBtn} ${inputMode === 'upload' ? styles.activeModeBtn : ''}`}
                                onClick={() => {
                                    setInputMode('upload');
                                    setFile(null);
                                }}
                            >
                                📤 Upload
                            </button>
                        </div>

                        {/* Recording Mode */}
                        {inputMode === 'record' && (
                            <MediaRecorderComponent
                                type={responseType === 'voice' ? 'audio' : 'video'}
                                onRecordingComplete={handleRecordingComplete}
                            />
                        )}

                        {/* Upload Mode */}
                        {inputMode === 'upload' && (
                            <div className={styles.uploadArea}>
                                {!file ? (
                                    <label className={styles.uploadLabel}>
                                        <input
                                            type="file"
                                            hidden
                                            accept={responseType === 'voice' ? 'audio/*' : 'video/*'}
                                            onChange={handleFileChange}
                                        />
                                        <div className={styles.uploadPlaceholder}>
                                            <Upload size={32} />
                                            <span>Click to upload {responseType} response</span>
                                            <span className={styles.formatHint}>
                                                {responseType === 'voice' ? 'MP3, M4A, WAV' : 'MP4, MOV'} (Max 100MB)
                                            </span>
                                        </div>
                                    </label>
                                ) : (
                                    <div className={styles.filePreview}>
                                        <div className={styles.fileInfo}>
                                            {responseType === 'voice' ? <Mic size={24} /> : <Video size={24} />}
                                            <div>
                                                <div className={styles.fileName}>{file.name}</div>
                                                <div className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                                            </div>
                                        </div>
                                        <button onClick={() => setFile(null)} className={styles.removeBtn}>
                                            <X size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            className={styles.submitBtn}
                            onClick={handleSubmitResponse}
                            disabled={!file || submitting}
                        >
                            {submitting ? 'Submitting...' : 'Submit Response'}
                        </button>
                    </div>
                )}

                {booking.status === 'completed' && (
                    <div className={styles.completedBanner}>
                        ✅ You've already responded to this booking
                    </div>
                )}

                {booking.status === 'pending_question' && (
                    <div className={styles.pendingBanner}>
                        ⏳ Waiting for fan to submit their question
                    </div>
                )}
            </div>
        </div >
    );
}
