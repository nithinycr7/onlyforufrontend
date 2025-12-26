'use client';

import { useEffect, useState } from 'react';
import { Clock, ShieldCheck, AlertCircle, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

// Mock coaching requests
const COACHING_REQUESTS = [
    {
        id: 1,
        fanName: 'Rahul K.',
        fanAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=50&h=50&fit=crop',
        service: 'Recipe Audit',
        request: 'My biryani always comes out too sticky. Can you review my technique?',
        price: 999,
        slaHours: 6,
        status: 'urgent',
        createdAt: '2 hours ago'
    },
    {
        id: 2,
        fanName: 'Priya M.',
        fanAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop',
        service: 'Dance Performance Review',
        request: 'Please review my Bharatanatyam performance and give feedback on expressions.',
        price: 1499,
        slaHours: 48,
        status: 'pending',
        createdAt: '1 day ago'
    },
    {
        id: 3,
        fanName: 'Amit S.',
        fanAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop',
        service: 'Comedy Script Feedback',
        request: 'I wrote a 5-minute standup routine. Can you review and suggest improvements?',
        price: 799,
        slaHours: 72,
        status: 'pending',
        createdAt: '3 days ago'
    }
];

const COMPLETED_REQUESTS = [
    {
        id: 4,
        fanName: 'Sneha R.',
        fanAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop',
        service: 'Singing Technique Audit',
        completedAt: 'Dec 20',
        price: 1299
    }
];

export default function WorkshopPage() {
    const router = useRouter();
    const [filter, setFilter] = useState<'priority' | 'oldest' | 'value'>('priority');

    const getSLAColor = (hours: number) => {
        if (hours <= 12) return '#dc2626'; // Red - urgent
        if (hours <= 24) return '#f97316'; // Orange - soon
        return '#10b981'; // Green - comfortable
    };

    const getSLAText = (hours: number) => {
        if (hours < 24) return `Due in ${hours} hours`;
        const days = Math.floor(hours / 24);
        return `Due in ${days} day${days > 1 ? 's' : ''}`;
    };

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Workshop</h1>
                <p className={styles.subtitle}>Fulfill coaching requests and deliver personalized feedback</p>
            </div>

            {/* Filter Bar */}
            <div className={styles.filterBar}>
                <button
                    className={filter === 'priority' ? styles.filterActive : styles.filterBtn}
                    onClick={() => setFilter('priority')}
                >
                    Priority
                </button>
                <button
                    className={filter === 'oldest' ? styles.filterActive : styles.filterBtn}
                    onClick={() => setFilter('oldest')}
                >
                    Oldest First
                </button>
                <button
                    className={filter === 'value' ? styles.filterActive : styles.filterBtn}
                    onClick={() => setFilter('value')}
                >
                    High Value
                </button>
            </div>

            <h2 className={styles.sectionTitle}>Active Requests</h2>

            <div className={styles.requestList}>
                {COACHING_REQUESTS.map(req => (
                    <div
                        key={req.id}
                        className={styles.requestCard}
                        onClick={() => router.push(`/workshop/${req.id}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className={styles.cardHeader}>
                            <div className={styles.fanInfo}>
                                <img src={req.fanAvatar} alt={req.fanName} className={styles.avatar} />
                                <div>
                                    <span className={styles.fanName}>{req.fanName}</span>
                                    <span className={styles.serviceName}>{req.service}</span>
                                </div>
                            </div>
                            {req.status === 'urgent' && (
                                <span className={styles.urgentBadge}>
                                    <AlertCircle size={14} />
                                    Urgent
                                </span>
                            )}
                        </div>

                        <div className={styles.cardBody}>
                            {req.request}
                        </div>

                        <div className={styles.cardFooter}>
                            <div className={styles.slaTimer} style={{ color: getSLAColor(req.slaHours) }}>
                                <Clock size={14} />
                                <span>{getSLAText(req.slaHours)}</span>
                            </div>
                            <div className={styles.escrowBadge}>
                                <ShieldCheck size={14} />
                                <span>₹{req.price} in escrow</span>
                            </div>
                        </div>

                        <div className={styles.cardAction}>
                            <span>View & Respond</span>
                            <ChevronRight size={16} />
                        </div>
                    </div>
                ))}
            </div>

            <h2 className={styles.sectionTitle}>Completed</h2>

            <div className={styles.requestList}>
                {COMPLETED_REQUESTS.map(req => (
                    <div key={req.id} className={styles.requestCard} style={{ opacity: 0.7 }}>
                        <div className={styles.cardHeader}>
                            <div className={styles.fanInfo}>
                                <img src={req.fanAvatar} alt={req.fanName} className={styles.avatar} />
                                <div>
                                    <span className={styles.fanName}>{req.fanName}</span>
                                    <span className={styles.serviceName}>{req.service}</span>
                                </div>
                            </div>
                            <span className={styles.completedBadge}>Completed</span>
                        </div>
                        <div className={styles.cardFooter} style={{ borderTop: 'none', paddingTop: 0 }}>
                            <span style={{ fontSize: 13, color: '#10b981' }}>✓ Delivered on {req.completedAt}</span>
                            <span style={{ fontSize: 13, color: '#666' }}>₹{req.price} earned</span>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
