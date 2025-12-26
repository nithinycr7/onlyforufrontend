'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui';
import { ArrowLeft, Clock, MessageCircle, Star, Send } from 'lucide-react';
import { api } from '@/lib/api';
import styles from './page.module.css';

interface Message {
    id: string;
    sender_type: 'fan' | 'creator';
    message_type: 'text' | 'audio' | 'video';
    text_content?: string;
    audio_url?: string;
    video_url?: string;
    created_at: string;
}

interface Booking {
    id: string;
    status: string;
    service_title: string;
    question_text?: string;
    question_video_url?: string;
    question_type: string;
    response_text?: string;
    response_media_url?: string;
    follow_ups_remaining: number;
    creator_display_name: string;
    creator_profile_image: string;
}

export default function BookingDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [followUpText, setFollowUpText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [bookingRes, messagesRes] = await Promise.all([
                api.get(`/bookings/${id}`),
                api.get(`/bookings/${id}/messages`)
            ]);

            const bookingData = bookingRes.data;
            setBooking(bookingData);

            // Construct full conversation: initial question + response + follow-ups
            const fullConversation: Message[] = [];

            // Add initial fan question if exists
            if (bookingData.question_submitted_at) {
                fullConversation.push({
                    id: `question-${bookingData.id}`,
                    sender_type: 'fan',
                    message_type: bookingData.question_type || 'text',
                    text_content: bookingData.question_text,
                    audio_url: bookingData.question_audio_url,
                    video_url: bookingData.question_video_url,
                    created_at: bookingData.question_submitted_at
                });
            }

            // Add creator response if exists
            if (bookingData.response_submitted_at) {
                fullConversation.push({
                    id: `response-${bookingData.id}`,
                    sender_type: 'creator',
                    // Map backend 'voice' to frontend 'audio'
                    message_type: bookingData.response_type === 'voice' ? 'audio' : (bookingData.response_type || 'audio'),
                    text_content: undefined,
                    audio_url: (bookingData.response_type === 'voice' || bookingData.response_type === 'audio') ? bookingData.response_media_url : null,
                    video_url: bookingData.response_type === 'video' ? bookingData.response_media_url : null,
                    created_at: bookingData.response_submitted_at
                });
            }

            // Add follow-up messages
            fullConversation.push(...messagesRes.data);

            setMessages(fullConversation);
        } catch (error) {
            console.error('Failed to fetch booking details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowUp = async () => {
        if (!followUpText) return;
        setSubmitting(true);
        try {
            // await api.post(`/bookings/${id}/follow-up`, {
            //     message_type: 'text',
            //     text_content: followUpText
            // });

            // Optimistic update
            const newMessage: Message = {
                id: Date.now().toString(),
                sender_type: 'fan',
                message_type: 'text',
                text_content: followUpText,
                created_at: new Date().toISOString()
            };
            setMessages([...messages, newMessage]);
            setFollowUpText('');
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: 20 }}>Loading...</div>;
    if (!booking) return <div className="container" style={{ padding: 20 }}>Booking not found</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Button variant="ghost" onClick={() => router.back()} style={{ paddingLeft: 0 }}>
                    <ArrowLeft size={20} />
                </Button>
                <h1>Consultation Details</h1>
            </div>

            <Card className={styles.statusCard}>
                <div className={styles.statusRow}>
                    <Badge variant={booking.status === 'completed' || booking.status === 'COMPLETED' ? 'success' : 'warning'}>
                        {booking.status === 'completed' || booking.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
                    </Badge>
                    <span className={styles.serviceName}>{booking.service_title}</span>
                </div>
                <div className={styles.creatorRow}>
                    {booking.creator_profile_image ? (
                        <img src={booking.creator_profile_image} alt="" className={styles.avatar} />
                    ) : (
                        <div className={styles.avatarFallback}>
                            {booking.creator_display_name?.charAt(0) || 'C'}
                        </div>
                    )}
                    <span>with <strong>{booking.creator_display_name}</strong></span>
                </div>
            </Card>

            <div className={styles.conversation}>
                {messages.map((msg, index) => (
                    <div key={msg.id} className={`${styles.message} ${msg.sender_type === 'fan' ? styles.fan : styles.creator}`}>
                        <div className={styles.bubble}>
                            {/* Simple labels for clarity */}
                            <div className={styles.senderLabel}>
                                {msg.sender_type === 'fan'
                                    ? (index === 0 ? 'Your Question' : 'Follow-up')
                                    : "Creator's Response"}
                            </div>

                            {/* Show text if present (even if media also exists) */}
                            {msg.text_content && <p>{msg.text_content}</p>}

                            {/* Show media if present */}
                            {msg.message_type === 'audio' && msg.audio_url && (
                                <audio controls src={msg.audio_url} className={styles.audioPlayer} />
                            )}
                            {msg.message_type === 'video' && msg.video_url && (
                                <video controls src={msg.video_url} className={styles.videoPlayer} />
                            )}

                            <span className={styles.time}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* If question not submitted yet, show submit button */}
            {(booking.status === 'pending_question' || booking.status === 'PENDING_QUESTION') && (
                <div className={styles.inputArea}>
                    <div className={styles.pendingInfo}>
                        <MessageCircle size={16} />
                        <span>You haven't submitted your question yet</span>
                    </div>
                    <Button
                        fullWidth
                        onClick={() => router.push(`/bookings/${id}/submit-question?serviceName=${encodeURIComponent(booking.service_title)}&creatorName=${encodeURIComponent(booking.creator_display_name)}`)}
                    >
                        Submit Your Question
                    </Button>
                </div>
            )}

            {/* Show follow-up input only if question submitted and follow-ups available */}
            {booking.follow_ups_remaining > 0 && booking.status !== 'pending_question' && booking.status !== 'PENDING_QUESTION' && (
                <div className={styles.inputArea}>
                    <div className={styles.followUpInfo}>
                        <MessageCircle size={14} />
                        <span>{booking.follow_ups_remaining} follow-up questions remaining</span>
                    </div>
                    <div className={styles.inputRow}>
                        <input
                            type="text"
                            value={followUpText}
                            onChange={(e) => setFollowUpText(e.target.value)}
                            placeholder="Ask a follow-up question..."
                            className={styles.input}
                        />
                        <Button onClick={handleFollowUp} disabled={!followUpText || submitting}>
                            <Send size={18} />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
