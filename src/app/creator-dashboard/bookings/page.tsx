'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, User, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import styles from './page.module.css';

interface Booking {
    id: string;
    fan_id: string;
    fan_name: string;
    fan_email: string;
    fan_profile_image_url?: string;
    service_title?: string;
    service_subtitle?: string;
    question_type?: string;
    question_text?: string;
    question_audio_url?: string;
    question_video_url?: string;
    question_submitted_at?: string;
    status: string;
    expected_response_by?: string;
    created_at: string;
    amount_paid: number;
}

export default function CreatorBookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'awaiting' | 'pending' | 'completed'>('awaiting');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/creator/bookings');
            setBookings(response.data);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTimeRemaining = (deadline?: string) => {
        if (!deadline) return null;

        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diff = deadlineDate.getTime() - now.getTime();

        if (diff < 0) return { text: 'Overdue', urgency: 'critical' };

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (hours < 6) return { text: `${hours}h left`, urgency: 'critical' };
        if (hours < 24) return { text: `${hours}h left`, urgency: 'warning' };
        if (days < 2) return { text: `${days}d left`, urgency: 'normal' };
        return { text: `${days}d left`, urgency: 'normal' };
    };

    const filterBookings = (status: string) => {
        return bookings.filter(b => {
            if (status === 'awaiting_response') return b.status === 'awaiting_response';
            if (status === 'pending_question') return b.status === 'pending_question';
            if (status === 'completed') return b.status === 'completed';
            return false;
        });
    };

    const awaitingBookings = filterBookings('awaiting_response');
    const pendingBookings = filterBookings('pending_question');
    const completedBookings = filterBookings('completed');

    const renderBookingCard = (booking: Booking) => {
        const timeRemaining = getTimeRemaining(booking.expected_response_by);

        return (
            <div
                key={booking.id}
                className={styles.bookingCard}
                onClick={() => router.push(`/creator-dashboard/bookings/${booking.id}`)}
            >
                <div className={styles.cardHeader}>
                    <div className={styles.fanInfo}>
                        <div className={styles.fanAvatar}>
                            {booking.fan_profile_image_url ? (
                                <img src={booking.fan_profile_image_url} alt={booking.fan_name} />
                            ) : (
                                <User size={20} />
                            )}
                        </div>
                        <div>
                            <div className={styles.fanName}>{booking.fan_name}</div>
                            <div className={styles.serviceTitle}>{booking.service_title || 'Consultation'}</div>
                        </div>
                    </div>
                    {timeRemaining && (
                        <div className={`${styles.timeRemaining} ${styles[timeRemaining.urgency]}`}>
                            <Clock size={14} />
                            {timeRemaining.text}
                        </div>
                    )}
                </div>

                {booking.question_text && (
                    <div className={styles.questionPreview}>
                        <MessageSquare size={16} />
                        <span>{booking.question_text.substring(0, 100)}{booking.question_text.length > 100 ? '...' : ''}</span>
                    </div>
                )}

                {booking.question_type && booking.question_type !== 'text' && (
                    <div className={styles.mediaIndicator}>
                        {booking.question_type === 'audio' ? '🎤 Audio Question' : '🎥 Video Question'}
                    </div>
                )}

                <div className={styles.cardFooter}>
                    <span className={styles.timestamp}>
                        {new Date(booking.created_at).toLocaleDateString()}
                    </span>
                    {booking.status === 'awaiting_response' && (
                        <button className={styles.respondBtn} onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/creator-dashboard/bookings/${booking.id}`);
                        }}>
                            Respond
                        </button>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading bookings...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>My Bookings</h1>
                <p>Manage your consultation requests</p>
            </div>

            {/* Mobile Tabs */}
            <div className={styles.mobileTabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'awaiting' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('awaiting')}
                >
                    Awaiting Response ({awaitingBookings.length})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'pending' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending ({pendingBookings.length})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'completed' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('completed')}
                >
                    Completed ({completedBookings.length})
                </button>
            </div>

            {/* Desktop Kanban Board */}
            <div className={styles.kanbanBoard}>
                <div className={styles.column}>
                    <div className={styles.columnHeader}>
                        <AlertCircle size={20} className={styles.iconWarning} />
                        <h2>Awaiting Response</h2>
                        <span className={styles.count}>{awaitingBookings.length}</span>
                    </div>
                    <div className={styles.columnContent}>
                        {awaitingBookings.length === 0 ? (
                            <div className={styles.emptyState}>
                                <CheckCircle size={48} />
                                <p>All caught up!</p>
                            </div>
                        ) : (
                            awaitingBookings.map(renderBookingCard)
                        )}
                    </div>
                </div>

                <div className={styles.column}>
                    <div className={styles.columnHeader}>
                        <Clock size={20} className={styles.iconNeutral} />
                        <h2>Pending Questions</h2>
                        <span className={styles.count}>{pendingBookings.length}</span>
                    </div>
                    <div className={styles.columnContent}>
                        {pendingBookings.length === 0 ? (
                            <div className={styles.emptyState}>
                                <MessageSquare size={48} />
                                <p>No pending questions</p>
                            </div>
                        ) : (
                            pendingBookings.map(renderBookingCard)
                        )}
                    </div>
                </div>

                <div className={styles.column}>
                    <div className={styles.columnHeader}>
                        <CheckCircle size={20} className={styles.iconSuccess} />
                        <h2>Completed</h2>
                        <span className={styles.count}>{completedBookings.length}</span>
                    </div>
                    <div className={styles.columnContent}>
                        {completedBookings.length === 0 ? (
                            <div className={styles.emptyState}>
                                <CheckCircle size={48} />
                                <p>No completed bookings yet</p>
                            </div>
                        ) : (
                            completedBookings.map(renderBookingCard)
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Column View */}
            <div className={styles.mobileView}>
                {activeTab === 'awaiting' && (
                    <div className={styles.mobileColumn}>
                        {awaitingBookings.length === 0 ? (
                            <div className={styles.emptyState}>
                                <CheckCircle size={48} />
                                <p>All caught up!</p>
                            </div>
                        ) : (
                            awaitingBookings.map(renderBookingCard)
                        )}
                    </div>
                )}
                {activeTab === 'pending' && (
                    <div className={styles.mobileColumn}>
                        {pendingBookings.length === 0 ? (
                            <div className={styles.emptyState}>
                                <MessageSquare size={48} />
                                <p>No pending questions</p>
                            </div>
                        ) : (
                            pendingBookings.map(renderBookingCard)
                        )}
                    </div>
                )}
                {activeTab === 'completed' && (
                    <div className={styles.mobileColumn}>
                        {completedBookings.length === 0 ? (
                            <div className={styles.emptyState}>
                                <CheckCircle size={48} />
                                <p>No completed bookings yet</p>
                            </div>
                        ) : (
                            completedBookings.map(renderBookingCard)
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
