'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Clock, Users, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function CreatorDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }
        const fetchStats = async () => {
            try {
                const res = await api.get('/analytics/dashboard');
                setStats(res.data);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [router]);

    if (loading) return <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>Loading...</div>;

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Creator Hub</h1>
                <p className={styles.subtitle}>Welcome back, {'Creator'}</p>
            </header>

            {/* ROI Stats (Feature C) */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#E3F2FD', color: '#2196F3' }}>
                        <TrendingUp size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Total Earnings</span>
                        <span className={styles.statValue}>₹{stats?.total_earnings?.toLocaleString() || '0'}</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#FFF3E0', color: '#FF9800' }}>
                        <Clock size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Avg. Reply Time</span>
                        <span className={styles.statValue}>{stats?.avg_response_time || 'N/A'}</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#E8F5E9', color: '#4CAF50' }}>
                        <Users size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Active Fans</span>
                        <span className={styles.statValue}>{stats?.active_subscribers || '0'}</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <h2 className={styles.sectionTitle}>Quick Actions</h2>
            <div className={styles.actionsGrid}>
                <div className={styles.actionCard} onClick={() => router.push('/creator-dashboard/services')}>
                    <div className={styles.actionIcon}>📦</div>
                    <div className={styles.actionContent}>
                        <h3 className={styles.actionTitle}>Manage Services</h3>
                        <p className={styles.actionDesc}>Create and edit your consultation offerings</p>
                    </div>
                    <ArrowUpRight className={styles.actionArrow} size={20} />
                </div>

                <div className={styles.actionCard} onClick={() => router.push('/creator-dashboard/bookings')}>
                    <div className={styles.actionIcon}>📅</div>
                    <div className={styles.actionContent}>
                        <h3 className={styles.actionTitle}>View Bookings</h3>
                        <p className={styles.actionDesc}>Check your upcoming consultations</p>
                    </div>
                    <ArrowUpRight className={styles.actionArrow} size={20} />
                </div>

                <div className={styles.actionCard} onClick={() => router.push('/creator/settings')}>
                    <div className={styles.actionIcon}>⚙️</div>
                    <div className={styles.actionContent}>
                        <h3 className={styles.actionTitle}>Settings</h3>
                        <p className={styles.actionDesc}>Update your profile and preferences</p>
                    </div>
                    <ArrowUpRight className={styles.actionArrow} size={20} />
                </div>
            </div>

            <h2 className={styles.sectionTitle}>Recent Earnings</h2>
            <div className={styles.earningsList}>
                {(!stats?.recent_earnings || stats.recent_earnings.length === 0) ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#888' }}>No recent earnings yet.</div>
                ) : (
                    stats.recent_earnings.map((item: any, i: number) => (
                        <div key={i} className={styles.earningItem}>
                            <div>
                                <div className={styles.earningSource}>{item.source || 'Payout'}</div>
                                <div className={styles.earningDate}>{item.date}</div>
                            </div>
                            <div className={styles.earningAmount}>+₹{item.amount}</div>
                        </div>
                    ))
                )}
            </div>

            <div className={styles.actionArea}>
                <Button fullWidth>Withdraw Funds</Button>
            </div>
        </main>
    );
}
