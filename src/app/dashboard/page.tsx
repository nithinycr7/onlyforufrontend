'use client';

import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';

const SUBSCRIPTIONS = [
    {
        id: 1,
        creator: 'Vismai Food',
        pic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        plan: 'Voice Notes',
        price: 99,
        messagesUsed: 3,
        messagesTotal: 5,
        renewal: 'Jan 24',
        isClub: false
    },
    {
        id: 2,
        creator: 'Telugu Tech',
        pic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
        plan: 'Text Replies',
        price: 49,
        messagesUsed: 0,
        messagesTotal: 3,
        renewal: 'Jan 28',
        isClub: false
    },
    {
        id: 3,
        creator: 'Pradeep Machiraju',
        pic: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=800&q=80',
        plan: 'Super Fan Club',
        price: 299,
        messagesUsed: 0,
        messagesTotal: 0,
        renewal: 'Feb 01',
        isClub: true
    }
];

export default function Dashboard() {
    const router = useRouter();

    return (
        <div className={styles.container}>
            <div className={styles.title} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>My Subscriptions</h1>
                <button
                    onClick={() => router.push('/creator-dashboard')}
                    style={{ fontSize: 12, color: '#2196F3', background: '#E3F2FD', padding: '6px 12px', borderRadius: 20, border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                    Creator View <ArrowUpRight size={14} />
                </button>
            </div>

            <div className={styles.list}>
                {SUBSCRIPTIONS.map(sub => (
                    <div key={sub.id} className={styles.subCard}>
                        <div className={styles.header}>
                            <div className={styles.pic} style={{ backgroundImage: `url(${sub.pic})` }} />
                            <div className={styles.info}>
                                <div className={styles.name}>
                                    {sub.creator}
                                    {sub.isClub && <span style={{ fontSize: 10, backgroundColor: '#f3e5f5', color: '#7b1fa2', padding: '2px 6px', borderRadius: 4, marginLeft: 6, fontWeight: 600 }}>CLUB</span>}
                                </div>
                                <div className={styles.plan}>{sub.plan} · ₹{sub.price}/mo</div>
                            </div>
                        </div>

                        {!sub.isClub ? (
                            <div className={styles.usage}>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${(sub.messagesUsed / sub.messagesTotal) * 100}%` }}
                                    />
                                </div>
                                <div className={styles.usageText}>
                                    <span>{sub.messagesUsed}/{sub.messagesTotal} messages used</span>
                                    <span>Next bill: {sub.renewal}</span>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.usage} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>● Active Member</span>
                                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}> • Next bill: {sub.renewal}</span>
                            </div>
                        )}

                        <div className={styles.actions}>
                            <Button fullWidth onClick={() => router.push(`/messages/${sub.isClub ? '2' : '1'}`)}>
                                {sub.isClub ? 'Enter Club' : 'Message'}
                            </Button>
                            {!sub.isClub && <Button variant="secondary" fullWidth onClick={() => router.push('/messages/1')}>View Thread</Button>}
                        </div>
                    </div>
                ))}
            </div>

            <BottomNav />
        </div>
    );
}
