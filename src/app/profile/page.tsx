'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Youtube, Instagram, Package, ExternalLink, LogOut } from 'lucide-react';
import { Button } from '@/components/ui';
import styles from './page.module.css';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import CreatorSettings from '../creator/settings/page';

type Tab = 'profile' | 'settings';

export default function ProfilePage() {
    const router = useRouter();
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    const loadProfile = async () => {
        try {
            // First, get the basic user info
            const userResponse = await api.get('/auth/me');
            const userData = userResponse.data;

            if (userData.role === 'creator') {
                // If creator, fetch the detailed creator profile
                const creatorResponse = await api.get('/creators/me');
                setProfile({ ...userData, ...creatorResponse.data, isCreator: true });
            } else {
                // If fan, just use the basic user data
                setProfile({ ...userData, isCreator: false });
            }
        } catch (err) {
            console.error('Failed to load profile:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }
        loadProfile();
    }, [router]);

    const handleLogout = () => {
        logout();
    };

    if (loading) {
        return (
            <main className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.loading}>Loading profile...</div>
                </div>
            </main>
        );
    }

    if (!profile) {
        return (
            <main className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.emptyState}>
                        <p>Something went wrong loading your profile.</p>
                        <Button onClick={() => window.location.reload()}>Retry</Button>
                    </div>
                </div>
            </main>
        );
    }

    // Logic for Fan Profile
    if (!profile.isCreator) {
        return (
            <main className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <h1>{profile.full_name}</h1>
                        <p>{profile.phone || profile.email}</p>
                    </div>

                    <div className={styles.tabs}>
                        <button className={`${styles.tab} ${styles.tabActive}`}>Profile</button>
                        <button className={styles.logoutBtn} onClick={handleLogout}>
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>

                    <div className={styles.content}>
                        <div className={styles.profileSection}>
                            <h2>Your Account</h2>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Name</span>
                                    <p className={styles.infoValue}>{profile.full_name}</p>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Email</span>
                                    <p className={styles.infoValue}>{profile.email}</p>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Phone</span>
                                    <p className={styles.infoValue}>{profile.phone || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.creatorPromo}>
                            <div className={styles.promoContent}>
                                <h3>🌟 Want to share your knowledge?</h3>
                                <p>Apply to become a creator and start offering consultations today!</p>
                            </div>
                            <Button
                                onClick={() => router.push('/creator/onboarding')}
                                className={styles.promoBtn}
                            >
                                Become a Creator
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.container}>
            <div className={styles.card}>
                {/* Header */}
                <div className={styles.header}>
                    <h1>{profile.display_name}</h1>
                    <p>{profile.niche} • {profile.language}</p>
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'profile' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'settings' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        Settings
                    </button>
                    <button
                        className={styles.logoutBtn}
                        onClick={handleLogout}
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {activeTab === 'profile' && (
                        <div>
                            {/* Bio Section */}
                            <div className={styles.profileSection}>
                                <h2>About</h2>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Bio</span>
                                        <p className={styles.infoValue}>{profile.bio}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Details Section */}
                            <div className={styles.profileSection}>
                                <h2>Details</h2>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Niche</span>
                                        <span className={styles.infoValue}>{profile.niche}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Language</span>
                                        <span className={styles.infoValue}>
                                            {profile.language.charAt(0).toUpperCase() + profile.language.slice(1)}
                                        </span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Slug</span>
                                        <span className={styles.infoValue}>{profile.slug}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Active Subscribers</span>
                                        <span className={styles.infoValue}>{profile.active_subscribers || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            {(profile.social_links?.youtube || profile.social_links?.instagram) && (
                                <div className={styles.profileSection}>
                                    <h2>Social Media</h2>
                                    <div className={styles.socialLinks}>
                                        {profile.social_links?.youtube && (
                                            <a
                                                href={profile.social_links.youtube}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.socialLink}
                                            >
                                                <Youtube size={18} />
                                                YouTube
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                        {profile.social_links?.instagram && (
                                            <a
                                                href={profile.social_links.instagram}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.socialLink}
                                            >
                                                <Instagram size={18} />
                                                Instagram
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Services Section */}
                            <div className={styles.profileSection}>
                                <h2>Services Offered</h2>
                                {profile.packages && profile.packages.length > 0 ? (
                                    <div className={styles.packagesList}>
                                        {profile.packages
                                            .filter((pkg: any) => pkg.is_active)
                                            .map((pkg: any) => (
                                                <div key={pkg.id} className={styles.packageCard}>
                                                    <div className={styles.packageHeader}>
                                                        <h3 className={styles.packageTitle}>{pkg.title}</h3>
                                                        <span className={styles.packagePrice}>₹{pkg.price_inr}</span>
                                                    </div>
                                                    <p className={styles.packageDesc}>{pkg.subtitle}</p>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className={styles.emptyState}>
                                        <Package size={48} />
                                        <p>No services yet. Add some in Settings!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <CreatorSettings
                            embedded={true}
                            onSaveComplete={() => {
                                // Reload profile data
                                setLoading(true);
                                api.get('/creators/me').then(response => {
                                    setProfile(response.data);
                                    setLoading(false);
                                    setActiveTab('profile'); // Switch back to profile tab
                                }).catch(err => {
                                    console.error('Failed to reload profile:', err);
                                    setLoading(false);
                                });
                            }}
                        />
                    )}
                </div>
            </div>
        </main>
    );
}
