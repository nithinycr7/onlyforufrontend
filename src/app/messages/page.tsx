'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, Clock, CheckCircle2, ChevronRight, Filter, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

// Mock Data for Requests
const REQUESTS = [
    {
        id: 1,
        creator: 'Vismai Food',
        avatar: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=100&h=100&fit=crop',
        service: 'Recipe Fix Package',
        status: 'pending',
        message: 'I need help fixing my biryani texture. It always comes out too sticky.',
        sla: 'Due in 2 days',
        price: 999,
        date: 'Today',
        isClub: false
    },
    {
        id: 2,
        creator: 'Pradeep Machiraju',
        avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=50&h=50&fit=crop',
        service: 'Super Fan Club',
        status: 'active',
        message: 'New Poll: Which outfit for tonight?',
        sla: 'Live Now',
        price: 299,
        date: 'Yesterday',
        isClub: true
    }
];

const COMPLETED_REQUESTS = [
    {
        id: 3,
        creator: 'Dr. Priya',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop',
        service: 'Skin Care Routine Audit',
        status: 'completed',
        message: 'Here is your personalized routine pdf and video.',
        sla: 'Completed on Dec 20',
        price: 1499,
        date: 'Dec 20'
    }
];

export default function MessagesPage() {
    const router = useRouter();
    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const [isCreatorMode, setIsCreatorMode] = useState(false);
    const [dmTab, setDmTab] = useState<'groups' | 'individual'>('groups');
    const isDMView = searchParams.get('type') === 'dm';

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        setIsCreatorMode(role === 'creator');
    }, []);

    // DM View - Simple chat list with tabs
    if (isDMView) {

        const GROUP_CHATS = [
            {
                id: 1,
                name: 'Super Fan Club',
                avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=50&h=50&fit=crop',
                lastMessage: 'Hey everyone! New poll is live 🔥',
                timestamp: '2m ago',
                unread: 5,
                members: 127
            },
            {
                id: 2,
                name: 'VIP Tier',
                avatar: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=50&h=50&fit=crop',
                lastMessage: 'Thanks for the exclusive content!',
                timestamp: '1h ago',
                unread: 0,
                members: 45
            }
        ];

        const INDIVIDUAL_DMS = [
            {
                id: 1,
                name: 'Rahul K.',
                avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=50&h=50&fit=crop',
                lastMessage: 'Can we schedule a 1-on-1 call?',
                timestamp: '10m ago',
                unread: 1,
                isPriority: true
            },
            {
                id: 2,
                name: 'Priya M.',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop',
                lastMessage: 'Thank you so much for the feedback!',
                timestamp: '3h ago',
                unread: 0,
                isPriority: false
            }
        ];

        return (
            <main className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Direct Messages</h1>
                    <p className={styles.subtitle}>Conversations with your community</p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #eee' }}>
                    <button
                        onClick={() => setDmTab('groups')}
                        style={{
                            padding: '12px 20px',
                            background: 'none',
                            border: 'none',
                            borderBottom: dmTab === 'groups' ? '2px solid #7c3aed' : '2px solid transparent',
                            color: dmTab === 'groups' ? '#7c3aed' : '#666',
                            fontWeight: dmTab === 'groups' ? 600 : 400,
                            cursor: 'pointer'
                        }}
                    >
                        Group Chats
                    </button>
                    <button
                        onClick={() => setDmTab('individual')}
                        style={{
                            padding: '12px 20px',
                            background: 'none',
                            border: 'none',
                            borderBottom: dmTab === 'individual' ? '2px solid #7c3aed' : '2px solid transparent',
                            color: dmTab === 'individual' ? '#7c3aed' : '#666',
                            fontWeight: dmTab === 'individual' ? 600 : 400,
                            cursor: 'pointer'
                        }}
                    >
                        Individual DMs
                    </button>
                </div>

                {/* Group Chats */}
                {dmTab === 'groups' && (
                    <div className={styles.requestList}>
                        {GROUP_CHATS.map(chat => (
                            <div key={chat.id} className={styles.requestCard} style={{ cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <img src={chat.avatar} alt={chat.name} style={{ width: 48, height: 48, borderRadius: '50%' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 600, fontSize: 15 }}>{chat.name}</span>
                                            <span style={{ fontSize: 12, color: '#888' }}>{chat.timestamp}</span>
                                        </div>
                                        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#666' }}>{chat.lastMessage}</p>
                                        <span style={{ fontSize: 12, color: '#888', marginTop: 4, display: 'block' }}>{chat.members} members</span>
                                    </div>
                                    {chat.unread > 0 && (
                                        <span style={{
                                            background: '#7c3aed',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: 24,
                                            height: 24,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 12,
                                            fontWeight: 600
                                        }}>
                                            {chat.unread}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Individual DMs */}
                {dmTab === 'individual' && (
                    <div className={styles.requestList}>
                        {INDIVIDUAL_DMS.map(dm => (
                            <div key={dm.id} className={styles.requestCard} style={{ cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <img src={dm.avatar} alt={dm.name} style={{ width: 48, height: 48, borderRadius: '50%' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span style={{ fontWeight: 600, fontSize: 15 }}>{dm.name}</span>
                                                {dm.isPriority && (
                                                    <span style={{
                                                        background: '#fef3c7',
                                                        color: '#92400e',
                                                        padding: '2px 8px',
                                                        borderRadius: 12,
                                                        fontSize: 11,
                                                        fontWeight: 600
                                                    }}>
                                                        Priority
                                                    </span>
                                                )}
                                            </div>
                                            <span style={{ fontSize: 12, color: '#888' }}>{dm.timestamp}</span>
                                        </div>
                                        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#666' }}>{dm.lastMessage}</p>
                                    </div>
                                    {dm.unread > 0 && (
                                        <span style={{
                                            background: '#7c3aed',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: 24,
                                            height: 24,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 12,
                                            fontWeight: 600
                                        }}>
                                            {dm.unread}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        );
    }

    // Bench View - Task management for creators
    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 className={styles.title}>{isCreatorMode ? 'The Bench' : 'My Requests'}</h1>
                </div>
                <p className={styles.subtitle}>{isCreatorMode ? 'Fulfil fan requests and deliver skill audits.' : 'Manage your requests and consultations.'}</p>
            </div>

            <h2 className={styles.sectionTitle}>Active</h2>

            <div className={styles.requestList}>
                {REQUESTS.map(req => (
                    <div
                        key={req.id}
                        className={styles.requestCard}
                        onClick={() => router.push(`/messages/${req.id}${isCreatorMode ? '?role=creator' : ''}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className={styles.cardHeader}>
                            <div className={styles.creatorInfo}>
                                <img src={isCreatorMode ? 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop' : req.avatar} alt="User" className={styles.avatar} />
                                <div>
                                    <span className={styles.creatorName}>{isCreatorMode ? 'Nithin (Fan)' : req.creator}</span>
                                    <span className={styles.serviceName}>{req.service}</span>
                                </div>
                            </div>
                            <span
                                className={`${styles.statusBadge} ${req.status === 'pending' ? styles.statusPending :
                                    req.status === 'active' ? styles.statusReview : styles.statusCompleted
                                    }`}
                            >
                                {req.status === 'active' ? 'Club Active' : req.status}
                            </span>
                        </div>

                        <div className={styles.cardBody}>
                            {req.message}
                        </div>

                        {!req.isClub ? (
                            <div className={styles.cardFooter}>
                                <div className={styles.slaTimer} style={{ color: isCreatorMode ? '#d32f2f' : 'inherit' }}>
                                    <Clock size={14} />
                                    <span>{req.sla} {isCreatorMode && '⚠️'}</span>
                                </div>
                                <div className={styles.escrowStatus}>
                                    <ShieldCheck size={14} />
                                    <span>₹{req.price} {isCreatorMode ? 'to be earned' : 'held in Escrow'}</span>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.cardFooter}>
                                <div className={styles.slaTimer} style={{ color: 'var(--text-secondary)' }}>
                                    <Clock size={14} />
                                    <span>{req.sla}</span>
                                </div>
                                <div className={styles.escrowStatus} style={{ background: '#f3e5f5', color: '#7b1fa2' }}>
                                    <span>Exclusive Access</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <h2 className={styles.sectionTitle}>History</h2>
            {/* Same history pattern... */}
            <div className={styles.requestList}>
                {COMPLETED_REQUESTS.map(req => (
                    <div key={req.id} className={styles.requestCard} style={{ opacity: 0.8 }}>
                        <div className={styles.cardHeader}>
                            <div className={styles.creatorInfo}>
                                <img src={isCreatorMode ? 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop' : req.avatar} alt="User" className={styles.avatar} />
                                <div>
                                    <span className={styles.creatorName}>{isCreatorMode ? 'Nithin (Fan)' : req.creator}</span>
                                    <span className={styles.serviceName}>{req.service}</span>
                                </div>
                            </div>
                            <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>
                                Completed
                            </span>
                        </div>
                        <div className={styles.cardFooter} style={{ borderTop: 'none', paddingTop: 0 }}>
                            <div className={`${styles.slaTimer} ${styles.safe}`}>
                                <CheckCircle2 size={14} />
                                <span>{req.sla}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
