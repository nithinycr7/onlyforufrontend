'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Upload, X, Mic, Video } from 'lucide-react';
import { api } from '@/lib/api';
import { MediaRecorderComponent } from '@/components/creator/MediaRecorder';
import AIQuestionSummary from '@/components/creator/AIQuestionSummary';
import AIProcessingStatus from '@/components/creator/AIProcessingStatus';
import { useAISummary } from '@/hooks/useAISummary';
import styles from './page.module.css';

interface Booking {
    id: string;
    fan_name: string;
    fan_email: string;
    fan_profile_image_url?: string;
    service_title?: string;
    question_type?: string;
    question_text?: string;
    question_audio_urls?: string[];  // Changed to plural array
    question_video_urls?: string[];  // Changed to plural array
    question_image_urls?: string[];  // Added for images
    response_media_url?: string;
    response_type?: string;
    response_text?: string;
    status: string;
    created_at: string;
}

// AI Summary Section Component
function AIQuestionSummarySection({ bookingId }: { bookingId: string }) {
    const { data, loading, isProcessing } = useAISummary({ bookingId });

    if (loading && !data) {
        return null; // Don't show anything while initial loading
    }

    // Show processing status if AI is still working
    if (isProcessing || data?.ai_processing_status === 'pending' || data?.ai_processing_status === 'processing') {
        return (
            <AIProcessingStatus
                status={data?.ai_processing_status || 'processing'}
                error={data?.ai_processing_error || undefined}
            />
        );
    }

    // Show AI summary if completed
    if (data?.ai_processing_status === 'completed' && data.ai_summary) {
        return (
            <AIQuestionSummary
                summary={data.ai_summary}
                sentiment={data.ai_sentiment || 'neutral'}
                stakes={data.ai_stakes || 'medium'}
                keyPoints={data.ai_key_points || []}
                language={data.ai_summary_language || 'en'}
            />
        );
    }

    // Show error state
    if (data?.ai_processing_status === 'failed') {
        return (
            <AIProcessingStatus
                status="failed"
                error={data.ai_processing_error || undefined}
            />
        );
    }

    return null;
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
    const [responseText, setResponseText] = useState<string>(''); // Optional text message

    useEffect(() => {
        fetchBookingDetails();
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        try {
            const response = await api.get(`/creator/bookings`);
            const allBookings = response.data;
            const currentBooking = allBookings.find((b: Booking) => b.id === bookingId);
            console.log('[DEBUG] Current booking:', currentBooking);
            console.log('[DEBUG] Audio URLs:', currentBooking?.question_audio_urls);
            console.log('[DEBUG] Video URLs:', currentBooking?.question_video_urls);
            console.log('[DEBUG] Image URLs:', currentBooking?.question_image_urls);
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

            // Add optional text message if provided
            if (responseText.trim()) {
                formData.append('response_text', responseText.trim());
            }

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

                {/* Question Section - Show Original Content First */}
                <div className={styles.questionSection}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0 }}>Fan's Question</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {booking.question_text && (
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    background: '#E3F2FD',
                                    color: '#1976D2',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 500
                                }}>📝 Text</span>
                            )}
                            {booking.question_audio_urls && booking.question_audio_urls.length > 0 && (
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    background: '#F3E5F5',
                                    color: '#7B1FA2',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 500
                                }}>🎵 Audio</span>
                            )}
                            {booking.question_video_urls && booking.question_video_urls.length > 0 && (
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    background: '#FFF3E0',
                                    color: '#F57C00',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 500
                                }}>📹 Video</span>
                            )}
                            {booking.question_image_urls && booking.question_image_urls.length > 0 && (
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    background: '#E8F5E9',
                                    color: '#388E3C',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 500
                                }}>🖼️ Image</span>
                            )}
                        </div>
                    </div>

                    {booking.question_text && (
                        <div className={styles.textQuestion}>
                            <p>{booking.question_text}</p>
                        </div>
                    )}

                    {/* Audio Files */}
                    {booking.question_audio_urls && booking.question_audio_urls.length > 0 && (
                        <div className={styles.mediaList}>
                            <h4>Audio Recordings</h4>
                            {booking.question_audio_urls.map((url, index) => (
                                <div key={index} className={styles.mediaItem}>
                                    <div className={styles.mediaLabel}>
                                        <Mic size={20} />
                                        <span>Audio {index + 1}</span>
                                    </div>
                                    <audio controls src={url} className={styles.audioPlayer} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Video Files */}
                    {booking.question_video_urls && booking.question_video_urls.length > 0 && (
                        <div className={styles.mediaList}>
                            <h4>Video Recordings</h4>
                            {booking.question_video_urls.map((url, index) => (
                                <div key={index} className={styles.mediaItem}>
                                    <div className={styles.mediaLabel}>
                                        <Video size={20} />
                                        <span>Video {index + 1}</span>
                                    </div>
                                    <video controls src={url} className={styles.videoPlayer} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Image Files */}
                    {booking.question_image_urls && booking.question_image_urls.length > 0 && (
                        <div className={styles.mediaList}>
                            <h4>Attached Images</h4>
                            <div className={styles.grid}>
                                {booking.question_image_urls.map((url, index) => (
                                    <div key={index} className={styles.imageItem}>
                                        <img src={url} alt={`Attachment ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {(!booking.question_text &&
                        (!booking.question_audio_urls || booking.question_audio_urls.length === 0) &&
                        (!booking.question_video_urls || booking.question_video_urls.length === 0) &&
                        (!booking.question_image_urls || booking.question_image_urls.length === 0)) && (
                            <div className={styles.noQuestion}>
                                <p>Fan hasn't submitted their question yet.</p>
                            </div>
                        )}
                </div>
            </div>

            {/* AI Summary Section - Show After Original Question */}
            <div style={{ marginBottom: '2rem' }}>
                <AIQuestionSummarySection bookingId={bookingId} />
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

                    {/* Optional Text Message */}
                    <div style={{ marginTop: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#333' }}>
                            Add a text message (optional)
                        </label>
                        <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Add a personal message to accompany your response..."
                            style={{
                                width: '100%',
                                minHeight: '100px',
                                padding: '0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                            }}
                        />
                    </div>

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
                <div className={styles.responseSection}>
                    <h3>Your Response</h3>

                    {booking.response_text && (
                        <div className={styles.textQuestion} style={{ marginBottom: '1.5rem', borderLeftColor: '#4CAF50' }}>
                            <p>{booking.response_text}</p>
                        </div>
                    )}

                    <div className={styles.mediaItem}>
                        <div className={styles.mediaLabel}>
                            {booking.response_type === 'video' ? <Video size={20} /> : <Mic size={20} />}
                            <span>Your {booking.response_type === 'video' ? 'Video' : 'Audio'} Response</span>
                        </div>
                        {booking.response_type === 'video' ? (
                            <video controls src={booking.response_media_url} className={styles.videoPlayer} />
                        ) : (
                            <audio controls src={booking.response_media_url} className={styles.audioPlayer} style={{ width: '100%' }} />
                        )}
                    </div>

                    <div className={styles.completedBanner} style={{ marginTop: '2rem' }}>
                        ✅ You've already responded to this booking
                    </div>
                </div>
            )}

            {booking.status === 'pending_question' && (
                <div className={styles.pendingBanner}>
                    ⏳ Waiting for fan to submit their question
                </div>
            )}
        </div>
    );
}
