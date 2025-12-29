'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings, LogOut } from 'lucide-react';
import styles from './Layout.module.css';

export const TopBar = () => {
    const router = useRouter();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        router.push('/login');
    };

    return (
        <header className={styles.topBar}>
            <div className={styles.navContainer}>
                {/* Logo */}
                <Link href="/creator-dashboard" className={styles.logoLink}>
                    <Image
                        src="/logo.png"
                        alt="OnlyForU"
                        width={120}
                        height={40}
                        className={styles.logoImage}
                    />
                </Link>

                {/* Right Side - User Menu Only */}
                <div className={styles.navActions}>
                    <div className={styles.userMenuWrapper}>
                        <button
                            className={styles.userAvatar}
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <div className={styles.avatarPlaceholder}>C</div>
                        </button>

                        {showUserMenu && (
                            <div className={styles.userDropdown}>
                                <Link href="/creator/settings" className={styles.dropdownItem}>
                                    <Settings size={16} />
                                    Settings
                                </Link>
                                <button onClick={handleLogout} className={styles.dropdownItem}>
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
