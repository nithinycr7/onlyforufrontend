'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Clock, User, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import styles from './page.module.css';

interface Booking {
    id: string;
    service_title: string;
    service_subtitle: string;
    creator_display_name: string;
    creator_slug: string;
    status: string;
    question_submitted_at: string | null;
    expected_response_by: string | null;
    response_submitted_at: string | null;
    created_at: string;
    amount_paid: number;
}

export default function MyBookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings');
            setBookings(response.data);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_question':
                return <Badge variant="warning">Pending Question</Badge>;
            case 'awaiting_response':
                return <Badge variant="info">Awaiting Response</Badge>;
            case 'completed':
                return <Badge variant="success">Completed</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getTimeRemaining = (expectedBy: string | null) => {
        if (!expectedBy) return null;

        const now = new Date();
        const deadline = new Date(expectedBy);
        const diff = deadline.getTime() - now.getTime();

        if (diff < 0) return 'Overdue';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h remaining`;
        return `${hours}h remaining`;
    };

    const filteredBookings = bookings.filter(booking => {
        if (filter === 'all') return true;
        if (filter === 'pending') return booking.status === 'pending_question' || booking.status === 'awaiting_response';
        if (filter === 'completed') return booking.status === 'completed';
        return true;
    });

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>My Consultations</h1>
                </div>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>My Consultations</h1>
                <p className={styles.subtitle}>Track your questions and responses</p>
            </div>

            <div className={styles.filters}>
                <button
                    className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({bookings.length})
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'pending' ? styles.active : ''}`}
                    onClick={() => setFilter('pending')}
                >
                    Pending ({bookings.filter(b => b.status !== 'completed').length})
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'completed' ? styles.active : ''}`}
                    onClick={() => setFilter('completed')}
                >
                    Completed ({bookings.filter(b => b.status === 'completed').length})
                </button>
            </div>

            <div className={styles.bookingsList}>
                {filteredBookings.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No consultations yet</p>
                        <button
                            className={styles.discoverBtn}
                            onClick={() => router.push('/home')}
                        >
                            Discover Creators
                        </button>
                    </div>
                ) : (
                    filteredBookings.map(booking => (
                        <Card
                            key={booking.id}
                            hover
                            onClick={() => router.push(`/bookings/${booking.id}`)}
                            className={styles.bookingCard}
                        >
                            <div className={styles.cardHeader}>
                                {getStatusBadge(booking.status)}
                                {booking.status === 'awaiting_response' && booking.expected_response_by && (
                                    <span className={styles.timeRemaining}>
                                        <Clock size={14} />
                                        {getTimeRemaining(booking.expected_response_by)}
                                    </span>
                                )}
                            </div>

                            <h3 className={styles.serviceTitle}>{booking.service_title}</h3>
                            <p className={styles.serviceSubtitle}>{booking.service_subtitle}</p>

                            <div className={styles.creatorInfo}>
                                <User size={16} />
                                <span>with {booking.creator_display_name}</span>
                            </div>

                            <div className={styles.cardFooter}>
                                <div className={styles.date}>
                                    <Calendar size={14} />
                                    <span>{new Date(booking.created_at).toLocaleDateString()}</span>
                                </div>
                                <span className={styles.viewDetails}>View Details →</span>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
